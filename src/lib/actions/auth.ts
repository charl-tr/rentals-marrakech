"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthOrigin, getSafeAdminPath } from "@/lib/auth-urls";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type LoginActionState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

export async function sendMagicLink(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const emailRaw = formData.get("email");
  const nextRaw = formData.get("next");
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  const next = getSafeAdminPath(typeof nextRaw === "string" ? nextRaw : null);

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Email invalide." };
  }

  // Whitelist : l'email doit correspondre à un advisor actif
  const { data: advisor } = await supabaseAdmin
    .from("advisors")
    .select("slug")
    .ilike("email", email)
    .eq("active", true)
    .maybeSingle();

  if (!advisor) {
    // Même résultat visuel qu'une adresse valide : aucune énumération d'emails.
    return { status: "sent", email };
  }

  const supabase = await createSupabaseServerClient();
  const h = await headers();
  const requestOrigin =
    h.get("origin") ??
    (h.get("host") ? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}` : null);
  const origin = getAuthOrigin(requestOrigin);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[sendMagicLink] error:", error.message);
    return {
      status: "error",
      message:
        "Le lien n'a pas pu être envoyé. Patientez un instant puis réessayez.",
    };
  }

  return { status: "sent", email };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // Redirection déterministe (comme la route GET /admin/signout) : on ne laisse
  // pas l'UI compter sur un re-render RSC implicite pour bouncer vers le login.
  redirect("/admin/login");
}
