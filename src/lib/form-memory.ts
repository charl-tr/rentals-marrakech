// ════════════════════════════════════════════════════════════════════
// form-memory — mémoire LOCALE (localStorage) qu'une demande a déjà été
// envoyée depuis ce navigateur, pour un CONTEXTE donné (formulaire générique
// ou fiche d'un bien précis).
//
// Donne la continuité côté formulaires : au refresh, on ne réaffiche pas un
// formulaire vierge (fini "on dirait que ça n'a pas été envoyé" / la double
// soumission accidentelle). On montre "demande envoyée" + le conseiller, avec
// une réouverture explicite. Aucun compte, aucun cookie serveur.
// ════════════════════════════════════════════════════════════════════

export interface SentRecord {
  sentAt: number; // epoch ms
  advisorSlug: string | null;
}

const KEY = (id: string) => `mr:form-sent:${id}`;

export function getSentRecord(id: string): SentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY(id));
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p.sentAt === "number") {
      return {
        sentAt: p.sentAt,
        advisorSlug: typeof p.advisorSlug === "string" ? p.advisorSlug : null,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setSentRecord(id: string, rec: SentRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY(id), JSON.stringify(rec));
  } catch {
    /* quota / private mode — non bloquant */
  }
}

export function clearSentRecord(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY(id));
  } catch {
    /* ignore */
  }
}
