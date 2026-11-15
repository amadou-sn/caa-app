# CAA.app

Application web installable pour reconnaître les signes d'un AVC et alerter les secours au Sénégal, pour l'association CAA.

**Prototype.** Les contenus médicaux, les numéros et la liste des hôpitaux restent à valider. Aucun message n'est envoyé aux hôpitaux.

## Organisation du code

| Fichier | Rôle |
|---|---|
| `index.html` | La page et son apparence |
| `core.js` | Le socle : navigation, textes, voix, mémoire, position |
| `config/sn.js` | Réglages du pays : numéros d'urgence, hôpitaux, langues |
| `config/base.js` | Adresse et clé publique de la base de données |
| `i18n/fr.js` | Tous les textes en français |
| `modules/` | Une fonctionnalité par fichier |
| `base/schema.sql` | Structure de la table des statistiques anonymes |
| `sw.js`, `manifest.webmanifest` | Installation sur le téléphone et usage hors connexion |

## Ajouter

- **Une fonctionnalité** : un fichier dans `modules/` qui appelle `CAA.register({id, render})`, une ligne `<script>` dans `index.html`, et ses textes dans `i18n/fr.js`.
- **Un pays** : copier `config/sn.js`.
- **Une langue** : copier `i18n/fr.js`.
