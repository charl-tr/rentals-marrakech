# Second audit — Post-Sprint ASAP · 18 avril 2026

**Scope** : audit plus profond, focus patterns / architecture / scalabilité / sécurité réelle. Évaluation de ce qui vient d'être livré dans Sprint ASAP + dette non couverte par le 1er audit.

**Baseline** : post-Sprint ASAP (3/5 items livrés — vue cards biens, segmentation vente/location, NBA actionnable). Items #4 fiche bien timeline + propriétaire et #5 portfolio conseiller **restent ouverts**.

---

## Résumé exécutif — ce que l'audit 1 a manqué

Le premier audit était structurel et fonctionnel. Ce second va plus profond : **qualité du code, patterns répétitifs, robustesse aux cas réels, sécurité effective, scalabilité dès 10×.**

Verdict additionnel : **l'architecture du code a vieilli plus vite que l'UX**. On a du JSX soigné par-dessus des fondations qui vont gratter. Les patterns se dupliquent à haute vitesse — on a maintenant 3 FilterBars, 4 StatusChangers, 2 approches auth, 2 types `role` vs `access_role`. Sans refactor, chaque feature future amplifie la dette.

### Scorecard approfondie

| Domaine | Score | Note |
|---|---|---|
| Code quality (DRY, SOLID) | **4/10** | Duplication massive, abstractions manquantes |
| Patterns cohérence | **3/10** | 3 FilterBars, 2 StatusChangers, 2 roles |
| Data integrity | **5/10** | FK OK, mais pas transactional, pas de concurrency control |
| Sécurité effective | **5/10** | Auth OK, RLS gruyère, service-role trop permissif |
| Scalabilité 10× | **4/10** | N+1 omniprésent, pas d'index, pas de cache |
| Déploiement ready | **2/10** | Pas d'env strict, pas d'error monitoring, pas de CI |
| Observabilité | **1/10** | Aucun logging structuré, aucune métrique |

**Score profond** : **3.4 / 10**

---

## Findings — ce qui n'allait pas et que l'audit 1 avait raté

### #A1 — Duplication massive des FilterBars

**Constat** : on a maintenant **3 FilterBars** quasi-identiques :
- `LeadsFilterBar` (pills statut/advisor/SLA, search, view toggle, scope toggle, intent tabs)
- `BiensFilterBar` (pills statut/type/zone/vis, search, view toggle)
- (potentiel) `EquipeFilterBar` quand on fera le portfolio conseiller

**Duplication** :
- Structure HTML (`<div className="flex flex-col gap-4 border-b...">`)
- Pill dropdown component (structural copy dans les 2)
- URL setParam logic (100% identique)
- Search debounce logic
- Reset button logic

**Ce qui devrait exister** :
```
<AdminFilterBar>
  <FilterBarSearch placeholder="..." />
  <FilterBarToggle options={[...]} />
  <FilterBarPill filter="status" options={...} />
  <FilterBarReset />
</AdminFilterBar>
```

Composable, réutilisable, un seul endroit à maintenir. **Dette 2-3h** à corriger.

---

### #A2 — 2 StatusChangers qui ne partagent rien

- `StatusChanger` (fiche lead) — modal 8 options avec note optionnelle
- `StatusCard` (fiche bien, inclus dans `PropertyAdminActions`) — modal 5 options, pas de note

Les deux font la même chose : "ouvre une modal avec des boutons, chacun submit une form server action". Rien ne partage de structure.

**Ce qui devrait exister** : `<StatusPicker>` générique qui prend `options[]` + `action` et rend la modal.

---

### #A3 — Les mutations admin sont du copy-paste structurel

Regarde côte à côte :
- `updateLeadStatus` (leads-admin.ts)
- `addNote` (leads-admin.ts)
- `assignLead` (leads-admin.ts)
- `logInteraction` (leads-admin.ts)
- `togglePublished` (properties-admin.ts)
- `toggleFeatured` (properties-admin.ts)
- `updatePropertyStatus` (properties-admin.ts)
- `updatePropertyPrice` (properties-admin.ts)

Chacune fait : `requireAdminSession → parse formData → guard ownership → update supabase → revalidatePath`. **8× le même squelette, à chaque fois ré-écrit à la main.**

