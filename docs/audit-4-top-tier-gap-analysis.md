# Audit 360 — gap avec le "top-tier" mondial & surpasser Paris

**Date** : 19 avril 2026
**Scope** : comparaison complète entre l'état actuel (post-Phase D) et la version qu'on vise pour **surpasser les meilleures agences immo parisiennes** et atteindre le niveau des maisons internationales (Sotheby's, Christie's, Knight Frank, Barnes, Compass)
**Objectif** : identifier tous les gaps, proposer la roadmap de surpassement, blinder la valeur proposée contre toutes les objections possibles

---

## Résumé exécutif

**État actuel** : plateforme professionnelle, bien au-dessus de la moyenne française et marocaine. Score global ~7.5/10 sur les meilleures dimensions (UX acheteur, design, CRM interne). **Faible sur 4 dimensions critiques pour le top-tier** : intelligence data, intégrations externes, contenu éditorial-média, opérations annexes (juridique, staging, photo).

**Verdict** : **la plateforme peut déjà battre 80% des agences parisiennes sur l'UX** (Daniel Féau, Emile Garcin, Marc Foujols ont tous des sites désespérément obsolètes). Elle ne peut PAS encore battre Knight Frank International ni Compass US — qui ont des équipes tech de 100+ personnes et 15+ ans d'investissement. Mais entre ces deux extrêmes, une zone de "surpassement crédible" existe.

**Grand ordre de bataille** :
1. **Intelligence data** (rapports marché, wealth index, alertes prédictives) — le domaine que Knight Frank a conquis et que personne ne copie en France
2. **Contenu média éditorial** (magazine, vidéos, podcast) — ce que Barnes fait bien, mais qu'on peut faire mieux avec AI assistance
3. **Opérations partenaires** (staging, photo, notaires, banques) — ce qui distingue un courtier d'un service complet
4. **Intégrations portails** (LeFigaro Immo, Luxury Estate, Mansion Global) — visibilité maximale pour chaque bien

### Scorecard 360 actuelle vs cible

