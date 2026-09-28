import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact — Marrakech Realty",
  description:
    "Agence à Guéliz, Marrakech. Téléphone, WhatsApp et formulaire — un conseiller senior vous répond sous 24 heures ouvrées.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage({ searchParams }: { searchParams: Promise<{ property?: string }> }) {
  return <ContactPageContent searchParams={searchParams} />;
}
