import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Check,
  ChevronRight,
  Sparkles,
  Target,
} from "lucide-react";
import { getAllLeads, getAllPropertiesAdmin } from "@/lib/db";
import { formatPrice, propertyTypeLabel } from "@/data/properties";
import { buildPropertyMatches } from "@/lib/matching";
import type { AdminLead } from "@/lib/leads";
import type { Property } from "@/data/properties";


export const metadata: Metadata = {
  title: "Matching · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMatchingPage() {
  const [allLeads, allProperties] = await Promise.all([
    getAllLeads(),
    getAllPropertiesAdmin(),
  ]);

  const results = buildPropertyMatches(allProperties, allLeads);
  const totalMatchedBuyers = new Set(results.flatMap((r) => r.matches.map((m) => m.lead.id))).size;
  const allScores = results.flatMap((r) => r.matches.map((m) => m.score));
  const avgScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  return (
    <div className="container-luxe py-12 md:py-16">
      {/* HEADER */}
      <div className="max-w-3xl">
        <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
          <Sparkles size={13} />
          Matching inverse
        </div>
        <h1 className="mt-5 font-serif text-4xl leading-tight text-[var(--color-charcoal)] md:text-5xl">
          Chaque bien trouve ses{" "}
          <span className="italic text-[var(--color-accent)]">acheteurs</span>,
          en 2 minutes.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--color-stone)]">
          Dès qu&apos;un nouveau bien rentre dans le portefeuille, notre moteur
          croise ses caractéristiques avec les critères des acheteurs actifs.
          Chaque conseiller reçoit ses matchs dans sa messagerie, prêt à
          pinger.
        </p>
      </div>

      {/* STATS RAPIDES */}
      <div className="mt-12 grid gap-0 overflow-hidden rounded-[14px] border border-[var(--color-beige-warm)] bg-white md:grid-cols-3 md:divide-x md:divide-[var(--color-beige-warm)]">
        <StatBlock value={results.length} label="biens matchés" />
        <StatBlock value={totalMatchedBuyers} label="acheteurs concernés" />
        <StatBlock value={`${avgScore}%`} label="score moyen" accent />
      </div>

      {/* RESULTS LIST */}
      <div className="mt-14 space-y-10">
        {results.length === 0 ? (
          <div className="rounded-[14px] border border-[var(--color-beige-warm)] bg-white p-12 text-center">
            <p className="text-sm text-[var(--color-stone)]">
              Aucun matching actif. Ajoutez des biens à la vente ou qualifiez des acheteurs.
            </p>
          </div>
        ) : (
          results.map((r) => (
            <MatchingCard key={r.property.slug} property={r.property} matches={r.matches} />
          ))
        )}
      </div>

      {/* Explainer bottom */}
      <section className="mt-20 border-t border-[var(--color-beige-warm)] pt-14">
        <div className="mx-auto max-w-3xl">
          <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
            Comment ça fonctionne
          </div>
          <h2 className="mt-4 font-serif text-3xl text-[var(--color-charcoal)]">
            Trois règles, zéro hasard.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Step
              num="01"
              title="Chaque acheteur renseigne ses critères"
              body="Type, quartiers, budget, chambres minimum, équipements bloquants. Capturé au premier contact par le conseiller, ou saisi sur le site public via une alerte."
            />
            <Step
              num="02"
              title="Le bien entre, le moteur croise"
              body="Dès l'ajout du bien au portefeuille, notre moteur interroge les critères actifs et calcule un score de matching 0-100."
            />
            <Step
              num="03"
              title="Le conseiller reçoit ses matchs"
              body="Notification WhatsApp au conseiller de chaque acheteur matchant, avec contexte complet (profil + historique + dernière interaction). Un clic, un ping."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────

