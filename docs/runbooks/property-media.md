# Édition des fiches et photos — 27 septembre 2026

## Parcours livré dans le code local

- Champs groupés à gauche ; galerie / aperçu simplifié de la saisie à droite sur desktop. Les deux panneaux défilent séparément ; empilement sur mobile.
- Galerie : ajout multiple depuis l’ordinateur, remplacement, retrait annulable, choix de couverture, déplacement par flèches ou glisser-déposer desktop.
- Enregistrement explicite de l’ensemble. Un transfert seul ne modifie pas la fiche. Les erreurs de transfert n’effacent pas les photos existantes.
- Brouillon = `published=false`. Dépublier retire la fiche du site ; il ne s’agit PAS d’une seconde version de travail parallèle à la fiche publique.
- Date de dernière mise à jour dans l’éditeur, et contrôle de concurrence par `updated_at` lors de l’enregistrement.
- Référence verrouillée côté formulaire et serveur ; slug affiché, non modifiable. Cela ne résout pas les doublons historiques d’import, qui nécessitent une décision métier séparée.
- Annuler/rétablir dans la session de saisie (100 étapes maximum), remise à la version chargée avec confirmation et lien retour protégé contre l’abandon involontaire. Ce n’est pas un historique de versions après enregistrement.
- Visionneuse en grand format, gros plan ×2, navigation clavier et fermeture Échap via dialogue natif.
- Masquage conditionnel des périodes en vente et des caractéristiques logement non renseignées pour les terrains ; valeurs conservées lors des changements de catégorie.
- Import texte : décodage HTML complet, paragraphes et listes conservés. Résumés techniques reconnus et remplacés par un extrait lors des futurs imports. Pour les fiches existantes, proposition de correction explicite dans l’éditeur, sans écriture massive en base.

## Stockage et limites

- Nouvelles images dans le bucket Supabase `properties`, chemins uniques `admin/<slug>/<uuid>.webp`, sans écrasement.
- JPG/PNG/WebP uniquement, source <=20 Mo, galerie <=100 photos. Compression navigateur puis validation et réencodage serveur, dimension maximale 2000 pixels. Les métadonnées EXIF ne sont pas conservées.
- Le bucket existant est PUBLIC : même avant publication, une image téléchargée est accessible à qui possède son URL. N’y déposer aucun document confidentiel.
- Les images WordPress existantes restent externes jusqu’à leur copie. Le bouton « Copier dans l’app » copie une image déjà rattachée à ce bien, depuis le seul domaine autorisé et sans redirection. Pas de migration massive.
- Retirer une image de la galerie ne détruit pas le fichier sous-jacent. Les transferts abandonnés restent dans le stockage. Prévoir un nettoyage des fichiers orphelins avec délai de récupération avant une exploitation prolongée ; aucun nettoyage destructif automatique ajouté ici.
- Upload et édition restent réservés au directeur authentifié, selon les permissions existantes. Pas d’élargissement des droits conseillers.

## Recette

### Navigation et actions rapides

- Visibilité via un switch accessible, sans confirmation supplémentaire : animation optimiste, verrouillage pendant la sauvegarde, retour à l’état confirmé et message en cas d’échec. Statut commercial indépendant.
- Fiche : en-tête, éditeur et sections CRM rendus séparément via Suspense. Les requêtes des demandes/mandat/historique ne bloquent plus l’éditeur.
- Projection portefeuille réduite aux champs utilisés (pas de descriptions longues, contenu éditorial ou données propriétaire). Sur les mêmes 250 lignes : 1 015 028 → 595 243 octets (-41 %). Mesure ponctuelle directe : 222 ms avant, 232 ms après, donc aucun gain de latence réseau démontré par cet échantillon. Temps de navigation authentifiée Vercel restant à mesurer.
- Lecture de fiche en cache serveur 15 secondes, invalidée par les mutations ; contrôle d’accès à chaque appel, copie avant masquage des informations propriétaire selon le rôle.

- En-tête de fiche compact : un seul retour au portefeuille (filtres conservés), un seul lien public, aucune action « Modifier » redondante. Date dans une ligne utilitaire ; slug sous une disclosure.
- Liste et grille : statut commercial modifiable sur place, bouton publier/masquer indépendant, confirmations pour clôture et visibilité. Permissions directeur inchangées ; contrôle de concurrence et invalidation des caches publics/admin.
- Une modification peut retirer la ligne du filtre courant (par exemple vendu dans « À vendre ») : c’est attendu, retrouver le bien dans le filtre des vendus.
- Photos de liste 112 × 80, grille à trois colonnes desktop, visionneuse sans ouvrir la fiche. Chargement différé des images ; pagination 32 conservée.
- Lecture du portefeuille sans payload brut d’import ni HTML d’origine. Aucun gain de latence chiffré sans mesure authentifiée.

- `npx tsx scripts/test-property-media.ts` : ordre, non-mutation, allowlist, dates, compression, EXIF, tailles et refus de données invalides.
- `npx tsx scripts/test-property-editor.ts` : champs vides, validation, liste blanche.
- Compilation production et lint ciblé validés.
- Route contrôlée sans session (401) et origine étrangère (403).
- À valider dans une session admin connectée sur une fiche de test : ajout réel, remplacement, annulation, ordre sauvegardé après rechargement, aperçu et bascule brouillon/publication. Aucune fiche réelle modifiée pour cette recette technique.
