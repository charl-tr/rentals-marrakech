import type { Metadata } from "next";
import SiteDocument from "@/components/SiteDocument";
import EnglishShell from "@/components/english/EnglishShell";

export const revalidate = 300;
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.marrakechrealty.com"),
  title: "Marrakech Realty — Property in Marrakech & Essaouira",
  description: "Explore properties for sale and rent in Marrakech and Essaouira. Speak to Marrakech Realty about your property project.",
  // Staged launch: no English URL is advertised in hreflang/sitemap until
  // listing descriptions, editorial/legal content and end-to-end QA are ready.
  robots: { index: false, follow: true },
  openGraph: { locale: "en_GB", siteName: "Marrakech Realty", type: "website" },
  icons: { icon: "/logo-original.png" },
};
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="en"><EnglishShell>{children}</EnglishShell></SiteDocument>;
}
