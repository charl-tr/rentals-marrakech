"use client";

import { useRealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";

// Composant transparent qui active la synchronisation Realtime sur les
// tables critiques de l'admin. À poser une fois dans le layout admin.
// Ne rend rien dans le DOM.

export default function RealtimeSync() {
  // Débounces différenciés : les tables « chaudes » (leads) réagissent vite,
  // les tables secondaires sont volontairement lentes pour éviter que des
  // changements en arrière-plan ne déclenchent un router.refresh() du layout
  // en cascade (flicker). Combiné à React.cache() sur les lectures, chaque
  // refresh est bien moins coûteux.
  useRealtimeRefresh("leads", 800);
  useRealtimeRefresh("lead_events", 800);
  useRealtimeRefresh("properties", 2500);
  useRealtimeRefresh("mandates", 2500);
  useRealtimeRefresh("property_events", 2500);
  return null;
}
