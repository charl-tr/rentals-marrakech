import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-charcoal-deep)] text-white">
      {/* CTA — sobre, un seul accent (le bouton) */}
      <div className="border-b border-white/10">
        <div className="container-luxe flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-20">
          <div className="max-w-xl">
            <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-accent-light)]">
              Parlons de votre projet
            </div>
            <h3 className="mt-4 font-serif text-3xl leading-tight text-white md:text-[2.75rem]">
              Un projet immobilier à Marrakech&nbsp;?
            </h3>
            <p className="mt-4 text-white/55">
              Estimation gratuite sous 24 heures — ou une conversation, simplement,
              autour de votre recherche.
            </p>
          </div>
          <Link href="/contact" className="btn-gold shrink-0">
            Prendre rendez-vous
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Colonnes */}
      <div className="container-luxe py-20 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-serif text-2xl">Marrakech Realty</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/40">
              Immobilier · Depuis 2000
            </div>
            <p className="mt-6 text-sm leading-relaxed text-white/55">
              Agence immobilière de caractère à Marrakech et Essaouira. Riads, villas,
              appartements et programmes neufs, en vente comme en location.
            </p>
            <div className="mt-7 flex gap-3">
              {[InstagramIcon, FacebookIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/15 text-white/70 transition-colors hover:border-white/60 hover:text-white"
                  aria-label="Réseau social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg text-white">Acheter</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/55">
              <li><Link href="/acheter/riad-renove" className="transition-colors hover:text-white">Riads rénovés</Link></li>
              <li><Link href="/acheter/riad-a-renover" className="transition-colors hover:text-white">Riads à rénover</Link></li>
              <li><Link href="/acheter/villa" className="transition-colors hover:text-white">Villas</Link></li>
              <li><Link href="/acheter/appartement" className="transition-colors hover:text-white">Appartements</Link></li>
              <li><Link href="/acheter/programmes-neufs" className="transition-colors hover:text-white">Programmes neufs</Link></li>
              <li><Link href="/essaouira" className="transition-colors hover:text-white">Essaouira</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-white">Services</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/55">
              <li><Link href="/louer/villa" className="transition-colors hover:text-white">Location longue durée</Link></li>
              <li><Link href="/louer/saisonnier" className="transition-colors hover:text-white">Location saisonnière</Link></li>
              <li><Link href="/deposer-un-bien" className="transition-colors hover:text-white">Estimation gratuite</Link></li>
              <li><Link href="/savoir-acheter" className="transition-colors hover:text-white">Guide juridique</Link></li>
              <li><Link href="/favoris" className="transition-colors hover:text-white">Mes favoris</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-white">Contact</h4>
            <ul className="mt-5 space-y-4 text-sm text-white/55">
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

        {/* Nav secondaire */}
        <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-3">
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
              L&apos;agence
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/55">
              <li><Link href="/a-propos" className="transition-colors hover:text-white">À propos</Link></li>
              <li><Link href="/equipe" className="transition-colors hover:text-white">L&apos;équipe</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
              Ressources
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/55">
              <li><Link href="/journal" className="transition-colors hover:text-white">Journal</Link></li>
              <li><Link href="/quartiers" className="transition-colors hover:text-white">Quartiers</Link></li>
              <li><Link href="/faq" className="transition-colors hover:text-white">Questions fréquentes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
              Légal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/55">
              <li><Link href="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="transition-colors hover:text-white">Confidentialité</Link></li>
              <li><Link href="/cookies" className="transition-colors hover:text-white">Cookies</Link></li>
              <li><Link href="/cgu" className="transition-colors hover:text-white">CGU</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <div>© {year} Marrakech Realty — Tous droits réservés.</div>
          <div className="text-white/30">
            Agence immobilière depuis 2000 · Marrakech &amp; Essaouira
          </div>
        </div>
      </div>
    </footer>
  );
}
