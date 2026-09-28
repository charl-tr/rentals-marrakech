import Image from "next/image";
import Link from "next/link";
import { languagePath } from "@/lib/i18n/routes";
import OriginalEditorialNotice from "@/components/OriginalEditorialNotice";
import { ArrowRight } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import { getAllArticles } from "@/lib/db";



const formatDate = (iso: string, locale: "fr" | "en") =>
  new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export default async function JournalPage({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const articles = await getAllArticles();
  const [hero, ...rest] = articles;

  return (
    <>
      <SectionHero locale={locale}
        eyebrow={en ? "Journal" : "Journal éditorial"}
        title={
          <>
            {en ? "Stories, perspectives," : "Histoires, regards,"}<br />
            <span className="italic text-[var(--color-accent-light)]">{en ? "insights" : "analyses"}</span>.
          </>
        }
        subtitle={en ? "Moroccan property, riad restoration and life in Marrakech. Stories from neighbourhoods, owners and our team." : "Marché immobilier marocain, restauration des riads, art de vivre marrakchi, portraits de quartiers et de propriétaires. Les coulisses de notre métier."}
      />

      <OriginalEditorialNotice locale={locale} href="/journal" />
      {hero && (
        <section className="bg-white py-20">
          <div className="container-luxe">
            <Link
              href={languagePath(`/journal/${hero.slug}`, locale)}
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
                  {en ? "Featured" : "À la une"} · {hero.category}
                </div>
                <h2 lang="fr" className="mt-5 font-serif text-4xl leading-[1.1] text-[var(--color-charcoal)] md:text-5xl group-hover:text-[var(--color-terracotta)] transition-colors">
                  {hero.title}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-[var(--color-stone)]">
                  {hero.lead}
                </p>
                <div className="mt-8 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-[var(--color-stone)]">
                  <span>{hero.author}</span>
                  <span>·</span>
                  <span>{formatDate(hero.publishedAt, locale)}</span>
                  <span>·</span>
                  <span>{hero.readingTime} {en ? "min read" : "min de lecture"}</span>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                  {en ? "Read article" : <>Lire l&apos;article</>}
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
              <div className="eyebrow">{en ? "All stories" : "Tout le journal"}</div>
              <h3 lang="fr" className="mt-3 font-serif text-3xl text-[var(--color-charcoal)]">
                {en ? "Recent articles." : "Articles récents."}
              </h3>
            </div>
            <div className="grid gap-12 md:grid-cols-2">
              {rest.map((a) => (
                <Link
                  key={a.slug}
                  href={languagePath(`/journal/${a.slug}`, locale)}
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
                    <h3 lang="fr" className="mt-3 font-serif text-2xl leading-snug text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)] transition-colors md:text-3xl">
                      {a.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">
                      {a.lead}
                    </p>
                    <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--color-stone)]">
                      <span>{a.author}</span>
                      <span>·</span>
                      <span>{formatDate(a.publishedAt, locale)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-y border-[var(--color-border)] bg-[var(--color-beige)] py-16">
        <div className="container-luxe text-center">
          <div className="eyebrow">
            {en ? "Stay in touch" : "Gardons le contact"}
          </div>
          <h2 lang="fr" className="mt-4 font-serif text-3xl md:text-4xl">
            {en ? "Talk to our team about your project." : "Échangeons sur votre projet."}
          </h2>
          <Link href={languagePath("/contact", locale)} className="btn-gold mt-8 inline-flex">{en ? "Contact our team" : "Contacter l’équipe"}</Link>
        </div>
      </section>
    </>
  );
}
