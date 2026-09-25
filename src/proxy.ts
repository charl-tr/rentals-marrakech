import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ════════════════════════════════════════════════════════════════════
// Proxy (Next 16+ convention, ex-"middleware") — rafraîchit la session
// Supabase sur chaque requête et protège /admin/* derrière magic-link + MFA.
// ════════════════════════════════════════════════════════════════════

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Rafraîchit la session — important pour que getUser() marche côté server.
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  function redirectWithSession(url: URL) {
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  const isLogin = pathname === "/admin/login";
  const isMfa = pathname === "/admin/mfa";
  const isSignout = pathname === "/admin/signout";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin && !isLogin && !isSignout && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return redirectWithSession(loginUrl);
  }

  let isAal2 = false;
  if (user && isAdmin && !isSignout) {
    const { data: assurance } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    isAal2 = assurance?.currentLevel === "aal2";
  }

  // Un premier facteur valide ne suffit jamais pour ouvrir le CRM.
  if (user && isAdmin && !isLogin && !isMfa && !isSignout && !isAal2) {
    const mfaUrl = request.nextUrl.clone();
    mfaUrl.pathname = "/admin/mfa";
    mfaUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return redirectWithSession(mfaUrl);
  }

  if (isLogin && user) {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = isAal2 ? "/admin" : "/admin/mfa";
    targetUrl.search = "";
    return redirectWithSession(targetUrl);
  }

  if (isMfa && user && isAal2) {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = "/admin";
    targetUrl.search = "";
    return redirectWithSession(targetUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Tous les paths sauf assets statiques + api/public OpenGraph si besoin
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
