"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clipboard, KeyRound, LoaderCircle, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Mode = "loading" | "enroll" | "challenge" | "success";

interface Enrollment {
  factorId: string;
  qrCode: string;
  secret: string;
}

export default function MfaForm({ next }: { next: string }) {
  const router = useRouter();
  const initialized = useRef(false);
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function initialize() {
      const supabase = createSupabaseBrowserClient();
      const { data: factors, error: listError } =
        await supabase.auth.mfa.listFactors();

      if (listError) {
        setError("Impossible de préparer la vérification. Reconnectez-vous.");
        return;
      }

      const verified = factors.totp[0];
      if (verified) {
        setFactorId(verified.id);
        setMode("challenge");
        return;
      }

      // Nettoie les enrôlements abandonnés avant de générer un secret neuf.
      for (const stale of factors.all.filter(
        (factor: { factor_type: string; status: string }) =>
          factor.factor_type === "totp" && factor.status === "unverified"
      )) {
        await supabase.auth.mfa.unenroll({ factorId: stale.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Marrakech Realty",
      });

      if (enrollError) {
        setError("La configuration de l’authentificateur a échoué. Réessayez.");
        return;
      }

      setFactorId(data.id);
      setEnrollment({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setMode("enroll");
    }

    void initialize();
  }, []);

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || code.length !== 6 || !factorId) return;

    setPending(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: verifyError } =
      await supabase.auth.mfa.challengeAndVerify({ factorId, code });

    if (verifyError) {
      setPending(false);
      setCode("");
      setError("Code incorrect ou expiré. Saisissez le nouveau code affiché.");
      return;
    }

    setMode("success");
    router.replace(next);
    router.refresh();
  }

  async function copySecret() {
    if (!enrollment) return;
    await navigator.clipboard.writeText(enrollment.secret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (mode === "loading" && !error) {
    return (
      <div className="mt-8 flex min-h-40 items-center justify-center rounded-[14px] border border-[var(--color-beige-warm)] bg-[var(--color-cream)]">
        <LoaderCircle className="animate-spin text-[var(--color-terracotta)]" size={22} />
        <span className="ml-3 text-sm text-[var(--color-stone)]">
          Préparation de la vérification…
        </span>
      </div>
    );
  }

  if (mode === "success") {
    return (
      <div className="mt-8 flex items-center gap-4 rounded-[14px] border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
          <Check size={18} />
        </div>
        <div>
          <div className="font-serif text-xl text-[var(--color-charcoal)]">Identité confirmée.</div>
          <p className="mt-1 text-sm text-[var(--color-stone)]">Ouverture de votre espace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {mode === "enroll" && enrollment && (
        <div className="rounded-[14px] border border-[var(--color-beige-warm)] bg-[var(--color-cream)] p-5 sm:p-6">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-terracotta)]">
              <KeyRound size={16} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-[var(--color-charcoal)]">
                Configuration unique
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--color-stone)]">
                Scannez ce QR code avec Google Authenticator, 1Password,
                Microsoft Authenticator ou votre gestionnaire habituel.
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-center rounded-[12px] bg-white p-4">
            {/* Supabase fournit une image SVG encodée en data URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enrollment.qrCode}
              alt="QR code de configuration de l’authentificateur"
              width={184}
              height={184}
              className="h-[184px] w-[184px]"
            />
          </div>

          <div className="mt-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-stone)]">
              Saisie manuelle
            </div>
            <button
              type="button"
              onClick={copySecret}
              className="mt-2 flex w-full items-center justify-between gap-3 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2.5 text-left"
            >
              <code className="min-w-0 break-all text-xs text-[var(--color-charcoal)]">
                {enrollment.secret}
              </code>
              {copied ? (
                <Check size={15} className="shrink-0 text-[var(--color-success)]" />
              ) : (
                <Clipboard size={15} className="shrink-0 text-[var(--color-stone)]" />
              )}
            </button>
          </div>
        </div>
      )}

      {mode === "challenge" && (
        <div className="rounded-[12px] border border-[var(--color-beige-warm)] bg-[var(--color-cream)] px-4 py-3 text-sm leading-6 text-[var(--color-stone)]">
          Ouvrez votre application d&apos;authentification et saisissez le code à
          6 chiffres associé à Marrakech Realty.
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-[10px] border-l-2 border-[var(--color-alert)] bg-[var(--color-alert-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-charcoal)]">
          {error}
        </div>
      )}

      {factorId && (
        <form onSubmit={verify} className="mt-5">
          <label htmlFor="mfa-code" className="block">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
              Code de vérification
            </span>
            <input
              id="mfa-code"
              name="code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus={mode === "challenge"}
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000 000"
              className="field mt-2 min-h-14 text-center font-mono text-xl tracking-[0.45em]"
              aria-invalid={Boolean(error)}
            />
          </label>
          <button
            type="submit"
            disabled={pending || code.length !== 6}
            className="btn-gold mt-4 min-h-13 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Vérification…" : mode === "enroll" ? "Activer et continuer" : "Continuer"}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={signOut}
        className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-stone)] transition-colors hover:text-[var(--color-charcoal)]"
      >
        <LogOut size={14} aria-hidden="true" />
        Utiliser un autre compte
      </button>
    </div>
  );
}
