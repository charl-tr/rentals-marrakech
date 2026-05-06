import "server-only";
import { createClient } from "@supabase/supabase-js";

// ════════════════════════════════════════════════════════════════════
// Client Supabase admin — server-only, utilise SERVICE_ROLE_KEY.
// ════════════════════════════════════════════════════════════════════
// Bypasse complètement RLS. À n'utiliser QUE dans :
//   - routes /admin/* (server components + server actions)
//   - scripts (seed, maintenance)
//   - edge functions (SLA watcher, cron)
//
// Ne JAMAIS l'exposer au client — "server-only" fait planter le build si
// ce module est importé depuis un Client Component.
// ════════════════════════════════════════════════════════════════════

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    "Manquant : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY (vérifier .env.local)"
  );
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
