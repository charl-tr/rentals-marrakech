# Runbook — accès à l'espace équipe

## Modèle d'accès

L'application utilise un lien de connexion Supabase sans mot de passe.

1. Le conseiller doit exister dans `public.advisors` avec un email et `active = true`.
2. Il saisit exactement cet email sur `/admin/login`.
3. Au premier accès, Supabase crée l'utilisateur Auth (`shouldCreateUser: true`) et envoie l'email **Confirm signup**.
4. Aux accès suivants, Supabase envoie l'email **Magic link**.
5. Le callback vérifie à nouveau que l'email correspond à un advisor actif avant d'ouvrir l'administration.

Ajouter un advisor à la table autorise donc le premier accès. Il n'est pas nécessaire de créer manuellement un mot de passe ou de supprimer un ancien utilisateur Auth.

## Configuration URL obligatoire

Dans **Supabase → Authentication → URL Configuration** :

- Site URL : `https://rentals-marrakech.vercel.app/`
- Redirect URL production : `https://rentals-marrakech.vercel.app/auth/callback`
- Redirect URL locale : `http://localhost:3000/auth/callback`

Ajouter aussi le callback du futur domaine final lorsqu'il sera connecté. Sans Redirect URL, Supabase peut remplacer le callback demandé par la racine du site et la session serveur ne sera pas créée correctement.

La variable Vercel `NEXT_PUBLIC_SITE_URL` doit pointer vers le même domaine de production, sans chemin.

## Emails brandés

Dans **Supabase → Authentication → Emails** :

- Confirm signup : sujet et HTML de `supabase/templates/confirmation.html`
- Magic link : sujet et HTML de `supabase/templates/magic-link.html`

Ne pas remplacer `{{ .ConfirmationURL }}` : Supabase y injecte le lien sécurisé à usage unique.

## Expéditeur professionnel avec Resend

Le SMTP Supabase par défaut affiche `Supabase Auth <noreply@mail.app.supabase.io>` et convient uniquement aux tests.

Pour la production, configurer **Supabase → Project Settings → Authentication → SMTP Settings** avec le compte Resend du projet :

- Host : `smtp.resend.com`
- Port : `465`
- Username : `resend`
- Password : clé API Resend dédiée à Supabase Auth
- Sender name : `Marrakech Realty`
- Sender email : une adresse sur le domaine vérifié, par exemple `acces@marrakechrealty.com`

Créer une clé Resend dédiée facilite la révocation et l'audit. Ne jamais versionner cette clé dans Git.

## Test avant mise en production

1. Vérifier un premier accès avec une nouvelle adresse advisor : email **Activez votre accès**.
2. Se déconnecter via `/admin/signout`.
3. Vérifier une deuxième connexion : email **Votre lien de connexion**.
4. Vérifier lien expiré ou réutilisé : retour vers `/admin/login?error=invalid_link`.
5. Désactiver temporairement l'advisor et vérifier que le callback refuse l'accès.
6. Contrôler l'affichage Gmail desktop, Gmail mobile et Apple Mail, images désactivées puis activées.

## Retirer un accès

Passer `public.advisors.active` à `false`. Le callback et les pages admin refuseront alors toute nouvelle session. Pour invalider immédiatement les sessions déjà ouvertes, révoquer aussi les sessions de l'utilisateur dans **Authentication → Users**.
