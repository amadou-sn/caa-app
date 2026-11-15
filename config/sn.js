/* Réglages du pays. Pour ouvrir l'appli à un autre pays : copier ce fichier et changer les valeurs.
   Numéros et hôpitaux À VALIDER avec la CAA avant toute diffusion. Coordonnées approximatives (ville). */
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
  hopitaux: [
    {nom:'CHNU de Fann', ville:'Dakar', region:'Dakar', lat:14.693, lon:-17.466, services:['neurologie']},
    {nom:'Hôpital Général Idrissa Pouye', ville:'Grand Yoff, Dakar', region:'Dakar', lat:14.737, lon:-17.455, services:['neurologie','neurochirurgie']},
    {nom:'Hôpital Principal de Dakar', ville:'Plateau, Dakar', region:'Dakar', lat:14.661, lon:-17.436, services:['urgences']},
    {nom:'Centre Hospitalier National de Pikine', ville:'Pikine', region:'Dakar', lat:14.750, lon:-17.390, services:['neurologie']},
    {nom:'Centre Hospitalier Régional de Thiès', ville:'Thiès', region:'Thiès', lat:14.790, lon:-16.930, services:['neurochirurgie']},
    {nom:'CHR El Hadji Ibrahima Niass', ville:'Kaolack', region:'Kaolack', lat:14.150, lon:-16.070, services:['neurochirurgie']},
    {nom:'Hôpital Régional de Ziguinchor', ville:'Ziguinchor', region:'Ziguinchor', lat:12.560, lon:-16.270, services:['neurologie']},
    {nom:'Centre Hospitalier Régional de Saint-Louis', ville:'Saint-Louis', region:'Saint-Louis', lat:16.030, lon:-16.500, services:['urgences']}
  ]
};
