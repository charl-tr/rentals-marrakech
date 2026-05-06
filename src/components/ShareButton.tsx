"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Mail, MessageCircle, Share2 } from "lucide-react";

/**
 * Share button — dropdown avec WhatsApp / email / copy link.
 * Utilise Web Share API sur mobile si dispo, fallback dropdown sinon.
 */
export default function ShareButton({
  url,
  title,
  description,
  variant = "hero",
}: {
  url: string;
  title: string;
  description?: string;
  variant?: "hero" | "inline";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [absoluteUrl, setAbsoluteUrl] = useState(url);

  useEffect(() => {
    // Construit l'URL absolue côté client
    if (typeof window !== "undefined") {
      setAbsoluteUrl(new URL(url, window.location.origin).toString());
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: description, url: absoluteUrl });
        return true;
      } catch {
        // user cancelled — fallback to dropdown
      }
    }
    return false;
  }, [absoluteUrl, title, description]);

  const handleClick = useCallback(async () => {
    const used = await handleNativeShare();
    if (!used) setOpen((o) => !o);
  }, [handleNativeShare]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [absoluteUrl]);

  const waText = encodeURIComponent(
    `${title}${description ? ` — ${description}` : ""}\n${absoluteUrl}`
  );
  const mailSubject = encodeURIComponent(title);
  const mailBody = encodeURIComponent(
    `Bonjour,\n\nJe voulais partager ce bien avec vous :\n\n${title}\n${description ?? ""}\n\n${absoluteUrl}\n\n—`
  );

  const buttonClasses =
    variant === "hero"
      ? "inline-flex items-center gap-2 border border-white/40 bg-transparent px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm transition-colors hover:border-white"
      : "inline-flex items-center gap-2 border border-[var(--color-beige-warm)] bg-white px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Partager ce bien"
        className={buttonClasses}
      >
        <Share2 size={12} />
        Partager
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-[calc(100%+8px)] z-40 min-w-[260px] border border-[var(--color-beige-warm)] bg-white shadow-[var(--shadow-luxe)]">
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-3.5 text-sm text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-cream)]"
            >
              <MessageCircle size={15} className="text-[var(--color-terracotta)]" />
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${mailSubject}&body=${mailBody}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-t border-[var(--color-beige-warm)] px-5 py-3.5 text-sm text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-cream)]"
            >
              <Mail size={15} className="text-[var(--color-terracotta)]" />
              Par e-mail
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-3 border-t border-[var(--color-beige-warm)] px-5 py-3.5 text-left text-sm text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-cream)]"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-[var(--color-terracotta)]" />
                  <span className="text-[var(--color-terracotta)]">
                    Lien copié !
                  </span>
                </>
              ) : (
                <>
                  <Copy size={15} className="text-[var(--color-terracotta)]" />
                  Copier le lien
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
