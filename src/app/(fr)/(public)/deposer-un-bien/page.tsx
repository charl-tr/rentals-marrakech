import type { Metadata } from "next";
import SellerPageContent from "@/components/SellerPageContent";
export const metadata: Metadata = {
  title: "Vendre votre bien à Marrakech ou Essaouira — Marrakech Realty",
  description: "Vous souhaitez vendre une villa, un riad, un appartement ou un terrain ? Présentez votre projet à Marrakech Realty. Un premier échange sans publication automatique.",
  alternates: { canonical: "/deposer-un-bien" },
};
export default function DeposerPage() { return <SellerPageContent />; }
