@AGENTS.md

# Architecture — Vertical Slice

Every feature ships as a complete vertical slice: migration → DB helper → server action (if needed) → page/component → admin hook-in. No horizontal layers in isolation. A slice is only done when it is testable end-to-end.

Order within a slice:
1. DB migration (schema first, idempotent)
2. DB helper in `src/lib/db.ts` (typed, server-only)
3. Server action in `src/lib/actions/` if mutations needed (via `defineMutation`)
4. Page in `src/app/(public)/` or `src/app/admin/`
5. Client component(s) if interactivity needed
6. Admin hook-in (button, link, or section on existing admin page)
7. Seed / test data so the slice is immediately demoable

Never commit a migration without the corresponding code. Never ship a page that has no reachable data.

# Patterns

- **Token-gated public pages** (`/mon-espace/[token]`, `/mon-bien/[token]`, `/ma-location/[token]`): UUID v4 token on the relevant DB row, anon RLS allows SELECT by token, `notFound()` on invalid/missing token, `robots: noindex`.
- **Admin mutations**: always via `defineMutation` factory — schema → requiredRole → handler → revalidate.
- **Server reads**: `supabase` (anon) for public pages, `supabaseAdmin` (service-role) for admin pages.
- **Parallel fetches**: use `Promise.all` when multiple independent DB calls are needed in one server component.
- **Neighborhood coords**: defined in `src/data/properties.ts` → `NEIGHBORHOOD_COORDS`, used in `rowToProperty` and `getPropertyPins`.
