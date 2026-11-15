# Publier CAA.app sur le Play Store

L'appli web installable peut être emballée pour Android sans réécrire une ligne de code. Coût : 25 $ une seule fois (compte développeur Google Play).

## Étapes

1. **Compte Google Play Console** : play.google.com/console, 25 $ une fois. Le compte doit être au nom de l'association CAA si l'appli est publiée en son nom (prévoir les documents de l'association pour la vérification).
2. **Générer le paquet Android** avec PWABuilder (gratuit, pwabuilder.com) :
   - coller l'adresse de l'appli : `https://amadou-sn.github.io/caa-app/`
   - *Package for stores* > *Android* > télécharger le fichier `.aab` et le fichier `assetlinks.json`.
3. **Déposer `assetlinks.json`** dans le dépôt, dans un dossier `.well-known/`, et pousser : c'est ce qui prouve que l'appli et le site sont à nous (sinon une barre d'adresse s'affiche dans l'appli).
4. **Créer l'application** dans la Play Console : nom *CAA.app*, catégorie *Médecine*, gratuite.
5. **Fiche** : description courte et longue (reprendre `01_PRESENTATION_PROJET_CAA_APP.md`), icône 512 × 512 (`icon-512.png` dans le dépôt), au moins 2 captures d'écran de téléphone.
6. **Questionnaires obligatoires** : classification du contenu, sécurité des données (déclarer : position utilisée pour l'alerte, pas de compte, statistiques anonymes facultatives), et la **déclaration « application de santé »** : CAA.app n'est pas un dispositif médical de diagnostic, c'est un outil d'alerte et d'information. Le disclaimer de l'appli doit être repris dans la fiche.
7. **Politique de confidentialité** : une page en ligne est exigée. Elle peut être une page du dépôt (`docs/confidentialite.md` à écrire avec la CAA).
8. **Test interne** d'abord (jusqu'à 100 testeurs par lien), puis **production**.

## Ce que Google vérifiera de près

Une appli de santé qui parle d'urgence vitale est examinée avec attention. Il faut : le disclaimer visible, aucune promesse de diagnostic, une politique de confidentialité claire, et idéalement le nom de l'association et de son référent médical dans la fiche. La validation médicale par le neurologue doit donc précéder la publication.

## iPhone

Sur iPhone, l'appli s'installe déjà depuis Safari (Partager > Sur l'écran d'accueil). L'App Store demande 99 $ par an et un Mac : à reporter.
