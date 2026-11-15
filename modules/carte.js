/* Carte schématique du pays, dessinée dans l'appli : fonctionne sans réseau.
   CAA.carte({pos, points, cible, proche}) rend la carte ; CAA.centres(pos) choisit les centres. */
CAA.carte = function(o){
  var P = CAA.pays.carte, h = CAA.ui.h, t = CAA.t;
  var X = function(lon){ return ((lon - P.lon0) * P.echelle).toFixed(1); };
  var Y = function(lat){ return ((P.lat0 - lat) * P.echelle).toFixed(1); };
  var poly = function(pts, cls){ return '<polygon class="' + cls + '" points="' + pts.map(function(p){ return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '"/>'; };
  var esc = function(s){ return String(s).replace(/[<>&"]/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]; }); };

  var s = '<svg viewBox="0 0 ' + P.largeur + ' ' + P.hauteur + '" role="img" aria-label="' + esc(t('carte.aria')) + '">';
  s += poly(P.contour, 'terre');
  (P.trous || []).forEach(function(tr){ s += poly(tr, 'trou'); });
  (P.villes || []).forEach(function(v){ s += '<text class="ville" x="' + X(v[1]) + '" y="' + (Y(v[2]) - 11) + '">' + esc(v[0]) + '</text>'; });
  if (o.pos && o.cible) s += '<line class="trajet" x1="' + X(o.pos.lon) + '" y1="' + Y(o.pos.lat) + '" x2="' + X(o.cible.lon) + '" y2="' + Y(o.cible.lat) + '"/>';
  (o.points || []).forEach(function(p){
    var neuro = p.services.some(function(x){ return x === 'neurologie' || x === 'neurochirurgie'; });
    var cls = (o.cible && p === o.cible) ? 'cible' : (o.proche && p === o.proche) ? 'proche' : neuro ? 'neuro' : 'hop';
    s += '<circle class="' + cls + '" cx="' + X(p.lon) + '" cy="' + Y(p.lat) + '" r="' + (cls === 'cible' ? 11 : 7) + '"><title>' + esc(p.nom) + '</title></circle>';
  });
  if (o.pos) s += '<circle class="halo" cx="' + X(o.pos.lon) + '" cy="' + Y(o.pos.lat) + '" r="18"/><circle class="moi" cx="' + X(o.pos.lon) + '" cy="' + Y(o.pos.lat) + '" r="8"><title>' + esc(t('carte.moi')) + '</title></circle>';
  if (o.cible) s += '<text class="etiq" x="' + X(o.cible.lon) + '" y="' + (Y(o.cible.lat) + 28) + '">' + esc(o.cible.nom) + '</text>';
  s += '</svg>';

  var box = h('div', {class:'map'});
  box.innerHTML = s;
  var leg = h('div', {class:'legend'}, [
    h('span', {}, [h('i', {class:'neuro'}), t('carte.neuro')]),
    h('span', {}, [h('i', {class:'hop'}), t('carte.hop')]),
    o.pos ? h('span', {}, [h('i', {class:'moi'}), t('carte.moi')]) : null,
    o.cible ? h('span', {}, [h('i', {class:'cible'}), t('carte.cible')]) : null
  ]);
  return h('div', {class:'stack'}, [box, leg, h('p', {class:'small muted', text:t('carte.note')})]);
};

/* Choix des centres : le plus proche de tous (premiers soins) et le service neuro le plus proche (alerte).
   Sans position : la région choisie dans les réglages, sinon le centre par défaut du pays. */
CAA.centres = function(pos){
  var H = CAA.pays.hopitaux;
  var neuro = H.filter(function(x){ return x.services.some(function(s){ return s === 'neurologie' || s === 'neurochirurgie'; }); });
  var dist = function(x){ return pos ? CAA.km(pos, x) : null; };
  if (pos){
    var tri = function(a, b){ return dist(a) - dist(b); };
    var p = H.slice().sort(tri)[0], n = neuro.slice().sort(tri)[0];
    return {proche:p, cible:n, dProche:dist(p), dCible:dist(n), mode:'gps'};
  }
  var region = CAA.pref('region');
  var nr = neuro.filter(function(x){ return x.region === region; })[0];
  var pr = H.filter(function(x){ return x.region === region; })[0];
  var def = H.filter(function(x){ return x.defaut; })[0] || neuro[0];
  return {proche:pr || null, cible:nr || def, dProche:null, dCible:null, mode: nr ? 'region' : 'defaut'};
};
