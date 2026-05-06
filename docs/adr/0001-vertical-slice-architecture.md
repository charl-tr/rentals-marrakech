# ADR-0001 — Vertical Slice Architecture

- **Date** : 2026-04-17
- **Statut** : Accepted
- **Décideur(s)** : Charles + Claude

## Contexte

Le projet démarre en greenfield. À chaque feature (ajout d'un type de bien, d'un statut de lead, d'un mandat, d'un portail token-gated), il faut décider comment on découpe le travail.

Deux écoles classiques :
- **Horizontal layering** : on construit la couche DB pour tous les modèles, puis la couche services pour tous les modèles, puis l'UI pour tous les modèles. Optimise la cohérence d'une couche.
- **Vertical slicing** : on construit chaque feature de bout en bout (DB → service → UI → admin) avant de passer à la suivante. Optimise le temps de feedback et la valeur livrée par étape.

Le projet est solo + IA, avec un objectif de démo-rapidité (chaque sprint doit produire quelque chose de cliquable).

## Options envisagées

- **Horizontal layering** — propre côté archi mais commits intermédiaires inutilisables, démo impossible avant la dernière couche, friction pour l'IA qui ne sait pas quoi tester.
- **Vertical slicing** — chaque sprint produit une slice complète et démontable. Parfait pour itérer en solo+IA, mais impose une discipline forte de "rien de partiel ne merge".
- **Mixte ad-hoc** — laisser le contexte décider. Risque : drift vers le pire des deux mondes.

## Décision

> On adopte le **vertical slicing strict**. Chaque feature ship dans l'ordre : migration DB → helper DB → server action si mutation → page → composant client si interactivité → hook-in admin → seed data.

Une slice n'est terminée que lorsqu'elle est **testable end-to-end depuis l'UI**.

## Conséquences

### Positives
- Chaque PR mergée est démontrable immédiatement.
- L'IA peut vérifier le résultat dans le navigateur (rapide loop d'itération).
- Pas d'accumulation de "code zombie" en attente d'être branché.
- Onboarding facile : un nouveau dev voit une feature complète, pas un layer hors-contexte.

### Négatives / coûts assumés
- Le code peut être moins DRY au début (helper non extraits jusqu'à ce que 2-3 features les justifient).
- Un refactor transverse (ex: changer la signature de tous les `defineMutation`) coûte plus cher car on touche plusieurs slices au lieu d'une couche.
- Discipline requise : interdiction de commit une migration sans le code qui l'utilise. Un slice incomplet ne merge pas.

### Conditions de remise en cause
- Si on passe à >3 développeurs simultanés sur des features distinctes, le coût de coordination "qui touche quel layer" peut justifier de revisiter.
- Si on monte une équipe back / front spécialisée, le slicing horizontal peut redevenir préférable.

## Références

- `CLAUDE.md` — la règle est codée comme instruction permanente pour les agents IA.
- `src/lib/actions/` + `src/lib/db.ts` — pattern `defineMutation` qui supporte la slice.
- Articles : Jimmy Bogard "Vertical Slice Architecture" (concept origin).
