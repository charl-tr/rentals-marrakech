# Préparation de la démo — 27 septembre 2026

## Verdict

Le parcours public testé est présentable en local. Ce n’est pas une validation de mise en production complète : une répétition authentifiée du CRM, l’envoi réel des emails et la recette du déploiement restent nécessaires.

Audit ciblé avec captures desktop/mobile, tests fonctionnels publics et revue du code admin. Aucun bien, contact ou compte réel modifié pour les tests. La méthode d’audit visuel a notamment révélé l’encombrement de la capture email sur mobile et le manque de contraste de la navigation intérieure.

## Corrections effectuées

- Catalogue compact ; navigation À vendre / Vendus explicite ; premières photos visibles au premier écran desktop.
- Navigation intérieure sable avec logo contrasté, sans ancien voile sombre sur fond clair.
- Admin : vues À vendre / Sous compromis / Vendus / Tous les biens, adaptées à la location. Les compteurs de transaction indiquent les disponibles, pas toutes les archives. Anciens paramètres de statut normalisés.
- Recherche admin synchronisée avec l’URL et nettoyage du délai de recherche ; libellé Disponible restauré dans les fiches.
- Éditeur : saisie contrôlée pour conserver les valeurs après une réponse de validation ; abandon explicite réinitialise les champs. Sauvegarde réelle non testée cette session.
- Suppression du bouton Nouveau bien inactif. Création de biens NON implémentée. Le bouton de nouvelle demande renvoie désormais vers les biens, où existe la saisie contextualisée.
- Cartes : lien de fiche indépendant des boutons favoris/comparaison, focus visible et localisation sans séparateur orphelin.
- Favoris : stockage validé, repli en mémoire si stockage refusé, erreur de chargement avec bouton Réessayer, indication des fiches retirées de publication.
- Capture email repliée par défaut ; confirmation honnête selon le résultat du transport, accès au lien de sélection même si l’email échoue. Absence de clé Resend ne simule plus un succès et ne journalise plus le destinataire.
- Comparateur : quatrième ajout refusé sans remplacer un bien ; ordre de sélection conservé ; plus de rendu initial de tout le catalogue avant hydratation ; valeurs inconnues affichées comme telles ; loyers avec période ; pas de classement financier entre transactions/périodes différentes ; suppression de « plus premium » déduit du prix.
- Suggestions acheteurs : biens vendus/loués/réservés exclus ; aucun score sans critère ; prix inconnu non considéré dans le budget. Score normalisé sur les critères renseignés, pas une probabilité de vente.
- Permissions : recherche globale et suggestions utilisent les demandes du portefeuille autorisé. Lecture du catalogue admin gardée par la session. Ces changements ont été revus dans le code, pas testés avec deux comptes réels.
- Texte promettant des notifications WhatsApp automatiques retiré : cette intégration n’est pas branchée.

## Parcours vérifiés dans le navigateur

1. Catalogue acheter : 314 biens au moment du test ; Appartement → 75 ; 4 chambres minimum → 1 fiche affichant 4 chambres.
2. Ajout du bien VE25334 aux favoris ; rechargement et navigation vers Favoris : bien conservé.
3. Mobile 390 × 844 : favoris compacts, fiche sans débordement horizontal ; ouverture de fiche à scrollY = 0 ; aucune image cassée détectée sur la fiche testée.
4. Biens vendus : 406 fiches affichées au moment du test, badge Vendu visible, avertissement sur les prix historiques ; ouverture du panneau de filtres et du choix de chambres sur mobile.
5. Comparateur : trois ajouts, refus explicite du quatrième, trois biens conservés. Tableau vérifié après rechargement : salles de bain non renseignées, prix et ordre cohérents.
6. Accès /admin/biens sans session : renvoi vers la connexion, pas d’inventaire exposé dans l’interface.

Les favoris et comparaisons ajoutés pour les tests sont retirés après vérification. Les nombres ci-dessus sont des observations du catalogue, pas un rapprochement exhaustif avec WordPress.

Captures locales : `/tmp/marrakech-demo-audit-2026-09-27/` (favoris-mobile.png, fiche-mobile.png, vendus-mobile.png, comparateur-desktop.png). Fichiers temporaires : à conserver ailleurs si nécessaires durablement.

## Vérifications techniques

- TypeScript : valide.
- Build Next de production : valide lors de cette session ; avertissements de dépréciation Sentry seulement.
- Tests : filtres numériques et valeurs manquantes ; éditeur/validation ; tri et statuts admin ; stockage de sélection ; suggestions acheteurs.
- ESLint ciblé sur les composants principaux modifiés : valide. Ce n’est pas un lint intégral historique du dépôt.
- Pas de mesure Lighthouse/Core Web Vitals production durant cet audit ; ne pas annoncer de score ni de gain commercial mesuré.

## À faire avant la présentation

1. Se connecter à l’admin avant le rendez-vous ; ouvrir Biens, une fiche puis les demandes liées. Répéter une sauvegarde sur un bien de test explicitement identifié, avec restauration des valeurs.
2. Déployer les corrections et refaire le parcours public sur Vercel. Le travail de cette session est local, pas automatiquement déployé.
3. Emails : RESEND_API_KEY et expéditeur absents de la configuration locale. Le SMTP Supabase Auth est une configuration distincte ; tester séparément connexion, sélection et notifications. Pas d’envoi réel vérifié.
4. Ne pas présenter création de bien, WhatsApp automatique ou centralisation automatique des appels comme déjà livrés. L’édition visuelle des photos est maintenant implémentée localement : recette authentifiée et déploiement encore à valider, voir `runbooks/property-media.md`.

## Hors démo : conditions avant remplacement du site actuel

- Références en doublon : migration d’unicité 0017 à valider après rapprochement, pas à appliquer aveuglément.
- SEO : recetter le mapping des anciennes URLs, les canonical, le domaine et les règles robots. Le code contient encore un blocage /_next/ dans robots et des redirections EN vers l’accueil ; ne pas déclarer la migration SEO terminée.
- Cartographie : coordonnées actuellement dérivées du quartier/centre-ville dans le mapping, donc pas des adresses exactes. Clarifier leur caractère indicatif dans toute présentation ; ne pas les vendre comme géolocalisation précise.
- Source de vérité et multidiffusion : confirmer avec l’agence ses outils actuels avant bascule.
- Permissions : recette directeur/conseiller, tests des liens privés et actions serveur avant production. Cette revue n’est pas un pentest.

## Démo de 5 minutes

1. **Trouver** : catalogue → type → chambres. « On arrive au bon bien sans parcourir tout le portefeuille. »
2. **Choisir** : fiche, photos, deux ou trois favoris, comparaison. « La sélection reste disponible, sans imposer un compte. »
3. **Contacter** : montrer le formulaire contextualisé sans envoyer de faux lead. « L’agence reçoit le bien concerné et le contexte utile. »
4. **Traiter** : session admin déjà ouverte → À vendre → fiche → demandes liées et prochaine action. « L’équipe sait qui relancer et sur quel bien. »
5. **Mesurer** : expliquer les événements et les limites d’attribution. Ne pas présenter un clic WhatsApp comme une conversation, ni promettre un doublement de revenus.

Promesse défendable : simplifier la recherche pour les clients et le suivi pour les conseillers. Les gains se mesurent ensuite ; ils ne se déduisent pas du seul design.
