# Audit — Plateforme Admin Marrakech Realty

**Date** : 18 avril 2026
**Scope** : Admin (`/admin/*`), site public (`/`), infrastructure (Supabase, auth, mutations)
**Auditor** : relecture critique interne
**Build auditée** : post-Phase B.5 (rôles + périmètre + NBA + seed v2 50 leads) + admin biens

---

## Résumé exécutif

La plateforme est **fonctionnellement démonstrable** mais **architecturalement naïve**. Elle impressionne en surface (design, NBA engine, permissions, répartition équipe) mais révèle des trous béants au-delà de 10 minutes d'exploration. Un directeur d'agence expérimenté identifiera 5 réflexions critiques dans les 20 premières minutes qu'on ne peut pas défendre.

**Verdict** : c'est une démo qui **signe** mais qui **ne survit pas** à un power-user en usage quotidien. L'écart entre "vitrine signable" et "outil d'exploitation" = 3 sprints de rigueur.

### Scorecard synthèse

| Domaine | Score | Commentaire |
|---|---|---|
| Design system | **8/10** | Cohérent, codes luxe tenus |
| Information architecture | **4/10** | Volets corrects, mais segmentation métier absente |
| UX conseiller (mode flow) | **5/10** | Fiche bien dump complet, NBA isolé |
| UX directeur (vue maison) | **7/10** | Dashboard + équipe OK, manque tendances |
| Modèle de données | **4/10** | Plat, leads/properties conflés, mandats absents |
| Sécurité & permissions | **6/10** | Auth + scope fonctionnels, RLS à raffiner |
| Performance | **7/10** | OK à 50 rows, questionable à 5000 |
| Accessibility | **3/10** | Focus nav cassée, contrastes limites, aria partiel |
| Mobile | **2/10** | Admin non testé, tables crashées sous 1024px |
| Testing | **0/10** | Aucun test |

**Score global** : **4.6 / 10**

---

## Critiques de démo (visibles en 5 min)

### #1 — Aucune segmentation **Vente / Location**, ni **types de mandats**

**Constat** : le pipeline `/admin/leads` mélange un acheteur à 2M€ de villa Palmeraie et un locataire saisonnier à 3k/semaine. Ce ne sont pas le même métier, pas les mêmes conseillers qui traitent, pas les mêmes cadences SLA, pas les mêmes KPIs. De même, `/admin/biens` ne distingue pas mandat exclusif / simple / apport d'affaires — information capitale pour le métier.

**Impact** : un directeur voyant ça dit *"ce n'est pas un dev qui a fait ça sans parler aux métiers"*. Il a raison.

**Correctif** :
- Ajouter un filtre/toggle primaire `vente | location | tous` sur `/admin/leads`
- Ajouter `mandate_type` sur properties (ou table dédiée)
- Ajouter une colonne visuelle "type de mandat" sur la liste biens

**Estimation** : 2-4 heures.

---

### #2 — `/admin/biens` sans **vue grille cards**

**Constat** : la liste biens n'offre qu'une table. Pour scanner un portefeuille visuel (= des photos), la grille de cards est toujours plus rapide. Le toggle Table/Kanban existe sur Leads, il manque sur Biens.

**Impact** : asymétrie évidente, cohérence de l'interface brisée. Un power-user le signale en < 5 min.

**Correctif** : composant `BiensGrid` + toggle cohérent avec la syntaxe Leads.

**Estimation** : 45 min.

---

### #3 — Pas de **Portfolio conseiller** cross-objets

**Constat** : le widget "Répartition équipe" montre des KPI par conseiller mais aucun moyen de cliquer pour aller sur SA page — ses leads actifs, ses biens en mandat, ses visites de la semaine, ses offres en négo, son temps de réponse moyen.

**Impact** : l'unité fondamentale d'une agence immo est le portefeuille du conseiller. Elle n'existe nulle part. Un directeur qui veut comprendre la productivité d'un de ses collaborateurs n'a aucun moyen.

