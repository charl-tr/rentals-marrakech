import { getAdminSession } from "@/lib/auth";
import { getAllLeads, getLeadsForSession } from "@/lib/db";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAgendaPage() {
  const now = new Date();
  const session = await getAdminSession();
  const leads =
    session?.role === "director"
      ? await getAllLeads()
      : await getLeadsForSession(session);

  // Leads with upcoming visits (or recent past visits within 7 days)
  const withVisits = leads
    .filter((l) => l.nextVisit?.at)
    .sort(
      (a, b) =>
        new Date(a.nextVisit!.at).getTime() - new Date(b.nextVisit!.at).getTime()
    );

  const upcoming = withVisits.filter(
    (l) => new Date(l.nextVisit!.at) >= new Date(now.getTime() - 7 * 86400000)
  );

  // Group by date (YYYY-MM-DD)
  const byDate = new Map<string, typeof upcoming>();
  for (const lead of upcoming) {
    const dateKey = lead.nextVisit!.at.slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(lead);
  }

  const dateEntries = Array.from(byDate.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const formatDay = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(iso));

  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  return (
    <div className="container-luxe py-10 md:py-14">
      <AdminBreadcrumbs crumbs={[{ label: "Agenda" }]} />

      <div className="mt-6 flex items-end justify-between border-b border-[var(--color-beige-warm)] pb-8">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-terracotta)]">
            Planning
          </div>
          <h1 className="mt-2 font-serif text-3xl text-[var(--color-charcoal)] md:text-4xl">
            Agenda
            <span className="ml-3 text-[var(--color-stone)]">· {upcoming.length}</span>
          </h1>
          <p className="mt-1 text-xs text-[var(--color-stone)]">
            Visites programmées — 7 jours passés et à venir
          </p>
        </div>
        <Link
          href="/admin/leads?status=visit_scheduled"
          className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)] hover:text-[var(--color-terracotta)]"
        >
          Tous les leads visites →
        </Link>
      </div>

      {dateEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Calendar size={32} className="mb-4 text-[var(--color-stone)]/40" />
          <p className="text-sm font-medium text-[var(--color-charcoal)]">
            Aucune visite programmée
          </p>
          <p className="mt-1 text-xs text-[var(--color-stone)]">
            Les visites apparaîtront ici dès qu&apos;un conseiller programme une date.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {dateEntries.map(([dateKey, dayLeads]) => {
            const isPast = new Date(dateKey) < new Date(now.toDateString());
            return (
              <section key={dateKey}>
                <div
                  className={`flex items-baseline gap-4 mb-4 pb-3 border-b border-[var(--color-beige-warm)] ${
                    isPast ? "opacity-60" : ""
                  }`}
                >
                  <h2 className="font-serif text-xl text-[var(--color-charcoal)] capitalize">
                    {formatDay(dateKey + "T12:00:00")}
                  </h2>
                  {isPast && (
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-stone)]">
                      passé
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {dayLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}`}
                      className={`group flex items-center gap-5 bg-white border border-[var(--color-beige-warm)] px-5 py-4 transition-colors hover:border-[var(--color-charcoal)] ${
                        isPast ? "opacity-70" : ""
                      }`}
                    >
                      <div className="flex h-12 w-14 flex-shrink-0 flex-col items-center justify-center border border-[var(--color-beige-warm)] text-center">
                        <div className="font-serif text-xl leading-none text-[var(--color-charcoal)]">
                          {formatTime(lead.nextVisit!.at)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--color-charcoal)] truncate">
                          {lead.buyer.firstName} {lead.buyer.lastName}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-stone)] truncate">
                          <MapPin size={10} />
                          {lead.nextVisit!.propertySlug}
                        </div>
                      </div>
                      {lead.nextVisit!.confirmed && (
                        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-terracotta)]">
                          Confirmée
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
