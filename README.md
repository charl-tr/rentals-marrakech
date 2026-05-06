# rentals-marrakech

CRM + site public pour agences immobilières luxe. Pilote : Marrakech Realty. Vision : SaaS multi-tenant.

**Stack** : Next.js 16 (Turbopack) · React 19 · Tailwind v4 · Supabase · Resend · Sentry · Leaflet · TypeScript.

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le template d'env et remplir les valeurs
cp .env.example .env.local

# 3. Lancer le serveur de dev
npm run dev
```

Le site tourne sur [http://localhost:3000](http://localhost:3000).

Variables d'env nécessaires : voir [`.env.example`](./.env.example).

---

## Documentation — où trouver quoi

Le projet suit une discipline de doc explicite. Chaque fichier a **un seul rôle** :

| Fichier | Rôle |
|---|---|
| [`README.md`](./README.md) | Front door — ce que tu lis là |
| [`ROADMAP.md`](./ROADMAP.md) | État actuel + sprints + phases long-terme |
| [`CHANGELOG.md`](./CHANGELOG.md) | Historique de ce qui a été shippé |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Workflow : branches, commits, PRs, tests |
| [`CLAUDE.md`](./CLAUDE.md) | Règles d'archi (lues par les agents IA et les humains) |
| [`docs/adr/`](./docs/adr/) | Architecture Decision Records — une décision majeure = un fichier |
| [`docs/runbooks/`](./docs/runbooks/) | Procédures ops (deploy, rollback, incidents) |
| [`docs/audit-*.md`](./docs/) | Audits ponctuels du produit |
| [`pitch/`](./pitch/) | Assets commerciaux (proposal, outreach, case study) |
| [`supabase/migrations/`](./supabase/migrations/) | Historique du schéma DB (numéroté, idempotent) |
| [`.env.example`](./.env.example) | Contrat des variables d'env |

**Si tu cherches** :
- *où on en est aujourd'hui* → [`ROADMAP.md`](./ROADMAP.md)
- *pourquoi telle décision a été prise* → [`docs/adr/`](./docs/adr/)
- *comment je contribue / merge une PR* → [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- *comment l'archi marche* → [`CLAUDE.md`](./CLAUDE.md)
- *que faire si Supabase est en pause* → [`docs/runbooks/supabase-paused.md`](./docs/runbooks/supabase-paused.md)

---

## Commandes utiles

```bash
npm run dev                              # serveur dev (:3000)
npm run build                            # build prod (test local de Vercel)
npm run lint                             # ESLint
npx tsc --noEmit                         # typecheck

npx tsx scripts/seed-supabase.ts         # seed biens/advisors/articles
npx tsx scripts/seed-leads.ts            # seed 50 leads démo
```

---

## Déploiement

Vercel **redéploie automatiquement** à chaque push :
- `main` → production (`https://rentals-marrakech.vercel.app`)
- toute autre branche dans une PR → preview URL dédiée

Voir [`docs/runbooks/deploy.md`](./docs/runbooks/deploy.md) pour les procédures détaillées (rollback, hotfix, etc.).
