"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { headers } from "next/headers";

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
  const next = typeof nextRaw === "string" && nextRaw.startsWith("/") ? nextRaw : "/admin";

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Email invalide." };
  }

  // Whitelist : l'email doit correspondre à un advisor actif
  const { data: advisor } = await supabaseAdmin
    .from("advisors")
    .select("slug")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (!advisor) {
    // Message générique pour ne pas divulguer qui est admin
    return {
      status: "error",
      message:
        "Si cet email est autorisé, un lien de connexion va arriver. Vérifiez votre boîte.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const h = await headers();
  const origin =
    h.get("origin") ??
    (h.get("host") ? `https://${h.get("host")}` : "http://localhost:3000");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[sendMagicLink] error:", error.message);
    return { status: "error", message: "Échec de l'envoi du lien. Réessayez." };
  }

  return { status: "sent", email };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
