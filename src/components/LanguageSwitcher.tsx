"use client";

import { usePathname } from "next/navigation";
import { languagePath } from "@/lib/i18n/routes";

export default function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const pathname = usePathname();
  const en = pathname === "/en" || pathname.startsWith("/en/");
  return <div aria-label={en ? "Website language" : "Langue du site"} className={`inline-flex shrink-0 items-center rounded-full border p-0.5 text-xs font-medium ${light ? "border-white/40 text-white" : "border-[var(--color-border)] text-[var(--color-charcoal)]"}`}>
    {(["fr", "en"] as const).map((locale) => <a key={locale}
      href={languagePath(pathname, locale)} hrefLang={locale} lang={locale}
      aria-label={locale === "fr" ? "Version française" : "English version"}
      aria-current={(locale === "en") === en ? "true" : undefined}
      onClick={(event) => {
        // Preserve filters, pagination and anchors; do not hijack modified clicks.
        event.currentTarget.href = languagePath(window.location.pathname + window.location.search + window.location.hash, locale);
      }}
      className={`grid min-h-9 min-w-10 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${(locale === "en") === en ? "bg-[var(--color-accent-deep)] text-white" : "hover:bg-black/5"}`}>
      {locale.toUpperCase()}
    </a>)}
  </div>;
}
