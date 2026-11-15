/* Tous les textes en français. Pour une nouvelle langue : copier ce fichier (wo.js, ff.js) et traduire les valeurs.
   Contenus médicaux À VALIDER par le neurologue référent. */
CAA.textes.fr = {
  voix: {code:'fr-FR'},
  commun: {accueil:'Accueil', retour:'Retour', bientot:'Bientôt', copie:'Copié', ajouter:'Ajouter', supprimer:'Retirer', avalider:'À valider avec la CAA.'},
  urgence: {samu:'SAMU national', pompiers:'Sapeurs-pompiers'},
  nav: {accueil:'Accueil', urgence:'Urgence', hopitaux:'Hôpitaux', reglages:'Réglages'},
  anevrisme: {
    etapes:{
      tete:{nom:'Mal de tête', q:'Un mal de tête brutal et très violent ?', aide:'Arrivé d\'un coup, souvent décrit comme le pire mal de tête de sa vie.'},
      nuque:{nom:'Nuque', q:'La nuque est-elle raide ou douloureuse ?', aide:'Demandez-lui de baisser le menton vers la poitrine.'},
      lumiere:{nom:'Lumière', q:'La lumière la gêne-t-elle, ou vomit-elle ?', aide:'Forte gêne à la lumière, nausées ou vomissements.'}
    },
    alerte:{sur:'Rupture d\'anévrisme possible', voix:'Rupture d\'anévrisme possible. Appelez le SAMU maintenant.', sms:'ALERTE ANEVRISME - CAA.app'},
    doute:{titre:'Pas de mal de tête brutal', texte:'Les signes observés peuvent avoir d\'autres causes. Consultez un médecin aujourd\'hui. Si un mal de tête violent apparaît ou si l\'état s\'aggrave, appelez les secours.'},
    rien:{titre:'Aucun des trois signes repérés', texte:'Cela ne garantit pas l\'absence de problème. Dans le doute, appelez.'}
  },
  comprendre: {
    blocs:[
      {titre:'Qu\'est-ce qu\'un AVC ?', points:['Le sang n\'arrive plus dans une partie du cerveau : un vaisseau est bouché ou s\'est rompu.','Privées de sang, les cellules du cerveau meurent en quelques minutes.','Plus les secours arrivent tôt, plus on sauve de cerveau.']},
      {titre:'Les signes à connaître', points:['Visage : un côté tombe ou ne bouge plus.','Bras : un bras ou une jambe devient faible ou engourdi.','Parole : la personne parle mal ou ne comprend plus.','Heure : notez l\'heure et appelez tout de suite.']},
      {titre:'Les idées fausses', points:['« Ça va passer. » Même si les signes disparaissent, c\'est une alerte : il faut consulter le jour même.','« C\'est une maladie de vieux. » L\'AVC touche aussi des adultes jeunes.','« On verra demain. » Les traitements ne sont possibles que dans les premières heures.']},
      {titre:'Ce qui augmente le risque', points:['La tension élevée, surtout si elle n\'est pas soignée.','Le diabète, le tabac, le manque d\'activité.','Un AVC déjà survenu, chez soi ou dans la famille.']}
    ],
    note:'Contenus à valider et à enrichir par le neurologue référent et la CAA.'
  },
  accueil: {
    titre:'Un AVC ? Chaque minute compte.',
    intro:'Trois questions simples pour reconnaître les signes et alerter les secours.',
    bouton:'Vérifier les signes maintenant', boutonsous:'3 questions · moins d\'une minute',
    urgences:'Urgences · {pays}',
    modules:'Prévenir, suivre, comprendre',
    avertissement:'Cette appli aide à donner l\'alerte. Elle ne pose pas de diagnostic et ne remplace pas un médecin. En cas de doute, appelez le {numero}.'
  },
  mod: {
    fast:{titre:'Vérifier les signes', sous:'Urgence'},
    risque:{titre:'Mon risque d\'AVC', sous:'8 questions · 1 minute'},
    tension:{titre:'Ma tension', sous:'Carnet de mesures'},
    proches:{titre:'Mes proches', sous:'À prévenir en cas d\'alerte'},
    hopitaux:{titre:'Hôpitaux', sous:'Les centres près de vous'},
    apres:{titre:'Après un AVC', sous:'Rééducation, aidants'},
    comprendre:{titre:'Comprendre l\'AVC', sous:'Signes, causes, idées fausses'},
    anevrisme:{titre:'Anévrisme', sous:'Mal de tête brutal'},
    association:{titre:'L\'association CAA', sous:''},
    reglages:{titre:'Réglages', sous:'Langue, voix, données'}
  },
  fast: {
    etape:'{nom} · {n} sur {total}',
    ecouter:'Écouter la question',
    choix:{oui:'Oui', non:'Non', doute:'Je ne suis pas sûr'},
    etapes:{
      visage:{lettre:'V', nom:'Visage', q:'Un côté du visage tombe-t-il ?', aide:'Demandez-lui de sourire ou de montrer les dents.'},
      bras:{lettre:'B', nom:'Bras', q:'Un bras retombe-t-il ou reste-t-il faible ?', aide:'Demandez-lui de lever les deux bras devant elle, dix secondes.'},
      parole:{lettre:'P', nom:'Parole', q:'La parole est-elle confuse ou impossible ?', aide:'Demandez-lui de répéter une phrase simple.'},
      debut:{lettre:'H', nom:'Heure', q:'Quand les signes ont-ils commencé ?', aide:'L\'heure de début guide le traitement à l\'hôpital.'}
    },
    debuts:['À l\'instant','Moins d\'une heure','Entre 1 h et 4 h','Plus de 4 h','Inconnu'],
    alerte:{
      sur:'Signes d\'AVC possibles', titre:'Appelez le SAMU maintenant', voix:'Signes d\'AVC possibles. Appelez le SAMU maintenant.',
      appeler:'Appeler le {numero}', copier:'Copier le numéro', sinon:'Pas de réponse ? {nom} : {numero}',
      observe:'Ce que vous avez observé', horloge:'Alerte donnée à {heure} · début des signes : {debut}',
      ou:'Où êtes-vous ?', cherche:'Recherche de votre position GPS…', gpsok:'Position GPS trouvée : {lat}, {lon}',
      gpsko:'GPS indisponible. Indiquez où vous êtes :', lieu:'Quartier et ville', lieuex:'Ex. : Grand Yoff, Dakar',
      repere:'Un repère connu à côté', repereex:'Ex. : en face de la mosquée, près du marché', regps:'Réessayer le GPS',
      proche:'Centre le plus proche : {nom}, à environ {km} km',
      message:'Message d\'alerte', envoyer:'Envoyer l\'alerte',
      simulation:'Simulation. Aucun message n\'a été envoyé. L\'envoi réel sera branché plus tard, avec les numéros validés par les hôpitaux.',
      proches:'Vos proches recevront le même message : {noms}.', sansproches:'Aucun proche enregistré. Ajoutez-les depuis l\'accueil, dans « Mes proches ».',
      attente:'En attendant les secours',
      gestes:['Allongez la personne, tête légèrement surélevée.','Ne lui donnez rien à manger, ni à boire, ni aucun médicament.','Restez avec elle et gardez l\'heure de début en tête.'],
      refaire:'Recommencer le test'
    },
    rien:{sur:'Résultat', titre:'Aucun des trois signes repérés',
      texte:'Cela ne garantit pas l\'absence d\'AVC. Mal de tête violent et soudain, trouble de la vue, perte d\'équilibre : dans le doute, appelez.', refaire:'Refaire le test'},
    sms:{titre:'ALERTE AVC - CAA.app', heure:'Heure alerte : ', debut:'Début signes : ', gps:'GPS : ', lieu:'Lieu : ', repere:'Repère : ', inconnu:'Position : non précisée'}
  },
  risque: {
    etape:'Question {n} sur {total}',
    questions:{
      age:{q:'Quel âge avez-vous ?', opts:['Moins de 40 ans','40 à 49 ans','50 à 59 ans','60 ans ou plus']},
      sexe:{q:'Vous êtes…', opts:['Une femme','Un homme']},
      hta:{q:'Avez-vous de l\'hypertension ?', aide:'La tension élevée est la première cause d\'AVC.', opts:['Oui','Non','Je ne sais pas'],
        conseil:'Tension : faites-la contrôler et suivez le traitement prescrit.', verifier:'Faites mesurer votre tension, en pharmacie ou au poste de santé.'},
      diabete:{q:'Avez-vous du diabète ?', opts:['Oui','Non','Je ne sais pas'], conseil:'Diabète : un suivi régulier réduit le risque.', verifier:'Demandez un contrôle de votre glycémie.'},
      tabac:{q:'Fumez-vous ?', opts:['Oui','Non'], conseil:'Tabac : arrêter de fumer réduit le risque.'},
      sedentaire:{q:'Bougez-vous moins de 30 minutes par jour ?', aide:'Marche, travaux, sport : tout compte.', opts:['Oui','Non'], conseil:'Activité : 30 minutes de marche par jour suffisent.'},
      cholesterol:{q:'Vous a-t-on dit que votre cholestérol est élevé ?', opts:['Oui','Non','Je ne sais pas'], conseil:'Cholestérol : parlez-en à un soignant.', verifier:'Demandez un bilan de cholestérol lors d\'une prochaine consultation.'},
      famille:{q:'Un parent proche a-t-il fait un AVC ?', aide:'Père, mère, frère ou sœur.', opts:['Oui','Non','Je ne sais pas']}
    },
    sur:'Votre niveau de risque', score:'{n} points sur {max}',
    niveaux:{bas:'Risque bas', moyen:'Risque moyen', eleve:'Risque élevé'},
    messages:{bas:'Continuez ainsi. Refaites le point une fois par an.', moyen:'Parlez-en à un soignant lors de votre prochaine consultation.', eleve:'Consultez un médecin rapidement pour faire le point.'},
    changer:'Ce que vous pouvez changer', verifier:'À faire vérifier',
    note:'Ce score est un repère de prévention, pas un diagnostic. Le barème reste à valider par le neurologue référent.',
    refaire:'Refaire le questionnaire', suite:'Noter ma tension'
  },
  tension: {
    nouvelle:'Nouvelle mesure', sys:'Chiffre du haut', dia:'Chiffre du bas', exsys:'Ex. : 135', exdia:'Ex. : 85', noter:'Enregistrer la mesure',
    erreur:'Vérifiez les deux chiffres : le chiffre du haut est le plus grand (par exemple 135 et 85).',
    derniere:'Dernière mesure', evolution:'Évolution du chiffre du haut', seuil:'seuil 140', historique:'Mes mesures',
    vide:'Aucune mesure pour l\'instant. Notez votre tension après chaque prise, en pharmacie ou au poste de santé.',
    niveaux:{bas:'Dans la norme', moyen:'Élevée', eleve:'Très élevée'},
    messages:{bas:'Continuez à la surveiller régulièrement.', moyen:'Montrez vos mesures à un soignant.', eleve:'Consultez sans attendre. En cas de malaise, appelez le {numero}.'},
    note:'Seuils indicatifs (140/90 et 180/120), à valider par le neurologue référent.'
  },
  proches: {
    intro:'Ces personnes seront prévenues en même temps que les secours. Leurs numéros restent sur ce téléphone.',
    nom:'Prénom ou nom', numero:'Numéro de téléphone', exnom:'Ex. : Awa', exnum:'Ex. : 77 123 45 67',
    vide:'Aucun proche enregistré.', max:'Cinq proches au maximum.', erreur:'Indiquez un nom et un numéro.'
  },
  hopitaux: {
    autour:'Trier par distance', cherche:'Recherche de votre position…', gpsko:'GPS indisponible. Choisissez votre région :',
    toutes:'Toutes les régions', distance:'à environ {km} km',
    services:{neurologie:'Neurologie', neurochirurgie:'Neurochirurgie', urgences:'Urgences'},
    note:'Liste indicative, à valider avec la CAA. En urgence, appelez d\'abord le {numero} : le SAMU choisit l\'hôpital.'
  },
  apres: {
    blocs:[
      {titre:'La rééducation', points:['Elle commence le plus tôt possible, dès l\'hôpital.','Kinésithérapie pour le mouvement, orthophonie pour la parole.','Les progrès continuent pendant des mois : la régularité compte plus que l\'intensité.']},
      {titre:'Pour les aidants', points:['Laissez la personne faire seule ce qu\'elle peut faire.','Tristesse durable, perte d\'envie : parlez-en au médecin, c\'est fréquent après un AVC.','Prenez des relais. Un aidant épuisé ne peut plus aider.']},
      {titre:'Éviter un deuxième AVC', points:['Prendre le traitement tous les jours, même quand tout va bien.','Faire contrôler la tension régulièrement.','Au moindre signe, refaire le test et appeler les secours.']}
    ],
    note:'Contenus à valider et à enrichir par le neurologue référent et la CAA.'
  },
  reglages: {
    langue:'Langue', avenir:'traduction à venir', voix:'Lire les questions à voix haute',
    voixnote:'La voix française dépend du téléphone. Le wolof et le pulaar passeront par des enregistrements.',
    donnees:'Statistiques anonymes', accord:'J\'accepte que mes réponses servent aux statistiques de la CAA',
    accordnote:'Jamais de nom, de numéro ni de position exacte. L\'appli fonctionne pareil si vous refusez.',
    journal:'{n} événement(s) anonyme(s) enregistré(s) sur ce téléphone.', apercu:'Dernier enregistrement :',
    effacer:'Effacer toutes mes données', confirmer:'Confirmer l\'effacement', efface:'Données effacées.'
  }
};
