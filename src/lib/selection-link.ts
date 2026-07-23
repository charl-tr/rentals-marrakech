// ════════════════════════════════════════════════════════════════════
// selection-link — mémoire LOCALE (localStorage) du fait que ce navigateur
// est déjà "lié" à une sélection sauvegardée (favoris/comparateur).
//
// C'est ce qui donne la continuité : une fois lié, l'app reconnaît l'utilisateur
// (« ✓ Sélection enregistrée · email ») au lieu de re-proposer de sauvegarder
// en boucle, et met à jour LE MÊME enregistrement plutôt que d'en créer un
// nouveau. Aucun compte, aucun cookie serveur — juste une trace côté client.
// Le rattachement réel (email → token → biens) vit en base ; ceci n'est que
// le repère qui dit « ce navigateur connaît déjà son token ».
// ════════════════════════════════════════════════════════════════════

export type SelectionKind = "favoris" | "comparateur";

export interface SelectionLink {
  token: string;
  email: string;
  savedSlugs: string[];
}

const KEY = (kind: SelectionKind) => `mr:selection-link:${kind}`;

export function getSelectionLink(kind: SelectionKind): SelectionLink | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY(kind));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.token === "string" &&
      typeof parsed.email === "string" &&
      Array.isArray(parsed.savedSlugs)
    ) {
      return {
        token: parsed.token,
        email: parsed.email,
        savedSlugs: parsed.savedSlugs.filter((s: unknown) => typeof s === "string"),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setSelectionLink(kind: SelectionKind, link: SelectionLink): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY(kind), JSON.stringify(link));
  } catch {
    /* quota / private mode — non bloquant */
  }
}

/** Deux sélections sont "identiques" si elles contiennent le même ensemble de
 *  slugs, quel que soit l'ordre. Sert à décider "à jour" vs "à mettre à jour". */
export function sameSelection(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((s) => setB.has(s));
}
