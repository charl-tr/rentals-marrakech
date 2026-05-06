# Contributing

Le projet est solo (Charles) + assistance IA (Claude). Ce doc fixe les conventions pour que la collaboration reste lisible dans le temps.

---

## Workflow Git

### Branches

Plus jamais de commit direct sur `main`. Toujours :

```
feature/<slug>    # nouvelle fonctionnalité
fix/<slug>        # correction de bug
chore/<slug>      # refacto, deps, infra
docs/<slug>       # doc seule
```

Slug en kebab-case, court et descriptif.

Exemples :
- `feature/portail-acheteur`
- `fix/cluster-badge-safari`
- `chore/docs-foundation`
- `docs/adr-0003-mirror-philosophy`

### Commits — Conventional Commits

Format : `<type>(<scope>): <short description>`

Types : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`.

Exemples :

```
feat(crm): add lead matching score widget
fix(map): cluster badge alignment on Safari
docs(adr): add ADR-0003 mirror philosophy
chore(deps): bump next to 16.2.5
```

Un commit = une intention atomique. Pas de "WIP" ou de "fixes" vagues.

### Pull Requests

Toute PR vers `main` :

1. Créée depuis une branche feature/fix/chore/docs.
2. Suit le template (`.github/PULL_REQUEST_TEMPLATE.md`).
3. Passe la CI (lint + typecheck).
4. Passe la preview Vercel (si UI changée, on visite la preview URL).
5. Mise à jour du `CHANGELOG.md` sous `## [Unreleased]`.

PR title = même format qu'un commit conventional.

---

## Doc obligations à chaque PR

| Si tu... | Alors... |
|---|---|
| Ajoutes/changes une env var | Update `.env.example` |
| Prends une décision archi non-triviale | Crée un ADR dans `docs/adr/` |
| Apprends une procédure ops (ex: incident, rollback) | Crée/update un runbook dans `docs/runbooks/` |
| Termines un sprint ou un bloc de roadmap | Update `ROADMAP.md` |
| Mergeras la PR | Ajoute une entrée sous `## [Unreleased]` dans `CHANGELOG.md` |

C'est non négociable, même pour une "petite" PR. C'est le prix à payer pour que la doc reste un asset.

---

## ADR — Architecture Decision Records

Une décision archi/produit non-triviale et durable mérite un ADR.

**Critère** : "Si je dois re-prendre cette même décision dans 6 mois, est-ce que j'aurai besoin de comprendre pourquoi on a choisi ça ?". Oui → ADR.

**Pas un ADR** : un choix de nommage de variable, l'ajout d'un champ DB, une refacto locale.

**Format** : copier `docs/adr/0000-template.md` → `docs/adr/NNNN-slug.md` (numéro suivant). 5 sections fixes (contexte, options, décision, conséquences, statut).

Un ADR ne se modifie pas — si une décision est révisée, on crée un nouvel ADR avec status `Accepted` et l'ancien passe en `Superseded by NNNN`.

---

## Runbooks

Procédure courte et exécutable pour un cas ops récurrent.

Exemples :
- `docs/runbooks/supabase-paused.md` — réveiller un projet free tier
- `docs/runbooks/deploy.md` — push vers prod / rollback
- `docs/runbooks/incident-prod-down.md` — checklist quand le site est KO

Format : objectif en 1 ligne → étapes numérotées → comment vérifier que c'est résolu.

---

## CHANGELOG

Format [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Sections autorisées sous `## [Unreleased]` : `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

Une entrée = une ligne factuelle, dans la voix passive ou l'infinitif. Pas de "j'ai", "on a".

Bon : `Added Vercel deploy pipeline with auto preview URLs.`
Mauvais : `J'ai ajouté Vercel.`

---

## Tests / qualité

À chaque PR, la CI exécute :

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript strict
```

**Pas de tests unitaires obligatoires** pour l'instant (le projet en est à l'étape produit, pas à l'étape stabilisation). Mais quand un bug fix arrive sur un endroit critique, on rajoute un test pour empêcher la régression.

---

## Sécurité — règles non négociables

- **Aucun secret** dans le code, dans une PR, dans un fichier traqué par git. Tout passe par variables d'env.
- `.env.local` est gitignoré. Vérifier `git status` avant chaque commit.
- Pas de console.log de tokens, mots de passe, ou clés en dev.
- Toute migration touchant aux RLS Supabase passe par une review attentive.

---

## Pour les agents IA (Claude, etc.)

Les règles d'archi et les obligations doc sont dans [`CLAUDE.md`](./CLAUDE.md). À lire en début de chaque session avec [`ROADMAP.md`](./ROADMAP.md).