**Correctif** : page `/admin/equipe/[slug]` avec onglets (Leads · Biens · Visites · Offres · Performance).

**Estimation** : 1-2 heures.

---

## Problèmes structurels — bloquent le scale

### #4 — Fiche bien **sans timeline d'activité**

**Constat** : la fiche `/admin/biens/[slug]` montre l'état actuel mais aucun historique. Quand le prix a baissé 3 fois, quand le statut a bougé, quand le bien a été réassigné — invisible. Aucune trace d'audit.

**Impact** : perte de mémoire institutionnelle. Risque de non-conformité (Legal demande "quand a été publié ce bien ?" → on ne peut pas répondre). Un nouvel advisor qui reprend un dossier ne sait rien de l'historique commercial.

**Correctif** : étendre `lead_events` en `activity_log` polymorphe OU créer `property_events`.

---

### #5 — Info **propriétaire / mandat** absente de la fiche bien

**Constat** : qui est le propriétaire ? Téléphone ? Email ? Quelle durée du mandat ? Quelle commission ? Quelle date d'expiration ? **Rien.**

**Impact** : pain quotidien #1 du conseiller. Préparer une visite = appeler le propriétaire pour accès. Faire une offre = discuter avec lui. Sans ces infos sur la fiche bien, le conseiller ouvre son téléphone ou son Excel perso.

**Correctif** : table `owners` + `mandates` séparées, liées à `properties`. Bloc "Propriétaire & mandat" sur la fiche bien.

---

### #6 — Fiche lead = **5000px de haut, NBA isolé des actions**

**Constat** : la page dump tout — profil, bien, parcours, advisor, offre, visite, timeline. Le NBA ("Appeler Hans — 2e follow-up") est en haut, mais le bouton Appeler est dans un autre bloc 2000px plus bas.

**Impact** : la recommandation n'est pas **actionnable là où elle apparaît**. Le conseiller qui veut exécuter doit scroller pour trouver le bouton correspondant. Friction énorme.

**Correctif** : panel flottant (sticky à gauche ou en bas) avec NBA + action button + 3 raccourcis (appeler, WhatsApp, noter). L'action suit la suggestion visuellement.

---

### #7 — **Pas de bulk actions**

**Constat** : programme neuf = 24 lots à publier d'un coup. Pipeline 5 leads devenus obsolètes à passer en `lost`. Aujourd'hui : 24/5 navigations séparées.

**Impact** : tâches de masse impossibles. Un directeur qui a 200 biens ne peut rien opérer à l'échelle.

**Correctif** :
- Checkbox par row dans les tables
- Barre d'actions qui apparaît au-dessus quand ≥1 sélection
- Actions : change status, publish/unpublish, assign, export

---

### #8 — **Objets métier plats** : `mandates` et `opportunities` inexistants

**Constat** : le schéma actuel entasse tout dans `leads` + `properties`. À l'échelle :
- Un **mandat** a durée, exclusivité, commission, auto-renewal, expiry alert — pas juste "un bien publié"
- Une **opportunity** (contact × projet) peut avoir 3 visites, 2 offres, 10 emails — chacun queryable séparément
- Un **contact** peut avoir 3 opportunities successives sur 5 ans — aujourd'hui on perd cet historique

**Impact** : dette de modèle. Chaque feature future (matching, portail acheteur, analytics) sera compliquée par ce schéma plat.

**Correctif** : refactor Phase D (1-2 semaines) :
```
contacts (personnes durables)
  └─ opportunities (projets éphémères)
       ├─ visits
       ├─ offers
       └─ communications (events)
mandates (contrats propriétaires)
  └─ properties
```

---

## Frictions UX — corrections immédiates possibles

