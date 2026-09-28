import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function isDemoRequest(request: NextRequest) {
  return (
    process.env.DEMO_MODE === "true" ||
    request.nextUrl.hostname.endsWith(".vercel.app")
  );
}

function addDemoHeaders(response: NextResponse, request: NextRequest) {
  if (isDemoRequest(request)) {
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet, noimageindex"
    );
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }

  return response;
}

function hasValidDemoCredentials(request: NextRequest) {
  const expectedPassword = process.env.DEMO_PASSWORD;
  if (!expectedPassword) return true;

  const expectedUsername = process.env.DEMO_USERNAME || "marrakech";
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(authorization.slice(6));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return false;

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);
    return username === expectedUsername && password === expectedPassword;
  } catch {
    return false;
  }
}

// ════════════════════════════════════════════════════════════════════
// Proxy (Next 16+ convention, ex-"middleware") — rafraîchit la session
// Supabase sur chaque requête et protège /admin/* derrière magic-link + MFA.
// ════════════════════════════════════════════════════════════════════

export async function proxy(request: NextRequest) {
  if (
    isDemoRequest(request) &&
    Boolean(process.env.DEMO_PASSWORD) &&
    !hasValidDemoCredentials(request)
  ) {
    return new NextResponse("Démonstration privée — authentification requise.", {
      status: 401,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Type": "text/plain; charset=utf-8",
        "WWW-Authenticate": 'Basic realm="Marrakech Realty private demo", charset="UTF-8"',
        "X-Robots-Tag":
          "noindex, nofollow, noarchive, nosnippet, noimageindex",
      },
    });
  }

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
    return addDemoHeaders(redirectWithSession(loginUrl), request);
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
    return addDemoHeaders(redirectWithSession(mfaUrl), request);
  }

  if (isLogin && user) {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = isAal2 ? "/admin" : "/admin/mfa";
    targetUrl.search = "";
    return addDemoHeaders(redirectWithSession(targetUrl), request);
  }

  if (isMfa && user && isAal2) {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = "/admin";
    targetUrl.search = "";
    return addDemoHeaders(redirectWithSession(targetUrl), request);
  }

  return addDemoHeaders(response, request);
}

export const config = {
  matcher: [
    // Tous les paths sauf assets statiques + api/public OpenGraph si besoin
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
