import type { Metadata } from "next";
import AreasPageContent from "@/components/AreasPageContent";
import AreaPageContent from "@/components/AreaPageContent";
import JournalPageContent from "@/components/JournalPageContent";
import JournalArticleContent from "@/components/JournalArticleContent";
import ComparePageContent from "@/components/ComparePageContent";
import MapClientWrapper from "@/components/MapClientWrapper";
import HomePage from "@/components/HomePage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_TYPES, NEIGHBORHOODS, type PropertyType } from "@/data/properties";
import { getCatalogueProperties, getPropertyBySlug, getPropertyPins } from "@/lib/db";
import { englishPropertyHeading, englishTypes } from "@/lib/i18n/english";
import { languagePath } from "@/lib/i18n/routes";
import EnglishCatalogue from "@/components/english/EnglishCatalogue";
import ContactPageContent from "@/components/ContactPageContent";
import SellerPageContent from "@/components/SellerPageContent";
import FavoritesPageContent from "@/components/FavoritesPageContent";
import PropertyDetail from "@/components/PropertyDetail";
import { journalArticles } from "@/data/verified-journal";

type Props = { params: Promise<{ path?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateViewport({ params }: Props) {
  const { path = [] } = await params;
  return { themeColor: path.length ? "#f7f5f0" : "#075581", viewportFit: "cover" as const };
}

// French editorial content has not been translated yet. Preserve the exact
// equivalent route and offer an explicit FR link, never pretend it is English.
const pendingPages = new Set(["a-propos", "faq", "savoir-acheter", "marche", "collections", "cookies", "politique-confidentialite", "mentions-legales", "cgu", "equipe", "estimer"]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path = [] } = await params;
  const pathname = `/en${path.length ? `/${path.join("/")}` : ""}`;
  const fr = languagePath(pathname, "fr").split("/").filter(Boolean);
  const labels: Record<string, string> = { acheter: "Properties for sale", louer: "Properties to rent", "biens-vendus": "Sold properties", "deposer-un-bien": "Sell your property", contact: "Contact", favoris: "Saved properties", comparer: "Compare properties", carte: "Property map", journal: "Journal", quartiers: "Areas", essaouira: "Property in Essaouira" };
  let title = labels[fr[0]] || "Property in Marrakech & Essaouira";
  if (fr[0] === "journal" && fr.length === 2) {
    title = journalArticles("en").find(a => a.slug === fr[1])?.title ?? "Article not found";
  }
  if (["acheter", "louer"].includes(fr[0]) && fr.length === 2 && ![...ALL_TYPES, "programmes-neufs", "saisonnier"].includes(fr[1])) {
    const p = await getPropertyBySlug(fr[1]);
    if (p) title = englishPropertyHeading(p);
  }
  return { title: `${title} — Marrakech Realty`, alternates: { canonical: pathname }, robots: { index: false, follow: true } };
}

export default async function EnglishPage({ params, searchParams }: Props) {
  const { path = [] } = await params;
  const pathname = `/en${path.length ? `/${path.join("/")}` : ""}`;
  const frPath = languagePath(pathname, "fr");
  const parts = frPath.split("/").filter(Boolean);
  const [section, second, third] = parts;
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(await searchParams)) if (typeof value === "string") query[key] = value;

  if (["acheter", "louer"].includes(section) && parts.length === 2 && ![...ALL_TYPES, "programmes-neufs", "saisonnier"].includes(second)) {
    const p = await getPropertyBySlug(second);
    if (!p || (section === "acheter" ? p.listing !== "vente" && p.type !== "programme-neuf" : p.listing === "vente")) notFound();
    return <PropertyDetail property={p} locale="en" />;
  }

  if (!section) return <HomePage locale="en" />;

  if (section === "contact" && parts.length === 1) return <ContactPageContent locale="en" searchParams={Promise.resolve({ property: query.property })} />;
  if (section === "deposer-un-bien" && parts.length === 1) return <SellerPageContent locale="en" />;

  if (section === "favoris" && parts.length === 1) return <FavoritesPageContent locale="en" />;
  if (section === "quartiers") {
    if (parts.length === 1) return <AreasPageContent locale="en" />;
    if (parts.length === 2) return <AreaPageContent locale="en" slug={second} />;
    notFound();
  }
  if (section === "journal") {
    if (parts.length === 1) return <JournalPageContent locale="en" />;
    if (parts.length === 2) return <JournalArticleContent locale="en" slug={second} />;
    notFound();
  }
  if (section === "comparer" && parts.length === 1) return <ComparePageContent locale="en" />;
  if (section === "carte" && parts.length === 1) return <div className="h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-4rem)]"><MapClientWrapper locale="en" pins={await getPropertyPins()} /></div>;
  if (["acheter", "louer", "essaouira", "biens-vendus"].includes(section)) {
    let properties = await getCatalogueProperties(section === "biens-vendus" ? "sold" : "active");
    let title = "Properties";
    let fixedType: string | undefined;
    if (section === "acheter") {
      title = "Properties for sale";
      properties = properties.filter((p) => p.listing === "vente" || p.type === "programme-neuf");
      if (!second && query.type !== "programme-neuf") properties = properties.filter((p) => p.type !== "programme-neuf");
    }
    if (section === "louer") { title = "Properties to rent"; properties = properties.filter((p) => p.listing !== "vente"); }
    if (section === "biens-vendus") { if (parts.length > 1) notFound(); title = "Sold properties"; }
    if (section === "essaouira") {
      title = "Property in Essaouira"; properties = properties.filter((p) => p.city === "Essaouira");
      if (second) {
        const types: Record<string, string[]> = { "vente-villa": ["villa"], "vente-riad": ["riad-renove", "riad-a-renover"], "vente-terrain": ["terrain"], "location-villa": ["villa"] };
        if (!types[second] || parts.length > 2) notFound();
        properties = properties.filter((p) => types[second].includes(p.type) && (second.startsWith("vente") ? p.listing === "vente" : p.listing !== "vente"));
      }
    } else if (second) {
      if (second === "saisonnier" && section === "louer") { properties = properties.filter((p) => p.listing === "location-saisonniere"); title = "Holiday rentals"; }
      else {
        fixedType = second === "programmes-neufs" ? "programme-neuf" : second;
        if (!(ALL_TYPES as string[]).includes(fixedType)) notFound();
        properties = properties.filter((p) => p.type === fixedType);
        if (section === "louer" && ["villa", "appartement"].includes(second)) {
          properties = properties.filter((p) => p.listing === "location");
        }
        title = `${englishTypes[fixedType as PropertyType]} · ${section === "acheter" ? "For sale" : "To rent"}`;
      }
      if (third) {
        const area = NEIGHBORHOODS.find((n) => n.slug === third);
        if (section !== "acheter" || second !== "villa" || !area || parts.length > 3) notFound();
        properties = properties.filter((p) => p.neighborhoodSlug === third); title = `Villas for sale in ${area.label}`;
      }
    }
    return <EnglishCatalogue properties={properties} title={title} base={pathname} query={query} fixedType={fixedType} />;
  }
  if (pendingPages.has(section)) return <section className="container-luxe max-w-3xl py-12"><h1 className="font-serif text-4xl">This page is currently available in French.</h1><p className="my-5">The English edition is being prepared. You can read the original page or contact our team in English.</p><div className="flex flex-wrap gap-3"><a href={frPath} hrefLang="fr" className="btn-outline">Read the French page</a><Link href="/en/contact" className="btn-gold">Contact us in English</Link></div></section>;
  notFound();
}
