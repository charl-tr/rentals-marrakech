import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  Circle,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  getAdvisor,
  getLeadByPortalToken,
  getShortlistForLead,
} from "@/lib/db";
import { formatPrice } from "@/data/properties";
import { relativeTime } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Mon espace — Marrakech Realty",
  robots: { index: false, follow: false },
};

// ── Timeline achat Maroc — stages génériques ──────────────────────
const PURCHASE_STAGES = [
  {
    key: "intro",
    label: "Premier contact",
    description: "Votre conseiller prend connaissance de votre projet",
  },
  {
    key: "qualified",
    label: "Qualification",
    description: "Discussion précise de vos critères et budget",
  },
  {
    key: "visits",
    label: "Visites",
    description: "Tour de visites sur place, 2 à 5 biens",
  },
  {
    key: "offer",
    label: "Offre",
    description: "Négociation et dépôt d'offre formelle",
  },
  {
    key: "compromise",
    label: "Compromis",
    description: "Signature chez le notaire, versement dépôt de garantie",
  },
  {
    key: "signing",
    label: "Acte authentique",
    description: "Signature finale, remise des clés, célébration",
  },
];

// Mapping du statut lead → stage actuel + completed stages
function mapStatusToStage(status: string): {
  currentIdx: number;
  completedKeys: string[];
} {
  switch (status) {
    case "new":
    case "contacted":
      return { currentIdx: 0, completedKeys: [] };
    case "qualified":
      return { currentIdx: 1, completedKeys: ["intro"] };
    case "visit_scheduled":
    case "visit_done":
      return { currentIdx: 2, completedKeys: ["intro", "qualified"] };
    case "offer":
      return {
        currentIdx: 3,
        completedKeys: ["intro", "qualified", "visits"],
      };
    case "signed":
      return {
        currentIdx: 5,
        completedKeys: [
          "intro",
          "qualified",
          "visits",
          "offer",
          "compromise",
          "signing",
        ],
      };
    default:
      return { currentIdx: 0, completedKeys: [] };
  }
}

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Validation UUID superficielle (évite les 404 trop larges sur des paths randoms)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    notFound();
  }

  const lead = await getLeadByPortalToken(token);
  if (!lead) notFound();

  const advisor = lead.advisorSlug ? await getAdvisor(lead.advisorSlug) : null;
  const shortlist = await getShortlistForLead(lead.id);

  const firstName = lead.buyer.firstName || "vous";
  const { currentIdx, completedKeys } = mapStatusToStage(lead.status);

  return (
    <div className="bg-[var(--color-cream)]">
      {/* HERO minimal — personnalisé */}
      <section className="border-b border-[var(--color-beige-warm)] bg-white py-16 md:py-20">
        <div className="container-luxe max-w-4xl">
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
            Votre espace — Marrakech Realty
          </div>
          <h1 className="mt-4 font-serif text-4xl text-[var(--color-charcoal)] md:text-5xl">
            Bonjour {firstName}.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-stone)]">
            Cet espace vous suit tout au long de votre projet. Vous y retrouvez
            votre sélection personnalisée, l&apos;avancée de votre dossier, et
            votre interlocuteur unique.
          </p>
        </div>
      </section>

      {/* CONSEILLER */}
      {advisor && (
        <section className="bg-[var(--color-charcoal)] py-12 text-white">
          <div className="container-luxe max-w-4xl">
            <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-xl font-medium uppercase">
                {advisor.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((s) => s[0].toUpperCase())
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta-light)]">
                  Votre interlocuteur
                </div>
                <div className="mt-1 font-serif text-2xl">{advisor.name}</div>
                <div className="mt-0.5 text-sm text-white/70">{advisor.role}</div>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                {advisor.phone && (
                  <a
                    href={`tel:${advisor.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-[var(--color-charcoal)]"
                  >
                    <Phone size={12} />
                    {advisor.phone}
                  </a>
                )}
                {advisor.whatsapp && (
                  <a
                    href={`https://wa.me/${advisor.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-[var(--color-charcoal)]"
                  >
                    <MessageCircle size={12} />
                    WhatsApp
                  </a>
                )}
                {advisor.email && (
                  <a
                    href={`mailto:${advisor.email}`}
                    className="inline-flex items-center gap-2 border border-white/30 bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-[var(--color-charcoal)]"
                  >
                    <Mail size={12} />
                    E-mail
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TIMELINE ACHAT */}
      <section className="bg-white py-16">
        <div className="container-luxe max-w-4xl">
          <div className="eyebrow">Votre parcours</div>
          <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
            Où en sommes-nous ?
          </h2>

          <div className="mt-10 space-y-5">
            {PURCHASE_STAGES.map((stage, i) => {
              const completed = completedKeys.includes(stage.key);
              const current = i === currentIdx && !completed;
              return (
                <div
                  key={stage.key}
                  className="grid grid-cols-[28px_1fr] items-start gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                        completed
                          ? "border-[var(--color-terracotta)] bg-[var(--color-terracotta)] text-white"
                          : current
                          ? "border-[var(--color-terracotta)] bg-white text-[var(--color-terracotta)]"
                          : "border-[var(--color-beige-warm)] bg-white text-[var(--color-stone-soft)]"
                      }`}
                    >
                      {completed ? (
                        <Check size={12} strokeWidth={3} />
                      ) : (
                        <Circle size={10} fill={current ? "currentColor" : "none"} />
                      )}
                    </div>
                    {i < PURCHASE_STAGES.length - 1 && (
                      <div
                        className={`mt-1 h-10 w-px ${
                          completed
                            ? "bg-[var(--color-terracotta)]"
                            : "bg-[var(--color-beige-warm)]"
                        }`}
                      />
                    )}
                  </div>
                  <div
                    className={`pb-6 ${
                      current
                        ? "text-[var(--color-charcoal)]"
                        : completed
                        ? "text-[var(--color-charcoal)]"
                        : "text-[var(--color-stone-soft)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg">{stage.label}</span>
                      {current && (
                        <span className="bg-[var(--color-terracotta)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SHORTLIST */}
      <section className="bg-[var(--color-cream)] py-16">
        <div className="container-luxe max-w-5xl">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="eyebrow">
                <Sparkles size={10} className="inline mr-1.5" />
                Votre sélection
              </div>
              <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
                {shortlist.length > 0 ? (
                  <>
                    {advisor?.name.split(" ")[0] ?? "Votre conseiller"} a curé{" "}
                    {shortlist.length} bien{shortlist.length > 1 ? "s" : ""} pour vous.
                  </>
                ) : (
                  <>Votre sélection se construit.</>
                )}
              </h2>
            </div>
          </div>

          {shortlist.length === 0 ? (
            <div className="mt-8 border border-dashed border-[var(--color-beige-warm)] bg-white p-10 text-center">
              <Heart size={24} className="mx-auto text-[var(--color-stone-soft)]" />
              <p className="mt-4 text-sm text-[var(--color-stone)]">
                Votre conseiller ajoute ici les biens qui correspondent à votre
                projet, au fil de ses recherches. Revenez dans quelques jours — ou
                contactez-le directement.
              </p>
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              {shortlist.map(({ item, property }) => {
                const href =
                  property.listing === "vente" || property.type === "programme-neuf"
                    ? `/acheter/${property.slug}`
                    : `/louer/${property.slug}`;
                return (
                  <div
                    key={item.id}
                    className="grid gap-6 border border-[var(--color-beige-warm)] bg-white p-4 md:grid-cols-[280px_1fr] md:p-6"
                  >
                    <Link href={href} className="group relative block aspect-[4/3] overflow-hidden bg-[var(--color-charcoal)]">
                      {property.images[0] && (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 280px"
                          className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                        />
                      )}
                    </Link>

                    <div className="flex flex-col">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                        <MapPin size={10} className="inline mr-1" />
                        {property.neighborhood}, {property.city} · Réf. {property.reference}
                      </div>
                      <Link href={href} className="group">
                        <h3 className="mt-2 font-serif text-xl text-[var(--color-charcoal)] group-hover:text-[var(--color-terracotta)]">
                          {property.title}
                        </h3>
                      </Link>
                      <div className="mt-1 font-serif text-lg text-[var(--color-terracotta)]">
                        {formatPrice(
                          property.price,
                          property.listing,
                          property.currency,
                          property.priceUnit
                        )}
                      </div>

                      {item.advisorNote && (
                        <blockquote className="mt-4 border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm italic text-[var(--color-charcoal)]">
                          « {item.advisorNote} »
                          {advisor && (
                            <footer className="mt-2 text-[11px] not-italic text-[var(--color-stone)]">
                              — {advisor.name.split(" ")[0]}, il y a{" "}
                              {relativeTime(item.addedAt, new Date())}
                            </footer>
                          )}
                        </blockquote>
                      )}

                      <div className="mt-auto flex items-center gap-3 pt-4">
                        <Link href={href} className="btn-outline">
                          Voir le bien
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER DISCRET */}
      <section className="border-t border-[var(--color-beige-warm)] bg-white py-10">
        <div className="container-luxe max-w-4xl text-center text-xs text-[var(--color-stone)]">
          Cet espace est personnel. Le lien ne doit pas être partagé.
          <br />
          Votre dossier : <span className="font-mono">{lead.id.slice(0, 8)}</span> ·
          créé {relativeTime(lead.createdAt, new Date())}
        </div>
      </section>
    </div>
  );
}
