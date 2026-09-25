import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSafeAdminPath } from "@/lib/auth-urls";

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

      const { data: advisor } = user?.email
        ? await supabaseAdmin
            .from("advisors")
            .select("slug")
            .ilike("email", user.email)
            .eq("active", true)
            .maybeSingle()
        : { data: null };

      if (advisor) {
        return NextResponse.redirect(new URL(next, origin));
      }

      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin/login?error=access_denied`);
    }
    console.error("[auth/callback] exchange error:", error.message);
  }

  // Code manquant ou échec — retour au login avec message d'erreur
  return NextResponse.redirect(`${origin}/admin/login?error=invalid_link`);
}
