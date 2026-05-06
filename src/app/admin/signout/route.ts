import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// ════════════════════════════════════════════════════════════════════
// GET /admin/signout — déconnexion de secours.
//
// Utile quand l'UI ne peut pas afficher le dropdown "Se déconnecter"
// (cookie corrompu, whitelist changée, etc.). L'utilisateur tape l'URL
// manuellement et se retrouve sur /admin/login avec session propre.
// ════════════════════════════════════════════════════════════════════

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/admin/login`);
}
