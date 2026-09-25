# Templates Supabase Auth

Ces fichiers sont la source versionnée des emails d'accès à l'espace équipe.

| Événement Supabase | Sujet | Fichier |
|---|---|---|
| Confirm signup | `Activez votre accès — Marrakech Realty` | `confirmation.html` |
| Magic link | `Votre lien de connexion — Marrakech Realty` | `magic-link.html` |

Le template `Confirm signup` est utilisé au premier accès d'un conseiller. Les connexions suivantes utilisent `Magic link`. Les deux doivent donc rester alignés visuellement.

Après une modification, recopier le sujet et le HTML dans **Supabase → Authentication → Emails** puis envoyer un email de test. Le détail de configuration est dans `docs/runbooks/admin-auth.md`.