**Ce qui devrait exister** :
```ts
export const updateLeadStatus = defineMutation({
  name: "updateLeadStatus",
  schema: z.object({ leadId: z.string(), status: LeadStatusSchema }),
  guard: leadOwnershipGuard,
  handler: async ({ input, session }) => { /* 5 lignes */ },
  revalidate: (input) => [`/admin/leads`, `/admin/leads/${input.leadId}`],
});
```

Un wrapper utilitaire `defineMutation` factoriserait tout. Dette invisible mais qui va se multiplier.

---

### #A4 — Le `revalidatePath` explose en radius d'effet

Exemples problématiques :
- `togglePublished` revalide `/`, `/admin`, `/admin/biens`, `/admin/biens/[slug]`, `/acheter/[slug]`, `/louer/[slug]` — **6 paths par mutation**
- `updateLeadStatus` revalide 3 paths mais un advisor qui change le statut d'un lead invalide TOUT l'admin pour TOUS les conseillers

**Problème** :
- Cache miss sur toutes les pages admin pour tous les users après chaque mutation
- Coût SSR augmente linéairement avec le trafic
- À l'échelle : 50 conseillers × 20 mutations/j = 1000 invalidations/j sur des pages communes

**Correctif** : revalidation granulaire (revalidateTag), tags par entité (`lead:${id}`), pas revalidation "blast radius".

---

### #A5 — Service-role client utilisé là où il ne devrait pas l'être

**Pratique actuelle** : toutes les queries admin passent par `supabaseAdmin` (service-role key, bypass RLS).

**Problème** :
- Une seule variable d'env qui compromettrait tout le système si elle fuit
- Zéro RLS vérifiée en prod → aucune défense en profondeur
- Si demain un dev ajoute une API route qui expose `supabaseAdmin` client-side accidentellement → tout est lu
- Les policies RLS qu'on a posées (`authenticated admins can read/update`) ne sont **jamais exécutées**

