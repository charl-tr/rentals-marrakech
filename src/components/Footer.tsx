import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className="bg-[linear-gradient(135deg,#674d3c_0%,#765844_58%,#80634f_100%)] text-white">
      {/* CTA compact — ouvre le footer sans créer un deuxième hero. */}
      <div className="border-b border-white/15">
        <div className="container-luxe flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between md:py-9">
          <div className="max-w-xl">
            <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/65">
              Parlons de votre projet
            </div>
            <h3 className="mt-2 font-serif text-3xl leading-tight text-white md:text-[2rem]">
              Un projet immobilier à Marrakech&nbsp;?
            </h3>
            <p className="mt-2 text-sm text-white/65">
              Estimation gratuite sous 24 heures — ou une conversation, simplement,
              autour de votre recherche.
            </p>
          </div>
          <Link href="/contact" className="btn-outline-light shrink-0">
            Prendre rendez-vous
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Colonnes */}
      <div className="container-luxe py-10 md:py-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="font-serif text-2xl">Marrakech Realty</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/40">
              Immobilier · Depuis 2000
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              Agence immobilière de caractère à Marrakech et Essaouira. Riads, villas,
              appartements et programmes neufs, en vente comme en location.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg text-white">Acheter</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li><Link href="/acheter/riad-renove" className="transition-colors hover:text-white">Riads rénovés</Link></li>
              <li><Link href="/acheter/riad-a-renover" className="transition-colors hover:text-white">Riads à rénover</Link></li>
              <li><Link href="/acheter/villa" className="transition-colors hover:text-white">Villas</Link></li>
              <li><Link href="/acheter/appartement" className="transition-colors hover:text-white">Appartements</Link></li>
              <li><Link href="/acheter/programmes-neufs" className="transition-colors hover:text-white">Programmes neufs</Link></li>
              <li><Link href="/essaouira" className="transition-colors hover:text-white">Essaouira</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-serif text-lg text-white">Services</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li><Link href="/louer/villa" className="transition-colors hover:text-white">Location longue durée</Link></li>
              <li><Link href="/louer/saisonnier" className="transition-colors hover:text-white">Location saisonnière</Link></li>
              <li><Link href="/deposer-un-bien" className="transition-colors hover:text-white">Estimation gratuite</Link></li>
              <li><Link href="/savoir-acheter" className="transition-colors hover:text-white">Guide juridique</Link></li>
              <li><Link href="/favoris" className="transition-colors hover:text-white">Mes favoris</Link></li>
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
                  Maroc
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
          <Link href="/a-propos" className="transition-colors hover:text-white">À propos</Link>
          <Link href="/equipe" className="transition-colors hover:text-white">L&apos;équipe</Link>
          <Link href="/journal" className="transition-colors hover:text-white">Journal</Link>
          <Link href="/quartiers" className="transition-colors hover:text-white">Quartiers</Link>
          <Link href="/faq" className="transition-colors hover:text-white">Questions fréquentes</Link>
          <Link href="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link>
          <Link href="/politique-confidentialite" className="transition-colors hover:text-white">Confidentialité</Link>
          <Link href="/cookies" className="transition-colors hover:text-white">Cookies</Link>
          <Link href="/cgu" className="transition-colors hover:text-white">CGU</Link>
          <Link href="/admin" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            <LockKeyhole size={12} aria-hidden="true" /> Espace équipe
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-white/15 pt-4 text-[11px] text-white/45 md:flex-row md:items-center md:justify-between">
          <div>© {year} Marrakech Realty — Tous droits réservés.</div>
          <div className="text-white/30">
            Agence immobilière depuis 2000 · Marrakech &amp; Essaouira
          </div>
        </div>
      </div>
    </footer>
  );
}
