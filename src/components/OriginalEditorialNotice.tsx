import Link from "next/link";

/** Keep original editorial claims intact until their translation is reviewed. */
export default function OriginalEditorialNotice({ locale = "fr", href }: { locale?: "fr" | "en"; href: string }) {
  if (locale !== "en") return null;
  return <div className="border-b border-[var(--color-border)] bg-[var(--color-cream)]">
    <p className="container-luxe py-3 text-sm leading-relaxed text-[var(--color-stone)]">
      This editorial content is currently in French. Its English translation is being prepared.{" "}
      <Link href={href} hrefLang="fr" className="underline underline-offset-4">Read the original</Link>
    </p>
  </div>;
}
