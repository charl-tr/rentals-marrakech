# Phase D — Sprint Client Immersion

**Date de lancement** : 2026-04-18
**Objectif** : transformer l'expérience B2C de "propre mais générique" à "immersive, mémorable, qui donne envie de revenir".
**Scope** : tout ce que voit un visiteur public (acheteur, vendeur, locataire, bailleur) — avant contact ET après.

---

## Vision

> *Un visiteur arrive sur le site. En 3 minutes, il comprend qu'on est LA maison du luxe à Marrakech. En 30 minutes, il a une shortlist de biens qu'il adore. En 7 jours, il a un espace personnel où son conseiller a curé pour lui une sélection. Il ne revient pas sur le site — il revient dans SON espace.*

### Les 3 leviers émotionnels à activer

| Levier | Définition | Exemples concrets |
|---|---|---|
| **Aspiration** | *"Je peux me voir là-bas"* | Imagerie cinématique, storytelling par bien, quartiers éditorialisés |
| **Confiance** | *"Ils comprennent Marrakech et ils me comprennent"* | Calculette frais MAR, estimation vendeur, expertise locale visible, portail perso |
| **Aisance** | *"C'est sans effort de rêver ici"* | Zéro friction, réponse instantanée, favoris persistants, comparateur, sticky CTAs |

---

## Le parcours client mappé (8 étapes)

```
1. Découverte     ← SEO / referral / bouche-à-oreille
2. Browse         ← Home / catalogue / quartiers
3. Intérêt        ← Favoris / comparateur / lecture longue
4. Signal         ← Formulaire contact / demande bien
5. Réponse        ← Email + lien portail (nouveau)
6. Curation       ← Portail avec shortlist conseiller
7. Planification  ← Calendrier visites
8. Décision       ← Visite physique / offre / signature
```

**État actuel** : on maîtrise 1-4 correctement. On ne fait rien de spécial entre 4 et 8. **Les phases 5-7 sont le champ de bataille** de la différenciation.

---

## Principes de design

1. **Cinématique sur le public, dense sur le privé** — le site vitrine est lent et beau, le portail client est dense et rapide.
2. **Editorial avant commercial** — toute feature raconte une histoire d'abord, vend ensuite. Jamais de pop-up newsletter, jamais de CTA "Achetez maintenant".
3. **Localisation authentique** — Marrakech n'est pas "le Maroc générique". Palmeraie ≠ Médina ≠ Hivernage. Chaque feature doit refléter cette spécificité.
4. **Mobile-first discrètement** — les acheteurs luxe browsent sur iPad le soir. La version mobile doit être soignée, mais on ne fait pas d'app native à ce stade.
5. **Pas de fausse hauteur** — pas de "Exclusive", "Discover now", "Premium properties" partout. Le ton du site parle à quelqu'un qui reconnaît le niveau sans qu'on lui dise.

---

## Les 6 blocs du sprint

### Bloc 1 — Polish fonctionnel immédiat (1-2 j équiv.)

*Level de baseline qualité. Rien de spectaculaire, mais l'absence de ces items dévalue l'ensemble.*

| Feature | Effet | Effort |
|---|---|---|
| **Sticky contact bar** sur fiche bien (mobile + desktop) | Zéro friction pour contacter en milieu de longue fiche | 0.25 |
| **Favoris persistants** localStorage (et dans DB si connecté) | Ils restent entre les sessions — shortlist naturelle | 0.5 |
| **Section "Similar properties"** bas de fiche | Keeps browsing, augmente session length | 0.5 |
| **Currency switcher** EUR / MAD / GBP / USD | Crédibilité internationale, basique en luxe | 0.5 |
| **Share native** (lien email, WhatsApp, copier) | Le couple acheteur partage souvent entre eux | 0.25 |
| **Amélioration hover cards** (transitions subtiles) | Feeling "vivant" sans gimmick | 0.25 |

### Bloc 2 — Expertises locales différenciantes (2-3 j équiv.)

*Les features où personne ne nous bat à Marrakech.*

| Feature | Effet | Effort |
|---|---|---|
| **Calculette frais acquisition Maroc** | Frais notaire 6-8%, TVA, IR plus-value si revente. Page dédiée + widget sur fiche. **Différenciateur local majeur.** | 1 |
| **Estimation vendeur instantanée (fourchette)** | Formulaire 3 questions → algo sur biens comparables en DB → résultat en 60s + CTA pour finaliser avec un conseiller | 1-1.5 |
| **Simulateur "net dans votre poche"** | Vendeur entre son prix → calcul commission + plus-value + fiscalité → montant net | 0.5 |
| **Page "Acheter au Maroc — guide synthétique"** | Refonte de `/savoir-acheter` avec illustrations, timeline visuelle, FAQ | 0.5 |

### Bloc 3 — Discovery & comparateur (2 j équiv.)

*Outils pour naviguer une shortlist personnelle.*

| Feature | Effet | Effort |
|---|---|---|
| **Comparateur side-by-side** (2-3 biens) | Aide à arbitrer quand on hésite | 1 |
| **"Parcourir par ambiance"** | Collections éditoriales : "Pour vivre", "Pour louer en saisonnier", "Pour la retraite", "Pour les Alizés" | 0.5 |
| **Collections conseillers** | "La sélection d'Antoine", "Les coups de cœur de Camille" — humanise l'algo | 0.5 |

### Bloc 4 — Portail acheteur personnalisé (3-5 j équiv.)

*LE gros chantier. Transforme la relation post-contact.*

