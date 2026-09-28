import Image from "next/image";
import Link from "next/link";
import { languagePath } from "@/lib/i18n/routes";
import OriginalEditorialNotice from "@/components/OriginalEditorialNotice";
import { ArrowRight } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import { getEditorializedNeighborhoods } from "@/lib/db";



export default async function QuartiersIndex({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const items = await getEditorializedNeighborhoods();

  return (
    <>
      <SectionHero locale={locale}
        eyebrow="Magazine"
        title={
          <>
            {en ? "Choose your neighbourhood," : "Choisir son quartier,"}<br />
            <span className="italic text-[var(--color-accent-light)]">{en ? "before" : "avant"}</span>{en ? " choosing your property." : " de choisir son bien."}
          </>
        }
        subtitle={en ? "Palmeraie is not the Medina, and Hivernage is not Targa. Explore our neighbourhood guides before choosing your property." : "La Palmeraie n'est pas la médina, l'Hivernage n'est pas Targa. Voici nos guides éditoriaux des quartiers que nous traitons en exclusivité."}
      />

      <OriginalEditorialNotice locale={locale} href="/quartiers" />
      <section className="bg-white py-24">
        <div className="container-luxe">
          <div className="grid gap-px bg-[var(--color-beige-warm)] md:grid-cols-2 lg:grid-cols-3">
            {items.map((q) => (
              <Link
                key={q.slug}
                href={languagePath(`/quartiers/${q.slug}`, locale)}
                className="group relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[var(--color-charcoal)]"
              >
                <Image
                  src={q.imageHero}
                  alt={q.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/85 via-[var(--color-charcoal)]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <div className="hero-text-soft text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta-light)]">
                    {q.city}
                  </div>
                  <h2 className="hero-text mt-2 font-serif text-3xl text-white">
                    {q.name}
                  </h2>
                  <div className="hero-text-soft mt-3 max-w-xs text-sm leading-snug text-white/90">
                    <span lang="fr">{q.tagline}</span>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {en ? "Read the guide" : "Lire le guide"}
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
            <div className="flex flex-col items-center justify-center gap-3 bg-[var(--color-cream)] p-12 text-center">
              <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                {en ? "Coming soon" : "À venir"}
              </div>
              <div className="font-serif text-xl text-[var(--color-charcoal)]">
                Guéliz, Sidi Kaouki, Ourika
              </div>
              <div className="text-xs text-[var(--color-stone)]">
                {en ? "More neighbourhood guides to come" : "De nouveaux guides à venir"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
