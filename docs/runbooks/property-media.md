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

- `npx tsx scripts/test-property-media.ts` : ordre, non-mutation, allowlist, dates, compression, EXIF, tailles et refus de données invalides.
- `npx tsx scripts/test-property-editor.ts` : champs vides, validation, liste blanche.
- Compilation production et lint ciblé validés.
- Route contrôlée sans session (401) et origine étrangère (403).
- À valider dans une session admin connectée sur une fiche de test : ajout réel, remplacement, annulation, ordre sauvegardé après rechargement, aperçu et bascule brouillon/publication. Aucune fiche réelle modifiée pour cette recette technique.
