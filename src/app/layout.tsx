import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Cormorant Garamond — serif d'hospitalité de luxe (Aman, boutique-hôtels).
// Plus délicat et raffiné que Playfair. Utilisé pour tous les titres.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const SITE_URL = "https://marrakechrealty.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Marrakech Realty — Riads, villas et appartements d'exception",
    template: "%s",
  },
  description:
    "Agence immobilière de caractère à Marrakech et Essaouira depuis 2000. Riads restaurés, villas contemporaines, appartements et programmes neufs — en vente et en location.",
  keywords: [
    "immobilier Marrakech",
    "riad à vendre",
    "villa Marrakech",
    "immobilier Essaouira",
    "agence immobilière Marrakech",
  ],
  icons: {
    icon: "/logo-original.png",
    apple: "/logo-original.png",
  },
  openGraph: {
    title: "Marrakech Realty",
    description: "Immobilier de caractère à Marrakech et Essaouira.",
    locale: "fr_FR",
    type: "website",
    siteName: "Marrakech Realty",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          duration={3500}
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!bg-white !border !border-[var(--color-beige-warm)] !shadow-[var(--shadow-luxe)] !rounded-none !font-sans",
              title: "!text-[var(--color-charcoal)] !font-medium",
              description: "!text-[var(--color-stone)] !text-xs",
              success: "!border-l-4 !border-l-[var(--color-success)]",
              error: "!border-l-4 !border-l-[var(--color-alert)]",
              info: "!border-l-4 !border-l-[var(--color-terracotta)]",
            },
          }}
        />
      </body>
    </html>
  );
}
