import Image from "next/image";
import HeroSearch, { type HeroSearchOption } from "./HeroSearch";

/** One composition for both languages: no locale-specific sizing or imagery. */
export default function HomeHero({ locale = "fr", typeOptions, zoneOptions, resultCount }: {
  locale?: "fr" | "en";
  typeOptions: HeroSearchOption[];
  zoneOptions: HeroSearchOption[];
  resultCount: number;
}) {
  const en = locale === "en";
  return <section data-home-hero className="home-hero relative flex min-h-[100svh] items-end bg-[#075581] pt-28 md:h-[100dvh] md:min-h-[720px] md:pb-20">
    <Image src="/hero-home.jpg" alt={en ? "Villa with a pool in Marrakech — ochre walls and palm trees" : "Villa avec piscine à Marrakech — murs ocre et palmiers"} fill priority sizes="100vw" className="object-cover" />
    <div className="absolute inset-0 hero-overlay-bottom" />
    <div className="container-luxe relative z-10">
      <div className="mb-6 max-w-2xl animate-fade-up md:mb-14">
        <div className="mb-4 eyebrow-light">Marrakech &amp; Essaouira</div>
        <h1 className="hero-text font-serif text-5xl leading-[1.05] text-white sm:text-6xl lg:text-[68px]">
          {en ? "The art of living" : "L’art de vivre"}<br />
          <span className="italic text-[var(--color-accent-light)]">{en ? "in Marrakech." : "marrakchi."}</span>
        </h1>
      </div>
      <HeroSearch locale={locale} typeOptions={typeOptions} zoneOptions={zoneOptions} resultCount={resultCount} />
    </div>
  </section>;
}
