# Runbook — accès à l'espace équipe

## Modèle d'accès

L'application utilise un lien de connexion Supabase sans mot de passe comme
premier facteur, puis un code TOTP comme second facteur obligatoire.

1. Le conseiller doit exister dans `public.advisors` avec un email et `active = true`.
2. Il saisit exactement cet email sur `/admin/login`.
3. Au premier accès, Supabase crée l'utilisateur Auth (`shouldCreateUser: true`) et envoie l'email **Confirm signup**.
4. Le callback lie définitivement l'UUID `auth.users` au profil dans la table privée `public.advisor_auth`.
5. L'utilisateur scanne une seule fois le QR code TOTP, puis confirme le code à 6 chiffres.
6. Aux accès suivants, Supabase envoie l'email **Magic link**, puis demande le code TOTP déjà configuré.
7. Le CRM et ses policies RLS refusent toute session qui n'est pas au niveau `aal2`.

Ajouter un advisor à la table autorise donc le premier accès. Il n'est pas nécessaire de créer manuellement un mot de passe. Après la première liaison, une modification de l'email du profil ne transfère pas l'accès à un autre compte : l'identité repose sur l'UUID Auth.

## Ordre de déploiement

1. Appliquer `0011_restore_public_content_rls.sql`, `0012_admin_identity_and_mfa.sql`, puis `0013_sensitive_data_hardening.sql` dans Supabase.
2. Vérifier que `public.advisor_auth` contient la liaison de l'utilisateur existant.
3. Déployer le code applicatif.
4. Tester le parcours dans une fenêtre privée avant de fermer la session Supabase Dashboard.

Ne pas déployer le code MFA avant la migration `0012` : le callback attend la table de liaison privée.

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
5. Au premier accès, vérifier l'enrôlement QR puis l'arrivée dans le CRM après le code TOTP.
6. Se reconnecter et vérifier que le QR n'est plus présenté, seulement le challenge à 6 chiffres.
7. Tenter d'ouvrir `/admin` après le magic link mais avant le TOTP : redirection obligatoire vers `/admin/mfa`.
8. Désactiver temporairement l'advisor et vérifier que le callback refuse l'accès.
9. Contrôler l'affichage Gmail desktop, Gmail mobile et Apple Mail, images désactivées puis activées.

## Perte ou changement d'authentificateur

Si l'utilisateur a encore accès à son TOTP, il utilise **Profil → Sécurité du compte → Changer d'authentificateur**. Le facteur est supprimé, la session est fermée, puis un nouveau QR est proposé au prochain login.

S'il n'a plus accès au TOTP, un administrateur du projet doit supprimer le facteur depuis **Supabase → Authentication → Users → utilisateur → MFA factors**. Ne pas supprimer l'utilisateur Auth : cela casserait la liaison d'identité et invaliderait son historique.

## Retirer un accès

Passer `public.advisors.active` à `false`. Le callback, les pages admin et les policies RLS refusent alors l'accès. Pour invalider immédiatement les sessions déjà ouvertes, révoquer aussi les sessions de l'utilisateur dans **Authentication → Users**.
