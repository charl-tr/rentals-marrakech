import "server-only";
import { Resend } from "resend";

// ════════════════════════════════════════════════════════════════════
// Client email — wrapper Resend avec fallback gracieux.
// ════════════════════════════════════════════════════════════════════
// Une configuration absente ne doit jamais simuler un envoi réussi.
//
// En prod : poser RESEND_API_KEY + RESEND_FROM_EMAIL + RESEND_FROM_NAME
// dans .env.local (gitignored). Domaine à vérifier côté Resend dashboard.
// ════════════════════════════════════════════════════════════════════

const apiKey = process.env.RESEND_API_KEY;
const defaultFromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@marrakechrealty.com";
const defaultFromName = process.env.RESEND_FROM_NAME ?? "Marrakech Realty";

// Sans domaine vérifié, Resend rejette les envois vers des adresses externes.
// DEV_EMAIL_OVERRIDE redirige tous les TO vers une adresse unique (ex: ton email perso)
// pour tester sans domaine. En prod avec domaine vérifié, supprimer cette var.
const devOverride = process.env.DEV_EMAIL_OVERRIDE ?? null;

const resend = apiKey ? new Resend(apiKey) : null;

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  fromName?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  const from = `${params.fromName ?? defaultFromName} <${defaultFromEmail}>`;

  // Ne pas journaliser les coordonnées du destinataire, même en démo.
  if (!resend) {
    console.warn("[sendEmail] Email delivery is not configured.");
    return { ok: false, error: "Email delivery is not configured" };
  }

  try {
    const to = devOverride ?? params.to;
    const subject = devOverride
      ? `[DEV→${params.to}] ${params.subject}`
      : params.subject;

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html: params.html,
      ...(params.replyTo ? { replyTo: [params.replyTo] } : {}),
    });
    if (error) {
      console.error("[sendEmail] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[sendEmail] throw:", msg);
    return { ok: false, error: msg };
  }
}
