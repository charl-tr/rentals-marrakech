import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ════════════════════════════════════════════════════════════════════
// Client Supabase pour Server Components + Server Actions + Route Handlers.
// Lit/écrit la session depuis les cookies Next.js (ssr cookies()).
// Utilisé pour : admin auth (magic-link), reads admin avec identité session.
// NE remplace PAS supabaseAdmin (service-role) — celui-ci bypass RLS et
// sert pour les writes admin + les scripts.
// ════════════════════════════════════════════════════════════════════

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll a été appelée depuis un Server Component où la mutation
            // cookies est interdite. Safe à ignorer si le middleware
            // rafraîchit déjà la session.
          }
        },
      },
    }
  );
}
