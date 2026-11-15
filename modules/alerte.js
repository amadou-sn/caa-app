/* Écran d'alerte partagé par tous les modules d'urgence (AVC, anévrisme, et les suivants).
   o = {sur, titre, voix, resume, debut, smsTitre, smsSignes, refaire, refaireTexte} */
CAA.alerte = function(view, o){
  var ui = CAA.ui, h = ui.h, t = CAA.t, A = 'fast.alerte.', S = 'fast.sms.', R = 'routage.';
  var at = new Date(), gps = null, cx = CAA.centres(null), main = CAA.principal();
  var other = CAA.pays.urgences.filter(function(u){ return u !== main; })[0];
  var proches = CAA.pref('proches') ? CAA.store.get('proches', []) : [];
  function hhmm(d){ return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function svc(x){ return x.services.map(function(s){ return t('hopitaux.services.' + s); }).join(', '); }

  view.innerHTML = '';
  CAA.vibrate(); CAA.awake();

  /* 1. Appeler */
  var copyBtn = h('button', {class:'second', text:t(A + 'copier')});
  copyBtn.addEventListener('click', function(){ ui.copy(main.numero, copyBtn); });
  view.appendChild(h('div', {class:'alertband'}, [
    h('span', {class:'label', style:'color:inherit;opacity:.85', text:o.sur}),
    h('h2', {text:o.titre}),
    h('div', {class:'callnum', text:main.numero}),
    h('div', {class:'row'}, [h('a', {class:'btn', href:'tel:' + main.numero, text:t(A + 'appeler', {numero:main.numero})}), copyBtn]),
    other ? h('p', {class:'small', text:t(A + 'sinon', {nom:t('urgence.' + other.id), numero:other.numero})}) : null
  ]));

  /* 2. Ce qui a été observé */
  view.appendChild(ui.card(t(A + 'observe'), [h('p', {text:o.resume}),
    h('p', {class:'small muted', text:t(A + 'horloge', {heure:hhmm(at), debut:o.debut.toLowerCase()})})]));

  /* 3. Où êtes-vous */
  var status = h('p', {class:'status'});
  var place = h('input', {type:'text', id:'place', placeholder:t(A + 'lieuex'), autocomplete:'off', oninput:sms});
  var mark = h('input', {type:'text', id:'landmark', placeholder:t(A + 'repereex'), autocomplete:'off', oninput:sms});
  var manual = h('div', {class:'stack', hidden:true}, [h('label', {for:'place'}, [t(A + 'lieu'), place]), h('label', {for:'landmark'}, [t(A + 'repere'), mark])]);
  var retry = h('button', {class:'ghost', hidden:true, text:t(A + 'regps'), onclick:find});
  view.appendChild(ui.card(t(A + 'ou'), [status, manual, retry]));

  /* 4. Centres : le plus proche pour les premiers soins, le service neuro destinataire de l'alerte */
  var routeBox = h('div', {class:'stack'});
  view.appendChild(ui.card(t(R + 'titre'), [routeBox]));

  /* 5. Message d'alerte */
  var pre = h('pre');
  var sent = h('div', {class:'stack', hidden:true}, [
    h('p', {class:'pill moyen', style:'align-self:flex-start', text:t(R + 'attente')}),
    h('p', {class:'note', text:t(A + 'simulation')})
  ]);
  var send = h('button', {class:'primary', text:t(A + 'envoyer')});
  send.addEventListener('click', function(){ sent.hidden = false; send.hidden = true; CAA.track('alerte_envoyee', {cible:cx.cible ? cx.cible.id : null, mode:cx.mode}); });
  var smsLink = h('a', {class:'btn ghost', href:'#', text:t(R + 'parsms')});
  var who = h('p', {class:'small muted'});
  view.appendChild(ui.card(t(A + 'message'), [pre, who, send, smsLink, h('p', {class:'small muted', text:t(R + 'parsmsnote')}), sent]));

  /* 6. Gestes */
  view.appendChild(ui.card(t(A + 'attente'), [ui.list(t(A + 'gestes')), h('p', {class:'small muted', text:t('commun.avalider')})]));
  view.appendChild(ui.back(o.refaire, o.refaireTexte || t(A + 'refaire')));

  function find(){
    status.textContent = t(A + 'cherche'); manual.hidden = true; retry.hidden = true;
    CAA.locate(function(p){
      gps = p; manual.hidden = false;
      cx = CAA.centres(p);
      if (p && !p.approx) status.textContent = t(A + 'gpsok', {lat:p.lat.toFixed(5), lon:p.lon.toFixed(5)});
      else if (p) { status.textContent = t(A + 'gpsapprox'); retry.hidden = false; }
      else { status.textContent = t(A + 'gpsko'); retry.hidden = false; }
      route(); sms();
    });
  }

  function route(){
    routeBox.innerHTML = '';
    var c = cx.cible, p = cx.proche;
    if (p && p !== c){
      routeBox.appendChild(h('div', {class:'stack tight'}, [ui.label(t(R + 'proche')),
        h('b', {text:p.nom}), h('span', {class:'small muted', text:p.ville + ' · ' + svc(p) + (cx.dProche != null ? ' · ' + t('hopitaux.distance', {km:Math.round(cx.dProche)}) : '')})]));
    }
    if (c){
      routeBox.appendChild(h('div', {class:'stack tight'}, [ui.label(t(R + 'cible')),
        h('b', {text:c.nom}), h('span', {class:'small muted', text:c.ville + ' · ' + svc(c) + (cx.dCible != null ? ' · ' + t('hopitaux.distance', {km:Math.round(cx.dCible)}) : '')}),
        c.tel ? h('span', {class:'small tab', text:c.tel + (c.valide ? '' : ' · ' + t(R + 'telavalider'))}) : null,
        h('span', {class:'small muted', text:t(R + {gps:'modegps', filiere:'modefiliere', region:'moderegion'}[cx.mode] || 'modedefaut')})]));
    }
    routeBox.appendChild(CAA.carte({pos:gps, points:CAA.pays.hopitaux, cible:c, proche:p}));
    routeBox.appendChild(h('p', {class:'small muted', text:t(R + 'confirm')}));
  }

  /* Le message à l'hôpital reste en français, quelle que soit la langue de l'appli */
  function sms(){
    var c = cx.cible, lines = [o.smsTitre];
    if (c) lines.push(t(S + 'pour') + c.nom);
    lines.push(t(S + 'heure') + hhmm(at), t(S + 'debut') + o.debut, o.smsSignes);
    if (gps){
      lines.push(t(S + 'gps') + gps.lat.toFixed(5) + ', ' + gps.lon.toFixed(5) + (gps.approx ? t(S + 'approx') : ''));
      lines.push('https://maps.google.com/?q=' + gps.lat.toFixed(5) + ',' + gps.lon.toFixed(5));
    }
    if (place.value.trim()) lines.push(t(S + 'lieu') + place.value.trim());
    if (mark.value.trim()) lines.push(t(S + 'repere') + mark.value.trim());
    if (!gps && !place.value.trim() && !mark.value.trim()) lines.push(t(S + 'inconnu'));
    if (cx.proche && cx.proche !== c) lines.push(t(S + 'proche') + cx.proche.nom);
    var text = lines.join('\n');
    pre.textContent = text;
    var num = (c && c.valide && c.tel) ? c.tel.replace(/[^\d+]/g, '') : '';
    smsLink.setAttribute('href', 'sms:' + num + '?body=' + encodeURIComponent(text));
    who.textContent = proches.length ? t(A + 'proches', {noms:proches.map(function(x){ return x.nom; }).join(', ')}) : t(A + 'sansproches');
  }

  route(); find(); sms();
  CAA.say(o.voix, o.voixCle || 'fast.alerte.voix');
};