| # | Point | Correctif | ETA |
|---|---|---|---|
| 9 | Tri non configurable dans les tables | Click header → sort asc/desc | 30 min |
| 10 | Dashboard surchargé | Réduire à 3 zones + "voir plus" | 1h |
| 11 | KPIs sans tendance (12 actifs vs sem. dernière ?) | Ajout sparkline ou delta | 1h |
| 12 | Recherche faible (titre/ref/slug) | Étendre à quartier/ville/description | 15 min |
| 13 | Pas d'état vide "design" | CTA proposé : créer, ajuster, contact | 30 min |
| 14 | `LeadsFilterBar` + `BiensFilterBar` dupliqués | `<AdminFilterBar>` générique | 1h |
| 15 | Modales inconsistantes | Composant `AdminModal` unifié | 1h |
| 16 | Pas de toast global | `<Toaster>` racine (Sonner) | 30 min |
| 17 | Fiche lead timeline sans filtre | Toggle emails / calls / notes | 30 min |
| 18 | Matching toujours fake | Kill ou brancher réel | variable |

**Total** : ~6 heures pour effacer le "cheap"-feel perçu.

---

## Dettes techniques

| Dette | Risque | Correctif | Urgence |
|---|---|---|---|
| 2 colonnes `role` + `access_role` sur advisors | Confusion future | Rename `role` → `title`, `access_role` → `role` | Medium |
| `leads.status` text sans CHECK DB | Données corrompues possibles | `ALTER TABLE ADD CHECK (status IN (...))` | High |
| Pas d'index sur `lead_events (type, created_at)` | Queries lentes à l'échelle | `CREATE INDEX` composite | High |
| RLS subquery `auth.email() in (select...)` | Inefficace, auth à chaque row | Fonction SECURITY DEFINER | Medium |
| Service-role client partout | RLS invisible, surface d'attaque | Session-aware + policies propres | High |
| Pas de `agency_id` FK | Multi-tenant = migration douloureuse | Ajouter nullable maintenant | Medium |
| Pas de soft delete sur biens | FK orphelines | `deleted_at timestamptz` | Medium |
| Zéro tests | Régression silencieuse | Tests mutations critiques | High |
| Pas d'error boundaries | Page crash si Supabase down | `<ErrorBoundary>` root admin | Medium |
| N+1 queries non-optimisées | Latence dashboard | `Promise.all` + views DB | Medium |
| `revalidatePath` trop larges | Sur-revalidation | Scoping plus précis | Low |

---

## Business logic manquant

| Manque | Impact | Taille |
|---|---|---|
| **Gestion des commissions** | Qui touche combien quand. Split apporteur/vendeur invisible. | Feature majeure |
| **Cycle de mandat** | Durée, expiration, alertes, renouvellement. Rien. | Feature majeure |
| **Gestion des documents** | Compromis, actes, CNI, titres fonciers. Aucune UX. | Feature majeure |
| **Notifications équipe** | Changement de statut invisible aux autres | Feature medium |
| **Export / extraction** | CSV de contacts / biens / leads impossible | Feature small |
| **Import bulk** | Onboarding nouveau client = 200 biens Excel. Impossible. | Feature medium |
| **SLA personnalisables** | Pas d'éditeur règles SLA, hardcodé dans le code | Feature small |
| **Email templates éditables** | Table existe, UI d'édition absente | Feature small |

---

## Design system — inconsistencies

- **Boutons** : 4 styles coexistent (`btn-primary`, `btn-gold`, inline Tailwind, bordered). Pas de système hiérarchique (primary / secondary / ghost / destructive).
- **Modales** : `StatusChanger` (lead) et `StatusChanger` (bien) ne partagent pas la même structure ni les mêmes marges.
- **Pills** : hauteurs légèrement différentes selon `LeadsFilterBar` vs `BiensFilterBar`.
- **Couleurs sémantiques** : `--color-success`, `--color-warning`, `--color-alert` définies mais pas appliquées uniformément (certaines status utilisent `--color-terracotta` à la place).
- **Ombres** : `--shadow-card` vs `--shadow-luxe` utilisées sans règle claire.
- **Typography** : tailles de texte arbitraires dans les admin pages (text-[10px], text-[11px], text-[9px]) — il faudrait définir une échelle sémantique (micro, caption, body, etc.).
- **Spacing** : `px-5 py-4 md:px-8` partout à la main — pas de token de padding pour pages admin.

