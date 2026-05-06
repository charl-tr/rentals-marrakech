import { createClient } from "@supabase/supabase-js";

// Client public — utilisé par les Server Components pour lire la DB.
// Les RLS policies garantissent que seules les rows published sont visibles.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error(
    "Manquant : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY (vérifier .env.local)"
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
