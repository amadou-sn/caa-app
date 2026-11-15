/* Carte : vraie carte (OpenStreetMap via Leaflet) quand il y a du réseau, carte schématique dessinée dans l'appli sinon.
   CAA.carte({pos, points, cible, proche}) rend la carte ; CAA.centres(pos) choisit les centres. */
CAA.carte = function(o){
  var h = CAA.ui.h, t = CAA.t;
  var enLigne = (typeof navigator === 'undefined') || navigator.onLine !== false;
  if (window.L && enLigne) return CAA.carteReelle(o);
  return CAA.carteSchema(o);
};

CAA.carteReelle = function(o){
  var h = CAA.ui.h, t = CAA.t, L = window.L;
  var box = h('div', {class:'map real'}), fallback = null;
  var wrap = h('div', {class:'stack'}, [box, h('p', {class:'small muted', text:t('carte.osm')})]);
  setTimeout(function(){
    try {
      var map = L.map(box, {zoomControl:true, attributionControl:true, scrollWheelZoom:false});
      var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:18, attribution:'&copy; OpenStreetMap'}).addTo(map);
      var errs = 0;
      tiles.on('tileerror', function(){ if (++errs === 6 && !fallback){ fallback = CAA.carteSchema(o); wrap.replaceChild(fallback, box); } });
      var pts = [];
      (o.points || []).forEach(function(p){
        var neuro = p.services.some(function(x){ return x === 'neurologie' || x === 'neurochirurgie'; });
        var kind = (o.cible && p === o.cible) ? 'cible' : (o.proche && p === o.proche) ? 'proche' : neuro ? 'neuro' : 'hop';
        var col = {cible:'#c1121f', proche:'#f2b705', neuro:'#0b6b4b', hop:'#6b7c74'}[kind];
        var m = L.circleMarker([p.lat, p.lon], {radius: kind === 'cible' ? 11 : 7, color:'#fff', weight:2, fillColor:col, fillOpacity:1}).addTo(map);
        m.bindPopup('<b>' + p.nom + '</b><br>' + p.ville + '<br>' + p.services.map(function(s){ return t('hopitaux.services.' + s); }).join(', '));
        if (kind === 'cible') m.bindTooltip(p.nom, {permanent:true, direction:'bottom', offset:[0, 10]});
        pts.push([p.lat, p.lon]);
      });
      if (o.pos){
        L.circleMarker([o.pos.lat, o.pos.lon], {radius:18, color:'#1d6fe0', weight:0, fillColor:'#1d6fe0', fillOpacity:.15}).addTo(map);
        L.circleMarker([o.pos.lat, o.pos.lon], {radius:8, color:'#fff', weight:3, fillColor:'#1d6fe0', fillOpacity:1}).addTo(map).bindTooltip(t('carte.moi'), {permanent:true, direction:'top', offset:[0, -8]});
        if (o.cible) L.polyline([[o.pos.lat, o.pos.lon], [o.cible.lat, o.cible.lon]], {color:'#c1121f', weight:3, dashArray:'8 6'}).addTo(map);
        var focus = [[o.pos.lat, o.pos.lon]];
        if (o.cible) focus.push([o.cible.lat, o.cible.lon]);
        if (o.proche) focus.push([o.proche.lat, o.proche.lon]);
        map.fitBounds(focus, {padding:[40, 40], maxZoom:13});
      } else if (pts.length) map.fitBounds(pts, {padding:[20, 20]});
    } catch(e){ if (!fallback){ fallback = CAA.carteSchema(o); wrap.replaceChild(fallback, box); } }
  }, 0);
  return wrap;
};

CAA.carteSchema = function(o){
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
  var byId = function(id){ return H.filter(function(x){ return x.id === id; })[0]; };
  if (pos){
    var tri = function(a, b){ return dist(a) - dist(b); };
    var p = H.slice().sort(tri)[0], n = neuro.slice().sort(tri)[0], mode = 'gps';
    var ev = (CAA.pays.evacuation || {})[p.region];
    if (ev && byId(ev)){ n = byId(ev); mode = 'filiere'; }
    return {proche:p, cible:n, dProche:dist(p), dCible:dist(n), mode:mode};
  }
  var region = CAA.pref('region');
  var nr = neuro.filter(function(x){ return x.region === region; })[0];
  var pr = H.filter(function(x){ return x.region === region; })[0];
  var def = H.filter(function(x){ return x.defaut; })[0] || neuro[0];
  return {proche:pr || null, cible:nr || def, dProche:null, dCible:null, mode: nr ? 'region' : 'defaut'};
};
