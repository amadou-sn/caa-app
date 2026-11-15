# Enregistrements audio

Un fichier par texte et par langue : `audio/<langue>/<clé>.mp3`, où la clé est celle du tableau de traduction avec les points remplacés par des tirets bas.

Exemple : la question sur le visage, clé `fast.etapes.visage`, en wolof → `audio/wo/fast_etapes_visage.mp3`.

L'appli lit l'enregistrement s'il existe, sinon la voix de synthèse du téléphone (français seulement), sinon rien. Il suffit donc de déposer les fichiers ici : rien d'autre à changer.

## Quoi enregistrer en priorité

Pour chaque question : l'aide puis la question, dans la même phrase (`fast.etapes.*`, `anevrisme.etapes.*`), et les deux phrases d'alerte (`fast.alerte.voix`, `anevrisme.alerte.voix`). Soit 9 fichiers par langue pour couvrir toute l'urgence.

## Comment

Un téléphone dans une pièce calme suffit. Parler lentement, comme à une personne affolée. Format mp3, mono, 64 kbit/s : chaque fichier pèse moins de 100 Ko.
