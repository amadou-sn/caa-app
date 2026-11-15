/* CAA.app : le socle. Il ne connaît aucune fonctionnalité.
   Chaque module s'enregistre avec CAA.register({id, render}) et apparaît tout seul sur l'accueil. */
window.CAA = (function(){
  var mods = [], byId = {}, view = null;
  var C = {textes:{}, pays:null};

  /* Mémoire de l'appareil (rien ne quitte le téléphone) */
  var store = {
    get: function(k, d){ try { var v = localStorage.getItem('caa.' + k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } },
    set: function(k, v){ try { localStorage.setItem('caa.' + k, JSON.stringify(v)); } catch(e){} },
    clear: function(){ try { Object.keys(localStorage).forEach(function(k){ if (k.indexOf('caa.') === 0) localStorage.removeItem(k); }); } catch(e){} }
  };

  /* Textes : t('fast.alerte.titre') cherche dans la langue choisie, puis en français */
  function look(o, parts){ for (var i = 0; i < parts.length && o != null; i++) o = o[parts[i]]; return o == null ? undefined : o; }
  function t(path, vars){
    var parts = path.split('.');
    var v = look(C.textes[store.get('langue', 'fr')], parts);
    if (v === undefined) v = look(C.textes.fr, parts);
    if (v === undefined) return path;
    if (typeof v === 'string' && vars) for (var k in vars) v = v.split('{' + k + '}').join(vars[k]);
    return v;
  }

  /* Voix : lit un texte à voix haute si le réglage est activé */
  function hush(){ try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch(e){} }
  function say(text){
    try {
      if (!store.get('voix', true) || !window.speechSynthesis) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = t('voix.code'); u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch(e){}
  }

  /* Journal anonyme : alimente la future base de données, seulement avec accord */
  function track(type, data){
    if (!store.get('accord', false)) return;
    var d = new Date(), j = store.get('journal', []);
    var ev = {type:type, jour:d.toISOString().slice(0, 10), heure:d.getHours(), pays:C.pays.code};
    for (var k in (data || {})) ev[k] = data[k];
    j.push(ev);
    store.set('journal', j.slice(-500));
    var q = store.get('envoi', []); q.push(ev); store.set('envoi', q.slice(-200));
    flush();
  }

  /* Envoi à la base : les événements attendent sur le téléphone tant qu'il n'y a pas de réseau */
  function flush(){
    var b = C.base, q = store.get('envoi', []);
    if (!b || !b.url || !b.cle || !q.length) return;
    var rows = q.map(function(e){
      var d = {};
      for (var k in e) if (['type','jour','heure','pays'].indexOf(k) < 0) d[k] = e[k];
      return {type:e.type, jour:e.jour, heure:e.heure, pays:e.pays, donnees:d};
    });
    try {
      fetch(b.url + '/rest/v1/evenements', {method:'POST', body:JSON.stringify(rows),
        headers:{apikey:b.cle, Authorization:'Bearer ' + b.cle, 'Content-Type':'application/json', Prefer:'return=minimal'}})
        .then(function(r){ if (r.ok) store.set('envoi', store.get('envoi', []).slice(rows.length)); })
        .catch(function(){});
    } catch(e){}
  }

  /* Position GPS : répond toujours, avec null si indisponible */
  function locate(cb){
    var done = false, tm = setTimeout(function(){ end(null); }, 8000);
    function end(p){ if (done) return; done = true; clearTimeout(tm); cb(p); }
    try {
      if (!navigator.geolocation) return end(null);
      navigator.geolocation.getCurrentPosition(
        function(p){ end({lat:p.coords.latitude, lon:p.coords.longitude}); },
        function(){ end(null); }, {enableHighAccuracy:true, timeout:7000});
    } catch(e){ end(null); }
  }
  function km(a, b){
    var r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    var x = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.pow(Math.sin(dLon / 2), 2);
    return 2 * 6371 * Math.asin(Math.sqrt(x));
  }

  /* Petits outils d'affichage partagés par tous les modules */
  function h(tag, a, kids){
    var e = document.createElement(tag); a = a || {};
    for (var k in a){
      if (k === 'text') e.textContent = a[k];
      else if (k === 'hidden') e.hidden = !!a[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), a[k]);
      else if (a[k] != null && a[k] !== false) e.setAttribute(k, a[k]);
    }
    (kids || []).forEach(function(c){ if (c == null || c === false) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  var ui = {
    h: h,
    label: function(text){ return h('span', {class:'label', text:text}); },
    card: function(labelText, kids){ return h('div', {class:'card'}, [labelText ? ui.label(labelText) : null].concat(kids || [])); },
    back: function(fn, text){ return h('button', {class:'link', text:'← ' + (text || t('commun.accueil')), onclick:fn || function(){ go('home'); }}); },
    dots: function(n, i){ var d = h('div', {class:'dots'}); for (var x = 0; x < n; x++) d.appendChild(h('i', {class: x <= i ? 'on' : ''})); return d; },
    head: function(id){ return h('div', {class:'stack'}, [ui.label(t('mod.' + id + '.sous')), h('h2', {text:t('mod.' + id + '.titre')})]); },
    list: function(items){ return h('ul', {}, items.map(function(x){ return h('li', {text:x}); })); },
    copy: function(text, btn){
      var old = btn.textContent;
      function ok(){ btn.textContent = t('commun.copie'); setTimeout(function(){ btn.textContent = old; }, 1800); }
      function ko(){ btn.textContent = text; }
      try { navigator.clipboard.writeText(text).then(ok, ko); } catch(e){ ko(); }
    }
  };

  function numbers(){
    return h('div', {class:'numbers'}, C.pays.urgences.map(function(u){
      return h('div', {class:'num'}, [h('span', {class:'small muted', text:t('urgence.' + u.id)}), h('strong', {text:u.numero})]);
    }));
  }

  function home(){
    var urgent = mods.filter(function(m){ return m.urgent; })[0];
    var tiles = mods.filter(function(m){ return !m.urgent && !m.hors; }).map(function(m){
      var kids = [h('b', {text:t('mod.' + m.id + '.titre')}), h('span', {class:'small muted', text: m.bientot ? t('commun.bientot') : t('mod.' + m.id + '.sous')})];
      return m.bientot ? h('div', {class:'tile'}, kids) : h('button', {class:'tile', onclick:function(){ go(m.id); }}, kids);
    });
    view.appendChild(h('div', {class:'stack'}, [h('h1', {text:t('accueil.titre')}), h('p', {class:'muted', text:t('accueil.intro')})]));
    if (urgent) view.appendChild(h('button', {class:'danger big', text:t('accueil.bouton'), onclick:function(){ go(urgent.id); }}));
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('accueil.urgences', {pays:C.pays.nom})), numbers()]));
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('accueil.modules')), h('div', {class:'tiles'}, tiles)]));
    view.appendChild(h('button', {class:'ghost', text:t('mod.reglages.titre'), onclick:function(){ go('reglages'); }}));
    view.appendChild(h('p', {class:'small muted', text:t('accueil.avertissement', {numero:principal().numero})}));
  }

  function principal(){ return C.pays.urgences.filter(function(u){ return u.principal; })[0] || C.pays.urgences[0]; }

  function go(id, params){
    hush();
    view.innerHTML = '';
    if (id === 'home' || !byId[id]) home(); else byId[id].render(view, params || {});
    window.scrollTo(0, 0);
  }

  C.register = function(m){ mods.push(m); byId[m.id] = m; };
  C.start = function(){
    view = document.getElementById('view');
    document.getElementById('brand').addEventListener('click', function(){ go('home'); });
    go('home');
    flush();
  };
  C.store = store; C.t = t; C.say = say; C.track = track; C.locate = locate; C.km = km;
  C.ui = ui; C.go = go; C.numbers = numbers; C.principal = principal;
  return C;
})();
