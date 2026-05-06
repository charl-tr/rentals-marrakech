"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// ════════════════════════════════════════════════════════════════════
// useRealtimeRefresh — écoute les changements d'une table Supabase et
// déclenche `router.refresh()` pour revalider les Server Components.
//
// Approche pragmatique : pas de state local à synchroniser, on laisse
// Next.js re-render les RSC avec la data fraîche. Debouncé à 500ms pour
// éviter les refresh en cascade si plusieurs changements arrivent vite.
//
// Usage dans une page client component ou layout :
//   useRealtimeRefresh("leads");
//   useRealtimeRefresh("lead_events");
//
// Active Supabase Realtime sur ces tables via Studio :
//   Database → Replication → activer pour leads et lead_events
// ════════════════════════════════════════════════════════════════════

// Client léger dédié aux channels Realtime (pas de persistSession)
// Safe en client car c'est la anon key + RLS filtre.
const realtimeClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export function useRealtimeRefresh(tableName: string, debounceMs = 500) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const channel = realtimeClient
      .channel(`table-${tableName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            router.refresh();
          }, debounceMs);
        }
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void realtimeClient.removeChannel(channel);
    };
  }, [tableName, debounceMs, router]);
}
