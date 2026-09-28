"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, RefreshCcw, Smartphone } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface TotpFactor {
  id: string;
  friendly_name?: string;
  created_at: string;
}

export default function SecurityPanel() {
  const router = useRouter();
  const [factor, setFactor] = useState<TotpFactor | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) {
        setError("Impossible de charger les paramètres de sécurité.");
      } else {
        setFactor((data.totp[0] as TotpFactor | undefined) ?? null);
      }
      setLoading(false);
    }
    void load();
  }, []);

  async function resetFactor() {
    if (!factor || pending) return;
    setPending(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: removeError } = await supabase.auth.mfa.unenroll({
      factorId: factor.id,
    });

    if (removeError) {
      setPending(false);
      setError("La réinitialisation a échoué. Reconnectez-vous puis réessayez.");
      return;
    }

    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <section className="rounded-[16px] border border-[var(--color-beige-warm)] bg-white p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-stone)]">
            Second facteur
          </div>
          <h2 className="mt-2 font-serif text-2xl text-[var(--color-charcoal)]">
            Application d&apos;authentification
          </h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-deep)]">
          <Smartphone size={18} aria-hidden="true" />
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-3 text-sm text-[var(--color-stone)]">
          <LoaderCircle size={18} className="animate-spin" />
          Chargement…
        </div>
      ) : factor ? (
        <div className="mt-7">
          <div className="flex items-center gap-3 rounded-[12px] border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
              <Check size={15} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--color-charcoal)]">
                Protection active
              </div>
              <div className="mt-0.5 text-xs text-[var(--color-stone)]">
                {factor.friendly_name ?? "Marrakech Realty"} · activée le{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(factor.created_at))}
              </div>
            </div>
          </div>

          <div className="mt-7 border-t border-[var(--color-beige-warm)] pt-6">
            {!confirming ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-[var(--color-beige-warm)] px-4 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-alert)] hover:text-[var(--color-alert)]"
              >
                <RefreshCcw size={14} />
                Changer d&apos;authentificateur
              </button>
            ) : (
              <div className="rounded-[12px] bg-[var(--color-alert-soft)] p-4">
                <p className="text-sm leading-6 text-[var(--color-charcoal)]">
                  Le facteur actuel sera supprimé et vous serez déconnecté. Au
                  prochain accès, un nouveau QR code sera généré.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={resetFactor}
                    disabled={pending}
                    className="min-h-10 rounded-[9px] bg-[var(--color-alert)] px-4 text-[10px] font-medium uppercase tracking-[0.14em] text-white disabled:opacity-50"
                  >
                    {pending ? "Réinitialisation…" : "Confirmer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={pending}
                    className="min-h-10 rounded-[9px] px-4 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-stone)]"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-7 text-sm leading-6 text-[var(--color-stone)]">
          Aucun facteur vérifié. Déconnectez-vous puis reconnectez-vous pour
          terminer la configuration.
        </p>
      )}

      {error && (
        <div role="alert" className="mt-5 rounded-[10px] border-l-2 border-[var(--color-alert)] bg-[var(--color-alert-soft)] px-4 py-3 text-sm text-[var(--color-charcoal)]">
          {error}
        </div>
      )}
    </section>
  );
}
