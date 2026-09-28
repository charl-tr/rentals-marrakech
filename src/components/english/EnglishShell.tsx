"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CompareFloatingDock from "@/components/CompareFloatingDock";
import FloatingContact from "@/components/FloatingContact";
import ScrollToTop from "@/components/ScrollToTop";
import BackToTopButton from "@/components/BackToTopButton";
import CookieBanner from "@/components/CookieBanner";


export default function EnglishShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullBleed = pathname === "/en" || /^\/en\/(buy|rent|sold-properties|essaouira|contact|sell|saved-properties|areas|journal|compare)(\/|$)/.test(pathname) || /^\/en\/areas\/.+/.test(pathname);
  return <>
    <ScrollToTop />
    <Navbar locale="en" />
    <main className={`min-h-screen ${fullBleed ? "" : "pt-14 lg:pt-16"}`}>{children}</main>
    <CookieBanner locale="en" />
    <Footer locale="en" />
    <CompareFloatingDock locale="en" />
    <FloatingContact locale="en" />
    <BackToTopButton locale="en" />
  </>;
}
