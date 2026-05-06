@AGENTS.md

# Documentation system — read this first

This project follows an explicit doc discipline. **Every doc has one role**, listed in [`README.md`](./README.md). Before doing anything non-trivial:

1. Read [`ROADMAP.md`](./ROADMAP.md) → understand current phase, current sprint, current blockers.
2. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) → follow the workflow (branches, commits, PRs).
3. If a major decision is being taken or recalled, check [`docs/adr/`](./docs/adr/).

Doc obligations during a session:

- **New env var** → update `.env.example` in the same PR.
- **New architectural decision** → create an ADR in `docs/adr/NNNN-slug.md` (use `0000-template.md`).
- **New ops procedure learned** (e.g. how to handle a paused Supabase) → add a runbook in `docs/runbooks/`.
- **PR mergeable** → propose an entry under `## [Unreleased]` in `CHANGELOG.md`.
- **Sprint complete** → propose updates to `ROADMAP.md` (move items, update "Where we are now").

Do **not** push files from the personal Claude memory directory (`~/.claude/projects/.../memory/`) into the repo. If a memory item crystallises into an actual project decision, transform it into an ADR or a `docs/` doc instead.

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

See [`docs/adr/0001-vertical-slice-architecture.md`](./docs/adr/0001-vertical-slice-architecture.md) for the rationale.

# Patterns

- **Token-gated public pages** (`/mon-espace/[token]`, `/mon-bien/[token]`, `/ma-location/[token]`): UUID v4 token on the relevant DB row, anon RLS allows SELECT by token, `notFound()` on invalid/missing token, `robots: noindex`.
- **Admin mutations**: always via `defineMutation` factory — schema → requiredRole → handler → revalidate.
- **Server reads**: `supabase` (anon) for public pages, `supabaseAdmin` (service-role) for admin pages.
- **Parallel fetches**: use `Promise.all` when multiple independent DB calls are needed in one server component.
- **Neighborhood coords**: defined in `src/data/properties.ts` → `NEIGHBORHOOD_COORDS`, used in `rowToProperty` and `getPropertyPins`.
