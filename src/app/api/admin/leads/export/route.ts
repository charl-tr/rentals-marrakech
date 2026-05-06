import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllLeads, getLeadsForSession } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const leads =
    session.role === "director"
      ? await getAllLeads()
      : await getLeadsForSession(session);

  const headers = [
    "ID",
    "Nom",
    "Email",
    "Téléphone",
    "Statut",
    "Intent",
    "Source",
    "Bien source",
    "Conseiller",
    "Budget max (€)",
    "Type recherché",
    "Quartier recherché",
    "Chambres min",
    "SLA tier",
    "Créé le",
    "Première réponse",
    "Fermé le",
  ];

  const rows = leads.map((l) => [
    l.id,
    `${l.buyer.firstName} ${l.buyer.lastName}`.trim(),
    l.buyer.email,
    l.buyer.phone,
    l.status,
    l.intent,
    l.source,
    l.sourcePropertySlug,
    l.advisorSlug,
    l.buyer.budget.max > 0 ? l.buyer.budget.max : "",
    l.buyer.criteria.types.join(";"),
    l.buyer.criteria.neighborhoods.join(";"),
    l.buyer.criteria.bedroomsMin > 0 ? l.buyer.criteria.bedroomsMin : "",
    l.slaTier,
    l.createdAt,
    l.firstResponseAt ?? "",
    "", // closedAt not in AdminLead type
  ]);

  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");

  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
