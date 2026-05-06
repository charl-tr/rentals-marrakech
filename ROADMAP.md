# Roadmap

État vivant du projet. Mis à jour à la fin de chaque sprint.

Pour l'historique de ce qui a été shippé : [`CHANGELOG.md`](./CHANGELOG.md).
Pour le contexte d'une décision : [`docs/adr/`](./docs/adr/).

---

## Where we are now

**Date** : 2026-05-06
**Phase** : E (top-tier rebuild) — partiellement livrée
**Sprint en cours** : Foundation deploy + doc

### Ce qui tourne déjà

- **Site public** (212 biens en DB Supabase) : home, /acheter, /louer, /carte, /marche, /quartiers, /journal, /contact, équipe, essaouira, etc.
- **CRM admin** : dashboard, leads (kanban + NBA rules-based + fiche riche), biens (avec propriétaire + mandats + timeline), équipe (portfolio), agenda visites, matching engine.
- **Auth** : magic-link Supabase Auth, 2 rôles (`director` / `advisor`) avec scope enforcement.
- **Map cinématique** : clustering zoom-aware, golden-angle Fibonacci spread, flyTo, mobile bottom-sheet.
- **Email Resend** : câblé avec `DEV_EMAIL_OVERRIDE` (garde-fou anti-envoi accidentel tant que domaine non vérifié).
- **DB Supabase** : 10 migrations appliquées (0001 → 0010), RLS hardening, index complets.

### Ce qui vient juste d'être mis en place (cette PR)

- Repo GitHub privé : https://github.com/charl-tr/rentals-marrakech
- Vercel project déployé sur `https://rentals-marrakech.vercel.app`
- Système de doc structuré (README, CONTRIBUTING, ROADMAP, CHANGELOG, ADRs, runbooks)
- CI GitHub Actions (lint + typecheck sur chaque PR)

### Bloqueurs actifs

Aucun.

---

## Sprint en cours — Foundation deploy + doc

**Objectif** : sécuriser le projet sur GitHub + Vercel et poser les fondations doc avant d'attaquer le travail produit suivant.

- [x] Initial commit + push GitHub (privé)
- [x] Setup Vercel + env vars
- [x] Premier déploiement réussi
- [x] Système de doc en place (README, CONTRIBUTING, ROADMAP, CHANGELOG, ADRs, runbooks)
- [x] CI lint + typecheck
- [x] PR template
- [ ] Vérifier que la prod sert correctement le site
- [ ] Décider si on met `noindex` global tant qu'on est en phase finition

---

## Next 2-4 weeks — finir Phase E

Suite directe du sprint actuel. Objectif : passer la dimension B2C de 6.0/10 à ≥7.5/10 (cf. [`docs/audit-4-top-tier-gap-analysis.md`](./docs/audit-4-top-tier-gap-analysis.md)).

- [ ] Test email Resend end-to-end (vérifier que ça arrive bien)
- [ ] Sweep mobile sur Footer + Navbar + pages publiques restantes (contact, journal, quartiers, équipe)
- [ ] Portail acheteur `/mon-espace/[token]` complet
- [ ] Alertes email (saved searches → notification auto)
- [ ] Sentry actif en prod (DSN + auth token sur Vercel)
- [ ] RLS refactor (service-role trop permissif sur certaines tables)
- [ ] Brochure PDF prestige annuelle

---

## Phase F — Parité internationale (4-6 semaines)

- Portail vendeur (dashboard mandats, suivi estimation → offres → acte)
- Portail bailleur (biens loués, revenus, calendrier)
- Gestion locative saisonnière
- Signatures électroniques (YouSign / DocuSign)
- Syndication portails (SeLoger, Mubawab, export XML)

---

## Phase G — Intégrations conseiller (4-6 semaines)

- Email bi-directionnel (Resend inbound + IMAP sync + matching contact)
- WhatsApp Business API (Twilio ou Meta)
- CTI téléphone (Aircall)
- Google/Outlook calendar bi-directionnel
- PWA mobile pour conseillers en mobilité
- Auto-relances configurables
- Lead scoring rules-based pondéré
- Analytics avancées (funnel, attribution, churn)
- i18n (EN + AR)

---

## Phase H — Marque & notoriété (ongoing)

- Events clients (soirées portes ouvertes)
- Podcast "Marrakech Realty Talks"
- Vidéo walkthrough biens
- Google/Meta Ads
- Programme affiliés
- Relations presse

---

## Phase G+ — Productisation SaaS (3-6 mois)

Décision de pivot prise le 2026-04-18 (cf. ADR-0002). Pour vendre à un 2e client il faut :

- [ ] Multi-tenancy (`agency_id` partout)
- [ ] Onboarding self-serve d'une nouvelle agence
- [ ] Branding configurable (logo, palette, domaine custom)
- [ ] Billing (Stripe)
- [ ] Doc produit pour les agences

Voir [`pitch/`](./pitch/) pour les assets commerciaux et [`positioning`](./pitch/) pour le pitch ICP.

---

## Décisions clés (références ADR)

- [ADR-0001](./docs/adr/0001-vertical-slice-architecture.md) — Vertical Slice Architecture
- [ADR-0002](./docs/adr/0002-saas-multi-tenant-pivot.md) — Pivot SaaS multi-tenant

Voir [`docs/adr/`](./docs/adr/) pour la liste complète.
