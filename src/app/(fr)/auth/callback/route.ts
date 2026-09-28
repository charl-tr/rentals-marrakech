import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSafeAdminPath } from "@/lib/auth-urls";
import { linkAdvisorIdentity } from "@/lib/auth";

// ════════════════════════════════════════════════════════════════════
// Callback post magic-link — échange le code contre une session cookie.
// URL de redirection dans l'email magic-link : /auth/callback?code=...&next=/admin
// ════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeAdminPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isLinked =
        user?.id && user.email
          ? await linkAdvisorIdentity(user.id, user.email)
          : false;

      if (isLinked) {
        const mfaUrl = new URL("/admin/mfa", origin);
        mfaUrl.searchParams.set("next", next);
        return NextResponse.redirect(mfaUrl);
      }

      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/login?error=access_denied`);
    }
    console.error("[auth/callback] exchange error:", error.message);
  }

  // Code manquant ou échec — retour au login avec message d'erreur
  return NextResponse.redirect(`${origin}/admin/login?error=invalid_link`);
}
