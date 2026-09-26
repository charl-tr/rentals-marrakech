"use client";

const KEY = "mr:measurement-session";
// Separate from the essential favorites storage: no consent, no measurement ID.
export function measurementSession(): string {
  try {
    if (localStorage.getItem("mr:consent") !== "accepted" || localStorage.getItem("mr:measurement-consent") !== "v1") {
      sessionStorage.removeItem(KEY);
      return "";
    }
    const previous = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (previous?.id && previous.expires > Date.now()) return previous.id;
    const id = crypto.randomUUID();
    sessionStorage.setItem(KEY, JSON.stringify({ id, expires: Date.now() + 30 * 60_000 }));
    return id;
  } catch { return ""; }
}

export function trackProperty(event: "property_view" | "favorite_add", slug: string) {
  const sessionId = measurementSession();
  if (!sessionId) return;
  void fetch("/api/conversion", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, slug, sessionId }), keepalive: true,
  }).catch(() => { /* Measurement must never block browsing or contact. */ });
}
