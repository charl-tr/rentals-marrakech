import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import { getAllProperties } from "@/lib/db";
import { COLLECTIONS } from "@/data/collections";

export const metadata: Metadata = {
  title: "Collections — Marrakech Realty",
  description:
    "Parcourir par intention : pour vivre, pour investir, pour la retraite, pour la mer. Nos sélections curatoriales.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsIndexPage() {
  const properties = await getAllProperties();

  return (
    <>
      <SectionHero
        eyebrow="Collections curatoriales"
        title={
          <>
            Parcourir<br />
            <span className="italic text-[var(--color-terracotta-light)]">
              par ambiance.
            </span>
          </>
        }
        subtitle="Plutôt que des filtres, des intentions. Chaque collection rassemble les biens qui répondent à un projet de vie précis."
      />

      <section className="bg-[var(--color-cream)] py-20">
        <div className="container-luxe">
          <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
            {COLLECTIONS.map((col) => {
              const matches = properties.filter(col.filter);
              const hero = matches[0]?.images[0];
              return (
                <Link
                  key={col.slug}
                  href={`/collections/${col.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-[16px] bg-[var(--color-charcoal)]"
                >
                  {hero && (
                    <Image
                      src={hero}
                      alt={col.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/85 via-[var(--color-charcoal)]/30 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                    <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
                      {col.eyebrow}
                    </div>
                    <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
                      {col.title}
                    </h2>
                    <p className="mt-3 max-w-md text-sm text-white/80">
                      {col.subtitle}
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-terracotta-light)]">
                      {matches.length} bien{matches.length > 1 ? "s" : ""}
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
