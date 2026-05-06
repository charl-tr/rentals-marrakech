import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Eye,
  Home,
  Key,
  Mail,
  MessageCircle,
  Phone,
  ScrollText,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { getMandateByOwnerToken } from "@/lib/db";
import { formatPrice } from "@/data/properties";
import {
  MANDATE_TYPE_LABELS,
  MANDATE_STATUS_LABELS,
  formatCommission,
} from "@/lib/mandates";

export const metadata: Metadata = {
  title: "Mon bien — Marrakech Realty",
  robots: { index: false, follow: false },
};

// ── Helpers ─────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return "Hier";
  if (d < 30) return `Il y a ${d} jours`;
  if (d < 365) return `Il y a ${Math.floor(d / 30)} mois`;
  return `Il y a ${Math.floor(d / 365)} an${Math.floor(d / 365) > 1 ? "s" : ""}`;
}

function fmtEur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(n);
}

const EVENT_LABELS: Record<string, { label: string; dot: string }> = {
  visit_scheduled:  { label: "Visite programmée",        dot: "bg-[var(--color-terracotta)]" },
  visit_completed:  { label: "Visite effectuée",          dot: "bg-green-600" },
  offer_submitted:  { label: "Offre reçue",               dot: "bg-blue-600" },
  price_change:     { label: "Prix modifié",              dot: "bg-[var(--color-beige-warm)]" },
  status_change:    { label: "Statut mis à jour",         dot: "bg-[var(--color-beige-warm)]" },
  mandate_created:  { label: "Mandat signé",              dot: "bg-[var(--color-terracotta)]" },
  mandate_updated:  { label: "Mandat mis à jour",         dot: "bg-[var(--color-beige-warm)]" },
  mandate_closed:   { label: "Mandat clôturé",            dot: "bg-red-500" },
  tenant_checkin:   { label: "Entrée locataire",          dot: "bg-green-600" },
  tenant_checkout:  { label: "Sortie locataire",          dot: "bg-[var(--color-stone)]" },
  rent_received:    { label: "Loyer perçu",               dot: "bg-green-600" },
  lease_signed:     { label: "Bail signé",                dot: "bg-[var(--color-terracotta)]" },
  lease_renewed:    { label: "Bail renouvelé",            dot: "bg-[var(--color-terracotta)]" },
};

// ── Sale pipeline ────────────────────────────────────────────────────
const SALE_STAGES = [
  { key: "mandat",    label: "Mandat" },
  { key: "diffusion", label: "Diffusion" },
  { key: "visites",   label: "Visites" },
  { key: "offre",     label: "Offre" },
  { key: "compromis", label: "Compromis" },
  { key: "acte",      label: "Acte" },
];

function getSaleStage(status: string, events: { type: string }[]) {
  const types = new Set(events.map((e) => e.type));
  if (status !== "active") return 0;
  if (types.has("offer_submitted")) return 3;
  if (types.has("visit_completed")) return 2;
  if (types.has("visit_scheduled")) return 2;
  return 1;
}

// ── Rental pipeline ──────────────────────────────────────────────────
const RENTAL_STAGES = [
  { key: "mandat",    label: "Mandat" },
  { key: "diffusion", label: "Diffusion" },
  { key: "candidats", label: "Candidatures" },
  { key: "selection", label: "Sélection" },
  { key: "bail",      label: "Bail signé" },
  { key: "loue",      label: "Bien loué" },
];

function getRentalStage(status: string, propStatus: string, events: { type: string }[]) {
  const types = new Set(events.map((e) => e.type));
  if (status !== "active") return 0;
  if (propStatus === "rented" || types.has("tenant_checkin")) return 5;
  if (types.has("lease_signed")) return 4;
  if (types.has("offer_submitted")) return 3;
  if (types.has("visit_completed")) return 2;
  if (types.has("visit_scheduled")) return 2;
  return 1;
}

