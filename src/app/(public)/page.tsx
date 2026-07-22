import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Star } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import FadeInOnScroll from "@/components/FadeInOnScroll";
import PressMentions from "@/components/PressMentions";
import HeroSearch from "@/components/HeroSearch";
import { getFeaturedProperties, getFirstEssaouiraProperty } from "@/lib/db";

// ISR — home en cache, revalidée toutes les 5 min. Navigation quasi instantanée.
export const revalidate = 300;

const STATS = [
  { value: "2000", label: "Maison fondée" },
  { value: "< 2h", label: "Première réponse" },
  { value: "25 ans", label: "D'expertise terrain" },
];

const SERVICES = [
  {
    n: "01",
    title: "Achat & Vente",
    description:
      "De la première visite à la signature chez le notaire — accompagnement complet, négociation et suivi administratif.",
  },
  {
    n: "02",
    title: "Location longue durée",
    description:
      "Biens meublés et non meublés sélectionnés, baux sécurisés, états des lieux rigoureux.",
  },
  {
    n: "03",
    title: "Gestion locative",
    description:
      "Conciergerie complète, gestion saisonnière, optimisation fiscale et rapports trimestriels.",
  },
  {
    n: "04",
    title: "Conseil juridique",
    description:
      "Structuration d'acquisition, SCI marocaine, régime fiscal, accompagnement par notaires partenaires.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Après deux ans de recherche infructueuse, Marrakech Realty nous a trouvé le riad de nos rêves en trois semaines. Un suivi d'une élégance rare, jusque dans les moindres détails de la restauration.",
    name: "Claire & Philippe M.",
    role: "Paris — Riad Médina",
  },
  {
    quote:
      "Leur connaissance de la Palmeraie est sans équivalent. Négociation sérieuse, contrats bétonnés, et ils ont anticipé tous les pièges administratifs. On leur confie désormais notre gestion locative.",
    name: "Hans Böhmer",
    role: "Munich — Villa Palmeraie",
  },
  {
    quote:
      "Accompagnement premium de A à Z pour notre maison d'hôtes d'Essaouira. Ils comprennent le business, pas juste l'immobilier. Je recommande à tous mes investisseurs.",
    name: "Amélie Rousseau",
    role: "Bruxelles — Maison d'hôtes Essaouira",
  },
];

