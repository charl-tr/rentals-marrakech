import Image from "next/image";
import Link from "next/link";
import {
  Award,
  ArrowRight,
  Building2,
  Compass,
  Key,
  Quote,
  Search,
  Shield,
  Star,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import FadeInOnScroll from "@/components/FadeInOnScroll";
import PressMentions from "@/components/PressMentions";
import { getFeaturedProperties, getFirstEssaouiraProperty } from "@/lib/db";

const STATS = [
  { value: "2000", label: "Fondée en" },
  { value: "380+", label: "Biens accompagnés" },
  { value: "< 2h", label: "Temps de 1ʳᵉ réponse" },
  { value: "Guéliz", label: "42, rue de la Liberté" },
];

const SERVICES = [
  {
    icon: Key,
    title: "Achat & Vente",
    description:
      "De la première visite à la signature chez le notaire — accompagnement complet, négociation et suivi administratif.",
  },
  {
    icon: Building2,
    title: "Location longue durée",
    description:
      "Biens meublés et non meublés sélectionnés, baux sécurisés, états des lieux rigoureux.",
  },
  {
    icon: Compass,
    title: "Gestion locative",
    description:
      "Conciergerie complète, gestion saisonnière, optimisation fiscale et rapports trimestriels.",
  },
  {
    icon: Shield,
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
    rating: 5,
  },
  {
    quote:
      "Leur connaissance de la Palmeraie est sans équivalent. Négociation sérieuse, contrats bétonnés, et ils ont anticipé tous les pièges administratifs. On leur confie désormais notre gestion locative.",
    name: "Hans Böhmer",
    role: "Munich — Villa Palmeraie",
    rating: 5,
  },
  {
    quote:
      "Accompagnement premium de A à Z pour notre maison d'hôtes d'Essaouira. Ils comprennent le business, pas juste l'immobilier. Je recommande à tous mes investisseurs.",
    name: "Amélie Rousseau",
    role: "Bruxelles — Maison d'hôtes Essaouira",
    rating: 5,
  },
];

export default async function Home() {
  const featuredProperties = await getFeaturedProperties(12);
  const essaouiraFallback = await getFirstEssaouiraProperty();

  const essaouiraHighlight =
    featuredProperties.find((p) => p.city === "Essaouira") ?? essaouiraFallback;
  const essaouiraImage = essaouiraHighlight?.images[0] ?? "/hero-home.jpg";
  const ctaVendreImage =
    featuredProperties[3]?.images[0] ?? "/hero-home.jpg";
  const ctaAcheterImage =
    featuredProperties[4]?.images[0] ?? "/hero-home.jpg";

  return (
    <>
      {/* HERO — image statique Marrakech, texte aligné gauche */}
      <section className="relative flex h-[100dvh] min-h-[600px] items-end overflow-hidden pb-32 md:min-h-[720px] md:pb-40">
        <Image
          src="/hero-home.jpg"
          alt="Villa avec piscine à Marrakech — murs ocre et palmiers"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="hero-overlay-bottom absolute inset-0" />
        <div className="hero-overlay-left absolute inset-0" />

        <div className="container-luxe relative z-10 text-white">
          <div className="max-w-2xl animate-fade-up">
            <div className="mb-5 text-[12px] font-medium uppercase tracking-[0.28em] text-white/80">
              Agence immobilière · Marrakech & Essaouira
            </div>
            <h1 className="hero-text font-serif text-[2.6rem] leading-[1.06] text-white sm:text-5xl md:text-7xl lg:text-[80px]">
              L&apos;art de vivre<br />
              <span className="italic text-[var(--color-terracotta-light)]">
                marrakchi.
              </span>
            </h1>
            <p className="hero-text-soft mt-6 max-w-lg text-base leading-relaxed text-white/85 sm:mt-8 md:text-lg">
              Riads restaurés, villas d&apos;architecte, appartements de caractère.
              Une sélection confidentielle, des histoires à habiter.
            </p>
          </div>

          <form
            action="/acheter"
            method="get"
            className="mt-10 max-w-4xl animate-fade-up bg-white/95 p-2 shadow-[var(--shadow-luxe)] backdrop-blur-sm sm:mt-14"
          >
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="border-b border-[var(--color-beige-warm)] p-5 text-left md:border-b-0 md:border-r">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Type de bien
                </span>
                <select
                  name="type"
                  defaultValue=""
                  className="mt-1.5 w-full bg-transparent text-sm font-medium text-[var(--color-charcoal)] focus:outline-none"
                >
                  <option value="">Tous les biens</option>
                  <option value="riad-renove">Riad rénové</option>
                  <option value="riad-a-renover">Riad à rénover</option>
                  <option value="villa">Villa</option>
                  <option value="appartement">Appartement</option>
                  <option value="programme-neuf">Programme neuf</option>
                  <option value="terrain">Terrain</option>
                </select>
              </label>
              <label className="border-b border-[var(--color-beige-warm)] p-5 text-left md:border-b-0 md:border-r">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Quartier
                </span>
                <select
                  name="quartier"
                  defaultValue=""
                  className="mt-1.5 w-full bg-transparent text-sm font-medium text-[var(--color-charcoal)] focus:outline-none"
                >
                  <option value="">Toutes les zones</option>
                  <option value="medina">Médina</option>
                  <option value="palmeraie">Palmeraie</option>
                  <option value="hivernage">Hivernage</option>
                  <option value="gueliz">Guéliz</option>
                  <option value="targa">Targa</option>
                  <option value="amelkis">Amelkis</option>
                  <option value="ourika">Route de l&apos;Ourika</option>
                  <option value="diabat">Diabat (Essaouira)</option>
                </select>
              </label>
              <label className="border-b border-[var(--color-beige-warm)] p-5 text-left md:border-b-0 md:border-r">
                <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  Budget
                </span>
                <select
                  name="budget"
                  defaultValue=""
                  className="mt-1.5 w-full bg-transparent text-sm font-medium text-[var(--color-charcoal)] focus:outline-none"
                >
                  <option value="">Tous budgets</option>
                  <option value="300">Jusqu&apos;à 300 000 €</option>
                  <option value="600">300 000 € – 600 000 €</option>
                  <option value="1000">600 000 € – 1 M€</option>
                  <option value="2000">1 M€ – 2 M€</option>
                  <option value="high">Plus de 2 M€</option>
                </select>
              </label>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-[var(--color-charcoal)] px-8 py-5 text-sm font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-terracotta)]"
              >
                <Search size={16} />
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[var(--color-charcoal)] text-white">
        <div className="container-luxe grid grid-cols-2 gap-4 py-10 sm:gap-6 md:grid-cols-4 md:gap-8 md:py-14">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-3xl text-[var(--color-terracotta)] sm:text-4xl md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="bg-[var(--color-cream)] py-28">
        <div className="container-luxe">
          <FadeInOnScroll as="div" className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <div className="eyebrow">Notre sélection</div>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                Biens d&apos;exception<br />
                <span className="italic text-[var(--color-terracotta)]">du moment</span>.
              </h2>
              <p className="mt-6 text-[var(--color-stone)]">
                Une sélection confidentielle mise à jour chaque semaine par nos conseillers.
              </p>
            </div>
            <Link
              href="/acheter"
              className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
            >
              Tous les biens
              <ArrowRight size={16} />
            </Link>
          </FadeInOnScroll>

          {featuredProperties.length >= 3 && (
            <div className="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
              <Link
                href={`/acheter/${featuredProperties[0].slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-[var(--color-charcoal)] shadow-[var(--shadow-card)] transition-shadow duration-500 hover:shadow-[var(--shadow-luxe)] lg:aspect-auto"
              >
                <Image
                  src={featuredProperties[0].images[0]}
                  alt={featuredProperties[0].title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/80 via-[var(--color-charcoal)]/15 to-transparent" />

                <div className="absolute inset-x-0 top-0 flex items-start gap-3 p-6">
                  {featuredProperties[0].exclusivity && (
                    <span className="bg-[var(--color-terracotta)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white">
                      ★ Exclusivité
                    </span>
                  )}
                  <span className="bg-white/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] backdrop-blur-sm">
                    {featuredProperties[0].city}, {featuredProperties[0].neighborhood}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-10">
                  <div className="hero-text-soft text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
                    Le bien vedette
                  </div>
                  <h3 className="mt-4 max-w-md font-serif text-3xl leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-4xl lg:text-5xl">
                    {featuredProperties[0].tagline}
                  </h3>
                  <div className="mt-6 flex items-end justify-between border-t border-white/20 pt-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/90">
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
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">
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
          )}

          <div className="mt-20 text-center">
            <Link href="/acheter" className="btn-outline">
              Voir tous les biens à vendre
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-white py-28">
        <div className="container-luxe">
          <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow">Nos services</div>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                Un accompagnement<br />sans compromis.
              </h2>
              <p className="mt-6 text-[var(--color-stone)]">
                Depuis 2000, nous guidons investisseurs, expatriés et amoureux du Maroc à travers
                chaque étape d&apos;un projet immobilier — de la première visite au bail de gestion.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]"
              >
                Nous rencontrer
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-px bg-[var(--color-beige-warm)] md:grid-cols-2">
              {SERVICES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group bg-white p-8 transition-colors hover:bg-[var(--color-cream)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center border border-[var(--color-terracotta)] text-[var(--color-terracotta)] transition-colors group-hover:bg-[var(--color-terracotta)] group-hover:text-white">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 font-serif text-xl">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRESS MENTIONS */}
      <PressMentions />

      {/* ESSAOUIRA IMMERSIVE */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[640px]">
          {essaouiraImage && (
            <Image
              src={essaouiraImage}
              alt={essaouiraHighlight?.title ?? "Essaouira — cité des Alizés"}
              fill
              sizes="100vw"
              className="object-cover animate-ken-burns"
            />
          )}
          <div className="hero-overlay-bottom absolute inset-0" />
          <div className="hero-overlay-left absolute inset-0" />

          <div className="container-luxe relative z-10 flex min-h-[640px] items-center py-20">
            <FadeInOnScroll as="div" className="max-w-xl text-white">
              <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
                Cap sur l&apos;océan
              </div>
              <h2 className="mt-5 hero-text font-serif text-5xl leading-tight md:text-6xl">
                Essaouira,<br />
                <span className="italic text-[var(--color-terracotta-light)]">l&apos;autre Maroc.</span>
              </h2>
              <p className="hero-text-soft mt-8 text-white/85 md:text-lg">
                À trois heures de Marrakech, la cité des Alizés conjugue médina UNESCO, plages
                infinies et douceur de vivre. Nos biens à Essaouira : riads à restaurer, maisons
                d&apos;hôtes en activité, villas contemporaines pieds dans l&apos;eau.
              </p>
              <Link
                href="/essaouira"
                className="btn-outline-light mt-10"
              >
                Explorer Essaouira
                <ArrowRight size={16} />
              </Link>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
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
                <Quote size={32} className="text-[var(--color-terracotta)]" strokeWidth={1.2} />
                <blockquote className="mt-6 flex-1 font-serif text-lg leading-relaxed text-[var(--color-charcoal)]">
                  « {t.quote} »
                </blockquote>
                <div className="mt-8 flex items-center gap-1 text-[var(--color-terracotta)]">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
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

          <div className="mt-14 flex items-center justify-center gap-2 text-[var(--color-stone)]">
            <Award size={16} className="text-[var(--color-terracotta)]" />
            <span className="text-sm">
              Agence certifiée FNAIM · Note Google 4.9/5 (186 avis)
            </span>
          </div>
        </div>
      </section>

      {/* DOUBLE CTA — Vendre / Acheter */}
      <section className="grid md:grid-cols-2">
        <div className="relative min-h-[420px] overflow-hidden">
          <Image
            src={ctaVendreImage}
            alt="Vendre avec Marrakech Realty"
            fill
            sizes="50vw"
            className="object-cover transition-transform duration-[900ms] hover:scale-105"
          />
          <div className="absolute inset-0 bg-[var(--color-charcoal)]/65" />
          <div className="relative z-10 flex h-full min-h-[420px] flex-col items-start justify-center p-12 text-white md:p-16">
            <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
              Vous vendez ?
            </div>
            <h3 className="mt-5 hero-text font-serif text-4xl leading-tight md:text-5xl">
              Estimation gratuite<br />sous 24 heures.
            </h3>
            <p className="hero-text-soft mt-5 max-w-md text-white/85">
              Un conseiller senior évalue votre bien et vous remet une estimation argumentée,
              appuyée sur les transactions comparables des 18 derniers mois.
            </p>
            <Link href="/deposer-un-bien" className="btn-gold mt-8">
              Déposer mon bien
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden">
          <Image
            src={ctaAcheterImage}
            alt="Acheter avec Marrakech Realty"
            fill
            sizes="50vw"
            className="object-cover transition-transform duration-[900ms] hover:scale-105"
          />
          <div className="absolute inset-0 bg-[var(--color-charcoal)]/65" />
          <div className="relative z-10 flex h-full min-h-[420px] flex-col items-start justify-center p-12 text-white md:p-16">
            <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
              Vous recherchez ?
            </div>
            <h3 className="mt-5 hero-text font-serif text-4xl leading-tight md:text-5xl">
              Recherche<br />personnalisée.
            </h3>
            <p className="hero-text-soft mt-5 max-w-md text-white/85">
              Décrivez-nous votre projet : nous activons notre réseau et notre portefeuille
              confidentiel pour vous trouver le bien qui vous ressemble.
            </p>
            <Link href="/acheter" className="btn-outline-light mt-8">
              Explorer les biens
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
