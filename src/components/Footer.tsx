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
  return (
    <footer className="bg-[var(--color-charcoal)] text-white">
      <div className="border-b border-white/10 bg-[var(--color-terracotta)]">
        <div className="container-luxe flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-serif text-3xl text-white md:text-4xl">
              Un projet immobilier à Marrakech&nbsp;?
            </h3>
            <p className="mt-2 text-white/90">
              Obtenez une estimation gratuite sous 24h — ou parlons de votre recherche.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-[var(--color-charcoal)] px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-[var(--color-charcoal)]"
          >
            Prendre rendez-vous
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="container-luxe py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-serif text-2xl">Marrakech Realty</div>
            <div className="mt-2 text-xs uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
              Immobilier · Depuis 2000
            </div>
            <p className="mt-6 text-sm leading-relaxed text-white/70">
              Agence immobilière de caractère à Marrakech et Essaouira. Riads, villas,
              appartements et programmes neufs, en vente comme en location.
            </p>
            <div className="mt-6 flex gap-3">
              {[InstagramIcon, FacebookIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:border-[var(--color-terracotta)] hover:bg-[var(--color-terracotta)]"
                  aria-label="Social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base text-white">Acheter</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><Link href="/acheter/riad-renove" className="hover:text-[var(--color-terracotta)]">Riads rénovés</Link></li>
              <li><Link href="/acheter/riad-a-renover" className="hover:text-[var(--color-terracotta)]">Riads à rénover</Link></li>
              <li><Link href="/acheter/villa" className="hover:text-[var(--color-terracotta)]">Villas</Link></li>
              <li><Link href="/acheter/appartement" className="hover:text-[var(--color-terracotta)]">Appartements</Link></li>
              <li><Link href="/acheter/programmes-neufs" className="hover:text-[var(--color-terracotta)]">Programmes neufs</Link></li>
              <li><Link href="/essaouira" className="hover:text-[var(--color-terracotta)]">Essaouira</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base text-white">Services</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><Link href="/louer/villa" className="hover:text-[var(--color-terracotta)]">Location longue durée</Link></li>
              <li><Link href="/louer/saisonnier" className="hover:text-[var(--color-terracotta)]">Location saisonnière</Link></li>
              <li><Link href="/deposer-un-bien" className="hover:text-[var(--color-terracotta)]">Estimation gratuite</Link></li>
              <li><Link href="/savoir-acheter" className="hover:text-[var(--color-terracotta)]">Guide juridique</Link></li>
              <li><Link href="/favoris" className="hover:text-[var(--color-terracotta)]">Mes favoris</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base text-white">Contact</h4>
            <ul className="mt-5 space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-terracotta)]" />
                <span>
                  42 rue de la Liberté<br />
                  Guéliz, Marrakech 40000<br />
                  Maroc
                </span>
              </li>
              <li>
                <a href="tel:+212660629444" className="flex items-center gap-3 hover:text-[var(--color-terracotta)]">
                  <Phone size={16} className="text-[var(--color-terracotta)]" />
                  +212 660 62 94 44
                </a>
              </li>
              <li>
                <a href="mailto:contact@marrakechrealty.com" className="flex items-center gap-3 hover:text-[var(--color-terracotta)]">
                  <Mail size={16} className="text-[var(--color-terracotta)]" />
                  contact@marrakechrealty.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Secondary nav (editorial + agence) */}
        <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-3">
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta-light)]">
              L&apos;agence
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link href="/a-propos" className="hover:text-[var(--color-terracotta)]">À propos</Link></li>
              <li><Link href="/equipe" className="hover:text-[var(--color-terracotta)]">L&apos;équipe</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--color-terracotta)]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta-light)]">
              Ressources
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link href="/journal" className="hover:text-[var(--color-terracotta)]">Journal</Link></li>
              <li><Link href="/quartiers" className="hover:text-[var(--color-terracotta)]">Quartiers</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--color-terracotta)]">Questions fréquentes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta-light)]">
              Légal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link href="/mentions-legales" className="hover:text-[var(--color-terracotta)]">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-[var(--color-terracotta)]">Confidentialité</Link></li>
              <li><Link href="/cookies" className="hover:text-[var(--color-terracotta)]">Cookies</Link></li>
              <li><Link href="/cgu" className="hover:text-[var(--color-terracotta)]">CGU</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Marrakech Realty — Tous droits réservés.</div>
          <div className="text-white/40">
            Agence immobilière depuis 2000 · Marrakech & Essaouira
          </div>
        </div>
      </div>
    </footer>
  );
}
