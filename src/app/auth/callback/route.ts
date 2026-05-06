import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// ════════════════════════════════════════════════════════════════════
// Callback post magic-link — échange le code contre une session cookie.
// URL de redirection dans l'email magic-link : /auth/callback?code=...&next=/admin
// ════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchange error:", error.message);
  }

  // Code manquant ou échec — retour au login avec message d'erreur
  return NextResponse.redirect(`${origin}/admin/login?error=invalid_link`);
}