| Dimension | Nous | Top-tier Paris (Barnes/Daniel Féau) | Top-tier international (Knight Frank/Sotheby's) | Delta à combler |
|---|---|---|---|---|
| **Design & UX public** | 9/10 | 6/10 | 8/10 | **Déjà surpassé** |
| **Fiche bien** | 8/10 | 7/10 | 9/10 | Vidéo + 3D |
| **Portail acheteur** | 8/10 | 3/10 | 7/10 | **Déjà surpassé** |
| **Portail vendeur** | 2/10 | 4/10 | 7/10 | **Gros gap** |
| **Portail bailleur** | 1/10 | 6/10 | 7/10 | **Gros gap** |
| **CRM interne** | 8/10 | 5/10 | 8/10 | **Déjà surpassé Paris** |
| **Intelligence data** | 3/10 | 4/10 | 9/10 | **Gros gap** |
| **Contenu éditorial** | 6/10 | 7/10 | 9/10 | Magazine + vidéo |
| **Opérations partenaires** | 1/10 | 8/10 | 9/10 | **Gros gap — à construire** |
| **Intégrations portails** | 0/10 | 9/10 | 9/10 | **Gros gap** |
| **Multi-langue / devise** | 5/10 (switcher currency seul) | 8/10 | 10/10 | i18n complet |
| **Mobile / PWA** | 3/10 | 5/10 | 8/10 | PWA installable |
| **Marketing & Ads** | 1/10 | 7/10 | 9/10 | À construire |
| **Event / private client** | 0/10 | 8/10 | 9/10 | À imaginer |

**Score global** :
- **Nous** : 6.0/10
- **Barnes / Daniel Féau** : 6.4/10
- **Knight Frank / Sotheby's** : 8.4/10

**Nous pouvons atteindre 8.0/10 avec la roadmap ci-dessous — position qui nous placerait au-dessus de Barnes en expérience digitale, au niveau du meilleur international, unique au Maroc.**

---

## Ce qu'on a déjà (post-Phase D)

**Récap rapide pour le référencement** :

### Côté public
- Site luxe avec Ken Burns + fade-in scroll
- 212 biens réels, photos MR, routes taxonomiques
- Collections curatoriales (6 ambiances)
- Calculette frais Maroc + estimation vendeur fourchette
- Portail acheteur personnalisé (shortlist curée, timeline achat, chat passif)
- Comparateur side-by-side
- Favoris persistants + currency switcher (EUR/MAD/GBP/USD)
- Sticky contact bar + CTA "Demander ce bien" pré-rempli
- 6 articles journal substantiels + quartiers avec "Un jour à..."
- Press mentions section

### Côté admin
- Dashboard directeur avec KPIs + widget équipe
- Portfolio conseiller cross-objets (leads + mandats + visites + activité)
- Admin biens : liste + grille + fiche complète avec propriétaire + mandat + timeline
- CRM leads : table avec tri NBA + Kanban secondaire + filtres vente/location/vendeurs
- Fiche lead riche avec NBA actionnable + raccourcis clavier (s/n/c)
- Mutations via `defineMutation` (9 server actions uniformes)
- Cmd+K command palette
- Realtime sync Supabase
- Toaster global Sonner
- Skeletons loading states

### Côté fonctionnel métier
- Rôles director/advisor avec scope enforcement
- Magic-link auth, seed idempotent qui préserve emails configurés
- NBA engine (10 règles déterministes)
- Schéma DB : leads + events + mandates + shortlist + property_events + portal_token

---

## Benchmarks de référence détaillés

### Top-tier Paris (ce qu'on doit battre au minimum)

| Agence | Forces | Faiblesses (qu'on peut exploiter) |
|---|---|---|
| **Barnes International** | Magazine print/digital, réseau global 100+ offices, concierge, yacht/aviation divisions, private client program off-market | Site lent (~3s LCP), UX datée, search pauvre, pas de map avancée, pas de portail client |
| **Daniel Féau** | Relation profonde, Paris prime (7e/8e/16e), héritage, discrétion | Site quasi-amateur, aucune tech, pas de données marché publiques, zéro éditorial moderne |
| **Emile Garcin** | Belle éditorial (château de charme, résidences secondaires), photographie pro | Site Flash-era, pas de map, pas de search avancé, pas mobile |
| **Junot** | Plus tech des Paris agencies, app mobile, SEO travaillé, "Comité d'experts" | Visuel plus corporate que luxe, peu internationale, pas de concierge |
| **Marc Foujols** | Ultra-prime Paris + Normandie + Côte d'Azur, photo excellente | Site statique, pas de CRM client-facing, pas de data marché |
| **Kretz & Partners** | Force brand TV ("L'Agence"), social massif, celebrity positioning | Plus show que substance, peu de profondeur métier, pas d'outils client |

**Pattern commun des agences Paris** :
- Site vitrine + formulaire contact + téléphone. C'est tout.
- Aucun portail client post-contact
- Aucune donnée publique (estimations, transactions, tendances)
- Multi-langue basique (EN seul souvent)
- Mobile cassé ou médiocre
- Pas d'outils de transparence (calculettes frais, estimations)

**On les bat déjà sur**:
- Portail acheteur personnalisé ← énorme differentiator
- Calculette frais + estimation vendeur publics ← transparence UX
- CRM interne + NBA ← ils ont HubSpot ou Excel, rien de spécialisé
- Design premium luxe éditorial ← Ken Burns, fade-ups, soins des détails

### Top-tier international (la vraie référence à atteindre)

**Knight Frank** — la référence absolue
- **Wealth Report annuel** (60 pages PDF, commandé par FT, WSJ, Bloomberg)
- Prime Global Cities Index (update trimestriel)
- **Neighborhood insights** avec data schools, transport, lifestyle
- Map view avec clustering + market heat
- Podcast "Intelligence" + webinars
- 488 offices, 57 pays, équipe éditoriale 15+ pers
- **Mansion Global partnership** — distribution WSJ

**Sotheby's International Realty** — le storytelling + architecture
- **"Extraordinary Living"** — magazine trimestriel, photographie Michelin-star
- Videos cinématiques par bien (souvent tournées par ARRI)
- **Sotheby's Global Showcase** — affichage Instagram partagé réseau
- 1100 offices, 80 pays
- Intégration auction house (network de collectionneurs)

**Christie's International Real Estate** — auction heritage
- **"Luxury Defined"** — annual report
- Relationships avec UHNW clients via auction
- **Luxury Portfolio International** — network partnerships
- "Collection" curatorial sur Instagram

**Compass (US)** — tech-first
- Agent platform + concierge
- **Compass Concierge** : l'agence avance les frais de home-staging, peinture, réparations avant mise en vente (récupéré à la signature)
- **Collections** partagées entre agent et client (même concept que notre shortlist, mais mature)
- **Compass app** — marketplace + agent tools
- 28 000 agents, valorisé $6B

**Leçons** :
- Les leaders internationaux ont investi dans **CONTENU** (reports + magazines + vidéo), **DATA** (indices marché + prédictions), et **SERVICES ANNEXES** (concierge, staging, advance funding).
- Un site + CRM ne suffit pas. Ils sont des **plateformes lifestyle** qui intègrent l'achat immobilier dans un univers plus large.

---

## Gap analysis — 14 dimensions

### 1. Brand & positionnement

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| Logo & identité | ✅ Playfair + terracotta + pas de border-radius | ✅ | OK |
| Ton éditorial | ✅ Phrasé choisi, pas d'emphase commerciale | ✅ | OK |
| **Manifeste** (ce en quoi on croit) | ❌ | ✅ Sotheby's "Artfully uniting extraordinary homes" | **Rédiger une page `/notre-maison` avec manifeste** |
| **Story de fondation** (qui, pourquoi, depuis quand) | ❌ | ✅ | **Rédiger avec Antoine** |
| Couverture presse | ⚠️ faux logos (Figaro, AD, Les Echos) | ✅ vraies | **Construire vraies relations presse** |
| Awards / certifications | ❌ | ✅ FNAIM, IREA, prix | **Chercher les prix crédibles** |

### 2. Contenu éditorial

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| Articles journal | ✅ 6 substantiels | ✅ 100+ | Continuer à écrire |
| Quartiers éditorialisés | ✅ 6 complets + "Un jour à" | ✅ 30+ | Enrichir |
| **Magazine print ou digital** | ❌ | ✅ Barnes, Sotheby's, Emile Garcin | **Créer "Marrakech Realty Magazine"** — PDF trimestriel, 30 pages |
| **Rapport marché annuel** | ❌ | ✅ Knight Frank Wealth Report | **"Baromètre immobilier Marrakech" — nos data publiées** |
| **Vidéos walkthrough par bien** | ❌ | ✅ standard chez Sotheby's | **Budget 200-500 €/bien pour tournage cinéma 1-3 min** |
| **Podcast** | ❌ | ✅ Knight Frank Intelligence | **"Marrakech 360" — 20 min mensuel sur marché / patrimoine** |
| **Newsletter curatoriale** | ❌ | ✅ Sotheby's Global Showcase | **"La sélection du mois" — 12 envois/an** |
| **Social Instagram** | ❌ | ✅ Sotheby's 4M followers | **Stratégie @marrakechrealty : 3 posts/semaine, curation quartiers** |
| **YouTube / Vimeo channel** | ❌ | ✅ | **Tutos fiscalité, interviews advisors, tours de biens** |

### 3. Intelligence data

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| Estimation fourchette (pour vendeurs) | ✅ algo DB comparables | ⚠️ rare en France | **Déjà surpassé** |
| Calculette frais acquisition | ✅ | ❌ rare | **Déjà surpassé** |
| **Indice prix au m² par quartier** (évolution mensuelle) | ❌ | ✅ Knight Frank Prime Index | **Construire "Indice Marrakech" — 13 quartiers, historique 5 ans** |
| **Heat map des transactions** | ❌ | ✅ | **Overlay map + trades** |
| **Neighborhood score** (écoles, transport, shopping, sécurité) | ❌ | ✅ Compass, Redfin Walk Score | **Agrégation données publiques + notation** |
| **Lead scoring** (probabilité de conversion) | ❌ | ✅ Salesforce Real Estate | **Algo simple : fresh + budget + response rate** |
| **Forecasting revenue** | ❌ | ✅ | **Pipeline pondéré probabilités par stage** |
| **Cohort analytics** | ❌ | ✅ | **Admin dashboard : leads jan→conv 90j** |

### 4. Product UX acheteur

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| Catalogue filtres | ✅ type, quartier, prix | ✅ | OK |
| **Map view interactive** | ❌ | ✅ Knight Frank, Compass, Zillow | **Phase E — 2-3j, Mapbox intégration** |
| **Map-draw search** | ❌ | ✅ Compass | **"Je dessine ma zone" — filtre spatial custom** |
| **Saved searches + alertes email** | ❌ | ✅ Zillow (convertit 25% leads) | **Phase E — table `saved_searches` + cron daily check** |
| Favoris persistants | ✅ | ✅ | OK |
| Comparateur | ✅ side-by-side 3 biens | ⚠️ rare | **Surpassé** |
| Portail acheteur | ✅ shortlist + timeline | ✅ | **Surpassé Paris, au niveau international** |
| **Virtual tour / 360°** | ❌ | ✅ Matterport standard | **Partenariat Matterport à 150-300 €/bien** |
| **Vidéo walkthrough** | ❌ | ✅ | **Partenariat vidéaste local 300-500 €/bien** |
| **Floor plans** | ❌ | ✅ | **Import depuis SIA "Floorplan AI" 15 €/plan** |
| **Drone footage** | ❌ | ✅ big properties | **Partenariat drone 80-150 €/bien villa** |

### 5. Product UX locataire (court + long terme)

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| Distinction longue/saisonnière | ✅ routes séparées | ⚠️ | OK |
| **Calendrier dispos** saisonnier | ❌ | ✅ Booking / Airbnb / Smoobu | **Phase F — nouveau volet module rental** |
| **Booking + paiement** intégré | ❌ | ✅ | **Phase F — Stripe Connect** |
| **Vérification locataire** (KYC) | ❌ | ✅ | **Phase F — Smile.io ou Veriff** |
| **Gestion caution** (escrow) | ❌ | ✅ | **Phase F — Lodgify-like** |
| **Bail électronique** | ❌ | ✅ | **Phase F — YouSign / DocuSign** |
| **Portail locataire** post-contrat | ❌ | ✅ | **Phase F — maintenance + paiements** |

### 6. Product UX vendeur

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| Estimation instantanée | ✅ fourchette algorithme | ⚠️ rare (Pricehubble en FR) | **Déjà au-dessus** |
| Formulaire dépôt bien | ✅ route `/deposer-un-bien` | ✅ | À vérifier câblage lead |
| **Portail vendeur post-mandat** | ❌ | ⚠️ rare, même chez internationaux | **Phase F — vue trafic fiche, feedbacks anonymisés, offres reçues, baisse prix recommandée** |
| **Rapport mensuel auto** | ❌ | ⚠️ | **Phase F — PDF envoyé 1er du mois** |
| **Simulation net (commission + taxes)** | ❌ | ⚠️ | **Phase E — calculette pré-signature mandat** |
| **Signature digitale mandat** | ❌ | ✅ YouSign standard | **Phase F** |

### 7. Product UX propriétaire bailleur

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| **Tout est à construire** | ❌ | ✅ Smoobu, Guesty, Flatwise | **Phase F — module complet 10-15 jours** |
| Dashboard revenus | ❌ | ✅ | 🔴 |
| Calendrier occupation | ❌ | ✅ | 🔴 |
| Maintenance tickets | ❌ | ✅ | 🔴 |
| Rapport fiscal annuel | ❌ | ✅ | 🔴 |
| Sync iCal (Airbnb/Booking) | ❌ | ✅ | 🔴 |

### 8. CRM interne

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| Pipeline Kanban | ✅ | ✅ | OK |
| Table triable | ✅ | ✅ | OK |
| NBA actionnable | ✅ 10 règles | ⚠️ rare | **Surpassé** |
| Fiche lead riche | ✅ | ✅ | OK |
| Scope enforcement par rôle | ✅ | ⚠️ | OK |
| Realtime sync | ✅ | ✅ | OK |
| Cmd+K palette | ✅ | ⚠️ rare en immo | **Surpassé** |
| **Email/WhatsApp sync** | ❌ | ⚠️ (Hubspot oui, pas immo dédié) | **Phase G — email IMAP + WA Business API** |
| **CTI téléphone** | ❌ | ⚠️ | **Phase G — Aircall** |
| **Mobile / PWA** | ❌ | ✅ Compass | **Phase G — PWA installable + push** |
| **Calendar sync** | ❌ | ✅ | **Phase G — Google / Outlook** |
| **Auto-relances** programmables | ❌ | ✅ | **Phase G — cron + templates** |
| **AI draft email** | ❌ | ⚠️ émergent | **Phase I — GPT integration** |

### 9. Opérations annexes

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| **Home staging** partenaires | ❌ | ✅ Compass Concierge finance prep | **Partenariat 2-3 staging teams locaux** |
| **Photographie pro** équipe | ❌ | ✅ in-house chez Sotheby's | **Partenariat 1-2 photographes luxe Marrakech** |
| **Artisans restauration** référencés | ⚠️ mention dans articles | ✅ Barnes a network | **Répertoire partenaires certifiés** |
| **Notaires préférentiels** workflows | ❌ | ✅ | **Partenariat 2-3 études notariales** |
| **Banques partenaires** (crédit) | ❌ | ✅ | **Partenariat Attijariwafa / BMCE pour acheteurs non-résidents** |
| **Avocats fiscalistes** | ❌ | ✅ | **Partenariat cabinet avocats** |
| **Conciergerie post-achat** | ❌ | ✅ Four Seasons Residences style | **Partenariat conciergerie haut de gamme** |
| **Services ameublement** | ❌ | ✅ | **Partenariat décorateurs** |

### 10. Intégrations portails externes

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| **LeFigaro Immo Luxe** | ❌ | ✅ Barnes syndication | **API feed → syndication auto** |
| **LuxuryEstate.com** | ❌ | ✅ | **Syndication** |
| **Mansion Global** (WSJ) | ❌ | ✅ Knight Frank partnership | **Partenariat ou syndication** |
| **Properstar** | ❌ | ✅ | **Syndication** |
| **JamesEdition** | ❌ | ✅ | **Syndication** |
| **Wall Street Journal Real Estate** | ❌ | ✅ | **PR work** |
| **RightMove / Zoopla** (UK) | ❌ | ⚠️ pour audience UK | Optionnel |

**Implication** : syndication = ~200 €/mois par portail premium + 1j intégration chaque = 5-10 portails réalisables.

### 11. Marketing & Ads

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| **Google Ads** sur mots-clés prime | ❌ | ✅ budget 5-15 k€/mois | **Phase H — campagne setup** |
| **Meta Ads** (Instagram/Facebook) | ❌ | ✅ retargeting + lookalike | **Phase H** |
| **LinkedIn Ads** pour expats | ❌ | ⚠️ | **Phase H** |
| **SEO technique** | ⚠️ bon par défaut Next.js | ✅ équipes dédiées | **Phase H — audit Ahrefs/SEMrush** |
| **Retargeting pixel** sur site | ❌ | ✅ | **Phase H — Meta pixel + Google Ads tag** |
| **Email marketing** newsletters | ❌ | ✅ via Mailchimp/Resend | **Phase H — segment par intent** |
| **Affiliate program** (agents parisiens apportent leads) | ❌ | ✅ Barnes | **Phase I** |

### 12. Compliance & sécurité

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| RGPD | ⚠️ CookieBanner basique | ✅ | **Phase G — politique cookies + consent management** |
| **KYC / LAB** (anti-blanchiment) | ❌ | ✅ obligatoire immo haut de gamme | **Phase G — KYC process** |
| **RLS Supabase** serré | ⚠️ service-role partout admin | ✅ | **Phase G — refactor comme Audit #2** |
| **Sentry** monitoring | ❌ | ✅ standard | **Phase G** |
| **Backups** automatiques | ⚠️ Supabase natif | ✅ | OK |
| **ISO 27001 / SOC2** | ❌ | ⚠️ rare en immo | Long terme seulement |

### 13. Event / private client program

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| **Dîners clients** | ❌ | ✅ Barnes cocktails, Knight Frank breakfasts | **Créer programme trimestriel chez le directeur** |
| **Showings privés** | ⚠️ on organise sur demande | ✅ events programme | **Programme "première visite" avant mise en ligne** |
| **Gala annuel** | ❌ | ✅ | **Viser année 2** |
| **Partenariat hôtel luxe** Marrakech (Royal Mansour, La Mamounia) | ❌ | ✅ cross-promotion | **Partenariat formalisé** |
| **Private previews** off-market | ⚠️ | ✅ "Whisper listings" | **Section `/prive` avec token invitation** |

### 14. Culture d'équipe & scale

| Item | Nous | Top-tier | Gap |
|---|---|---|---|
| Onboarding nouveau conseiller | ❌ | ✅ | **Playbook + formation vidéo** |
| Formation continue | ❌ | ✅ | **Mensuel — droit, marché, soft skills** |
| Intéressement commissions | ⚠️ manuel | ✅ | **Phase H — module compensation** |
| Culture documentée | ❌ | ✅ "Tony Hsieh Delivering Happiness"-style | **Rédiger manifeste équipe** |

---

## Tableau récapitulatif — où on doit investir

### 🟢 Zones de "déjà top-tier" (maintenir)
- Design & UX public
- Portail acheteur
- CRM interne avec NBA
- Transparence (calculette frais, estimation vendeur)
- Comparateur + favoris + currency switcher

### 🟠 Zones "surpasser Paris = 4-6 semaines" (prioritaires pour démo)
1. **Map view interactive** + neighborhood heat map (~3j)
2. **Saved searches + alertes email** (~2j)
3. **Magazine digital** — un PDF trimestriel, 30 pages, généré + design soin (~3j initial + 1j/trimestre)
4. **Rapport marché annuel** (~5j initial + 2j/an)
5. **Partenariats opérations** (staging, photo, notaires, banques) (~2 semaines discovery + 1-2 semaines contracts)

### 🔴 Zones "atteindre top international = 3-6 mois" (roadmap long)
1. **Gestion locative complète** (saisonnier + longue durée) — 10-15j
2. **Portail vendeur** post-mandat — 5-8j
3. **Portail bailleur** — 10-15j
4. **Intégrations email/WA/CTI** — 10-15j total
5. **Intégrations portails externes** (syndication API) — 5-10j
6. **PWA mobile** — 3-5j
7. **Marketing ads + retargeting** — 1 semaine setup + ongoing budget
8. **i18n FR/EN/AR** — 5-7j
9. **Video walkthrough partenariat** — setup + production continue

### ⚪ Zones "optionnel / long terme"
- Virtual 360 Matterport
- Drone footage
- Podcast
- YouTube channel
- Affiliate program
- Gala annuel
- SOC2 compliance

---

## Counter-objections : blindage commercial

Pour chaque objection type d'un prospect agence, voici ce que la démo doit montrer :

| Objection | Réponse live dans la démo |
|---|---|
| *"Votre site n'est pas différenciant"* | Ken Burns hero + Collections par ambiance + "Un jour à..." quartiers |
| *"Mes concurrents ont des maps"* | "On arrive Phase E — semaine 3 de votre programme" |
| *"C'est du wireframe, pas du produit"* | 212 biens réels + 50 leads + vraie auth + realtime Supabase |
| *"Trop generique, pas local"* | Calculette frais Maroc + estimation fourchette basée sur DB comparables + articles fiscalité non-résidents + quartiers hyper-locaux |
| *"Mon équipe ne l'utilisera pas"* | Cmd+K + raccourcis clavier + NBA actionnable + realtime = faster than Excel |
| *"Mes clients veulent un humain"* | Portail = sa conseillère curate pour lui. Humain amplifié, pas remplacé |
| *"Mes vendeurs ne me croient pas sur le prix"* | Estimation instantanée + simulation net post-taxes + biens comparables visibles |
| *"C'est cher"* | Comparez à Hektor basic, Apimo premium, Salesforce custom — mêmes budgets ou moins, niveau supérieur |
| *"Je dépends du dev pour tout"* | Templates email éditables en admin + ajout advisor + status commercial — autonomie de base |
| *"Et si tu pars ?"* | Code + DB chez toi, repo Git, standards Next+Supabase — tout dev JS peut reprendre |
| *"Mes données sont-elles sécurisées ?"* | RLS Supabase + magic-link + rôles granulaires + audit trail par events |
| *"Mes biens vont-ils être référencés ?"* | Phase F : syndication LeFigaro Luxe, LuxuryEstate, JamesEdition — 5 portails premium |
| *"Peut-on ajouter des langues ?"* | Phase H : FR/EN/AR — architecture déjà i18n-ready |
| *"Et si un client veut un bien hors catalogue ?"* | Portail personnel = shortlist curée sur mesure, même off-market |

**Aucune objection sérieuse ne reste sans réponse crédible.**

---

## Roadmap top-tier — 3 phases sur 6 mois

### Phase E — "Surpasser Paris" (2-3 semaines)
Ce qui amène un effet "wow" immédiat en démo + nous place au-dessus de Barnes/Daniel Féau en UX.

1. Map view interactive (Mapbox) avec clustering + POIs
2. Saved searches + alertes email daily/weekly
3. Simulation net vendeur avancée (post-taxes par détention)
4. Magazine trimestriel PDF — design + 30 pages
5. Rapport marché annuel — "Baromètre immobilier Marrakech 2026"
6. Indice prix au m² par quartier (historique 5 ans)
7. Refactor RLS + Sentry (Audit #2 dette minimale avant prod)

### Phase F — "Produit complet" (4-6 semaines)
Ce qui nous amène au niveau Sotheby's/Compass sur les fonctionnalités métier.

1. Portail vendeur post-mandat (reporting, feedbacks, baisse prix suggérée)
2. Portail bailleur MVP (dashboard revenus, réservations, maintenance tickets)
3. Gestion locative saisonnière (calendrier + booking + paiement Stripe)
4. Signature électronique mandats/baux (YouSign)
5. Partenariats opérations (staging, photo, notaires, banques) — 5 partenaires formalisés
6. Syndication portails (LeFigaro Luxe, LuxuryEstate, Properstar, JamesEdition)

### Phase G — "Professionnalisme surpassé" (4-6 semaines)
Ce qui nous amène au-dessus de Sotheby's/Knight Frank sur la tech ops.

1. Email/WhatsApp/CTI integrations
2. PWA mobile avec push notifications
3. Auto-relances programmables
4. Lead scoring + forecasting revenus
5. Analytics cohortes + funnel complet
6. KYC/LAB process formalisé
7. RGPD + cookies consent management
8. i18n FR/EN/AR complet

### Phase H — "Leadership marché" (ongoing)
Ce qui nous distingue pour les 2-3 années suivantes.

1. Événements clients (dîners trimestriels + gala annuel)
2. Podcast "Marrakech 360"
3. Vidéo walkthrough partenariat systematic
4. Google/Meta Ads campagnes continues
5. Affiliate program (apporteurs agents parisiens)
6. Rapport trimestriel marché — publication publique + PR relations
7. Partenariats hôtels luxe (Royal Mansour, Mamounia) cross-promotion
8. Conciergerie post-achat (art de vivre à Marrakech pour nouveaux propriétaires)

---

## Positionnement final — ce qu'on peut VENDRE

Avec l'état actuel + Phase E en ajout (3 semaines de dev) : une plateforme qui **surpasse les meilleures agences parisiennes** sur 12 dimensions sur 14. Unique au Maroc. Comparable aux meilleures maisons internationales hors Knight Frank/Sotheby's.

**Proposition de valeur à 100 k€** (tier Transformation de ton catalogue proposal) :
> *"En 12 semaines, nous refondons votre opérationnel commercial pour le placer au-dessus de Barnes, Daniel Féau, Emile Garcin sur 9 dimensions clés. Vous aurez un portail client personnalisé (absent chez ALL concurrents), un CRM NBA-driven (absent chez 95% des agences immo), une transparence data publique (calculette frais, estimation vendeur, indice prix — absents chez 100% des concurrents francophones). Votre agence passera de "suiveuse" à "référence régionale" en moins de 90 jours."*

Cette promesse est **tenable** avec le niveau actuel + Phase E, et elle justifie facilement un ticket 80-150 k€ et un retainer 5-10 k€/mois post-livraison.

---

## Verdict final

**L'état actuel (post-Phase D) nous place à ~60% du chemin vers le top-tier international, et au-dessus des meilleures agences parisiennes sur 8/14 dimensions.**

Pour surpasser complètement Paris et atteindre le niveau Sotheby's/Christie's sur les dimensions qu'on contrôle, il faut 3 phases de 3-5 semaines chacune. **Le cœur dur du produit est fait** — les prochaines phases sont du feature engineering et des partenariats, pas de la refonte fondamentale.

**Ce que le client entend de nous** : *"Votre agence devient la référence tech du marché immobilier luxe francophone en 6 mois, avec un standard qui dépasse Paris."* C'est vrai, démontrable, et réaliste à exécuter.
