import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import PropertyCard from "@/components/PropertyCard";
import { getAllProperties } from "@/lib/db";
import { COLLECTIONS, findCollection } from "@/data/collections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const col = findCollection(slug);
  if (!col) return { title: "Collection" };
  return {
    title: `${col.title} — Marrakech Realty`,
    description: col.subtitle,
    alternates: { canonical: `/collections/${col.slug}` },
  };
}

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const col = findCollection(slug);
  if (!col) notFound();

  const properties = await getAllProperties();
  let matches = properties.filter(col.filter);
  if (col.sort) {
    matches = [...matches].sort(col.sort);
  }

  return (
    <>
      <SectionHero
        eyebrow={col.eyebrow}
        title={col.title}
        subtitle={col.subtitle}
      />

      <section className="bg-[var(--color-cream)] py-12">
        <div className="container-luxe">
          <div className="flex items-center gap-3 text-xs text-[var(--color-stone)]">
            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 uppercase tracking-[0.22em] hover:text-[var(--color-terracotta)]"
            >
              <ArrowLeft size={11} />
              Toutes les collections
            </Link>
            <span>·</span>
            <span>
              {matches.length} bien{matches.length > 1 ? "s" : ""} sélectionné
              {matches.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-cream)] pb-20">
        <div className="container-luxe">
          {matches.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[var(--color-beige-warm)] bg-white p-12 text-center">
              <div className="font-serif text-xl text-[var(--color-charcoal)]">
                Aucun bien ne correspond actuellement.
              </div>
              <p className="mt-3 text-sm text-[var(--color-stone)]">
                Cette collection évolue chaque semaine — revenez bientôt, ou
                parlez directement à un conseiller.
              </p>
              <Link href="/contact" className="btn-outline mt-6">
                Décrire votre projet
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((p, i) => (
                <PropertyCard key={p.slug} property={p} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
