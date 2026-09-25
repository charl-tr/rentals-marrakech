import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";

// ════════════════════════════════════════════════════════════════════
// Auth helpers admin — identité liée à auth.users + MFA obligatoire.
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

interface AdvisorIdentity {
  userId: string;
  email: string;
  advisorSlug: string;
  advisorName: string;
  advisorRole: string;
  role: AdminRole;
}

/**
 * Résout une identité Auth vers un profil équipe actif.
 * La table de liaison est privée et n'est jamais lisible avec la clé anon.
 */
export async function getAdvisorIdentity(): Promise<AdvisorIdentity | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) return null;

  const { data: mapping } = await supabaseAdmin
    .from("advisor_auth")
    .select("advisor_slug")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!mapping) return null;

  const { data: advisor } = await supabaseAdmin
    .from("advisors")
    .select("slug, name, role, access_role, active")
    .eq("slug", mapping.advisor_slug)
    .eq("active", true)
    .maybeSingle();

  if (!advisor) return null;

  return {
    userId: user.id,
    email: user.email,
    advisorSlug: advisor.slug as string,
    advisorName: advisor.name as string,
    advisorRole: (advisor.role as string) ?? "",
    role:
      (advisor.access_role as string) === "director" ? "director" : "advisor",
  };
}

/**
 * Lie une identité Supabase au profil équipe portant le même email.
 * Les contraintes uniques rendent l'opération atomique et empêchent qu'un
 * compte Auth ou un profil équipe soient liés deux fois.
 */
export async function linkAdvisorIdentity(
  userId: string,
  email: string
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: existing } = await supabaseAdmin
    .from("advisor_auth")
    .select("advisor_slug")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (existing) {
    const { data: activeAdvisor } = await supabaseAdmin
      .from("advisors")
      .select("slug")
      .eq("slug", existing.advisor_slug)
      .eq("active", true)
      .maybeSingle();
    return Boolean(activeAdvisor);
  }

  const { data: advisor } = await supabaseAdmin
    .from("advisors")
    .select("slug")
    .ilike("email", normalizedEmail)
    .eq("active", true)
    .maybeSingle();

  if (!advisor) return false;

  const { error } = await supabaseAdmin.from("advisor_auth").insert({
    advisor_slug: advisor.slug,
    auth_user_id: userId,
  });

  if (!error) return true;

  // Une tentative simultanée peut avoir gagné la course. On ne valide que si
  // la liaison finale correspond bien à cet utilisateur et ce profil.
  const { data: linked } = await supabaseAdmin
    .from("advisor_auth")
    .select("advisor_slug")
    .eq("auth_user_id", userId)
    .eq("advisor_slug", advisor.slug)
    .maybeSingle();

  return Boolean(linked);
}

/**
 * Récupère la session admin courante — null si l'identité n'est pas liée,
 * si le profil est désactivé, ou si le second facteur n'a pas été validé.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createSupabaseServerClient();
  const identity = await getAdvisorIdentity();
  if (!identity) return null;

  const { data: assurance, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error || assurance.currentLevel !== "aal2") return null;
  return identity;
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
