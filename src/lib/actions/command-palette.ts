"use server";

import { getAllAdvisors, getAllLeads, getAllPropertiesAdmin } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import "server-only";
import type { CommandPaletteData } from "@/components/admin/CommandPalette";

// Chargée à la demande (premier ⌘K), pas au chargement du layout admin —
// évite de bloquer CHAQUE navigation sur 3 requêtes pleine-table. Les
// lectures sous-jacentes sont déjà en cache court (unstable_cache, 15s,
// tag "admin"), donc même un ⌘K répété reste rapide.
export async function getCommandPaletteData(): Promise<CommandPaletteData> {
  await requireAdminSession();

  const [leads, properties, advisors] = await Promise.all([
    getAllLeads(),
    getAllPropertiesAdmin(),
    getAllAdvisors(),
  ]);

  return {
    leads: leads.slice(0, 30).map((l) => ({
      id: l.id,
      name: `${l.buyer.firstName} ${l.buyer.lastName}`.trim(),
      status: l.status,
    })),
    properties: properties.slice(0, 30).map((p) => ({
      slug: p.slug,
      title: p.title,
      reference: p.reference,
    })),
    advisors: advisors.map((a) => ({ slug: a.slug, name: a.name })),
  };
}
