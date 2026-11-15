/* Réglages du pays. Pour ouvrir l'appli à un autre pays : copier ce fichier et changer les valeurs.
   Deux listes distinctes :
   - avc : les SEULS établissements qui ont un service capable de prendre en charge un AVC (neurologie, neurochirurgie).
     Ce sont eux qui apparaissent sur la carte et qui reçoivent l'alerte. À VALIDER avec la CAA.
   - config/centres.js : toutes les structures de santé du pays, pour proposer la plus proche, où que l'on soit.
   valide:false = numéro non confirmé, l'appli ne le pré-remplit pas dans les SMS. */
CAA.pays = {
  code: 'SN',
  nom: 'Sénégal',
  urgences: [
    {id:'samu', numero:'1515', principal:true},
    {id:'pompiers', numero:'18'}
  ],
  langues: [
    {code:'fr', nom:'Français', pret:true},
    {code:'wo', nom:'Wolof', pret:false},
    {code:'ff', nom:'Pulaar', pret:false}
  ],
  avc: [
    {id:'fann', nom:'CHNU de Fann', ville:'Dakar', region:'Dakar', lat:14.693, lon:-17.466, services:['neurologie'], tel:'+221 33 825 36 78', valide:false, defaut:true},
    {id:'hogip', nom:'Hôpital Général Idrissa Pouye', ville:'Grand Yoff, Dakar', region:'Dakar', lat:14.737, lon:-17.455, services:['neurologie','neurochirurgie'], tel:'+221 33 869 40 50', valide:false},
    {id:'principal', nom:'Hôpital Principal de Dakar', ville:'Plateau, Dakar', region:'Dakar', lat:14.661, lon:-17.436, services:['neurologie'], tel:'', valide:false},
    {id:'pikine', nom:'Centre Hospitalier National de Pikine', ville:'Pikine', region:'Dakar', lat:14.750, lon:-17.390, services:['neurologie'], tel:'+221 33 853 00 71', valide:false},
    {id:'thies', nom:'Centre Hospitalier Régional de Thiès', ville:'Thiès', region:'Thies', lat:14.790, lon:-16.930, services:['neurochirurgie'], tel:'+221 33 836 36 94', valide:false},
    {id:'kaolack', nom:'CHR El Hadji Ibrahima Niass', ville:'Kaolack', region:'Kaolack', lat:14.150, lon:-16.070, services:['neurochirurgie'], tel:'', valide:false},
    {id:'ziguinchor', nom:'Hôpital Régional de Ziguinchor', ville:'Ziguinchor', region:'Ziguinchor', lat:12.560, lon:-16.270, services:['neurologie'], tel:'+221 30 107 48 20', valide:false}
  ],
  /* Filière d'évacuation : quand le centre de santé le plus proche est dans une de ces régions, l'alerte va au service
     indiqué plutôt qu'au service AVC le plus proche à vol d'oiseau (les routes ne suivent pas la ligne droite). À VALIDER. */
  evacuation: {'Saint-Louis':'fann', 'Matam':'fann', 'Louga':'fann'},
  /* Carte schématique (repli sans réseau) : contour simplifié du pays en (longitude, latitude). */
  carte: {
    lon0:-17.65, lat0:16.8, echelle:100, largeur:640, hauteur:460,
    contour:[[-16.52,16.06],[-16.1,16.45],[-15.6,16.52],[-15.0,16.62],[-14.4,16.62],[-13.9,16.2],[-13.4,16.1],[-13.15,15.5],[-12.7,15.3],[-12.25,14.85],[-12.0,14.4],[-11.75,13.9],[-11.4,13.2],[-11.45,12.45],[-12.1,12.4],[-13.0,12.45],[-13.7,12.65],[-14.5,12.68],[-15.5,12.45],[-16.3,12.35],[-16.75,12.45],[-16.8,12.85],[-16.75,13.15],[-16.7,13.6],[-16.85,14.1],[-17.15,14.55],[-17.5,14.72],[-17.2,14.95],[-16.95,15.4],[-16.6,15.85]],
    trous:[[[-16.75,13.15],[-15.0,13.2],[-13.8,13.3],[-13.8,13.5],[-15.0,13.55],[-16.7,13.6]]],
    villes:[['Dakar',-17.45,14.69],['Thiès',-16.93,14.79],['Saint-Louis',-16.5,16.03],['Kaolack',-16.07,14.15],['Ziguinchor',-16.27,12.56],['Tambacounda',-13.67,13.77],['Touba',-15.88,14.85]]
  }
};
