# Changelog

Toutes les modifications notables sont consignées ici.

Format : [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versionning : [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Espace sans mot de passe (« Ma sélection ») : la capture email des favoris/comparateur renvoie désormais un lien magique (`/ma-selection/[token]`) envoyé par email, qui restaure la sélection sur n'importe quel appareil — sans compte. Réutilise le `portal_token` existant (aucune migration). Colmate la fuite « favoris perdus entre appareils ».
- Continuité de sélection : le navigateur mémorise localement qu'il est déjà « lié » (`selection-link`). La bannière ne re-propose plus de sauvegarder en boucle — elle reconnaît l'utilisateur (« ✓ Sélection enregistrée · email ») et, si la sélection a changé, propose de **mettre à jour le même enregistrement** (`updateSavedSelection`) au lieu de créer un doublon.
- Email de sélection enrichi : sujet explicite (« Vos N biens sélectionnés vous attendent »), preheader, logo, et vignettes des biens sauvegardés (photo + titre + prix) — email de désir, pas juste un lien.
- Mémoire d'envoi des formulaires de contact (`form-memory`) : au refresh, le formulaire ne réapparaît plus vierge — il reconnaît « demande déjà envoyée » (avec le conseiller assigné), clé par contexte (bien précis ou générique), avec réouverture explicite « Envoyer un autre message ». Supprime l'impression de non-envoi et la re-soumission accidentelle.
- Documentation foundation : `README.md` refresh, `CONTRIBUTING.md`, `ROADMAP.md`, `CHANGELOG.md`.
- ADR system : `docs/adr/0000-template.md`, `docs/adr/0001-vertical-slice-architecture.md`, `docs/adr/0002-saas-multi-tenant-pivot.md`.
- Runbook system : `docs/runbooks/supabase-paused.md`.
- GitHub Actions CI workflow : ESLint + TypeScript typecheck on every PR.
- Pull Request template enforcing changelog/ADR/env-var doc obligations.
- `.env.example` extended to cover all environment variables actually used by the code (Resend, Sentry, NEXT_PUBLIC_SITE_URL, DEV_EMAIL_OVERRIDE).

### Changed
- `CLAUDE.md` updated to reference the new doc system and obligations for AI agents.

---

## [0.1.0] — 2026-05-06

Initial commit — snapshot of ~17 days of pre-version-control work.

### Added
- Public site (route group `(public)`) : home, /acheter, /louer, /carte, /marche, /quartiers, /journal, /contact, /equipe, /essaouira, /mon-espace, /mon-bien, /deposer-un-bien, /estimer, /faq, /comparer, /collections, /savoir-acheter, /favoris, légal.
- 212 properties live in Supabase (sourced from Marrakech Realty via Wayback scraping).
- Admin CRM (`/admin/*`) : dashboard, leads (kanban + next-best-action + rich profile), biens (with owner + mandates + timeline), équipe (advisor portfolio), agenda (visit scheduling), matching (real engine).
- Auth : Supabase magic-link with whitelist on `advisors.email`, two roles (`director`, `advisor`) with scope enforcement.
- Map view (`/carte`) : Leaflet with zoom-aware clustering, golden-angle Fibonacci spread, `flyTo` cinematic transitions, mobile bottom-sheet UX.
- Email outbound : Resend integration with `DEV_EMAIL_OVERRIDE` safety net.
- Matching engine : `src/lib/matching.ts` (budget 40 / type 25 / neighborhood 20 / bedrooms 15).
- Visit scheduling : `scheduleVisit` mutation + `VisitScheduler` component + `/admin/agenda`.
- CSV export of leads.
- Supabase migrations 0001 → 0010 (initial schema, status, leads, leads extended, advisor roles, mandates + owners, client portal, seller portal, RLS hardening, DB hardening with indexes).
- Mobile responsive sweep on home, catalogue, property card.
- SEO : 308 redirects preserving all legacy Marrakech Realty slugs.
- Sentry integration (build-side, awaiting prod activation).
- Realtime sync : Supabase Realtime channel on 5 tables (leads, lead_events, properties, mandates, property_events) with debounced `router.refresh()`.
- Stack-1 UX primitives : `useKeyboard` hook, `<Kbd>` component, `<CommandPalette>` (cmd+K with fuzzy search), skeletons.
- Stack-1 advanced : generic `<DataTable>` with j/k navigation, contextual shortcuts on lead profile (`s` status, `n` note, `c` log call).
- Stack-2 data layer : `useOptimisticMutation` hook with rollback.

### Infrastructure
- Repo published privately on GitHub : `charl-tr/rentals-marrakech`.
- Vercel project deployed on `https://rentals-marrakech.vercel.app`.

[Unreleased]: https://github.com/charl-tr/rentals-marrakech/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/charl-tr/rentals-marrakech/releases/tag/v0.1.0
