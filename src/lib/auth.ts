import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";

// ════════════════════════════════════════════════════════════════════
// Auth helpers admin — whitelist basée sur advisors.email (active=true)
// ════════════════════════════════════════════════════════════════════

export type AdminRole = "director" | "advisor";

export interface AdminSession {
  userId: string;
  email: string;
  advisorSlug: string;
  advisorName: string;
  advisorRole: string; // libellé humain (ex: "Conseillère senior — Médina & Riads")
  role: AdminRole;     // rôle système (permissions)
}

/**
 * Récupère la session admin courante — null si pas loggé OU si l'email
 * n'est pas dans la whitelist advisors.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  // Whitelist check via supabaseAdmin (bypass RLS pour vérif advisors.active)
  const { data: advisor } = await supabaseAdmin
    .from("advisors")
    .select("slug, name, role, access_role, active")
    .eq("email", user.email)
    .eq("active", true)
    .maybeSingle();

  if (!advisor) return null;

  const role: AdminRole =
    (advisor.access_role as string) === "director" ? "director" : "advisor";

  return {
    userId: user.id,
    email: user.email,
    advisorSlug: advisor.slug as string,
    advisorName: advisor.name as string,
    advisorRole: (advisor.role as string) ?? "",
    role,
  };
});

// ── Permission helpers ──────────────────────────────────────────────

export function isDirector(session: AdminSession | null): boolean {
  return session?.role === "director";
}

/** Peut-on lire/éditer ce lead ? Director = oui, advisor = si assigné à lui. */
export function canActOnLead(
  session: AdminSession | null,
  lead: { advisorSlug: string }
): boolean {
  if (!session) return false;
  if (session.role === "director") return true;
  return lead.advisorSlug === session.advisorSlug;
}

/**
 * Variante qui throw si pas authentifié — à utiliser dans les server actions
 * qui sont déjà censées être protégées par le middleware.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("Non authentifié");
  return session;
}