**Correctif** :
- Reads admin via `createSupabaseServerClient()` (session cookie → RLS s'applique)
- `supabaseAdmin` réservé à : auth whitelist check, seeds, edge functions cron, mutations qui nécessitent genuinement bypass
- Ajouter des tests de policy RLS

---

### #A6 — N+1 queries invisibles

**Exemples concrets** :

`/admin/leads/[id]` :
```
getLeadById(id)
  → supabase.from("leads").select ... (1 query)
  → getAdvisor(lead.advisorSlug) (2)
  → supabase.from("lead_events").select ... (3)
then in page:
  → getAdvisor(lead.advisorSlug) AGAIN (4)
  → getPropertyBySlug(lead.sourcePropertySlug) (5)
  → Promise.all(viewed.map(getPropertyBySlug)) (N queries si N viewed)
```

Chaque visite de fiche = 5-15 queries. À 50 users concurrents → 250-750 queries sur Supabase.

**Correctifs** :
- JOIN côté DB (`select *, advisor:advisors(*), events:lead_events(*), property:properties(*)`)
- Cache React Query ou équivalent
- Limiter `propertiesViewed` à N=5 max

---

### #A7 — Pas de transactions DB

Les opérations multi-table ne sont pas atomiques :

```ts
// updateLeadStatus actuel :
await update("leads").update({ status }) ...
await insert("lead_events") ...
```

Si le 1er succès et le 2e plante → statut changé sans event de tracking. Dangereux.

**Correctif** : Supabase RPC (fonction Postgres) qui fait les 2 dans une transaction. Ou au pire, try/catch + rollback applicatif.

---

### #A8 — Concurrency non gérée

Scénario : directeur et conseiller ouvrent le même lead en même temps, tous deux changent le statut. Dernier gagne, pas de warning.

**Correctif** :
- Ajouter `updated_at` en colonne + check optimiste (`WHERE updated_at = $last_seen`)
- Ou : Supabase Realtime pour signaler les changements concurrents

Aujourd'hui : zéro mécanisme.

---

### #A9 — Aucun logging structuré

**Constat** : nos server actions utilisent `console.error("[submitLead] insert error:", error)`. C'est tout. Aucun système de logs centralisé, aucune stack trace, aucune correlation entre requête et erreur.

**À l'échelle** :
- Client appelle, erreur silencieuse, on ne sait pas pourquoi
- Debugging en prod = grep dans Next logs
- Pas de tableau de bord d'erreurs (Sentry, LogRocket, etc.)

**Correctif immédiat** : wrapper logger + Sentry ou Axiom.

---

### #A10 — Pas d'error boundaries React

**Constat** : si `getLeadById` throw (Supabase down, réseau perdu), la page /admin/leads/[id] crash en plein écran avec une stack trace Next.

**Correctif** : `error.tsx` à la racine de `/admin/` + un pour chaque route segment critique.

---

### #A11 — Pas de validation runtime sur les outputs DB

**Constat** : on fait confiance à la forme des rows DB (`row.status as LeadStatus`). Si un dev fait un UPDATE manuel avec un statut invalide, le type TS ment et l'UI crash.

**Correctif** : Zod schemas sur les rowTo* — validation au boundary.

---

### #A12 — Aucun test unitaire

**Constat** : **0 fichier `*.test.ts`**. Aucun CI. Aucun coverage.

Risques concrets :
- Un refactor de `computeNextAction` casse silencieusement la logique de priorité
- Une migration DB qui rename une colonne → toutes les pages admin crashent en prod
- Un changement de RLS → les conseillers perdent accès à leurs leads

**Minimum vital à ajouter** :
- Tests unitaires pour `computeNextAction` (rules engine)
- Tests des server actions (happy path + guards)
- Un smoke test E2E : /contact → DB insert → email mock

---

### #A13 — Pas de monitoring production

**Constat** :
- Aucune métrique (latence, throughput, error rate)
- Aucun healthcheck (`/health`, `/ready`)
- Aucun uptime monitoring externe
- Aucun alerte si Supabase tombe

**Correctif** : Vercel Analytics + Sentry + UptimeRobot. Minimum de décence.

---

### #A14 — Bundle size non audité

**Constat** : jamais regardé. On a installé Zod, Resend, @supabase/ssr — chacun pèse. Les Client Components (LeadsTable, FilterBar, NextActionCard, etc.) sont envoyés au browser.

**À vérifier** :
```sh
npm run build && npm run analyze  # Next bundle analyzer
```

Objectif : first load JS <120 kB gzipped sur /admin.

---

### #A15 — Secrets mal gérés

**Constat** :
- `.env.local` gitignored ✓
- Mais : aucun template `.env.example`
- Aucun check que les env vars sont là au démarrage
- `RESEND_API_KEY` lu silencieusement — si absent, mock sans warning prod

**Correctif** :
- `.env.example` avec tous les noms attendus
- Validation Zod au boot (`z.object({...}).parse(process.env)`)

---

### #A16 — Pas de versioning API / breaking changes

**Constat** : les server actions sont appelées par le browser via un endpoint Next. Si on change la shape d'un retour, l'ancien JS client (cache) appelle et crash.

**Correctif** : stratégie de backward-compat, ou deploy all-or-nothing avec revalidation forcée.

---

### #A17 — Pas d'internationalisation

**Constat** : tout en français hardcodé dans le JSX. Pour vendre à des agences internationales, il faut FR/EN/AR au minimum.

**Correctif** : `next-intl` ou équivalent. ~8h à refactorer tout le copy.

---

## Problèmes spécifiques dans ce qu'on vient de livrer (Sprint ASAP)

### Sprint #1 — Grille cards biens

- **Bien** : grille visuelle, hover animation, status overlay, featured star
- **Pas bien** : la grille n'a pas d'actions rapides (hover → publish/feature toggle). Il faut cliquer pour entrer dans la fiche
- **Pas bien** : pas de tri (alphabetical? price? newest? leads count?)
- **Pas bien** : pas de pagination — 212 biens en grille = beaucoup de DOM
- **Manqué** : drag-drop pour reorder (featured manual)

### Sprint #2 — Segmentation vente/location

- **Bien** : tabs visuellement claires, URL bookmarkable, counts par onglet
- **Pas bien** : le count "vendre" inclut aussi les "autre" qui n'est pas covered, car les leads seedés ne matchent pas toujours `intent="vendre"` exactement
- **Pas bien** : pas d'adapter le SLA/NBA selon intent. Un prospect "vendeur" n'a pas les mêmes règles qu'un acheteur — aujourd'hui on applique les mêmes
- **Manqué** : un vendeur a des fields différents (estimation, pourcentage frais souhaités, etc.) — même fiche utilisée

### Sprint #3 — NBA actionnable

- **Bien** : CTA primaire 1-clic qui mute le statut, intégration propre avec les mutations existantes
- **Pas bien** : `log_call` ne déclenche PAS un appel — il logue juste qu'on a appelé. Un vrai CTI téléphonerait. Le label "Logger l'appel" est honnête mais pas magique
- **Pas bien** : pas de raccourci clavier (l'audit initial a pointé, pas fait)
- **Pas bien** : si le statut est déjà celui suggéré (rare), le button est là quand même
- **Manqué** : "Undo" après une mutation — si le conseiller clique par erreur, pas de retour arrière

---

## Ce qui manque encore du Sprint ASAP (items 4, 5)

- **#4 Fiche bien : timeline + bloc propriétaire/mandat** — pas fait ce turn. Nécessite un nouveau modèle data (table `owners` ou colonnes sur `properties` + table `mandates`). Estimation **2-3h**.
- **#5 Portfolio conseiller `/admin/equipe/[slug]`** — pas fait. Nécessite nouvelle page + composant multi-onglets + queries spécifiques. Estimation **2h**.

Ces 2 items sont des livrables non encore acquittés du Sprint ASAP officiel.

---

## Nouveau top 10 priorities — actionable

### 🔴 Sécurité critique (à faire en premier)

1. **Remplacer supabaseAdmin par session client** dans tous les reads admin. Ajouter des vraies RLS policies. ~4h.
2. **Ajout `.env.example` + validation Zod des env vars au boot**. ~30 min.
3. **Error boundaries sur /admin**. ~1h.

### 🟠 Dette architecture (avant prochain sprint)

4. **Factoriser `defineMutation`** helper — élimine 70% du boilerplate des actions. ~2h.
5. **`<AdminFilterBar>` + `<StatusPicker>` génériques**. ~3h.
6. **Revalidation ciblée (tags)** au lieu de blast radius. ~2h.

### 🟡 Qualité / scale

7. **Supabase RPC pour mutations atomiques** (changer statut + logger event en 1 transaction). ~2h.
8. **Sentry + structured logging**. ~2h.
9. **Tests NBA engine + mutations critiques**. ~4h.
10. **Finir Sprint ASAP #4 et #5** (timeline bien + portfolio conseiller). ~5h.

---

## Verdict de ce second audit

La plateforme **fonctionne bien à 50 users / 50 leads / 200 biens**. Elle commencera à souffrir vers 200 users / 500 leads / 2000 biens si on ne règle pas :
- Les N+1 queries
- La revalidation trop large
- L'absence de cache

Elle commencera à **poser des problèmes de sécurité** dès que des data sensibles y entrent (noms de clients réels, données financières, docs légaux) tant que le service-role est partout.

Elle aura des **incidents silencieux** dès la mise en prod si on ne branche pas Sentry + error boundaries + validation env.

**Ce qui est bien** : la fondation UX, le NBA engine, les flows happy path. Ce qui est mauvais : la plomberie invisible qui devient critique dès que le produit devient réel.

**La vraie question** : es-tu prêt à investir 15-20h de dette tech avant de livrer à MR en prod, ou tu livres "comme c'est" et tu attends les bugs pour itérer ?

---

## Checklist "prêt pour MR en prod"

Avant livraison / mise en prod chez le client :

- [ ] Sentry + error monitoring branché
- [ ] `.env.example` + validation boot
- [ ] Error boundaries sur admin + public
- [ ] Service-role cantonné aux writes + auth check
- [ ] Tests unitaires NBA + mutations
- [ ] Healthcheck endpoint
- [ ] Backup automatique Supabase
- [ ] Politique RGPD / data retention
- [ ] Protection OTP brute-force sur magic-link
- [ ] Limites SLA RLS check
- [ ] Documentation "opérationnel" pour l'agence (qui contacter en cas de pépin)

**Aucune de ces cases n'est cochée aujourd'hui.**
