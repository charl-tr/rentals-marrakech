import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCatalogueProperties } from "@/lib/db";
import { languagePath } from "@/lib/i18n/routes";
import PropertyCard from "@/components/PropertyCard";

export default async function EssaouiraDestination({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const properties = (await getCatalogueProperties("active")).filter(p => p.city === "Essaouira");
  const categories = [
    { slug: "vente-villa", label: en ? "Buy a villa" : "Acheter une villa", count: properties.filter(p => p.type === "villa" && p.listing === "vente").length },
    { slug: "vente-riad", label: en ? "Buy a riad" : "Acheter un riad", count: properties.filter(p => ["riad-renove", "riad-a-renover"].includes(p.type) && p.listing === "vente").length },
    { slug: "vente-terrain", label: en ? "Buy land" : "Acheter un terrain", count: properties.filter(p => p.type === "terrain" && p.listing === "vente").length },
    { slug: "location-villa", label: en ? "Rent a villa" : "Louer une villa", count: properties.filter(p => p.type === "villa" && p.listing !== "vente").length },
  ];
  return <>
    <section className="relative flex min-h-[85svh] items-end bg-[#285b70] pt-28" style={{ paddingBottom: "max(2.5rem, calc(var(--cookie-banner-height, 0px) + 1.5rem))" }}>
      <Image src="https://images.unsplash.com/photo-1743963790208-07ce117cdfc6?auto=format&w=2400&q=85"
        alt={en ? "Essaouira’s ramparts and Atlantic coastline" : "Les remparts d’Essaouira et la côte atlantique"} fill preload sizes="100vw" quality={75} className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#102b35]/90 via-[#102b35]/25 to-transparent" />
      <div className="container-luxe relative z-10 w-full">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/85">{en ? "Essaouira · Atlantic coast" : "Essaouira · Côte atlantique"}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] text-white md:text-7xl">Essaouira,<br /><span className="italic">{en ? "a life by the ocean." : "la vie côté océan."}</span></h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/90 md:text-lg">{en ? "A riad, a villa, a place of your own. Find your next property in Essaouira and its surroundings." : "Un riad, une villa, un lieu à soi. Trouvez votre prochain bien à Essaouira et dans ses environs."}</p>
        <nav aria-label={en ? "Your project in Essaouira" : "Votre projet à Essaouira"} className="mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-white/25 bg-white/10 p-2 shadow-xl backdrop-blur-xl md:mt-10 md:grid-cols-4">
          {categories.map(c => <Link key={c.slug} href={languagePath("/essaouira/" + c.slug, locale)} className="group flex min-h-24 items-center justify-between gap-2 rounded-xl px-4 py-4 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white md:px-6">
            <span><span className="block text-sm font-medium md:text-base">{c.label}</span><span className="mt-2 block text-xs text-white/75">{c.count ? en ? c.count + " properties" : c.count + (c.count > 1 ? " biens" : " bien") : en ? "Enquire about availability" : "Disponibilités à consulter"}</span></span>
            <ArrowUpRight size={18} className="shrink-0" aria-hidden />
          </Link>)}
        </nav>
      </div>
    </section>
    <section className="bg-[var(--color-cream)] py-10 md:py-14">
      <div className="container-luxe">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl md:text-4xl">{en ? "Explore properties in Essaouira." : "Votre projet prend forme."}</h2>
          <Link href={languagePath("/contact", locale)} className="text-sm text-[var(--color-accent-deep)] underline underline-offset-4">{en ? "Tell us what you’re looking for" : "Parlez-nous de votre recherche"}</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.slice(0, 6).map(p => <PropertyCard key={p.slug} property={p} locale={locale} />)}</div>
        <p className="mt-8 text-xs text-[var(--color-stone)]">Photo : <a href="https://unsplash.com/photos/GyIcdvrlY3U" target="_blank" rel="noopener noreferrer" className="underline">Anastasia Dimitri — Unsplash</a></p>
      </div>
    </section>
  </>;
}
