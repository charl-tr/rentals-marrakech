import {
  Activity,
  Banknote,
  Check,
  Eye,
  EyeOff,
  FileText,
  Scroll,
  Star,
  User,
} from "lucide-react";
import { relativeTime } from "@/lib/leads";
import type { PropertyEvent } from "@/lib/mandates";
import type { Advisor } from "@/data/properties";

const TYPE_META: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  status_change: { icon: Check, label: "Statut commercial modifié" },
  price_change: { icon: Banknote, label: "Prix ajusté" },
  publish_change: { icon: Eye, label: "Publication modifiée" },
  featured_change: { icon: Star, label: "Mise en avant modifiée" },
  mandate_created: { icon: Scroll, label: "Mandat créé" },
  mandate_updated: { icon: Scroll, label: "Mandat mis à jour" },
  mandate_closed: { icon: Scroll, label: "Mandat clôturé" },
  owner_updated: { icon: User, label: "Propriétaire mis à jour" },
  note: { icon: FileText, label: "Note" },
  visit_scheduled: { icon: Activity, label: "Visite programmée" },
  visit_completed: { icon: Activity, label: "Visite effectuée" },
  offer_submitted: { icon: Activity, label: "Offre soumise" },
};

export default function PropertyTimeline({
  events,
  advisors,
  now,
}: {
  events: PropertyEvent[];
  advisors: Advisor[];
  now: Date;
}) {
  if (events.length === 0) {
    return (
      <div className="text-sm text-[var(--color-stone)]">
        Aucun événement enregistré pour ce bien.
      </div>
    );
  }

  const advisorByslug: Record<string, Advisor> = {};
  for (const a of advisors) advisorByslug[a.slug] = a;

  return (
    <div className="space-y-5">
      {events.map((ev) => {
        const meta = TYPE_META[ev.type] ?? { icon: Activity, label: ev.type };
        const Icon = meta.icon;
        const advisor = ev.authorSlug ? advisorByslug[ev.authorSlug] : null;
        return (
          <div key={ev.id} className="flex gap-4">
            <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-cream)] text-[var(--color-charcoal)]">
              <Icon size={13} />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-[var(--color-stone)]">
                <span className="font-medium text-[var(--color-charcoal)]">
                  {meta.label}
                </span>
                {advisor && (
                  <>
                    <span>·</span>
                    <span>{advisor.name.split(" ")[0]}</span>
                  </>
                )}
                <span>·</span>
                <span>{relativeTime(ev.createdAt, now)}</span>
              </div>
              {ev.body && (
                <div className="mt-1 text-sm leading-relaxed text-[var(--color-charcoal)]">
                  {ev.body}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
