# Architecture Decision Records

Une décision archi/produit non-triviale et durable = un ADR.

**Critère** : "Si je dois re-prendre cette même décision dans 6 mois, est-ce que j'aurai besoin de comprendre pourquoi on a choisi ça ?". Oui → ADR.

## Comment créer un ADR

1. Copier `0000-template.md` vers `NNNN-slug.md` (numéro suivant disponible).
2. Remplir les 5 sections (contexte, options, décision, conséquences, statut).
3. Ouvrir une PR. Une fois mergée, l'ADR passe `Status: Accepted`.
4. Référencer l'ADR depuis `ROADMAP.md` ou `CLAUDE.md` si pertinent.

## Règles d'immutabilité

- Un ADR **ne se modifie pas** après merge. Si une décision change, on crée un nouvel ADR avec `Status: Accepted` et l'ancien passe en `Status: Superseded by NNNN`.
- Les seules modifications autorisées sur un ADR mergé : correction typo / lien cassé.

## Index

| # | Titre | Statut |
|---|---|---|
| [0001](./0001-vertical-slice-architecture.md) | Vertical Slice Architecture | Accepted |
| [0002](./0002-saas-multi-tenant-pivot.md) | Pivot SaaS multi-tenant | Accepted |
