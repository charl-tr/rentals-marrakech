import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Catalogue from "@/components/Catalogue";
import PropertyDetail from "@/components/PropertyDetail";
import { type Property } from "@/data/properties";
import { getPropertyBySlug } from "@/lib/db";

const LOUER_BASE = (p: Property) =>
  p.listing === "location" || p.listing === "location-saisonniere";

type Route =
  | { kind: "catalogue" }
  | { kind: "villa" }
  | { kind: "appartement" }
  | { kind: "saisonnier" }
  | { kind: "fiche"; property: Property }
  | { kind: "notfound" };

async function resolve(path: string[]): Promise<Route> {
  if (path.length === 0) return { kind: "catalogue" };
  if (path.length === 1) {
    if (path[0] === "villa") return { kind: "villa" };
    if (path[0] === "appartement") return { kind: "appartement" };
    if (path[0] === "saisonnier") return { kind: "saisonnier" };
    const property = await getPropertyBySlug(path[0]);
    if (property && LOUER_BASE(property)) return { kind: "fiche", property };
    return { kind: "notfound" };
  }
  return { kind: "notfound" };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path = [] } = await params;
  const route = await resolve(path);

  if (route.kind === "fiche") {
    const p = route.property;
    return {
      title: `${p.title} — Marrakech Realty`,
      description: p.shortDescription,
      openGraph: {
        title: p.title,
        description: p.shortDescription,
        images: [p.images[0]],
        type: "website",
      },
      alternates: { canonical: `/louer/${p.slug}` },
    };
  }
  return {
    title: "Louer à Marrakech — Marrakech Realty",
    description:
      "Locations longue durée meublées et locations saisonnières privatisées — riads, villas et appartements de standing.",
    alternates: { canonical: "/louer" },
  };
}

export default async function LouerPage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { path = [] } = await params;
  const route = await resolve(path);

  if (route.kind === "notfound") notFound();
  if (route.kind === "fiche") return <PropertyDetail property={route.property} />;

  // searchParams n'est lu que pour les catalogues → les fiches restent statiques (ISR).
  const sp = await searchParams;

  const selected: Record<string, string | undefined> = {};
  ["type", "quartier", "ville", "budget", "chambres", "piscine", "duree", "tri", "vue"].forEach(
    (k) => {
      const v = sp[k];
      if (typeof v === "string") selected[k] = v;
    }
  );

  if (route.kind === "catalogue") {
    return (
      <Catalogue
        eyebrow="Louer — Marrakech & Essaouira"
        title="S'installer ou séjourner, dans des biens choisis."
        subtitle="Locations longue durée meublées, locations saisonnières privatisées — toutes nos offres en cours."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Louer" }]}
        prefilter={LOUER_BASE}
        filterMode="location"
        baseHref="/louer"
        selectedFilters={selected}
        visibleFilters={{
          type: true,
          neighborhood: true,
          city: true,
          budget: true,
          bedrooms: true,
          duration: true,
        }}
      />
    );
  }

  if (route.kind === "villa") {
    return (
      <Catalogue
        eyebrow="Louer · Villa"
        title="Villas à louer."
        subtitle="Locations longue durée meublées en domaine sécurisé."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Louer", href: "/louer" },
          { label: "Villa" },
        ]}
        prefilter={(p) => p.listing === "location" && p.type === "villa"}
        filterMode="location"
        baseHref="/louer/villa"
        selectedFilters={selected}
        visibleFilters={{ neighborhood: true, budget: true, bedrooms: true }}
      />
    );
  }

  if (route.kind === "appartement") {
    return (
      <Catalogue
        eyebrow="Louer · Appartement"
        title="Appartements à louer."
        subtitle="Locations longue durée dans des résidences de standing."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Louer", href: "/louer" },
          { label: "Appartement" },
        ]}
        prefilter={(p) => p.listing === "location" && p.type === "appartement"}
        filterMode="location"
        baseHref="/louer/appartement"
        selectedFilters={selected}
        visibleFilters={{ neighborhood: true, budget: true, bedrooms: true }}
      />
    );
  }

  if (route.kind === "saisonnier") {
    return (
      <Catalogue
        eyebrow="Locations saisonnières"
        title="Riads et villas privatisés."
        subtitle="Locations à la semaine — service complet, chef et majordome inclus selon le bien."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Louer", href: "/louer" },
          { label: "Saisonnier" },
        ]}
        prefilter={(p) => p.listing === "location-saisonniere"}
        filterMode="location"
        baseHref="/louer/saisonnier"
        selectedFilters={selected}
        visibleFilters={{ neighborhood: true, city: true, bedrooms: true }}
      />
    );
  }

  notFound();
}
