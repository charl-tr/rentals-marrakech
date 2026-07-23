// ════════════════════════════════════════════════════════════════════
// anti-spam — défense SANS friction pour les formulaires publics (leads).
// Combine honeypot + piège temporel + heuristique de contenu. Aucun captcha,
// zéro friction pour l'humain. Un bot détecté est "drop silencieux" côté
// action (on lui renvoie un succès → il ne réessaie pas).
//
// Portée : élimine le gros du spam AUTOMATIQUE (bots de formulaire). Ne stoppe
// pas un attaquant ciblé déterminé (emails variés, JS complet) — le tier
// suivant serait un rate-limit IP ou un captcha invisible (hCaptcha/Turnstile).
//
// Isomorphe : les constantes sont importées côté client (FormGuard), les
// fonctions côté serveur (actions). Aucune API server-only ici.
// ════════════════════════════════════════════════════════════════════

// Nom volontairement hors des catégories d'autofill (name/email/url/tel/org…)
// pour qu'aucun gestionnaire de mots de passe ne le remplisse chez un humain
// (sinon faux positif). Les bots "remplis-tout" le remplissent quand même.
export const HONEYPOT_FIELD = "hp_confirm";
export const FORM_TS_FIELD = "formTs";

// Soumission plus rapide que ça = quasi certainement un bot.
const MIN_ELAPSED_MS = 1200;

export function isLikelyBot(formData: FormData): boolean {
  // 1. Honeypot rempli — champ caché que seul un bot remplit.
  const hp = formData.get(HONEYPOT_FIELD);
  if (typeof hp === "string" && hp.trim() !== "") return true;

  // 2. Piège temporel — on ne rejette que si l'écart est POSITIF et
  //    absurdement court. Un écart négatif = décalage d'horloge client →
  //    on laisse passer (évite les faux positifs).
  const tsRaw = formData.get(FORM_TS_FIELD);
  const ts = typeof tsRaw === "string" ? parseInt(tsRaw, 10) : NaN;
  if (Number.isFinite(ts)) {
    const elapsed = Date.now() - ts;
    if (elapsed >= 0 && elapsed < MIN_ELAPSED_MS) return true;
  }

  return false;
}

// Heuristique de contenu — un message bourré de liens / motifs = spam probable.
export function looksSpammy(message: string | null | undefined): boolean {
  if (!message) return false;
  const links = message.match(/https?:\/\//gi);
  if (links && links.length >= 3) return true;
  if (/\[url=|\bviagra\b|\bcasino\b|t\.me\/|bit\.ly\//i.test(message)) return true;
  return false;
}
