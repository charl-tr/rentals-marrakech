import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import CompareFloatingDock from "@/components/CompareFloatingDock";
import ScrollToTop from "@/components/ScrollToTop";

// ── Cache ISR par défaut sur tout le groupe public ────────────────────
// Les pages de contenu (accueil, catalogue, marché, quartiers, fiches…)
// sont mises en cache et revalidées toutes les 5 min → navigation quasi
// instantanée, plus d'aller-retour Supabase à chaque visite.
//
// Les pages dynamiques (filtres via searchParams) restent dynamiques
// automatiquement. Les portails token-gated (mon-espace, mon-bien) ont
// quitté ce groupe pour (portal) — chrome privé dédié + temps réel.
export const revalidate = 300;

const SITE_URL = "https://marrakechrealty.com";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Marrakech Realty",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-original.png`,
  description:
    "Agence immobilière de caractère à Marrakech et Essaouira depuis 2000.",
  foundingDate: "2000",
  founder: { "@type": "Person", name: "Antoine Gandin" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "42 rue de la Liberté",
    addressLocality: "Marrakech",
    postalCode: "40000",
    addressCountry: "MA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+212-660-62-94-44",
    email: "contact@marrakechrealty.com",
    contactType: "Sales",
    availableLanguage: ["French", "English", "Arabic"],
    areaServed: ["MA", "Marrakech", "Essaouira"],
  },
  sameAs: [
    "https://www.instagram.com/marrakechrealty",
    "https://www.facebook.com/marrakechrealty",
    "https://www.linkedin.com/company/marrakechrealty",
  ],
  areaServed: [
    { "@type": "City", name: "Marrakech" },
    { "@type": "City", name: "Essaouira" },
  ],
};

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieBanner />
      <CompareFloatingDock />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
    </>
  );
}