export default async function Home() {
  const featuredProperties = await getFeaturedProperties(12);
  await getFirstEssaouiraProperty();

  return (
    <>
      {/* ═══ HERO — image Marrakech (la seule image "hero" du site) ═══ */}
      <section className="relative flex h-[100dvh] min-h-[600px] items-end overflow-hidden pb-14 md:min-h-[720px] md:pb-20">
        <Image
          src="/hero-home.jpg"
          alt="Villa avec piscine à Marrakech — murs ocre et palmiers"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(22,19,15,0.80)] via-[rgba(22,19,15,0.20)] to-[rgba(22,19,15,0.12)]" />

        <div className="container-luxe relative z-10">
          <div className="mb-10 max-w-xl animate-fade-up md:mb-14">
            <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.32em] text-white/60">
              Marrakech &amp; Essaouira
            </div>
            <h1 className="hero-text font-serif text-[2.4rem] leading-[1.06] text-white sm:text-[3.2rem] md:text-[3.6rem]">
              L&apos;art de vivre<br />
              <span className="italic text-[var(--color-terracotta-glow)]">
                marrakchi.
              </span>
            </h1>
          </div>
          <HeroSearch />
        </div>
      </section>

      {/* ═══ STATS — section NOIRE (tempo) ═══ */}
      <section className="bg-[var(--color-charcoal-deep)] text-white">
        <div className="container-luxe grid grid-cols-3 gap-6 py-14 md:gap-8 md:py-20">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-4xl text-[var(--color-terracotta-light)] md:text-6xl">
                {stat.value}
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.28em] text-white/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MANIFESTE — BLANC, éditorial, l'âme de la maison ═══ */}
      <section className="bg-white py-28 md:py-36">
        <div className="container-luxe">
          <FadeInOnScroll as="div" className="mx-auto max-w-3xl text-center">
            <div className="eyebrow">La maison</div>
            <h2 className="mt-6 font-serif text-3xl leading-[1.2] text-[var(--color-charcoal)] md:text-[2.75rem]">
              Vingt-cinq ans à lire Marrakech, rue par rue.
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[var(--color-stone)] md:text-lg">
              Nous ne vendons pas des mètres carrés. Nous confions des lieux qui ont
              une histoire — un riad restauré au cœur de la Médina, une villa d&apos;architecte
              dans la Palmeraie, une maison d&apos;hôtes face à l&apos;Atlantique.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-stone)] md:text-lg">
              Chaque bien de notre portefeuille est visité, vérifié, raconté. Une sélection
              confidentielle, pour une clientèle qui sait ce qu&apos;elle cherche.
            </p>
            <div className="gold-rule" />
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══ FEATURED — CRÈME, mosaïque des vrais biens ═══ */}
      {featuredProperties.length >= 3 && (
        <section className="bg-[var(--color-cream)] py-28">
          <div className="container-luxe">
            <FadeInOnScroll as="div" className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <div className="eyebrow">Notre sélection</div>
                <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                  Biens d&apos;exception<br />
                  <span className="italic text-[var(--color-terracotta)]">du moment</span>.
                </h2>
              </div>
              <Link
                href="/acheter"
                className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
              >
                Tous les biens
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </FadeInOnScroll>

            <div className="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
              <Link
                href={`/acheter/${featuredProperties[0].slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-[var(--color-charcoal-deep)] shadow-[var(--shadow-card)] transition-shadow duration-500 hover:shadow-[var(--shadow-luxe)] lg:aspect-auto"
              >
                <Image
                  src={featuredProperties[0].images[0]}
                  alt={featuredProperties[0].title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
                <div className="hero-overlay-bottom absolute inset-0" />

                <div className="absolute inset-x-0 top-0 flex items-start gap-3 p-6">
                  {featuredProperties[0].exclusivity && (
                    <span className="bg-[var(--color-terracotta)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white">
                      Exclusivité
                    </span>
                  )}
                  <span className="bg-white/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] backdrop-blur-sm">
                    {featuredProperties[0].city}, {featuredProperties[0].neighborhood}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
                  <div className="hero-text-soft text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-glow)]">
                    Le bien vedette
                  </div>
                  <h3 className="mt-4 max-w-md font-serif text-3xl leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-4xl lg:text-5xl">
                    {featuredProperties[0].tagline}
                  </h3>
                  <div className="mt-6 flex items-end justify-between border-t border-white/20 pt-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/80">
                        Prix de vente
                      </div>
                      <div className="mt-1 font-serif text-2xl md:text-3xl">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: featuredProperties[0].currency,
                          maximumFractionDigits: 0,
                        }).format(featuredProperties[0].price)}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/80">
                      Réf. {featuredProperties[0].reference}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="flex flex-col gap-8 lg:gap-10">
                {featuredProperties.slice(1, 3).map((property) => (
                  <PropertyCard key={property.slug} property={property} />
                ))}
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link href="/acheter" className="btn-outline">
                Voir tous les biens à vendre
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ SERVICES — NOIR, éditorial numéroté (zéro icône) ═══ */}
      <section className="bg-[var(--color-charcoal-deep)] py-28 text-white md:py-32">
        <div className="container-luxe">
          <FadeInOnScroll as="div" className="max-w-2xl">
            <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
              Nos métiers
            </div>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">
              Un accompagnement<br />sans compromis.
            </h2>
            <p className="mt-6 max-w-lg text-white/60">
              Depuis 2000, nous guidons investisseurs, expatriés et amoureux du Maroc —
              de la première visite au bail de gestion.
            </p>
          </FadeInOnScroll>

          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2">
            {SERVICES.map((s) => (
              <div
                key={s.n}
                className="group bg-[var(--color-charcoal-deep)] p-8 transition-colors hover:bg-[var(--color-dark-soft)] md:p-10"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-2xl text-[var(--color-terracotta-light)]">
                    {s.n}
                  </span>
                  <h3 className="font-serif text-xl text-white md:text-2xl">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link href="/contact" className="btn-outline-light">
              Nous rencontrer
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ PRESS — BLANC ═══ */}
      <PressMentions />

      {/* ═══ ESSAOUIRA — NOIR éditorial, ZÉRO image (fini la Guadeloupe) ═══ */}
      <section className="relative overflow-hidden bg-[var(--color-charcoal-deep)] py-28 text-white md:py-36">
        {/* filet terracotta décoratif discret */}
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[var(--color-terracotta)] to-transparent opacity-40" />
        <div className="container-luxe">
          <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:items-center md:gap-20">
            <FadeInOnScroll as="div">
              <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
                Cap sur l&apos;océan
              </div>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-6xl">
                Essaouira,<br />
                <span className="italic text-[var(--color-terracotta-glow)]">
                  l&apos;autre Maroc.
                </span>
              </h2>
            </FadeInOnScroll>
            <FadeInOnScroll as="div">
              <p className="text-lg leading-relaxed text-white/70">
                À trois heures de Marrakech, la cité des Alizés conjugue médina UNESCO,
                remparts battus par le vent et douceur de vivre. Riads à restaurer,
                maisons d&apos;hôtes en activité, villas pieds dans l&apos;eau.
              </p>
              <Link href="/essaouira" className="btn-outline-light mt-10">
                Explorer Essaouira
                <ArrowRight size={16} />
              </Link>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS — CRÈME ═══ */}
      <section className="bg-[var(--color-cream)] py-28">
        <div className="container-luxe">
          <FadeInOnScroll as="div" className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">Ils nous font confiance</div>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Paroles de clients</h2>
            <div className="gold-rule" />
          </FadeInOnScroll>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col bg-white p-10 shadow-[var(--shadow-card)]"
              >
                <Quote size={28} className="text-[var(--color-terracotta)]" strokeWidth={1.2} />
                <blockquote className="mt-6 flex-1 font-serif text-lg leading-relaxed text-[var(--color-charcoal)]">
                  « {t.quote} »
                </blockquote>
                <div className="mt-8 flex items-center gap-1 text-[var(--color-terracotta)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <figcaption className="mt-4 border-t border-[var(--color-beige-warm)] pt-4">
                  <div className="font-medium text-[var(--color-charcoal)]">{t.name}</div>
                  <div className="mt-0.5 text-xs uppercase tracking-[0.18em] text-[var(--color-stone)]">
                    {t.role}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOUBLE CTA — deux blocs couleur pleins (fini les images stock) ═══ */}
      <section className="grid md:grid-cols-2">
        {/* Vendre — bloc NOIR */}
        <div className="flex flex-col items-start justify-center gap-6 bg-[var(--color-charcoal-deep)] p-12 py-20 text-white md:p-20">
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
            Vous vendez ?
          </div>
          <h3 className="font-serif text-3xl leading-tight text-white md:text-4xl">
            Estimation gratuite<br />sous 24 heures.
          </h3>
          <p className="max-w-md text-white/60">
            Un conseiller senior évalue votre bien et vous remet une estimation
            argumentée, appuyée sur les transactions comparables récentes.
          </p>
          <Link href="/deposer-un-bien" className="btn-gold mt-2">
            Déposer mon bien
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Acheter — bloc TERRACOTTA */}
        <div className="flex flex-col items-start justify-center gap-6 bg-[var(--color-terracotta)] p-12 py-20 text-white md:p-20">
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
            Vous recherchez ?
          </div>
          <h3 className="font-serif text-3xl leading-tight text-white md:text-4xl">
            Recherche<br />personnalisée.
          </h3>
          <p className="max-w-md text-white/80">
            Décrivez-nous votre projet : nous activons notre réseau et notre
            portefeuille confidentiel pour trouver le bien qui vous ressemble.
          </p>
          <Link href="/acheter" className="btn-outline-light mt-2">
            Explorer les biens
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
