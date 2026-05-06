# Runbook — Supabase project paused

## Objectif

Réveiller le projet Supabase quand il a été mis en pause par le free tier (inactivité > 7 jours).

## Symptômes

- Build Vercel échoue avec :
  ```
  TypeError: fetch failed
  Caused by: Error: getaddrinfo ENOTFOUND bjdcdtwfqlmvwxkrfklt.supabase.co
  ```
- `nslookup bjdcdtwfqlmvwxkrfklt.supabase.co` retourne `NXDOMAIN`.
- Local : `npm run dev` lance mais toutes les pages retournent une erreur Supabase 500.

## Cause racine

Supabase free tier met un projet en pause après **7 jours sans activité** (= aucune requête API, ni admin dashboard, ni runtime). Quand un projet est paused :
- Compute coupé.
- DNS du hostname API supprimé temporairement.
- Données conservées intactes.

## Étapes

1. Aller sur [le dashboard Supabase](https://supabase.com/dashboard/project/bjdcdtwfqlmvwxkrfklt).
2. Si le projet est paused, un bandeau "Project is paused" apparaît avec un bouton **"Restore project"** (ou "Resume").
3. Cliquer. Le réveil prend ~30-60 secondes.
4. Attendre l'écran "Project is healthy" sur le dashboard.

Pendant ce temps, vérifier que le DNS résout à nouveau :

```bash
nslookup bjdcdtwfqlmvwxkrfklt.supabase.co
# Devrait retourner une IP, pas NXDOMAIN
```

Une fois résolu, retourner sur Vercel → deployment qui a échoué → menu trois points en haut à droite → **Redeploy**.

## Vérification

- Build Vercel passe (logs propres dans le dashboard).
- `https://rentals-marrakech.vercel.app` charge et affiche les biens.
- Login admin fonctionne.

## Prévention

Trois options classées par préférence :

1. **Trafic réel** : un site déployé qui sert régulièrement des pages garde Supabase éveillé. Le runbook devient inutile dès qu'on a quelques visites/semaine.
2. **Upgrade Pro tier** ($25/mois) — pas de pause. Solution propre dès qu'on a un usage commercial sérieux.
3. **Heartbeat externe** : cron qui ping Supabase toutes les 6 jours. Bricolage, à éviter sauf nécessité absolue.

## Notes

- Si le projet est paused depuis **plus de 90 jours**, Supabase peut le supprimer (warning 30 jours avant). Restorer dès qu'on revient sur le projet.
- Les credentials (anon key, service role key) restent valides après restore — pas besoin de les changer dans Vercel.
