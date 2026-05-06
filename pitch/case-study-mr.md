# Case study — Marrakech Realty

*Transformation plateforme commerciale · 2026*

---

## Le client

**Marrakech Realty** — agence immobilière de luxe à Marrakech depuis 2000. Spécialisée en biens d'exception : riads restaurés de la médina, villas contemporaines de la Palmeraie, programmes golfiques, maisons d'hôtes à Essaouira.

- Équipe : 1 directeur-fondateur + 4 conseillers seniors (FR/EN/AR/PT/ES)
- Clientèle internationale (France, Belgique, Suisse, UK, Italie)
- Ticket moyen : 1.2 M€
- Portefeuille : 210+ biens actifs

## Le problème

Avant notre intervention :

1. **Site vieillissant** — template WordPress standard, pas de cohérence visuelle avec le niveau des biens. 0 différenciation vs concurrents low-mid. Le visiteur qui cherchait du Knight Frank trouvait du SeLoger.

2. **Fragmentation commerciale** — leads entrants via 4 canaux (formulaire site, email, WhatsApp, appels) sans consolidation. Zéro visibilité équipe. Zéro tracking. *"Qui a répondu à Claire ? Quand ? On ne le sait pas."*

3. **Opérationnel manuel** — les conseillers géraient leur portefeuille de tête + Excel + WhatsApp perso. Pas de relances automatisées. Pas de SLA. Des leads oubliés.

4. **Zéro vue directeur** — aucun tableau de bord global, impossible de mesurer temps de réponse, conversion, performance par conseiller.

## La vision

> *Votre conseiller ouvre son admin le matin. Il voit ses 3 leads urgents, ses 2 visites de la semaine, et à côté de chaque dossier, le système lui suggère l'action la plus pertinente à faire maintenant. Plus de saisie manuelle — ses emails et WhatsApp apparaissent déjà dans le CRM. Il passe 3 minutes par dossier, pas 15. Vous, directeur, vous avez la santé maison en 5 secondes.*

## Le livrable

### Site public refondu

- **Design système** aux codes des maisons de référence (Sotheby's, Knight Frank, Christie's) : typographies Playfair Display + Inter, palette terracotta/crème, zéro border-radius, hairlines subtiles
- **19 routes** structurées : home, acheter (taxonomies par type + quartier), louer, Essaouira (hub dédié), quartiers éditorialisés, équipe, savoir-acheter, journal, contact, dépôt de bien
- **Migration SEO complète** : 200+ slugs legacy préservés via 308 redirects. Zéro perte traffic organique.
- **Données réelles** : 212 biens scrapés via Wayback Machine et intégrés en base
- **Performance** : Core Web Vitals tous verts, images lazy-loadées, TTFB <100ms

### Plateforme opérationnelle (CRM)

- **Authentification magic-link** sans mot de passe — Supabase Auth + whitelist équipe
- **2 rôles** : Directeur (vue maison entière) et Conseiller (ses leads uniquement)
- **Permissions granulaires** : un conseiller ne voit pas les leads d'un autre ; le directeur peut toggler "Mes leads / Équipe entière"
- **Pipeline Kanban 8 statuts** : new → contacted → qualified → visit_scheduled → visit_done → offer → signed/lost
- **Mutations tracées** : chaque changement de statut, chaque note, chaque action loguée dans une timeline chronologique
- **Next-Best-Action engine** : le système suggère l'action prioritaire sur chaque dossier selon 10 règles (SLA, visites imminentes, offres en attente, dormance)
- **SLA watchdog** : calcul automatique urgent/standard selon budget et zone, flag rouge si dépassé
- **Widget répartition équipe** : le directeur voit en un coup d'œil combien de dossiers par conseiller, par statut, SLA rouges, etc.
- **Fiche lead immersive** : tout le contexte client en 1 page (profil, bien d'origine, parcours sur site, timeline complète, actions inline)

### Données & migration

- 212 biens migrés avec photos réelles
- 13 quartiers éditorialisés (6 complets, 7 minimaux)
- 5 conseillers avec spécialités géographiques/typologiques
- 50 leads de démonstration + 130 événements timeline pour projection réaliste

## Les chiffres

[À compléter après 30-60 jours d'usage en production.]

| Métrique | Avant | Après | Delta |
|---|---|---|---|
| Temps moyen de 1ère réponse | ~[X] | ~[Y] | [−%] |
| Leads perdus / mois | ~[X] | 0 | −100% |
| Temps conseiller par lead | ~15 min | ~3 min | −80% |
| Visibilité pipeline directeur | 0 | Temps réel | ∞ |
| Taux de conversion lead→visite | ~[X]% | ~[Y]% | [+%] |

## Ce que le client dit

> *"[Testimonial à recueillir 30j post go-live. Format : 2-3 phrases, signé nom + titre + photo.]"*
> — [Nom], Fondateur, Marrakech Realty

## Le process

**Durée totale** : [X] semaines
**Équipe** : 1 (solo full-stack — design + dev + UX + PM)
**Cadence** : démo hebdo, 1 call par semaine fixe

| Phase | Durée | Livrables |
|---|---|---|
| Kickoff + audit | 1 sem | Design system, architecture, roadmap |
| Site public | 4 sem | 19 routes, migration SEO, photos réelles |
| Base de données | 1 sem | Supabase, migrations, RLS, seeds |
| CRM core | 2 sem | Auth, rôles, leads, timeline, mutations |
| NBA + dashboards | 1 sem | Moteur d'actions + widgets directeur |
| Rodage | 1 sem | Tests avec l'équipe, ajustements UX |

## Stack

Next.js 16 + React 19 + Tailwind v4 + Supabase (DB + Auth + Storage) + Resend (email) + Zod (validation). Déploiement sur leur infrastructure.

---

## Comment montrer ce case study

**En démo live (20 min)** :
1. Le site public — parcours Palmeraie → fiche d'une villa 2M€ → formulaire contact (scène 1 du script démo)
2. L'admin directeur — dashboard → répartition équipe → dans les SLA rouges → fiche lead avec NBA en évidence
3. La bascule rôle — déconnexion → reconnexion comme conseiller → vue restreinte

**En visuel (3-4 screenshots dans le proposal)** :
- Home
- Fiche bien
- Admin dashboard (directeur)
- Fiche lead avec NBA card

**En vidéo loom (3 min)** : le parcours complet en voix-off — à enregistrer après livraison finale
