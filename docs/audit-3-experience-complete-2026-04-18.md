# Audit complet — expérience bout-en-bout, tous POV

**Date** : 18 avril 2026
**Scope** : tous les utilisateurs de la plateforme, côté public ET côté admin
**Baseline** : post Stack 1+2 (Command palette, DataTable générique, raccourcis clavier, Realtime, optimistic wrapper)

---

## Index

1. [Résumé exécutif](#résumé-exécutif)
2. [POV Acheteur](#pov-1--acheteur-b2c)
3. [POV Locataire](#pov-2--locataire-b2c)
4. [POV Vendeur](#pov-3--vendeur-b2c)
5. [POV Propriétaire bailleur](#pov-4--propriétaire-bailleur-b2c)
6. [POV Directeur d'agence](#pov-5--directeur-dagence-b2b)
7. [POV Conseiller / staff](#pov-6--conseiller-staff-b2b)
8. [Matrice Impact × Effort](#matrice-impact--effort)
9. [Benchmarks concurrents](#benchmarks-concurrents)
10. [Roadmap prioritaire](#roadmap-prioritaire)

---

## Résumé exécutif

| POV | Score | Gros gap |
|---|---|---|
| Acheteur | **6.5 / 10** | Pas de map · pas d'alertes · pas de portail |
| Locataire | **4 / 10** | Pas de calendrier dispos · pas de booking · rien de post-contrat |
| Vendeur | **3 / 10** | Pas d'estimation · pas de portail · pas de reporting |
| Propriétaire bailleur | **1 / 10** | Rien de dédié |
| Directeur d'agence | **7 / 10** | Analytics / forecasting / export |
| Conseiller | **6 / 10** | Intégrations email/WA/CTI manquantes |

**Score moyen** : **4.6 / 10**
**Score si on raffine le B2C (public + portails clients)** : **6.5-7 / 10**
**Score si on raffine le B2B (staff tools)** : **8 / 10**

**Verdict** : la plateforme est **plus mûre côté agence que côté clients finaux**. On a investi beaucoup dans les outils interne (CRM, admin, NBA, realtime), insuffisamment dans l'expérience acheteur/vendeur/locataire **post-contact**. Pour une agence qui vend à des clients internationaux exigeants, **c'est l'expérience client qui ferme les deals**, pas la polish de l'admin.

**Priorité stratégique** : les prochains sprints devraient pencher vers les POV 1, 3, 4 (acheteur, vendeur, bailleur).

---

## POV #1 — Acheteur (B2C)

**Profil type** : Français, Belge, Suisse, 45-65 ans, cherche résidence secondaire ou investissement à Marrakech. Budget 400k-3M€. Achat sur 3-6 mois en moyenne. Anglophone avec FR maîtrisé, parfois AR pour la clientèle du Golfe.

**Parcours type** :
1. Recherche Google "riad médina marrakech à vendre" → atterrit sur home ou fiche
2. Navigation : filtres, biens, quartiers
3. Intérêt fort sur un bien → formulaire contact
4. Discovery call avec conseiller → shortlist curée
5. Voyage à Marrakech → tour de visites
6. Négociation, offre, compromis → signature notaire

### Ce qui tourne (+)

| Feature | Commentaire |
|---|---|
| ✅ **Site vitrine éditorial** | Codes luxe respectés (Playfair, terracotta, pas de bord rond) |
| ✅ **212 biens réels** | Photos vraies (pas de stock), descriptions sourcées de MR |
| ✅ **Routes par type/quartier** | `/acheter/villa/palmeraie`, `/acheter/riad-renove` — SEO-friendly |
| ✅ **Fiche bien riche** | Prix EUR + MAD, surface, chambres, features, conseiller dédié |
| ✅ **Formulaire contact câblé** | Zod validation, accusé client, routing vers conseiller |
| ✅ **Quartiers éditorialisés** | 6 quartiers avec description + atlas (Sotheby's / Knight Frank le font) |
| ✅ **Journal éditorial** | Différenciation content, 3 articles seedés |
| ✅ **SEO préservé** | 30 redirects 308 MR legacy — 0 perte traffic organique |

### Ce qui manque / est faible (−)

| Gap | Sévérité | Comparaison |
|---|---|---|
| 🔴 **Pas de map view** | Critique | Knight Frank, Sotheby's, Christie's ALL ont une map interactive avec clustering |
| 🔴 **Pas d'alertes email** | Critique | Zillow/Redfin convertissent 25% des leads par alertes bien-matché |
| 🔴 **Pas de portail acheteur perso** | Critique | Compass/Keller a shortlist privée + comparateur + timeline achat |
| 🟠 **Favoris cookie-based** | Majeur | Disparaissent à chaque session. Firstbase ou cross-device impossible |
| 🟠 **Pas de comparateur** | Majeur | Side-by-side 2-3 biens — standard dans le luxe immo |
| 🟠 **Pas de langue EN/AR** | Majeur | Cible internationale forte, Marrakech = 60% acquéreurs étrangers |
| 🟠 **Pas de switcher devise** | Majeur | EUR/MAD/GBP/USD selon origine acheteur |
| 🟠 **Pas de virtual tour / video / floor plan** | Majeur | Compass / Lusso (luxe) l'ont tous |
| 🟠 **Pas de calculette frais Maroc** | Majeur | Frais de notaire 6-8% + TVA + IR — méconnu des acquéreurs étrangers |
| 🟡 **Pas de "similar properties"** | Moyen | Sur fiche bien, pas de "voir aussi" |
| 🟡 **Pas de sticky contact bar** | Moyen | Fiche bien longue → contact se perd en scrollant |
| 🟡 **Pas de share natif** | Moyen | "Envoyer ce bien à un partenaire" par email/WA |
| 🟡 **Pas de simulateur crédit** | Moyen | Partenariat bancaire avec simulation intégrée |
| 🟡 **Pas de carte chaleur transactions** | Moyen | "Biens vendus dans ce quartier récemment" (transparence marché) |
| 🟡 **Core Web Vitals non audités** | Moyen | Lighthouse score inconnu — peut affecter SEO |

### Opportunités (💡 sortent du lot)

1. **Map view avec isochrone** : "Tous les biens à 10 min de la Place Jemaa el-Fna à pied" — pertinent pour cible expat recherchant quartier animé.
2. **Portail acheteur personnalisé post-contact** :
   - Shortlist curée par le conseiller
   - Comparateur side-by-side
   - Timeline achat Maroc-spécifique (CIN, notaire Benjelloun, Titre Foncier, Signature, Remise de clés)
   - Chat avec le conseiller
   - Upload docs (passeport, justificatifs)
3. **Calculette Maroc** : entrer prix → frais notaire, IR sur plus-value (si revente), fiscalité non-résident. **Différenciateur énorme** car spécifique au Maroc.
4. **Biens vendus récemment (transparence)** : graphe des transactions M² par quartier sur 24 mois. Knight Frank fait ça en UK, personne au Maroc.
5. **Concierge digital post-achat** : recommandations artisans, fournisseurs, mobilier, propriété management.

---

## POV #2 — Locataire (B2C)

**Profil type** : mix de 3 cibles :
- **Longue durée** : expat 1-5 ans Marrakech (professionnels, familles)
- **Saisonniers** : vacanciers 1-4 semaines (familles, retraités fortunés)
- **Événementiels** : mariages, retreats, entreprises

**Parcours type** :
1. Recherche "villa à louer Marrakech vacances"
2. Filtres durée + capacité
3. Dispo & prix → contact
4. Visio si longue durée, photos+tour si saisonnier
5. Contrat + caution → check-in

### Ce qui tourne (+)

| Feature | Commentaire |
|---|---|
| ✅ **Distinction longue/saisonnière** | Route /louer + /louer/saisonnier + listing "location-saisonniere" dans DB |
| ✅ **Prix affichés par durée** | /semaine ou /mois visibles |
| ✅ **Fiches biens** | Photos, caractéristiques, équipements |

### Ce qui manque (−)

| Gap | Sévérité | Comparaison |
|---|---|---|
| 🔴 **Pas de calendrier de dispos** | Bloquant | Airbnb / Booking / VRBO : calendrier est LA base. Ici on n'a aucune idée si le bien est libre |
| 🔴 **Pas de booking direct** | Bloquant | Paiement acompte en ligne = standard. Ici tout passe par contact manuel |
| 🔴 **Pas de vérification locataire** | Majeur | KYC pour longue durée (justif pro, rev, garant). Absent |
| 🟠 **Pas de gestion caution** | Majeur | Escrow digital standard (Lodgify, Flatchr) |
| 🟠 **Pas de contrat bail généré** | Majeur | Template FR/EN + signature DocuSign intégrée |
| 🟠 **Pas d'état des lieux digital** | Majeur | Photos horodatées + checklist signée |
| 🟠 **Pas de portail locataire post-contrat** | Majeur | Pas de lieu pour signaler fuite d'eau, demande maintenance |
| 🟡 **Pas de reviews locataires** | Moyen | Trust signal crucial en location courte |
| 🟡 **Pas de sync iCal** | Moyen | Pour propriétaires qui louent aussi sur Airbnb → pas de double-booking |
| 🟡 **Pas de concierge service** | Moyen | "Cuisinier / chauffeur / excursion" — upsell luxe |

### Opportunités

1. **Module Seasonal séparé** : même DB, mais UI dédiée ressemblant à Airbnb/Booking — calendrier + paiement + avis. Très gros marché Marrakech (1-4 semaines ultra-luxe).
2. **Concierge add-on** : facturé en plus — cuisinier, spa privé, excursion Atlas.
3. **Integration iCal multi-canal** : si un bien est aussi sur Airbnb/Booking, sync automatique des dispos.
4. **Portail locataire + maintenance tickets** : fuite d'eau, clim HS, wifi down → signal en 1 clic, l'agence coordonne.

---

## POV #3 — Vendeur (B2C)

**Profil type** : expat qui revend après 5-10 ans de possession (bien valorisé souvent ×2-3), Marocain investisseur qui diversifie, héritier qui revend.

**Parcours type** :
1. Réflexion sur valeur de son bien (veut estimation)
2. Contacte agence pour mandat
3. Signe mandat, laisse les clés
4. Attend... **zone d'ombre totale** (chez 90% des agences)
5. Négociation, offre, signature

### Ce qui tourne (+)

| Feature | Commentaire |
|---|---|
| ✅ **Route `/deposer-un-bien`** | Existe mais formulaire peut-être pas câblé |
| ✅ **Intent "vendre"** dans leads | Pipeline commercial séparable par tabs |
| ✅ **Table `mandates`** existe | Créable/visualisable/clôturable côté admin |
| ✅ **Timeline bien** côté admin | Transparence INTERNE (mais pas exposée au vendeur) |

### Ce qui manque (−)

| Gap | Sévérité | Comparaison |
|---|---|---|
| 🔴 **Pas d'estimation instantanée** | Bloquant | Pricehubble (FR), Homelight (US), Meilleursagents → valeur en 60s |
| 🔴 **Pas de portail vendeur post-mandat** | Bloquant | **Le plus gros gap**. Le vendeur confie, plus aucune visibilité |
| 🔴 **`/deposer-un-bien` non confirmé câblé au CRM** | Majeur | À vérifier en audit code |
| 🟠 **Pas de rapport visites/feedbacks hebdo** | Majeur | "Cette semaine : 3 visites, 1 retour positif, 2 'trop cher'". Silence total aujourd'hui |
| 🟠 **Pas de simulation prix net** | Majeur | Vendeur veut savoir combien il touche après commission + plus-value |
| 🟠 **Pas de signature digitale mandat** | Majeur | DocuSign / YouSign standard |
| 🟠 **Pas de "mon bien sur le site"** | Majeur | Vendeur voudrait se voir sur la shortlist "bien en vedette" |
| 🟡 **Pas de conseil baisse prix auto** | Moyen | "Votre bien a 45j, < seuil de visite, on recommande -3%" |

### Opportunités (gros)

1. **Estimation IA en 60 secondes** : algo sur biens comparables de la DB (même quartier, même type, surface similaire) → fourchette +/- 10%. Différenciateur local majeur.
2. **Portail vendeur post-signature mandat** :
   - Dashboard : trafic sur fiche (vues, appels, visites)
   - Timeline interactions (feedback anonymisé "trop cher", "trop loin", "coup de cœur")
   - Offres reçues
   - Report mensuel auto par email signé par le conseiller
   - Chat asynchrone avec l'agence
   - Actions : "dépublier temporairement", "baisser prix", "promotion"
3. **Reporting fiscal post-vente** : calcul plus-value imposable, conseils avocat partenaire.
4. **Simulation net** : "Votre bien à 1.2M€, commission 5%, plus-value IR 20% sur 200k de gain → vous touchez 1.10M€"

---

## POV #4 — Propriétaire bailleur (B2C)

**Profil type** : expat qui a acheté un riad/villa, habite à l'étranger, veut rentabiliser via location (saisonnière principalement, longue durée secondaire). **Ne veut rien gérer lui-même**.

**Parcours type** :
1. Contacte agence pour gestion locative
2. Signe mandat gestion
3. **Reçoit un virement mensuel** (idéalement)
4. Attend rapport trimestriel
5. Déclare les revenus au fisc

### Ce qui tourne (+)

| Feature | Commentaire |
|---|---|
| ✅ **Presque rien** | Table `properties` permet d'associer un propriétaire |
| ✅ **Mandats** peuvent être de type "gestion" | Théorique, pas de UI dédiée |

### Ce qui manque (− = tout)

| Gap | Sévérité |
|---|---|
| 🔴 **Pas de portail propriétaire** | Bloquant |
| 🔴 **Pas de dashboard revenus** | Bloquant |
| 🔴 **Pas de calendrier réservations** | Bloquant |
| 🔴 **Pas de maintenance tickets** | Bloquant |
| 🔴 **Pas de rapport fiscal** | Bloquant |
| 🔴 **Pas de paiement loyers intégré** | Bloquant |
| 🔴 **Pas d'approval workflow** (valider visites/offres) | Bloquant |

### Opportunités (gros business)

**C'est un produit entier à construire.** Gestion locative = **récurrence** (commission 20-30% des loyers mensuels). Une agence qui gère 50 biens × 5k€/mois × 25% commission = **62.5k€/mois de revenu passif**.

1. **Dashboard propriétaire** :
   - Revenus du mois / année
   - Taux d'occupation (saisonnier)
   - Prochaines réservations
   - Revenus nets après charges (mensuel, trimestriel, annuel)
2. **Maintenance tickets** :
   - Locataire signale un problème
   - Agence dispatche artisan partenaire
   - Propriétaire voit le devis + accepte
   - Dépense tracée dans dashboard
3. **Rapport fiscal annuel auto** :
   - Total revenus bruts
   - Charges déductibles (maintenance, commission agence, taxes)
   - Template déclaration Maroc + FR (pour double imposition)
4. **Paiement loyers** :
   - Virements automatiques (Stripe Connect)
   - Relevés bancaires téléchargeables
5. **Approval workflow** :
   - Nouvelle demande location → notif propriétaire
   - Valide ou refuse en 1 clic
   - Offre achat reçue → notif + accept/counter

**Cf. Smoobu (saisonnier)** et **Flatwise (longue durée FR)** pour benchmarks.

---

## POV #5 — Directeur d'agence (B2B)

**Profil type** : fondateur/directeur, 10-25 ans d'expérience, supervise 4-20 conseillers, vise croissance CA de 15-30%/an.

**Parcours type quotidien** :
1. Ouvre admin le matin
2. Regarde santé pipeline
3. Identifie les SLA breach
4. Assigne/réassigne si besoin
5. Revoit les mandats expirants
6. Check performance conseillers

### Ce qui tourne (+)

| Feature | Commentaire |
|---|---|
| ✅ **Dashboard avec KPIs** | 4 cartes : leads actifs, visites, offres, signés |
| ✅ **Widget répartition équipe** | Dense, scannable, chaque row clickable → portfolio |
| ✅ **Portfolio conseiller** | Cross-objets : leads + mandats + visites + activité |
| ✅ **Admin biens complet** | Filtres, publish/feature, statut, prix, propriétaire, mandat, timeline |
| ✅ **Scope enforcement** | Peut toggler "Mes leads" vs "Équipe entière" |
| ✅ **Cmd+K** navigation rapide | Top-tier feel |
| ✅ **Realtime** | Changements répercutés 500ms chez les autres users |
| ✅ **NBA sur chaque lead** | Décisions assistées |
| ✅ **Timeline bien** | Audit trail conformité |

### Ce qui manque (−)

| Gap | Sévérité | Description |
|---|---|---|
| 🟠 **Pas de forecasting revenus** | Majeur | Pipeline pondéré par probabilité close × valeur = CA prévisionnel |
| 🟠 **Pas d'analytics cohortes** | Majeur | "Leads arrivés en janvier : conversion à 90j = 12%". Absent |
| 🟠 **Pas de funnel complet** | Majeur | lead → contacté → qualifié → visité → offre → signé : taux à chaque stage |
| 🟠 **Pas d'attribution source** | Majeur | Quel canal apporte quels leads ? SEO / referral / social ? |
| 🟠 **Pas d'export CSV / PDF** | Majeur | Reporting externe (investisseurs, comptable, banquier) |
| 🟠 **Pas de notifications push** | Majeur | Doit ouvrir l'app pour voir SLA breach / urgences |
| 🟠 **Pas de goals/targets conseillers** | Majeur | "Idriss doit faire 3 signés ce trimestre, il est à 1" |
| 🟡 **Pas d'intégration comptabilité** | Moyen | Commissions calculées manuellement |
| 🟡 **Pas d'audit trail lisible** | Moyen | Les events existent mais pas de vue "qui a fait quoi" top-down |
| 🟡 **Pas de "team inbox"** | Moyen | Emails communs agence, visibles par tous |
| 🟡 **Pas de calendrier agrégé** | Moyen | Visites de toute l'équipe sur une semaine |

### Opportunités

1. **Forecasting** : pipeline visualisé × probabilité de close par stage → CA prévisionnel 30/60/90 jours. Utile pour décisions embauche, cash-flow.
2. **Leaderboard conseillers** : gamification (signés, revenus, satisfaction clients). Effet motivationnel éprouvé.
3. **Cohort analytics** : retention, conversion, time-to-close par segment.
4. **"Coaching insights"** : "Idriss converti mal après 3 visites. À investiguer."
5. **Weekly board meeting report auto** : PDF généré vendredi soir, distribution lundi matin.

---

## POV #6 — Conseiller / staff (B2B)

**Profil type** : 3-15 ans d'expérience immo, porte 15-40 leads actifs en parallèle + 10-20 mandats actifs. Mobile toute la journée, entre visites et bureau.

**Parcours type quotidien** :
1. Répondre aux messages de la nuit (WhatsApp + email)
2. Traitement des nouveaux leads (SLA)
3. Visites (2-4 par jour)
4. Log post-visite
5. Relances sur leads dormants
6. Échange équipe

### Ce qui tourne (+)

| Feature | Commentaire |
|---|---|
| ✅ **Fiche lead riche** | Profil, bien, parcours, timeline |
| ✅ **NBA actionnable** | Suggestions 1-clic |
| ✅ **Raccourcis `s` / `n` / `c`** | Pattern top-tier |
| ✅ **Timeline events** | Tout est tracé |
| ✅ **Portfolio perso** | Ses leads, mandats, visites |
| ✅ **Scope enforcement** | Ne voit que les siens |
| ✅ **Realtime sync** | Pas besoin de refresh manuel |

### Ce qui manque (− criticaux)

| Gap | Sévérité | Description |
|---|---|---|
| 🔴 **Pas d'intégration email** | Critique | Tous les échanges clients via Gmail perso — invisible du CRM |
| 🔴 **Pas d'intégration WhatsApp** | Critique | Canal dominant au Maroc — manuel à logger |
| 🔴 **Pas de mobile / PWA** | Critique | Conseiller en visite = smartphone uniquement |
| 🔴 **Pas de notifications push** | Critique | Raccrocher après une visite, rappelé sur un nouveau lead urgent — impossible si pas devant son ordi |
| 🟠 **Pas de calendar sync** | Majeur | Visites dans Google/Outlook = double saisie |
| 🟠 **Pas d'auto-relances** | Majeur | Relance à J+3, J+7, J+14 sur leads dormants = manuel |
| 🟠 **Pas de shared inbox** | Majeur | Emails contact@agence dispatchés manuellement |
| 🟠 **Pas de CTI téléphone** | Majeur | Aircall / Twilio → cliquer = appeler + recording auto |
| 🟠 **Pas de templates email UI** | Majeur | Table existe, pas d'éditeur |
| 🟠 **Pas de docs management** | Majeur | Compromis, CNI, attestations — dans Gmail perso |
| 🟡 **Pas d'AI draft email** | Moyen | GPT pour pre-rédiger selon contexte du lead |

### Opportunités

1. **Intégration Gmail/Outlook** : emails entrants/sortants auto-loggés sur la fiche lead (matching par email). ROI colossal.
2. **WhatsApp Business API** : numéro dédié agence, messages répliqués dans le CRM. Canal n°1 au Maroc.
3. **PWA mobile avec push notifications** : *"Nouveau lead urgent — Hans Böhmer · villa 2M€"* reçu même hors app.
4. **Auto-relances programmables** : "Si qualifié et pas de visite à J+7 → relance auto".
5. **AI co-pilot** : sur fiche lead, bouton "Draft email" → GPT écrit en français luxe basé sur le contexte.
6. **CTI** : Aircall ou Twilio. Le client appelle → fiche ouverte automatiquement côté conseiller.

---

## Matrice Impact × Effort

### 🟢 Quick wins (High Impact / Low Effort) — à faire ASAP

| Item | POV | Effort j/h | Impact |
|---|---|---|---|
| Favoris persistant (localStorage) | Acheteur | 0.5 | 🔥🔥 |
| Sticky contact bar fiche bien | Acheteur | 0.25 | 🔥🔥 |
| Similar properties sur fiche | Acheteur | 0.5 | 🔥 |
| Calculette frais Maroc | Acheteur | 0.5 | 🔥🔥🔥 |
| Currency switcher public | Acheteur | 0.5 | 🔥🔥 |
| Export CSV leads/biens | Directeur | 0.5 | 🔥🔥 |
| Notifications push admin | Conseiller + Directeur | 1 | 🔥🔥🔥 |
| Templates email editor UI | Conseiller | 1 | 🔥🔥 |
| Audit `/deposer-un-bien` câblage | Vendeur | 0.25 | 🔥🔥 |
| Estimation fourchette basique | Vendeur | 1-2 | 🔥🔥🔥 |

**Total** : ~6-8 jours équivalents humain — fait monter le score de 6 à 7.5.

### 🟠 Gros chantiers (High Impact / High Effort)

| Item | POV | Effort j/h | Impact |
|---|---|---|---|
| **Map view public** avec clustering | Acheteur | 2-3 | 🔥🔥🔥🔥 |
| **Alertes email saved search** | Acheteur | 2-3 | 🔥🔥🔥 |
| **Portail acheteur personnalisé** | Acheteur | 5-8 | 🔥🔥🔥🔥 |
| **Portail vendeur post-mandat** | Vendeur | 5-8 | 🔥🔥🔥🔥 |
| **Gestion locative complète** | Bailleur | 10-15 | 🔥🔥🔥🔥🔥 |
| **Calendrier dispos + booking** | Locataire | 5-8 | 🔥🔥🔥🔥 |
| **Intégration email Gmail/Outlook** | Conseiller | 3-5 | 🔥🔥🔥🔥🔥 |
| **WhatsApp Business API** | Conseiller | 3-5 | 🔥🔥🔥🔥🔥 |
| **PWA mobile + push** | Conseiller + Directeur | 3-4 | 🔥🔥🔥🔥 |
| **Analytics avancées** | Directeur | 3-5 | 🔥🔥🔥 |
| **i18n FR/EN/AR** | Acheteur | 5-7 | 🔥🔥🔥 |

**Total** : 45-70 jours équivalents humain — 3-4 mois de travail à temps plein pour atteindre le score 9+.

### 🟡 Niche (Low-Medium Impact)

| Item | Raison de différer |
|---|---|
| Virtual tour 360° | Spécialisé, cher, partenariat externe |
| Signature électronique | Intégration tierce (DocuSign 30€/mois) |
| AI draft email | Nice-to-have, pas bloquant |
| Simulateur crédit | Partenariat bancaire requis |

---

## Benchmarks concurrents

### Immo luxe international (référence haute)

| Acteur | Ce qu'ils font mieux |
|---|---|
| **Knight Frank** | Map view, currency switcher, emergency contact 24/7, "Send to a friend" |
| **Sotheby's International Realty** | Editorial content "The Collection", videos sur chaque bien, "Find an agent" par expertise |
| **Christie's Int. Real Estate** | Photography pro, saved searches avec alerts, virtual tours |
| **Engel & Völkers** | Strong brand, mobile-first, multi-country |
| **Barnes International** | Magazine print + digital, expertise premium |
| **Compass (US)** | Tech-first : collections partagées, 3D tours, market analyses |

### CRM immo français/européen

| Acteur | Forces | Faiblesses |
|---|---|---|
| Hektor | Mass market, intégrations portails | UX daté, pas premium |
| Apimo | Complet, mandat + compta | Interface chargée |
| Jestimo | Simple à prendre en main | Peu de features avancées |
| Immonotors (CH) | Premium swiss | Cher, fermé |
| Noslyf (FR) | Gestion loc intégrée | Interface basique |

### Tools spécialisés référence

| Domaine | Tool référence | Leçon |
|---|---|---|
| Saisonnier | Smoobu, Guesty, Lodgify | Sync multi-canal, automation |
| Longue durée | Flatwise (FR), Flatchr | Portail locataire + bailleur + quittances |
| Estimation | Pricehubble, Meilleursagents | 60s, fourchette, source transparente |
| CRM saas | Attio, Folk, Linear | Keyboard-first, inline edit, real-time |

---

## Roadmap prioritaire recommandée

### Phase D — Quick wins acheteur + vendeur (1 semaine)

Transforme l'expérience B2C publique :
- Favoris persistants
- Sticky contact bar
- Similar properties
- Currency switcher
- Calculette frais Maroc
- Estimation vendeur fourchette
- `/deposer-un-bien` câblage audit + fix
- Sticky CTA fiche bien

### Phase E — Map view + alertes + portails (2 semaines)

Saut qualitatif côté acheteur :
- Map view interactive avec clustering
- Alertes email saved search
- Portail acheteur personnalisé (shortlist + timeline + chat)

### Phase F — Portail vendeur + gestion locative basique (3-4 semaines)

Ouvre deux nouveaux business lines :
- Portail vendeur post-mandat (reporting, feedbacks anonymisés)
- Portail bailleur MVP (dashboard revenus, réservations, maintenance tickets basiques)

### Phase G — Intégrations conseiller deep (2-3 semaines)

Saut qualitatif B2B :
- Email sync bi-directionnel (Gmail/Outlook)
- WhatsApp Business API
- PWA mobile + push notifications
- Calendar sync

### Phase H — Analytics + i18n + Enterprise features (2-3 semaines)

- Forecasting, cohortes, funnel
- Export CSV/PDF
- i18n FR/EN (AR plus tard)
- Leaderboard conseillers

---

## Conclusion

**La plateforme a investi 80% dans le staff tools et 20% dans l'expérience client.** Pour une agence qui vend à 60-150k€ le projet, et dont la crédibilité repose sur **l'expérience client impeccable**, ce ratio doit s'inverser avant la prochaine vague de features.

**La prochaine priorité n'est PAS encore une autre couche admin — c'est le portail acheteur personnalisé + map view + alertes email.** Ces 3 items donnent un saut qualitatif massif côté B2C et rendent la démo commerciale bien plus convaincante (un directeur d'agence voit immédiatement la valeur pour SES clients finaux, pas juste pour son équipe).

**Pour MR spécifiquement** : shipper la Phase D (quick wins, ~1 sem) avant le premier client. Phase E (map + portail) payable avec acompte du client. Phases F-H en Platform Partnership (retainer continu).