| Feature | Effet | Effort |
|---|---|---|
| **Magic link post-submit** | Le client reçoit un email avec lien unique vers son espace | 0.5 |
| **Espace portail `/mon-espace/[token]`** | Non authentifié par mot de passe, juste un token signé. Simple et premium. | 1 |
| **Shortlist curée** | Le conseiller peut ajouter/retirer des biens depuis l'admin → apparaissent dans l'espace client | 1 |
| **Timeline achat Maroc-spécifique** | "Votre conseiller vous rappelle sous 2h · Votre 1ère visite · Votre offre · Le compromis · La signature notaire" | 0.5 |
| **Chat asynchrone** avec le conseiller | Pas du real-time, juste messages + notif email | 1 |
| **Favoris du visiteur → retrouvés dans son espace** | Continuity | 0.25 |
| **Planning visites** | Le conseiller propose des créneaux, le client valide | 1 |

### Bloc 5 — Polish visuel cinématique (1 j équiv.)

*Le toucher "aspiration" — effets sobres mais mémorables.*

| Feature | Effet | Effort |
|---|---|---|
| **Hero section animation** discrète (slow zoom, fade overlay) | Premier impact visuel | 0.25 |
| **Fade-up au scroll** sur les sections | Feuille qui se tourne | 0.25 |
| **Galerie bien avec nav clavier** et transitions | Immersion dans les photos | 0.5 |
| **Meilleurs micro-détails** (cursor, scroll indicator, loading) | Qualité perçue globale | 0.25 |

### Bloc 6 — Contenu éditorial curatif (1-2 j équiv.)

*Enrich ce qui existe — pas de nouvelle route mais enrichir journal + quartiers.*

| Feature | Effet | Effort |
|---|---|---|
| **3 nouveaux articles journal** (rédigés par Claude, revus par Charles) | SEO + trust + engagement | 1 |
| **Quartiers enrichis** avec section "Un jour à X" + recommandations restaurants/artisans | Aspiration locale | 0.5 |
| **Section "Press mentions"** sur home (même fake initialement) | Signal crédibilité | 0.25 |
| **Section "Chiffres qui parlent"** remplaçant les stats génériques | Remplace "25 ans · 340+ vendus · 92%" par données plus nuancées et datées | 0.25 |

---

## Exécution — ordre recommandé

**Sprint jour par jour** (en jours équivalents humain) :

### J1 — Bloc 1 + début Bloc 2
- ☐ Sticky contact bar fiche bien
- ☐ Favoris persistants (localStorage d'abord, DB plus tard)
- ☐ Similar properties section
- ☐ Currency switcher widget
- ☐ Share native button
- ☐ Calculette frais Maroc (page + widget)

### J2 — Fin Bloc 2 + Bloc 3
- ☐ Estimation vendeur fourchette
- ☐ Simulateur net vendeur
- ☐ Refonte `/savoir-acheter`
- ☐ Comparateur side-by-side
- ☐ Collections ambiance / conseillers

### J3-J5 — Bloc 4 Portail acheteur
- ☐ Schema magic link tokens
- ☐ Email template "votre espace perso"
- ☐ `/mon-espace/[token]` route publique
- ☐ Admin "curer shortlist" depuis fiche lead
- ☐ Timeline achat visuelle
- ☐ Chat asynchrone
- ☐ Planning visites

### J6 — Bloc 5 Polish visuel

### J7 — Bloc 6 Contenu éditorial

---

## Ce qu'on ne fait PAS dans cette Phase D (et pourquoi)

- ❌ **Map view interactive** — Phase E (2-3j dédiés). Trop lourd pour Phase D.
- ❌ **i18n FR/EN/AR** — Phase H. Priorité de contenu d'abord, traduction après.
- ❌ **Virtual tour 360°** — nécessite partenariat photographe spécialisé.
- ❌ **Portail bailleur / locataire** — Phase F. On focus acheteur d'abord car c'est la majorité du business MR.
- ❌ **Booking saisonnier** — Phase F.
- ❌ **Alertes email saved search** — Phase E (va avec la map).

---

## Métriques de succès

**Avant Phase D** (baseline) :
- Session length moyenne : inconnue (à mesurer)
- Bounce rate fiche bien : inconnu
- Conversion form contact : ~X% (a mesurer)
- Score audit #3 — POV Acheteur : 6.5/10

**Après Phase D** (cible) :
- Session length : **+50%** (favoris, comparateur, parcours curatifs font naviguer plus)
- Conversion form contact : **+20-30%** (sticky CTA + calculette + estimation = plus de signals)
- Score audit #3 — POV Acheteur : **8.5/10**
- Score POV Vendeur : **3 → 5** (grâce à estimation + simulateur)
- "Dégueu/5" par le premier prospect en test : 5/5

**KPIs à ajouter en tracking** :
- % de visiteurs qui utilisent la calculette
- % de visiteurs qui utilisent l'estimation
- % de leads qui activent leur portail dans les 48h
- Temps moyen passé sur le portail

---

## Stack technique (pas de nouvelles dépendances majeures)

- Tout reste en Next.js 16 + Supabase + Tailwind v4
- Pour les animations : CSS transitions + `animate-fade-up` existant (pas de framer-motion lourd)
- Pour le magic link : JWT signé par service_role + route handler `/auth/magic`
- Pour le portail : route `(public)/mon-espace/[token]` — token validé côté server

---

## Planification cashflow

- **Bloc 1-2 avant signature client** : quick wins qui améliorent la démo
- **Bloc 4 (portail) = argument vente principal** du premier proposal à 80-120k
- **Bloc 3-5-6 payables sur l'acompte** post-signature

---

*Plan en évolution vivante. À mettre à jour à chaque fin de journée d'exécution.*
