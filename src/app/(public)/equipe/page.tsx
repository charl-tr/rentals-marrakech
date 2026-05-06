import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import SectionHero from "@/components/SectionHero";
import { getAllAdvisors } from "@/lib/db";

export const metadata: Metadata = {
  title: "L'équipe — Marrakech Realty",
  description:
    "Quatre conseillers seniors dédiés à Marrakech et Essaouira. Riads, villas, programmes neufs, bord de mer — chacun son territoire, vingt ans d'agence en commun.",
  alternates: { canonical: "/equipe" },
};

export default async function EquipePage() {
  const advisors = await getAllAdvisors();
  return (
    <>
      <SectionHero
        eyebrow="L'agence — depuis 2000"
        title={
          <>
            Quatre conseillers,<br />
            <span className="italic text-[var(--color-terracotta-light)]">un seul</span> standard.
          </>
        }
        subtitle="Chacun son territoire, ses langues, ses spécialités. Tous issus du marché marocain ou expatriés de longue date — et tous formés au même exigeant cahier des charges Marrakech Realty."
      />

      <section className="bg-white py-24">
        <div className="container-luxe">
          <div className="grid gap-16 md:grid-cols-2">
            {advisors.map((a) => (
              <article key={a.slug} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-beige)]">
                  {a.photo ? (
                    <Image
                      src={a.photo}
                      alt={a.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-serif text-7xl tracking-[0.04em] text-[var(--color-charcoal)]">
                      {a.name.split(/\s+/).filter(Boolean).map((s) => s[0].toUpperCase()).slice(0, 2).join("")}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
                    {a.role}
                  </div>
                  <h3 className="mt-3 font-serif text-3xl text-[var(--color-charcoal)]">
                    {a.name}
                  </h3>
                  <p className="mt-4 leading-relaxed text-[var(--color-stone)]">
                    {a.speciality}.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] text-[var(--color-stone)]">
                    <span>
                      <span className="text-[var(--color-terracotta)]">{a.yearsExperience}</span>{" "}
                      ans d&apos;expérience
                    </span>
                    <span>Langues : {a.languages.join(" · ")}</span>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={`tel:${a.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 border border-[var(--color-charcoal)] bg-transparent px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
                    >
                      <Phone size={13} />
                      {a.phone}
                    </a>
                    <a
                      href={`https://wa.me/${a.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[var(--color-charcoal)] px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-terracotta)]"
                    >
                      <MessageCircle size={13} />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-beige)] py-24">
        <div className="container-luxe text-center">
          <div className="eyebrow">Notre engagement</div>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            Vingt-cinq ans d&apos;agence,<br />
            <span className="italic text-[var(--color-terracotta)]">une seule manière</span> de travailler.
          </h2>
          <div className="gold-rule" />
          <p className="mx-auto max-w-2xl text-[var(--color-stone)]">
            Marrakech Realty a été fondée en 2000 par Antoine Gandin. Notre approche n&apos;a pas
            changé : sélection confidentielle, accompagnement humain, transactions sécurisées par
            nos notaires partenaires. Aucun bien que nous n&apos;aurions pas visité, aucun acquéreur
            que nous ne connaîtrions pas par son prénom.
          </p>
          <Link href="/savoir-acheter" className="btn-outline mt-10 inline-flex">
            Nos garanties juridiques
          </Link>
        </div>
      </section>
    </>
  );
}