---

## Mobile / responsive

- **Admin non testé mobile** — les tables cassent sous 1024px (colonnes compressées)
- **FilterBar wrap mal** — les pills s'empilent désordonnément
- **Modales débordent** sur < 400px
- **Sidebar/topbar** nav admin ne prévoit pas de menu hamburger complet
- **PropertyAdminActions** : les inputs ne scalent pas sur iPhone

---

## Accessibility

- `focus:outline-none` partout → **navigation clavier cassée** (pas de focus ring visible)
- Icon-only buttons sans `aria-label` pour beaucoup (chevrons, stars, stricts)
- Contrastes `text-[var(--color-stone-soft)]` limite WCAG AA sur backgrounds cream
- Modales sans `role="dialog"` ni trap focus
- Pas de `<main>`, `<nav>`, `<aside>` sémantiques dans les admin pages
- Images sans alt descriptifs (surtout dans les grids de biens)

---

## Roadmap de remédiation prioritaire

### Sprint ASAP — 1 semaine (avant toute démo sérieuse)

1. **Vue grille cards `/admin/biens`** (45 min)
2. **Segmentation vente/location `/admin/leads`** (30 min)
3. **Fiche bien : timeline + bloc propriétaire/mandat** (2h, même minimal)
4. **Fiche lead : NBA sticky avec action button inline** (1h)
5. **Portfolio conseiller `/admin/equipe/[slug]`** (2h)

**Total estimé** : ~6-7 heures.

### Sprint court — 2 semaines

6. **Bulk actions** (tables + checkboxes + barre d'actions) (3h)
7. **Tri configurable** sur toutes les tables (1h)
8. **AdminFilterBar générique** (1h)
9. **AdminModal générique** (1h)
10. **Toast system global** (Sonner) (30 min)
11. **Matching réel OU retrait fake** (variable)
12. **Gestion documents minimale** (Supabase Storage + attachment) (4h)

**Total estimé** : ~10-12 heures.

### Sprint structurel — 2-3 semaines

13. **Refactor schéma** : `contacts` + `opportunities` + `mandates` + `visits` + `offers` (1 sem)
14. **Ajout `agency_id`** nullable sur toutes les tables (1 j)
15. **Soft delete** partout (1 j)
16. **Migration des leads/properties existants** vers nouveau schéma (2-3 j)
17. **Tests de base** des mutations critiques (2-3 j)
18. **Mobile responsive** admin (3-4 j)
19. **Accessibility** refonte focus / aria / sémantique (2 j)

**Total estimé** : 2-3 semaines concentrées.

---

## Verdict final

Le projet est :
- **À 90% d'une démo qui fait signer** (avec polish rapide)
- **À 40% d'un outil d'exploitation quotidien que je vendrais sans rougir** à un directeur qui l'utilisera 200 jours par an

**La question critique** : *"Je vends MR comme vitrine (peu importe les failles découvertes dans 6 mois) ou comme produit d'exploitation (auquel cas il faut combler avant)?"*

Si vitrine → sprint ASAP suffit, tu signes, tu factures, tu vis bien 3 mois.
Si exploitation → les 3 sprints sont non-négociables, AVANT de livrer.

---

## Annexe — process d'audit

**Scope audité** :
- `/admin/*` — dashboard, leads, biens, layout, composants
- `src/lib/*` — auth, db, leads, actions, email
- `supabase/migrations/*` — schema, RLS, indexes
- Data seedé : 5 advisors, 50 leads, 130 events, 212 biens

**Non audité** (volontaire) :
- Site public (audit séparé recommandé)
- Pipeline de scraping
- Intégrations externes (pas encore branchées)
- Tests de charge / stress / sécurité offensive

**Méthode** :
- Review code par couche (data → logic → UI)
- Test manuel des flows critiques
- Analyse des inconsistencies de pattern
- Cross-check avec standards métier (Sotheby's, Knight Frank, Attio, Linear)

---

*Document généré le 2026-04-18. À archiver. À relire avant chaque grosse release.*
