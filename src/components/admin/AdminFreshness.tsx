"use client";

import { useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminFreshness() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const lastRefresh = useRef(0);
  // Never refresh an editor in the background: preserve unsaved input.
  const editing = !["/admin", "/admin/biens", "/admin/leads", "/admin/matching", "/admin/conversion"].includes(pathname);
  useEffect(() => {
    const onFocus = () => {
      if (editing || document.visibilityState !== "visible" || Date.now() - lastRefresh.current < 30000) return;
      lastRefresh.current = Date.now();
      startTransition(() => router.refresh());
    };
    window.addEventListener("focus", onFocus);
    const timer = setInterval(onFocus, 60000);
    return () => { window.removeEventListener("focus", onFocus); clearInterval(timer); };
  }, [editing, router]);
  return <button type="button" disabled={pending} onClick={() => {
    if (editing && !window.confirm("Actualiser cette fiche peut perdre votre saisie non enregistrée. Continuer ?")) return;
    lastRefresh.current = Date.now(); startTransition(() => router.refresh());
  }} title="Navigation conservée en mémoire brièvement. Actualiser pour vérifier les dernières données." className="rounded-lg border border-[var(--color-beige-warm)] px-3 py-2 text-xs text-[var(--color-stone)] disabled:opacity-50" aria-live="polite">{pending ? "Actualisation…" : "↻ Actualiser"}</button>;
}
