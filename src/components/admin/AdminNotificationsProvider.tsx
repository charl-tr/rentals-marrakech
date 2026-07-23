"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// ════════════════════════════════════════════════════════════════════
// AdminNotificationsProvider — badge + toast temps réel sur les nouveaux
// leads. S'appuie sur Supabase Realtime (INSERT sur `leads`) : nécessite
// que la réplication soit activée pour cette table dans Supabase Studio
// (Database → Replication) — même prérequis que RealtimeSync.
//
// Scope par rôle : un directeur est notifié de tous les nouveaux leads,
// un conseiller uniquement de ceux qui lui sont assignés.
// ════════════════════════════════════════════════════════════════════

interface NotificationsCtx {
  unreadLeads: number;
}

const Ctx = createContext<NotificationsCtx>({ unreadLeads: 0 });
export const useAdminNotifications = () => useContext(Ctx);

// Client dédié, léger — même pattern que useRealtimeRefresh.ts (pas de
// session persistée, la anon key + RLS suffisent).
const notifClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const INTENT_LABEL: Record<string, string> = {
  acheter: "Achat",
  louer: "Location",
  vendre: "Vente",
  autre: "Contact",
};

export default function AdminNotificationsProvider({
  isDirector,
  advisorSlug,
  children,
}: {
  isDirector: boolean;
  advisorSlug: string;
  children: React.ReactNode;
}) {
  const [unreadLeads, setUnreadLeads] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Visiter la page Leads efface le compteur — pas besoin d'un "marquer lu"
  // manuel, la simple visite fait foi.
  useEffect(() => {
    if (pathname?.startsWith("/admin/leads")) setUnreadLeads(0);
  }, [pathname]);

  useEffect(() => {
    const channel = notifClient
      .channel("admin-lead-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const row = payload.new as {
            name?: string;
            assigned_advisor_slug?: string | null;
            intent?: string;
          };
          const relevant = isDirector || row.assigned_advisor_slug === advisorSlug;
          if (!relevant) return;

          setUnreadLeads((n) => n + 1);
          toast(`Nouveau lead — ${row.name ?? "Contact"}`, {
            description: row.intent ? INTENT_LABEL[row.intent] ?? undefined : undefined,
            action: {
              label: "Voir",
              onClick: () => router.push("/admin/leads"),
            },
          });
        }
      )
      .subscribe();

    return () => {
      void notifClient.removeChannel(channel);
    };
  }, [isDirector, advisorSlug, router]);

  return <Ctx.Provider value={{ unreadLeads }}>{children}</Ctx.Provider>;
}
