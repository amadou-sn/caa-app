# Robot WhatsApp CAA.app

Le même test des signes d'AVC, par messages WhatsApp, sans rien installer. Le code est dans `index.ts`, prévu pour une fonction Supabase (gratuite).

## Ce qu'il faut créer (une fois)

1. Un compte **Meta for Developers** (developers.facebook.com), une application de type *Business*, et le produit **WhatsApp**.
2. Dans WhatsApp > *API Setup* : noter le **Phone number ID** et générer un **jeton d'accès**. Meta fournit un numéro de test gratuit ; un vrai numéro demande une vérification de l'entreprise (ici, l'association CAA).
3. Dans Supabase > Edge Functions : créer la fonction `whatsapp` avec ce fichier, puis dans *Secrets* : `WA_TOKEN`, `WA_PHONE_ID`, `WA_VERIFY` (un mot de passe au choix).
4. Dans Meta > WhatsApp > *Configuration* : coller l'adresse de la fonction comme **Callback URL**, le `WA_VERIFY` comme *Verify token*, et cocher le champ `messages`.

## Essayer

Envoyer **AVC** au numéro WhatsApp. Le robot pose les quatre questions et donne la conduite à tenir.

## Coûts

Les conversations lancées par l'utilisateur sont gratuites dans la limite mensuelle de Meta (1 000 au moment d'écrire ces lignes). La fonction Supabase est dans l'offre gratuite.

## À faire ensuite

- Garder l'état des conversations dans une table Supabase au lieu de la mémoire.
- Brancher la liste des hôpitaux de `config/sn.js` pour répondre à une position envoyée.
- Versions wolof et pulaar, à partir du tableau de traduction.
