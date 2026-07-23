import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import { getAllArticles } from "@/lib/db";

export const metadata: Metadata = {
  title: "Journal — Marrakech Realty",
  description:
    "Le magazine éditorial de l'agence : marché, restauration, art de vivre marocain, portraits de quartiers et de propriétaires.",
  alternates: { canonical: "/journal" },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export default async function JournalPage() {
  const articles = await getAllArticles();
  const [hero, ...rest] = articles;

  return (
    <>
      <SectionHero
        eyebrow="Journal éditorial"
        title={
          <>
            Histoires, regards,<br />
            <span className="italic text-[var(--color-accent-light)]">analyses</span>.
          </>
        }
        subtitle="Marché immobilier marocain, restauration des riads, art de vivre marrakchi, portraits de quartiers et de propriétaires. Les coulisses de notre métier."
      />

      {hero && (
        <section className="bg-white py-20">
          <div className="container-luxe">
            <Link
              href={`/journal/${hero.slug}`}
              className="group grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-[16px] bg-[var(--color-charcoal)]">
                <Image
                  src={hero.imageHero}
                  alt={hero.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
                  À la une · {hero.category}
                </div>
                <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-[var(--color-charcoal)] md:text-5xl group-hover:text-[var(--color-terracotta)] transition-colors">
                  {hero.title}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-[var(--color-stone)]">
                  {hero.lead}
                </p>
                <div className="mt-8 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-[var(--color-stone)]">
                  <span>{hero.author}</span>
                  <span>·</span>
                  <span>{formatDate(hero.publishedAt)}</span>
                  <span>·</span>
                  <span>{hero.readingTime} min de lecture</span>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                  Lire l&apos;article
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="bg-[var(--color-cream)] py-20">
          <div className="container-luxe">
            <div className="mb-12 text-center">
              <div className="eyebrow">Tout le journal</div>
              <h3 className="mt-3 font-serif text-3xl text-[var(--color-charcoal)]">
                Articles récents.
              </h3>
            </div>
            <div className="grid gap-12 md:grid-cols-2">
              {rest.map((a) => (
                <Link
                  key={a.slug}
                  href={`/journal/${a.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/2] overflow-hidden rounded-[14px] bg-[var(--color-charcoal)]">
                    <Image
                      src={a.imageHero}
                      alt={a.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-6">
                    <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                      {a.category}
                    </div>
                    <h3 className="mt-3 font-serif text-2xl leading-snug text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)] transition-colors md:text-3xl">
                      {a.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">
                      {a.lead}
                    </p>
                    <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--color-stone)]">
                      <span>{a.author}</span>
                      <span>·</span>
                      <span>{formatDate(a.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[var(--color-charcoal)] py-16 text-white">
        <div className="container-luxe text-center">
          <div className="eyebrow-light">
            Recevoir le journal
          </div>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl">
            Une fois par mois, dans votre boîte.
          </h2>
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 rounded-[10px] border border-white/30 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/50 focus:border-[var(--color-accent-light)] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-[10px] bg-[var(--color-accent)] px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-accent-deep)]"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
