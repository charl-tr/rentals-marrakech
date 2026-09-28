import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Catalogue from "@/components/Catalogue";
import PropertyDetail from "@/components/PropertyDetail";
import {
  ALL_TYPES,
  NEIGHBORHOODS,
  propertyTypeLabel,
  type Property,
  type PropertySummary,
  type PropertyType,
} from "@/data/properties";
import { getPropertyBySlug } from "@/lib/db";

const VENTE_BASE = (p: PropertySummary) =>
  p.listing === "vente" || p.type === "programme-neuf";

type ResolvedRoute =
  | { kind: "catalogue" }
  | { kind: "type"; type: PropertyType }
  | { kind: "geo"; type: PropertyType; quartierSlug: string; quartierLabel: string }
  | { kind: "fiche"; property: Property }
  | { kind: "notfound" };

async function resolve(path: string[]): Promise<ResolvedRoute> {
  if (path.length === 0) return { kind: "catalogue" };

  const [first, second] = path;

  if (path.length === 1) {
    // Programmes-neufs alias
    if (first === "programmes-neufs") return { kind: "type", type: "programme-neuf" };
    // Type taxonomy
    if ((ALL_TYPES as readonly string[]).includes(first)) {
      return { kind: "type", type: first as PropertyType };
    }
    // Property slug?
    const property = await getPropertyBySlug(first);
    if (property && VENTE_BASE(property)) {
      return { kind: "fiche", property };
    }
    return { kind: "notfound" };
  }

  if (path.length === 2 && first === "villa") {
    const quartier = NEIGHBORHOODS.find((n) => n.slug === second);
    if (quartier) {
      return {
        kind: "geo",
        type: "villa",
        quartierSlug: quartier.slug,
        quartierLabel: quartier.label,
      };
    }
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

  if (route.kind === "catalogue") {
    return {
      title: "Acheter à Marrakech & Essaouira — Marrakech Realty",
      description:
        "Riads rénovés, villas de la Palmeraie, appartements de l'Hivernage, programmes neufs. Une sélection confidentielle d'agence immobilière de luxe.",
      alternates: { canonical: "/acheter" },
    };
  }
  if (route.kind === "type") {
    const label = propertyTypeLabel(route.type);
    return {
      title: route.type === "programme-neuf" ? "Programmes neufs à Marrakech et Essaouira" : route.type === "riad-a-renover" ? "Riads à rénover à vendre — Marrakech Realty" : `${label}s à vendre — Marrakech Realty`,
      description: `Notre sélection de ${label.toLowerCase()}s à Marrakech et Essaouira.`,
      alternates: { canonical: `/acheter/${route.type === "programme-neuf" ? "programmes-neufs" : route.type}` },
    };
  }
  if (route.kind === "geo") {
    return {
      title: `Villas à vendre — ${route.quartierLabel}, Marrakech`,
      description: `Sélection confidentielle de villas à ${route.quartierLabel}.`,
      alternates: { canonical: `/acheter/villa/${route.quartierSlug}` },
    };
  }
  if (route.kind === "fiche") {
    const p = route.property;
    return {
      title: p.seoTitle || `${p.title} — Marrakech Realty`,
      description: p.seoDescription || p.shortDescription,
      openGraph: {
        title: p.title,
        description: p.seoDescription || p.shortDescription,
        images: [p.images[0]],
        type: "website",
      },
      alternates: { canonical: `/acheter/${p.slug}` },
    };
  }
  return { title: "Page introuvable — Marrakech Realty" };
}

export default async function AcheterPage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { path = [] } = await params;
  const route = await resolve(path);

  if (route.kind === "notfound") notFound();

  if (route.kind === "fiche") {
    return <PropertyDetail property={route.property} />;
  }

  // searchParams n'est lu que pour les catalogues → les fiches restent statiques (ISR).
  const sp = await searchParams;

  // Convert searchParams to flat record
  const selected: Record<string, string | undefined> = {};
  ["type", "quartier", "ville", "budget", "chambres", "piscine", "tri", "vue", "page"].forEach(
    (k) => {
      const v = sp[k];
      if (typeof v === "string") selected[k] = v;
    }
  );

  if (route.kind === "catalogue") {
    if (selected.type === "programme-neuf") {
      const query = new URLSearchParams(Object.entries(selected).filter((entry): entry is [string, string] => entry[0] !== "type" && typeof entry[1] === "string"));
      redirect(`/acheter/programmes-neufs${query.size ? `?${query}` : ""}`);
    }
    return (
      <Catalogue
        eyebrow="Achat — Marrakech & Essaouira"
        title="Biens à vendre"
        subtitle="Riads, villas, appartements et terrains à Marrakech et Essaouira."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Acheter" }]}
        prefilter={(p) => VENTE_BASE(p) && p.type !== "programme-neuf"}
        baseHref="/acheter"
        selectedFilters={selected}
      />
    );
  }

  if (route.kind === "type") {
    const label = propertyTypeLabel(route.type);
    const typeSlug = route.type === "programme-neuf" ? "programmes-neufs" : route.type;
    return (
      <Catalogue
        eyebrow={`Acheter · ${label}`}
        title={route.type === "programme-neuf" ? "Programmes neufs" : route.type === "riad-a-renover" ? "Riads à rénover à vendre" : `${label}s à vendre.`}
        subtitle={route.type === "programme-neuf" ? "Découvrez les programmes immobiliers neufs à Marrakech et Essaouira." : route.type === "riad-a-renover" ? "Les riads à rénover disponibles à Marrakech et Essaouira. Filtrez par ville pour affiner votre sélection." : `Notre sélection de ${label.toLowerCase()}s à Marrakech et Essaouira.`}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          ...(route.type === "programme-neuf" ? [] : [{ label: "Acheter", href: "/acheter" }]),
          { label: label },
        ]}
        prefilter={(p) => VENTE_BASE(p) && p.type === route.type}
        baseHref={`/acheter/${typeSlug}`}
        selectedFilters={selected}
        visibleFilters={{
          neighborhood: true,
          city: true,
          budget: true,
          bedrooms: true,
        }}
      />
    );
  }

  if (route.kind === "geo") {
    return (
      <Catalogue
        eyebrow={`Villa · ${route.quartierLabel}`}
        title={`Villas à vendre — ${route.quartierLabel}.`}
        subtitle={`Notre sélection de villas dans le quartier ${route.quartierLabel}, à Marrakech.`}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Acheter", href: "/acheter" },
          { label: "Villa", href: "/acheter/villa" },
          { label: route.quartierLabel },
        ]}
        prefilter={(p) =>
          VENTE_BASE(p) &&
          p.type === "villa" &&
          p.neighborhoodSlug === route.quartierSlug
        }
        baseHref={`/acheter/villa/${route.quartierSlug}`}
        selectedFilters={selected}
        visibleFilters={{ budget: true, bedrooms: true }}
      />
    );
  }

  notFound();
}
