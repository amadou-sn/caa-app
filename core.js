/* CAA.app : le socle. Il ne connaît aucune fonctionnalité.
   Chaque module s'enregistre avec CAA.register({id, icone, render}) et apparaît tout seul sur l'accueil. */
window.CAA = (function(){
  var mods = [], byId = {}, view = null, nav = null, current = 'home';
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

  /* Voix : lit un texte si le réglage est activé et si la langue a une voix sur le téléphone */
  function hush(){ try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch(e){} }
  function say(text){
    try {
      var code = look(C.textes[store.get('langue', 'fr')], ['voix', 'code']);
      if (!code || !store.get('voix', true) || !window.speechSynthesis) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = code; u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch(e){}
  }

  /* Journal anonyme : alimente la base de données, seulement avec accord */
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
        .then(function(r){ /* envoyé, ou refusé pour de bon par la base : dans les deux cas on ne réessaie pas */
          if (r.ok || [400, 401, 403, 409].indexOf(r.status) >= 0) store.set('envoi', store.get('envoi', []).slice(rows.length)); })
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

  /* Pictogrammes (traits simples, 24 x 24) */
  var ICONS = {
    home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    alerte:'M12 9v4M12 16.5v.5M10.3 3.9L2.5 17.5a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    hopitaux:'M4 21V7l8-4 8 4v14M9 21v-5h6v5M12 8v5M9.5 10.5h5',
    reglages:'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4',
    risque:'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    tension:'M3 12h4l2.5-7 5 14L17 12h4',
    proches:'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.2a3.5 3.5 0 0 1 0 6.6M18 14.5a6.5 6.5 0 0 1 3.5 5.5',
    apres:'M4 20h4v-4h4v-4h4V8h4',
    comprendre:'M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h13M9 8h6',
    anevrisme:'M13 2L4 14h7l-1 8 9-12h-7z',
    association:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v.5M11 12h1v5',
    tel:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z'
  };

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
    icon: function(name, cls){
      var s = h('span', {class:'ic' + (cls ? ' ' + cls : ''), 'aria-hidden':'true'});
      s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + (ICONS[name] || ICONS.association) + '"/></svg>';
      return s;
    },
    label: function(text){ return h('span', {class:'label', text:text}); },
    card: function(labelText, kids){ return h('div', {class:'card'}, [labelText ? ui.label(labelText) : null].concat(kids || [])); },
    back: function(fn, text){ return h('button', {class:'link', text:'← ' + (text || t('commun.accueil')), onclick:fn || function(){ go('home'); }}); },
    dots: function(n, i){ var d = h('div', {class:'dots'}); for (var x = 0; x < n; x++) d.appendChild(h('i', {class: x <= i ? 'on' : ''})); return d; },
    head: function(id){
      return h('div', {class:'head'}, [ui.icon(byId[id] && byId[id].icone || id, 'lg'),
        h('div', {class:'stack tight'}, [ui.label(t('mod.' + id + '.sous')), h('h2', {text:t('mod.' + id + '.titre')})])]);
    },
    list: function(items){ return h('ul', {}, items.map(function(x){ return h('li', {text:x}); })); },
    /* Un écran de question : o = {n, total, lettre, etiquette, q, aide, choix:[{texte, classe, clic}], ecouter, retour} */
    question: function(view, o){
      view.innerHTML = '';
      view.appendChild(ui.dots(o.total, o.n));
      if (o.lettre) view.appendChild(h('div', {class:'letter', text:o.lettre}));
      view.appendChild(h('div', {class:'stack'}, [ui.label(o.etiquette), h('h2', {text:o.q})]));
      if (o.aide) view.appendChild(h('p', {class:'instr', text:o.aide}));
      view.appendChild(h('div', {class:'stack'}, o.choix.map(function(c){ return h('button', {class:c.classe || '', text:c.texte, onclick:c.clic}); })));
      if (o.ecouter) view.appendChild(h('button', {class:'ghost', text:t('fast.ecouter'), onclick:o.ecouter}));
      view.appendChild(ui.back(o.retour, t('commun.retour')));
    },
    copy: function(text, btn){
      var old = btn.textContent;
      function ok(){ btn.textContent = t('commun.copie'); setTimeout(function(){ btn.textContent = old; }, 1800); }
      function ko(){ btn.textContent = text; }
      try { navigator.clipboard.writeText(text).then(ok, ko); } catch(e){ ko(); }
    }
  };

  function numbers(){
    return h('div', {class:'numbers'}, C.pays.urgences.map(function(u){
      return h('a', {class:'num', href:'tel:' + u.numero}, [
        h('span', {class:'small muted', text:t('urgence.' + u.id)}),
        h('span', {class:'numline'}, [ui.icon('tel', 'sm'), h('strong', {text:u.numero})])
      ]);
    }));
  }

  function home(){
    var urgent = mods.filter(function(m){ return m.urgent; })[0];
    var tiles = mods.filter(function(m){ return !m.urgent && !m.hors; }).map(function(m){
      var kids = [ui.icon(m.icone || m.id), h('div', {class:'stack tight'}, [h('b', {text:t('mod.' + m.id + '.titre')}),
        h('span', {class:'small muted', text: m.bientot ? t('commun.bientot') : t('mod.' + m.id + '.sous')})])];
      return m.bientot ? h('div', {class:'tile soon'}, kids) : h('button', {class:'tile', onclick:function(){ go(m.id); }}, kids);
    });
    view.appendChild(h('div', {class:'stack'}, [h('h1', {text:t('accueil.titre')}), h('p', {class:'muted', text:t('accueil.intro')})]));
    if (urgent) view.appendChild(h('button', {class:'urgent', onclick:function(){ go(urgent.id); }}, [
      ui.icon('alerte', 'lg'), h('span', {class:'stack tight'}, [h('b', {text:t('accueil.bouton')}), h('span', {class:'small', text:t('accueil.boutonsous')})])]));
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('accueil.urgences', {pays:C.pays.nom})), numbers()]));
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('accueil.modules')), h('div', {class:'tiles'}, tiles)]));
    view.appendChild(h('p', {class:'small muted', text:t('accueil.avertissement', {numero:principal().numero})}));
  }

  function principal(){ return C.pays.urgences.filter(function(u){ return u.principal; })[0] || C.pays.urgences[0]; }

  /* Barre du bas : toujours visible, pour ne jamais se perdre */
  function drawNav(){
    if (!nav) return;
    var urgent = mods.filter(function(m){ return m.urgent; })[0];
    var items = [['home', 'home', 'accueil'], [urgent ? urgent.id : 'home', 'alerte', 'urgence'], ['hopitaux', 'hopitaux', 'hopitaux'], ['reglages', 'reglages', 'reglages']];
    nav.innerHTML = '';
    items.forEach(function(it, i){
      nav.appendChild(h('button', {class:(i === 1 ? 'sos ' : '') + (current === it[0] ? 'on' : ''), 'aria-current': current === it[0] ? 'page' : null,
        onclick:function(){ go(it[0]); }}, [ui.icon(it[1]), h('span', {text:t('nav.' + it[2])})]));
    });
  }

  function go(id, params){
    hush();
    current = (id === 'home' || !byId[id] || !byId[id].render) ? 'home' : id;
    view.innerHTML = '';
    if (current === 'home') home(); else byId[current].render(view, params || {});
    drawNav();
    if (view.classList){ view.classList.remove('in'); void view.offsetWidth; view.classList.add('in'); }
    window.scrollTo(0, 0);
  }

  C.register = function(m){ mods.push(m); byId[m.id] = m; };
  C.start = function(){
    view = document.getElementById('view');
    nav = document.getElementById('nav');
    document.getElementById('brand').addEventListener('click', function(){ go('home'); });
    go('home');
    flush();
  };
  C.store = store; C.t = t; C.say = say; C.track = track; C.locate = locate; C.km = km;
  C.ui = ui; C.go = go; C.numbers = numbers; C.principal = principal;
  return C;
})();
