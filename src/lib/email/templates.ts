import "server-only";
import type { Advisor, Property } from "@/data/properties";

// ════════════════════════════════════════════════════════════════════
// Templates email — HTML inline simple, pas de MJML pour l'instant.
// Typographies serif (Playfair-style) via web fonts, palette cohérente
// avec le site. Responsive via max-width + table layout.
// ════════════════════════════════════════════════════════════════════

const BRAND_CHARCOAL = "#1c1815";
const BRAND_TERRACOTTA = "#945B2C";
const BRAND_CREAM = "#faf6f0";
const BRAND_STONE = "#8a7f70";
const BRAND_BEIGE = "#e8ddcb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://marrakechrealty.com";

function baseLayout(content: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BRAND_CREAM};font-family:Georgia,'Times New Roman',serif;color:${BRAND_CHARCOAL};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND_CREAM};padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;max-width:560px;">
          <tr><td style="padding:36px 40px;border-bottom:1px solid ${BRAND_BEIGE};">
            <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${BRAND_TERRACOTTA};">Marrakech Realty</div>
          </td></tr>
          <tr><td style="padding:40px;">
            ${content}
          </td></tr>
          <tr><td style="padding:24px 40px;border-top:1px solid ${BRAND_BEIGE};font-family:Arial,sans-serif;font-size:11px;color:${BRAND_STONE};">
            Marrakech Realty · 42 rue de la Liberté, Guéliz, Marrakech · <a href="${SITE_URL}" style="color:${BRAND_STONE};">${SITE_URL.replace(/^https?:\/\//, "")}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

// ── Email au client : accusé de réception ──────────────────────────

export interface ClientConfirmParams {
  firstName: string;
  advisor?: Advisor | null;
  property?: Pick<Property, "title" | "reference" | "slug" | "city" | "neighborhood"> | null;
  slaHours: number;
  portalUrl?: string;
}

export function renderClientConfirmation(params: ClientConfirmParams): {
  subject: string;
  html: string;
} {
  const { firstName, advisor, property, slaHours, portalUrl } = params;

  const firstNameAdvisor = advisor?.name.split(" ")[0] ?? "Un conseiller";

  const advisorBlock = advisor
    ? `
      <tr><td style="padding-top:28px;border-top:1px solid ${BRAND_BEIGE};margin-top:28px;">
        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND_TERRACOTTA};margin-bottom:12px;">Votre interlocuteur dédié</div>
        <div style="font-family:Georgia,serif;font-size:22px;color:${BRAND_CHARCOAL};">${advisor.name}</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;color:${BRAND_STONE};margin-top:4px;">${advisor.role}</div>
        <div style="margin-top:16px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;">
          ${advisor.phone ? `📞 <a href="tel:${advisor.phone.replace(/\s/g, "")}" style="color:${BRAND_CHARCOAL};text-decoration:none;">${advisor.phone}</a><br>` : ""}
          ${advisor.whatsapp ? `💬 <a href="https://wa.me/${advisor.whatsapp}" style="color:${BRAND_CHARCOAL};text-decoration:none;">WhatsApp direct</a><br>` : ""}
          ${advisor.email ? `✉️ <a href="mailto:${advisor.email}" style="color:${BRAND_CHARCOAL};text-decoration:none;">${advisor.email}</a>` : ""}
        </div>
      </td></tr>`
    : "";

  const propertyBlock = property
    ? `
      <tr><td style="padding:20px;background:${BRAND_CREAM};margin-top:24px;">
        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND_STONE};margin-bottom:8px;">Votre demande concerne</div>
        <div style="font-family:Georgia,serif;font-size:18px;color:${BRAND_CHARCOAL};line-height:1.4;">${property.title}</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;color:${BRAND_STONE};margin-top:6px;">
          ${property.neighborhood}, ${property.city} · Réf. ${property.reference}
        </div>
      </td></tr>`
    : "";

  const subject = property
    ? `Votre demande sur ${property.title} — bien reçue`
    : `Votre demande — bien reçue`;

  const html = baseLayout(`
    <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${BRAND_TERRACOTTA};">Message reçu</div>
    <h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.2;color:${BRAND_CHARCOAL};margin:12px 0 0 0;font-weight:400;">
      Bonjour ${firstName}.<br>
      <em style="color:${BRAND_TERRACOTTA};">Votre demande est entre de bonnes mains.</em>
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.65;color:${BRAND_CHARCOAL};margin:24px 0 0 0;">
      Merci pour votre intérêt. ${firstNameAdvisor} prend personnellement en charge votre demande et vous recontactera <strong>sous ${slaHours} heures ouvrées</strong>.
    </p>
    <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.65;color:${BRAND_STONE};margin:16px 0 0 0;">
      Pour les demandes urgentes, n'hésitez pas à joindre directement votre interlocuteur ci-dessous — par téléphone ou WhatsApp.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
      ${propertyBlock}
      ${advisorBlock}
    </table>

    ${portalUrl
      ? `
    <div style="margin-top:32px;padding:20px;background:${BRAND_CREAM};border-left:3px solid ${BRAND_TERRACOTTA};">
      <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${BRAND_TERRACOTTA};">Votre espace personnel</div>
      <div style="font-family:Georgia,serif;font-size:16px;color:${BRAND_CHARCOAL};margin-top:8px;line-height:1.5;">
        Nous avons créé un espace privé pour votre projet. Votre conseiller y curera des biens au fil de ses recherches, et vous pourrez suivre l'avancée de votre dossier.
      </div>
      <a href="${portalUrl}" style="display:inline-block;margin-top:14px;background:${BRAND_CHARCOAL};color:#ffffff;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;padding:12px 22px;text-decoration:none;">
        Accéder à mon espace
      </a>
      <div style="font-family:Arial,sans-serif;font-size:11px;color:${BRAND_STONE};margin-top:12px;">
        Ce lien est personnel — conservez-le, il reste actif.
      </div>
    </div>`
      : ""}
  `);

  return { subject, html };
}

// ── Email au conseiller : notification nouveau lead ────────────────

export interface AdvisorNotifParams {
  leadId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  message?: string | null;
  project: string;
  channel: string;
  slaTier: "urgent" | "standard";
  property?: Pick<Property, "title" | "reference" | "slug" | "city" | "neighborhood" | "price" | "currency"> | null;
  adminUrl: string;
}

export function renderAdvisorNotification(params: AdvisorNotifParams): {
  subject: string;
  html: string;
} {
  const { leadId, clientName, clientEmail, clientPhone, message, project, channel, slaTier, property, adminUrl } = params;

  const urgencyBadge = slaTier === "urgent"
    ? `<span style="display:inline-block;background:${BRAND_TERRACOTTA};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;padding:4px 10px;">★ Urgent · SLA 4h</span>`
    : `<span style="display:inline-block;background:${BRAND_BEIGE};color:${BRAND_CHARCOAL};font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;padding:4px 10px;">SLA 24h</span>`;

  const channelLabel: Record<string, string> = {
    contact_form: "Formulaire contact",
    property_form: "Fiche bien (CTA)",
    whatsapp: "WhatsApp",
    email: "Email",
    phone: "Téléphone",
  };

  const propertyBlock = property
    ? `
      <tr><td style="padding:16px;background:${BRAND_CREAM};">
        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND_STONE};margin-bottom:6px;">Bien d'origine</div>
        <div style="font-family:Georgia,serif;font-size:16px;color:${BRAND_CHARCOAL};">${property.title}</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;color:${BRAND_STONE};margin-top:4px;">
          ${property.neighborhood}, ${property.city} · Réf. ${property.reference} · ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: property.currency, maximumFractionDigits: 0 }).format(property.price)}
        </div>
      </td></tr>`
    : "";

  const messageBlock = message
    ? `
      <tr><td style="padding-top:20px;">
        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND_STONE};margin-bottom:8px;">Message du prospect</div>
        <div style="font-family:Georgia,serif;font-size:15px;line-height:1.6;color:${BRAND_CHARCOAL};font-style:italic;border-left:2px solid ${BRAND_BEIGE};padding-left:14px;">
          « ${message.replace(/</g, "&lt;")} »
        </div>
      </td></tr>`
    : "";

  const subject = `[${slaTier === "urgent" ? "URGENT" : "Lead"}] ${clientName} — ${project}${property ? ` — ${property.reference}` : ""}`;

  const html = baseLayout(`
    <div style="margin-bottom:16px;">${urgencyBadge}</div>
    <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${BRAND_TERRACOTTA};">Nouveau lead</div>
    <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;color:${BRAND_CHARCOAL};margin:12px 0 0 0;font-weight:400;">
      ${clientName}
    </h1>
    <div style="font-family:Arial,sans-serif;font-size:13px;color:${BRAND_STONE};margin-top:4px;">
      ${project} · via ${channelLabel[channel] ?? channel}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
      <tr><td>
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:${BRAND_CHARCOAL};">
          ✉️ <a href="mailto:${clientEmail}" style="color:${BRAND_CHARCOAL};">${clientEmail}</a><br>
          ${clientPhone ? `📞 <a href="tel:${clientPhone.replace(/\s/g, "")}" style="color:${BRAND_CHARCOAL};">${clientPhone}</a><br>` : ""}
          ${clientPhone ? `💬 <a href="https://wa.me/${clientPhone.replace(/\D/g, "")}" style="color:${BRAND_CHARCOAL};">WhatsApp direct</a>` : ""}
        </div>
      </td></tr>
      ${propertyBlock ? `<tr><td style="padding-top:20px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${propertyBlock}</table></td></tr>` : ""}
      ${messageBlock}
    </table>

    <div style="margin-top:32px;">
      <a href="${adminUrl}" style="display:inline-block;background:${BRAND_CHARCOAL};color:#ffffff;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;padding:14px 24px;text-decoration:none;">
        Ouvrir dans l'admin →
      </a>
    </div>

    <div style="font-family:Arial,sans-serif;font-size:11px;color:${BRAND_STONE};margin-top:24px;">
      Réf. lead : ${leadId.slice(0, 8)}
    </div>
  `);

  return { subject, html };
}