function MatchingCard({
  property,
  matches,
}: {
  property: Property;
  matches: Array<{ lead: AdminLead; score: number; reasons: string[] }>;
}) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-[var(--color-charcoal)] bg-white">
      {/* TOP : property header */}
      <div className="grid gap-0 md:grid-cols-[320px_1fr]">
        {/* Image */}
        <Link
          href={`/acheter/${property.slug}`}
          target="_blank"
          className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-charcoal)] md:aspect-auto"
        >
          {property.images[0] && (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              sizes="320px"
              className="object-cover"
            />
          )}
        </Link>

        {/* Property meta */}
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-charcoal)] md:text-3xl">
                {property.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-stone)]">
                <span>{propertyTypeLabel(property.type)}</span>
                <span>·</span>
                <span>
                  {property.neighborhood}, {property.city}
                </span>
                <span>·</span>
                <span>{property.bedrooms} chambres</span>
                {property.surface > 0 && (
                  <>
                    <span>·</span>
                    <span>{property.surface} m²</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-serif text-3xl text-[var(--color-charcoal)]">
                {formatPrice(property.price, property.listing, property.currency, property.priceUnit)}
              </div>
            </div>
          </div>

          {/* Match summary */}
          <div className="mt-7 border-t border-[var(--color-beige-warm)] pt-5">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl text-[var(--color-terracotta)]">
                {matches.length}
              </span>
              <span className="text-base text-[var(--color-charcoal)]">
                acheteurs actifs correspondent
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-stone)]">
              <span className="flex items-center gap-1.5">
                <Target size={11} className="text-[var(--color-terracotta)]" />
                Score moyen :{" "}
                {Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length)}%
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/acheter/${property.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[var(--color-charcoal)] bg-white px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-white"
            >
              Voir la fiche publique
            </Link>
          </div>
        </div>
      </div>

      {/* MATCHED BUYERS list */}
      <div className="border-t border-[var(--color-beige-warm)] bg-[var(--color-cream)]/40">
        <div className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-stone)] md:px-8">
          Les acheteurs matchés
        </div>
        <div className="divide-y divide-[var(--color-beige-warm)]">
          {matches.map((match, i) => (
            <div
              key={i}
              className="grid items-center gap-4 px-6 py-5 md:grid-cols-[1fr_auto_auto] md:gap-6 md:px-8"
            >
              {/* Buyer */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="font-serif text-lg text-[var(--color-charcoal)]">
                    {match.lead.buyer.firstName} {match.lead.buyer.lastName}
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-stone)]">
                  <span>
                    Budget ≤{" "}
                    {match.lead.buyer.budget.max > 0
                      ? `${(match.lead.buyer.budget.max / 1000000).toFixed(1)} M€`
                      : "non contraint"}
                  </span>
                  {match.lead.buyer.criteria.types.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{match.lead.buyer.criteria.types.join(", ")}</span>
                    </>
                  )}
                  {match.lead.buyer.criteria.neighborhoods.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{match.lead.buyer.criteria.neighborhoods.join(", ")}</span>
                    </>
                  )}
                  {match.lead.buyer.criteria.bedroomsMin > 0 && (
                    <>
                      <span>·</span>
                      <span>{match.lead.buyer.criteria.bedroomsMin}+ ch.</span>
                    </>
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {match.reasons.slice(0, 3).map((r, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-white px-2 py-1 text-[10px] text-[var(--color-charcoal)]"
                    >
                      <Check size={9} className="mr-1 inline text-[var(--color-terracotta)]" />
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match score */}
              <div className="text-right">
                <div className="font-serif text-3xl text-[var(--color-terracotta)]">
                  {match.score}%
                </div>
                <div className="text-[9px] uppercase tracking-[0.22em] text-[var(--color-stone)]">
                  score
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/leads/${match.lead.id}`}
                  className="inline-flex items-center gap-1 rounded-[10px] border border-[var(--color-beige-warm)] bg-white px-3 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-charcoal)] transition-colors hover:border-[var(--color-charcoal)]"
                >
                  Ouvrir lead
                  <ChevronRight size={10} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function StatBlock({
  value,
  label,
  accent = false,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className={`p-7 ${accent ? "bg-[var(--color-cream)]" : ""}`}>
      <div
        className={`font-serif text-4xl ${
          accent ? "text-[var(--color-terracotta)]" : "text-[var(--color-charcoal)]"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
        {label}
      </div>
    </div>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-[var(--color-stone-soft)]">{num}</div>
      <h3 className="mt-3 font-serif text-xl text-[var(--color-charcoal)]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-stone)]">{body}</p>
    </div>
  );
}
