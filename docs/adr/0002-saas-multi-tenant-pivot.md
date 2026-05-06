# ADR-0002 — Pivot SaaS multi-tenant

- **Date** : 2026-04-18
- **Statut** : Accepted
- **Décideur(s)** : Charles

## Contexte

Le projet a démarré comme un rebuild luxe du site de Marrakech Realty (MR), avec un CRM interne pour leurs conseillers. Au fil des audits, deux constats se croisent :

1. **Côté produit** : les briques construites (CRM avec NBA, matching engine, mandats, portails token-gated, map cinématique) ne sont pas spécifiques à MR. Elles couvrent les besoins génériques d'une agence immobilière luxe.
2. **Côté marché** : Apimo / Hektor / Jestimo ciblent le bas du marché (80-150€/mois, UX vieillie). Salesforce custom = over-engineered et hors-budget. Les agences luxe régionales (1 000-5 000 dans le monde) sont **sous-équipées**. Aucun acteur dédié.

Si on ne fait que MR, on construit un produit avec un marché de 1 client. Si on en fait un SaaS, on adresse un marché à 100× le potentiel commercial.

## Options envisagées

- **Continuer en outil interne MR** — simple, pas de surcoût archi, mais TAM = 1.
- **Pivoter en SaaS dès maintenant** — refacto archi pour accepter `agency_id`, branding configurable, billing. Coût immédiat élevé, risque de ne jamais finir le pilote.
- **Pivoter à terme, garder MR comme pilote** — design des futures features avec multi-tenancy en tête, MAIS rester single-tenant en pratique tant que MR n'est pas livré. Refacto multi-tenant en Phase G+.

## Décision

> On pivote en **SaaS multi-tenant**, mais en deux temps : MR reste pilote single-tenant en Phase E-F, et on bascule en multi-tenant à partir de Phase G+. Toutes les décisions archi prises **dès maintenant** doivent être évaluées sous l'angle "portable à 50 agences ?".

Conséquence directe : pas de hardcoded "Marrakech Realty" dans la couche produit. Le tenant "MR" est la première configuration, pas le seul tenant possible.

## Conséquences

### Positives
- Potentiel commercial 100× supérieur (cf. `pitch/case-study-mr.md`, `pitch/proposal-template.md`).
- Pricing implicite Pro tier : 800-1500€/mois par agence 4-10 conseillers (vs 150€ chez les concurrents).
- Le travail produit pour MR (matching, NBA, portails, etc.) capitalise au lieu de se diluer.
- ICP clair : agences luxe régionales sous-équipées (cf. `positioning.md` mémoire IA).

### Négatives / coûts assumés
- Discipline produit accrue : chaque feature doit passer le test "agency-agnostique".
- Une refacto multi-tenant non triviale en Phase G+ (ajout `agency_id` partout, RLS scopée, branding, billing).
- Risque de trop abstraire avant la 1ère vente, donc on **garde le MVP single-tenant** jusqu'à preuve commerciale.
- MR doit être livré exemplairement (pilote + référence + case study) — c'est notre meilleur asset commercial.

### Conditions de remise en cause
- Si après 6 mois post-MR-livré on n'a pas signé un 2e client, on remet en cause le pivot (peut-être que le marché n'est pas là, ou que le pricing n'est pas ajusté).
- Si MR demande une feature 100% spécifique à leur métier (ex: spécificités fiscales marocaines uniques), on refuse ou on l'isole derrière une feature flag tenant-spécifique.

## Références

- `pitch/case-study-mr.md`, `pitch/proposal-template.md`, `pitch/outreach-templates.md`, `pitch/landing-copy.md` — assets commerciaux.
- `ROADMAP.md` section "Phase G+ Productisation SaaS" — le plan de refacto multi-tenant.
- Mémoire IA : `commercial_model.md`, `positioning.md`, `sales_playbook.md` (privé, non versionné).
