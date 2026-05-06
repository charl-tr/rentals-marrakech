"use client";

import { useRealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";

// Composant transparent qui active la synchronisation Realtime sur les
// tables critiques de l'admin. À poser une fois dans le layout admin.
// Ne rend rien dans le DOM.

export default function RealtimeSync() {
  useRealtimeRefresh("leads");
  useRealtimeRefresh("lead_events");
  useRealtimeRefresh("properties");
  useRealtimeRefresh("mandates");
  useRealtimeRefresh("property_events");
  return null;
}