// ── Stage progress bar (shared) ──────────────────────────────────────
function StageBar({ stages, current }: { stages: { key: string; label: string }[]; current: number }) {
  return (
    <div className="flex items-start">
      {stages.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={stage.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 ${done ? "bg-[var(--color-terracotta)]" : "bg-[var(--color-beige-warm)]"}`} />
              )}
              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center ${
                done
                  ? "bg-[var(--color-terracotta)] text-white"
                  : active
                  ? "border-2 border-[var(--color-terracotta)] bg-white text-[var(--color-terracotta)]"
                  : "border border-[var(--color-beige-warm)] bg-[var(--color-cream)] text-[var(--color-stone)]"
              }`}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="text-[10px] font-semibold">{i + 1}</span>
                )}
              </div>
              {i < stages.length - 1 && (
                <div className={`h-0.5 flex-1 ${done ? "bg-[var(--color-terracotta)]" : "bg-[var(--color-beige-warm)]"}`} />
              )}
            </div>
            <div className={`mt-2 text-center text-[9px] font-medium uppercase tracking-[0.16em] ${
              active ? "text-[var(--color-terracotta)]" : done ? "text-[var(--color-charcoal)]" : "text-[var(--color-stone)]"
            }`}>
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function OwnerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getMandateByOwnerToken(token);
  if (!data) notFound();

  const { mandate, property, events, advisor, neighborhoodStats } = data;

  const isRental =
    property.listing === "location" || property.listing === "location-saisonniere";
  const isSeasonal = property.listing === "location-saisonniere";

  // Metrics
  const visitCount = events.filter(
    (e) => e.type === "visit_completed" || e.type === "visit_scheduled"
  ).length;
  const offerCount  = events.filter((e) => e.type === "offer_submitted").length;
  const pricePerSqm = property.surface > 0 ? Math.round(property.price / property.surface) : null;

  // Stage
  const currentStage = isRental
    ? getRentalStage(mandate.status, property.status, events)
    : getSaleStage(mandate.status, events);
  const stages = isRental ? RENTAL_STAGES : SALE_STAGES;

  // Rental-specific
  const monthlyRevenue = isRental
    ? isSeasonal
      ? property.price * 4  // ~4 semaines/mois
      : property.price
    : null;

  return (
    <main className="min-h-screen bg-[var(--color-cream)]">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative h-64 w-full overflow-hidden bg-[var(--color-charcoal)] md:h-80">
        {property.images[0] && (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="100vw"
            className="object-cover opacity-70"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 md:px-10">
          <div className="eyebrow text-white/70">
            {isRental ? "Votre bien en location" : "Votre bien en vente"}
          </div>
          <h1 className="mt-2 font-serif text-2xl text-white md:text-3xl">
            {property.title}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {property.neighborhood} · Réf. {property.reference}
          </p>
        </div>
      </div>

      <div className="container-luxe py-10">
        {/* ── KPIs ─────────────────────────────────────────────────── */}
        {(() => {
          const kpis = isRental ? [
            { icon: Home,       label: "Loyer affiché",       value: formatPrice(property.price, property.listing, "EUR", property.priceUnit ?? "mois") },
            { icon: Eye,        label: "Visites / candidats", value: String(visitCount) },
            { icon: Wallet,     label: "Revenu mensuel est.", value: monthlyRevenue ? fmtEur(monthlyRevenue) : "—" },
            { icon: Clock,      label: "Mandat depuis",       value: fmtDate(mandate.signedAt ?? mandate.createdAt) },
          ] : [
            { icon: Home,       label: "Prix affiché",        value: formatPrice(property.price, property.listing) },
            { icon: Eye,        label: "Visites",             value: String(visitCount) },
            { icon: TrendingUp, label: "Offres reçues",       value: String(offerCount) },
            { icon: Clock,      label: "Mandat depuis",       value: fmtDate(mandate.signedAt ?? mandate.createdAt) },
          ];
          return (
            <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {kpis.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col gap-2 border border-[var(--color-beige-warm)] bg-white p-5">
                  <Icon size={16} className="text-[var(--color-terracotta)]" />
                  <div className="font-serif text-xl text-[var(--color-charcoal)]">{value}</div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">{label}</div>
                </div>
              ))}
            </div>
          );
        })()}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Main ──────────────────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-2">

            {/* Pipeline */}
            <section className="border border-[var(--color-beige-warm)] bg-white p-6">
              <h2 className="mb-6 font-serif text-xl text-[var(--color-charcoal)]">
                {isRental ? "Progression de la mise en location" : "Progression de la vente"}
              </h2>
              <StageBar stages={stages} current={currentStage} />
            </section>

            {/* Revenus locatifs (rental only) */}
            {isRental && (
              <section className="border border-[var(--color-beige-warm)] bg-white p-6">
                <h2 className="mb-4 font-serif text-xl text-[var(--color-charcoal)]">
                  Revenus locatifs
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="border-l-2 border-[var(--color-terracotta)] pl-4">
                    <div className="font-serif text-xl text-[var(--color-charcoal)]">
                      {formatPrice(property.price, property.listing, "EUR", property.priceUnit ?? "mois")}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-stone)]">
                      {isSeasonal ? "Tarif semaine" : "Loyer mensuel"}
                    </div>
                  </div>
                  {monthlyRevenue && (
                    <div className="border-l-2 border-[var(--color-beige-warm)] pl-4">
                      <div className="font-serif text-xl text-[var(--color-charcoal)]">
                        {fmtEur(monthlyRevenue * 12)}/an
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-stone)]">
                        Revenu annuel estimé
                      </div>
                    </div>
                  )}
                  {pricePerSqm && (
                    <div className="border-l-2 border-[var(--color-beige-warm)] pl-4">
                      <div className="font-serif text-xl text-[var(--color-charcoal)]">
                        {fmtEur(pricePerSqm)}/m²
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-stone)]">
                        {isSeasonal ? "Par semaine et m²" : "Par mois et m²"}
                      </div>
                    </div>
                  )}
                </div>
                {property.surface > 0 && (
                  <p className="mt-4 text-[11px] text-[var(--color-stone)]">
                    Surface : {property.surface} m²
                    {property.bedrooms > 0 && ` · ${property.bedrooms} chambre${property.bedrooms > 1 ? "s" : ""}`}
                    {property.pool && " · Piscine"}
                  </p>
                )}
              </section>
            )}

            {/* Timeline */}
            <section className="border border-[var(--color-beige-warm)] bg-white p-6">
              <h2 className="mb-6 font-serif text-xl text-[var(--color-charcoal)]">
                Activité récente
              </h2>
              {events.length === 0 ? (
                <p className="text-sm text-[var(--color-stone)]">
                  Aucun événement enregistré pour l&apos;instant.
                </p>
              ) : (
                <ol className="space-y-0">
                  {events.map((ev, i) => {
                    const meta = EVENT_LABELS[ev.type] ?? { label: ev.type, dot: "bg-[var(--color-beige-warm)]" };
                    return (
                      <li key={ev.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${meta.dot}`} />
                          {i < events.length - 1 && (
                            <div className="w-px flex-1 bg-[var(--color-beige-warm)]" style={{ minHeight: 28 }} />
                          )}
                        </div>
                        <div className="pb-5">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-charcoal)]">
                            {meta.label}
                          </div>
                          {ev.body && (
                            <p className="mt-1 text-sm text-[var(--color-charcoal)]">{ev.body}</p>
                          )}
                          <div className="mt-1 text-[11px] text-[var(--color-stone)]">
                            {relDate(ev.createdAt)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            {/* Données marché */}
            {(pricePerSqm || neighborhoodStats) && !isRental && (
              <section className="border border-[var(--color-beige-warm)] bg-white p-6">
                <h2 className="mb-4 font-serif text-xl text-[var(--color-charcoal)]">
                  Données marché — {property.neighborhood}
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {pricePerSqm && (
                    <div className="border-l-2 border-[var(--color-terracotta)] pl-4">
                      <div className="font-serif text-xl text-[var(--color-charcoal)]">{fmtEur(pricePerSqm)}/m²</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-stone)]">Votre bien</div>
                    </div>
                  )}
                  {neighborhoodStats?.avgPricePerSqm ? (
                    <div className="border-l-2 border-[var(--color-beige-warm)] pl-4">
                      <div className="font-serif text-xl text-[var(--color-charcoal)]">{fmtEur(neighborhoodStats.avgPricePerSqm)}/m²</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-stone)]">Moyenne quartier</div>
                    </div>
                  ) : null}
                  {neighborhoodStats?.count ? (
                    <div className="border-l-2 border-[var(--color-beige-warm)] pl-4">
                      <div className="font-serif text-xl text-[var(--color-charcoal)]">{neighborhoodStats.count}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-stone)]">Biens en vente dans le quartier</div>
                    </div>
                  ) : null}
                </div>
                <p className="mt-4 text-[11px] text-[var(--color-stone)]">
                  Données issues de notre catalogue actif.{" "}
                  <Link href="/marche" className="underline hover:text-[var(--color-terracotta)]">
                    Rapport marché →
                  </Link>
                </p>
              </section>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Mandat */}
            <section className="border border-[var(--color-beige-warm)] bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                {isRental ? <Key size={16} className="text-[var(--color-terracotta)]" /> : <ScrollText size={16} className="text-[var(--color-terracotta)]" />}
                <h2 className="font-serif text-lg text-[var(--color-charcoal)]">Votre mandat</h2>
              </div>
              <dl className="space-y-3 text-sm">
                {[
                  { label: "Type",      value: MANDATE_TYPE_LABELS[mandate.type] },
                  { label: "Statut",    value: MANDATE_STATUS_LABELS[mandate.status] },
                  { label: "Signé le",  value: fmtDate(mandate.signedAt) },
                  { label: "Expire le", value: fmtDate(mandate.expiryDate) },
                  { label: "Commission",value: formatCommission(mandate) ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-stone)]">{label}</dt>
                    <dd className="text-right text-[var(--color-charcoal)]">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Conseiller */}
            {advisor && (
              <section className="border border-[var(--color-beige-warm)] bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <User size={16} className="text-[var(--color-terracotta)]" />
                  <h2 className="font-serif text-lg text-[var(--color-charcoal)]">Votre conseiller</h2>
                </div>
                <div className="flex gap-3">
                  {advisor.photo && (
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden">
                      <Image src={advisor.photo} alt={advisor.name} fill sizes="56px" className="object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-[var(--color-charcoal)]">{advisor.name}</div>
                    <div className="text-[11px] text-[var(--color-stone)]">{advisor.role}</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {advisor.phone && (
                    <a href={`tel:${advisor.phone}`} className="flex items-center gap-2 text-sm text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">
                      <Phone size={14} />{advisor.phone}
                    </a>
                  )}
                  {advisor.whatsapp && (
                    <a href={`https://wa.me/${advisor.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">
                      <MessageCircle size={14} />WhatsApp
                    </a>
                  )}
                  {advisor.email && (
                    <a href={`mailto:${advisor.email}`} className="flex items-center gap-2 text-sm text-[var(--color-charcoal)] hover:text-[var(--color-terracotta)]">
                      <Mail size={14} />{advisor.email}
                    </a>
                  )}
                </div>
              </section>
            )}

            <p className="text-[10px] leading-relaxed text-[var(--color-stone)]">
              Cette page est accessible uniquement via votre lien personnel. Elle ne figure pas
              dans les moteurs de recherche et n&apos;est visible que par vous et votre conseiller.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
