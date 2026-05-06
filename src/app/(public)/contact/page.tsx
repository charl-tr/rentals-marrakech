import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import ContactForm from "@/components/ContactForm";
import { getAllAdvisors, getPropertyBySlug } from "@/lib/db";
import { propertyTypeLabel } from "@/data/properties";

export const metadata: Metadata = {
  title: "Contact — Marrakech Realty",
  description:
    "Agence à Guéliz, Marrakech. Téléphone, WhatsApp et formulaire — un conseiller senior vous répond sous 24 heures ouvrées.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const sp = await searchParams;
  const advisors = await getAllAdvisors();
  // Contexte bien si ?property=slug — pré-remplit project + channel
  const property = sp.property ? await getPropertyBySlug(sp.property) : null;

  const contextualTitle = property
    ? `Votre demande sur ${property.title}.`
    : undefined;
  const contextualSubtitle = property
    ? `${property.neighborhood}, ${property.city} — réf. ${property.reference}. Votre conseiller vous répond sous 24 heures ouvrées.`
    : undefined;
  const defaultProject = property
    ? property.listing === "vente"
      ? `Acheter ${
          property.type === "appartement" ? "un" : "une"
        } ${propertyTypeLabel(property.type).toLowerCase()}`
      : property.listing === "location-saisonniere"
      ? "Louer (saisonnier)"
      : "Louer (longue durée)"
    : undefined;
  return (
    <>
      <SectionHero
        eyebrow="Nous parler"
        title={
          <>
            Une question, un projet,<br />
            <span className="italic text-[var(--color-terracotta-light)]">une visite</span>.
          </>
        }
        subtitle="Téléphone, WhatsApp, formulaire ou rendez-vous à l'agence du Guéliz. Un conseiller senior vous répond sous 24 heures ouvrées."
      />

      <section className="bg-white py-24">
        <div className="container-luxe grid gap-16 lg:grid-cols-[1fr_1fr]">
          {/* COLONNE GAUCHE — INFOS */}
          <div className="space-y-12">
            <div>
              <div className="eyebrow">L&apos;agence</div>
              <h2 className="mt-4 font-serif text-3xl md:text-4xl">
                42, rue de la Liberté
              </h2>
              <p className="mt-3 text-[var(--color-stone)]">
                Guéliz, Marrakech 40000 — Maroc
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <a
                  href="tel:+212660629444"
                  className="flex items-center gap-3 text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
                >
                  <Phone size={16} className="text-[var(--color-terracotta)]" />
                  +212 660 62 94 44
                </a>
                <a
                  href="https://wa.me/212660629444"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
                >
                  <MessageCircle size={16} className="text-[var(--color-terracotta)]" />
                  +212 660 62 94 44 (WhatsApp)
                </a>
                <a
                  href="mailto:contact@marrakechrealty.com"
                  className="flex items-center gap-3 text-[var(--color-charcoal)] transition-colors hover:text-[var(--color-terracotta)]"
                >
                  <Mail size={16} className="text-[var(--color-terracotta)]" />
                  contact@marrakechrealty.com
                </a>
              </div>
            </div>

            <div>
              <div className="eyebrow">Horaires</div>
              <h3 className="mt-4 font-serif text-xl">L&apos;agence vous accueille</h3>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-stone)]">
                <li>Lundi → Vendredi · 9h00 — 18h30</li>
                <li>Samedi · 10h00 — 16h00 (sur rendez-vous)</li>
                <li>Dimanche · sur rendez-vous</li>
              </ul>
            </div>

            <div>
              <div className="eyebrow">Vos conseillers</div>
              <h3 className="mt-4 font-serif text-xl">Quatre territoires, une équipe</h3>
              <div className="mt-6 grid grid-cols-2 gap-6">
                {advisors.map((a) => (
                  <Link
                    key={a.slug}
                    href="/equipe"
                    className="group flex items-center gap-3"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden bg-[var(--color-beige)]">
                      {a.photo ? (
                        <Image src={a.photo} alt={a.name} fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-serif text-sm tracking-[0.04em] text-[var(--color-charcoal)]">
                          {a.name.split(/\s+/).filter(Boolean).map((s) => s[0].toUpperCase()).slice(0, 2).join("")}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                        {a.name}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-stone)]">
                        {a.role.split("—")[1]?.trim()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* FORMULAIRE */}
          <ContactForm
            advisors={advisors}
            sourcePage={property ? `/contact?property=${property.slug}` : "/contact"}
            propertySlug={property?.slug}
            channel={property ? "property_form" : "contact_form"}
            defaultProject={defaultProject}
            title={contextualTitle}
            subtitle={contextualSubtitle}
          />
        </div>
      </section>

      {/* MAP — lien Google Maps stylisé */}
      <section className="bg-[var(--color-beige)] py-12">
        <div className="container-luxe">
          <a
            href="https://www.google.com/maps?q=42+rue+de+la+Liberté,+Guéliz,+Marrakech"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[16/6] overflow-hidden border border-[var(--color-beige-warm)] bg-white"
          >
            <div className="absolute inset-0 bg-[var(--color-cream)]" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-beige-warm) 1px, transparent 1px), linear-gradient(90deg, var(--color-beige-warm) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-8 animate-pulse rounded-full bg-[var(--color-terracotta)]/15" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-terracotta)] text-white shadow-[0_8px_24px_rgba(148,91,44,0.4)]">
                  <MapPin size={26} fill="white" strokeWidth={1.5} />
                </div>
                <div className="absolute left-1/2 top-full mt-4 -translate-x-1/2 whitespace-nowrap bg-white/95 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] shadow-[var(--shadow-card)]">
                  42, rue de la Liberté · Guéliz
                </div>
              </div>
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-2 bg-[var(--color-charcoal)]/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              Ouvrir Google Maps →
            </div>
          </a>
        </div>
      </section>
    </>
  );
}

