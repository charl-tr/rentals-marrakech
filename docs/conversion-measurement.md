# Conversion v1 — mise en service

- Appliquer `supabase/migrations/0015_conversion_events.sql` avant le déploiement.
- Programmer chaque jour `select public.purge_conversion_events();` pour supprimer les événements et liens de session de plus de 90 jours. Vérifier l’exécution du scheduler avant d’annoncer cette durée comme effective.
- Ajouter une limitation distribuée/edge sur POST `/api/conversion`. La protection en mémoire du serveur est seulement un filet local.
- Tableau direction : `/admin/conversion`, authentification MFA et rôle director requis.
- Contrôler consentement refusé = aucune requête de mesure ; accepté = vue unique par session et bien, ajout favori unique. Une session expire après 30 minutes, sans suivi inter-appareils.
- Envoyer une demande de test (ne pas contacter de vrai prospect). Vérifier meta.funnel_session_id puis les statuts visit_done / signed et le tableau direction. Supprimer le lead de test et ses événements après validation.

## Référence avant lancement (à obtenir de l’agence)

Conserver 28 jours de données comparables de l’ancien site : sessions, sources/campagnes, consultations de fiches, demandes valides et qualifiées, visites réalisées, signatures, commissions nettes réellement encaissées. Documenter les définitions, exclusions de bots, budget acquisition et changements d’inventaire. Ne pas inventer les données manquantes.

Le tableau actuel mesure seulement les sessions consentantes avec fiche et leur rapprochement aux demandes. Les favoris sont une branche facultative, pas une étape obligatoire. Une signature CRM ne prouve ni un paiement ni un effet causal du nouveau site. Séparer les demandes téléphoniques/WhatsApp non attribuées. Pour prouver un uplift, privilégier un test contrôlé ; sinon expliciter les biais d’une comparaison avant/après (saison, sources, budget, stock, délais de vente).

Les événements web restent des déclarations client, soumis aux bloqueurs, au refus et aux bots. Ne pas les utiliser comme registre financier.
