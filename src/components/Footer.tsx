import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, MapPin, Phone } from "lucide-react";

import { languagePath } from "@/lib/i18n/routes";
export default function Footer({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const en = locale === "en";
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className="bg-[linear-gradient(135deg,#674d3c_0%,#765844_58%,#80634f_100%)] text-white">
      {/* CTA compact — ouvre le footer sans créer un deuxième hero. */}
      <div className="border-b border-white/15">
        <div className="container-luxe flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between md:py-9">
          <div className="max-w-xl">
            <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/65">
              {en ? "Let’s talk about your project" : <>Parlons de votre projet</>}
            </div>
            <h3 className="mt-2 font-serif text-3xl leading-tight text-white md:text-[2rem]">
              {en ? "A property project in Marrakech?" : <>Un projet immobilier à Marrakech&nbsp;?</>}
            </h3>
            <p className="mt-2 text-sm text-white/65">
              {en ? "Selling a property or refining your search? Let’s discuss your plans." : <>Un bien à vendre ou une recherche à préciser ? Échangeons sur votre projet.</>}
            </p>
          </div>
          <div className="flex flex-wrap gap-3"><Link href={languagePath("/deposer-un-bien", locale)} className="btn-outline-light shrink-0">{en ? "Sell my property" : <>Vendre mon bien</>}</Link><Link href={languagePath("/contact", locale)} className="btn-outline-light shrink-0">
            {en ? "Make an appointment" : <>Prendre rendez-vous</>}
            <ArrowRight size={16} />
          </Link></div>
        </div>
      </div>

      {/* Colonnes */}
      <div className="container-luxe py-10 md:py-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="font-serif text-2xl">Marrakech Realty</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/40">
              {en ? "Real estate · Since 2000" : <>Immobilier · Depuis 2000</>}
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              {en ? "Distinctive real estate in Marrakech and Essaouira. Riads, villas, apartments and new developments, for sale and to rent." : <>Agence immobilière de caractère à Marrakech et Essaouira. Riads, villas,
              appartements et programmes neufs, en vente comme en location.</>}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg text-white">{en ? "Buy" : <>Acheter</>}</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li><Link href={languagePath("/biens-vendus", locale)} className="transition-colors hover:text-white">{en ? "Sold properties" : <>Biens vendus</>}</Link></li>
              <li><Link href={languagePath("/acheter/riad-renove", locale)} className="transition-colors hover:text-white">{en ? "Renovated riads" : <>Riads rénovés</>}</Link></li>
              <li><Link href={languagePath("/acheter/riad-a-renover", locale)} className="transition-colors hover:text-white">{en ? "Riads to renovate" : <>Riads à rénover</>}</Link></li>
              <li><Link href={languagePath("/acheter/villa", locale)} className="transition-colors hover:text-white">Villas</Link></li>
              <li><Link href={languagePath("/acheter/appartement", locale)} className="transition-colors hover:text-white">{en ? "Apartments" : <>Appartements</>}</Link></li>
              <li><Link href={languagePath("/acheter/programmes-neufs", locale)} className="transition-colors hover:text-white">{en ? "New developments" : <>Programmes neufs</>}</Link></li>
              <li><Link href={languagePath("/essaouira", locale)} className="transition-colors hover:text-white">Essaouira</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-serif text-lg text-white">Services</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li><Link href={languagePath("/louer/villa", locale)} className="transition-colors hover:text-white">{en ? "Long-term rentals" : <>Location longue durée</>}</Link></li>
              <li><Link href={languagePath("/louer/saisonnier", locale)} className="transition-colors hover:text-white">{en ? "Holiday rentals" : <>Location saisonnière</>}</Link></li>
              <li><Link href={languagePath("/deposer-un-bien", locale)} className="transition-colors hover:text-white">{en ? "Sell my property" : <>Vendre mon bien</>}</Link></li>
              <li><Link href={languagePath("/savoir-acheter", locale)} className="transition-colors hover:text-white">{en ? "Buying guide" : <>Guide juridique</>}</Link></li>
              <li><Link href={languagePath("/favoris", locale)} className="transition-colors hover:text-white">{en ? "Saved properties" : <>Mes favoris</>}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-serif text-lg text-white">Contact</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-white/40" />
                <span>
                  42 rue de la Liberté<br />
                  Guéliz, Marrakech 40000<br />
                  {en ? "Morocco" : <>Maroc</>}
                </span>
              </li>
              <li>
                <a href="tel:+212660629444" className="flex items-center gap-3 transition-colors hover:text-white">
                  <Phone size={16} className="text-white/40" />
                  +212 660 62 94 44
                </a>
              </li>
              <li>
                <a href="mailto:contact@marrakechrealty.com" className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail size={16} className="text-white/40" />
                  contact@marrakechrealty.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Nav secondaire condensée sur une ligne desktop. */}
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-white/15 pt-5 text-xs text-white/55">
          <Link href={languagePath("/a-propos", locale)} className="transition-colors hover:text-white">{en ? "About us" : <>À propos</>}</Link>
          <Link href={languagePath("/equipe", locale)} className="transition-colors hover:text-white">{en ? "Our team" : <>L&apos;équipe</>}</Link>
          <Link href={languagePath("/journal", locale)} className="transition-colors hover:text-white">Journal</Link>
          <Link href={languagePath("/quartiers", locale)} className="transition-colors hover:text-white">{en ? "Areas" : <>Quartiers</>}</Link>
          <Link href={languagePath("/faq", locale)} className="transition-colors hover:text-white">{en ? "FAQs" : <>Questions fréquentes</>}</Link>
          <Link href={languagePath("/mentions-legales", locale)} className="transition-colors hover:text-white">{en ? "Legal information" : <>Mentions légales</>}</Link>
          <Link href={languagePath("/politique-confidentialite", locale)} className="transition-colors hover:text-white">{en ? "Privacy" : <>Confidentialité</>}</Link>
          <Link href={languagePath("/cookies", locale)} className="transition-colors hover:text-white">Cookies</Link>
          <Link href={languagePath("/cgu", locale)} className="transition-colors hover:text-white">{en ? "Terms of use" : <>CGU</>}</Link>
          <Link href="/admin" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            <LockKeyhole size={12} aria-hidden="true" /> {en ? "Team access" : <>Espace équipe</>}
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-white/15 pt-4 text-[11px] text-white/45 md:flex-row md:items-center md:justify-between">
          <div>© {year} Marrakech Realty — {en ? "All rights reserved." : "Tous droits réservés."}</div>
          <div className="text-white/30">
            {en ? "Real estate since 2000 · Marrakech & Essaouira" : <>Agence immobilière depuis 2000 · Marrakech &amp; Essaouira</>}
          </div>
        </div>
      </div>
    </footer>
  );
}
