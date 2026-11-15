/* Écran d'alerte partagé par tous les modules d'urgence (AVC, anévrisme, et les suivants).
   o = {type, sur, titre, voix, voixCle, resume, debut, signes:[[libellé clinique, 'oui'|'non'|'doute']], refaire, refaireTexte}
   Ordre à l'écran : appeler → centre de santé le plus proche → service AVC destinataire → messages → consignes. */
CAA.alerte = function(view, o){
  var ui = CAA.ui, h = ui.h, t = CAA.t, A = 'fast.alerte.', R = 'routage.', M = 'messages.';
  var at = new Date(), ref = CAA.reference(at), gps = null, cx = CAA.centres(null), main = CAA.principal();
  var other = CAA.pays.urgences.filter(function(u){ return u !== main; })[0];
  var proches = CAA.pref('proches') ? CAA.store.get('proches', []) : [];
  var moi = CAA.store.get('moi', {nom:'', tel:''});
  function hhmm(d){ return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function svc(x){ return x.services.map(function(s){ return t('hopitaux.services.' + s); }).join(', '); }
  function kmTxt(d){ return d == null ? '' : ' · ' + t('hopitaux.distance', {km:Math.round(d)}); }

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

  /* 2. Centre de santé le plus proche, quel qu'il soit */
  var procheBox = h('div', {class:'stack'});
  var status = h('p', {class:'status'});
  var place = h('input', {type:'text', id:'place', placeholder:t(A + 'lieuex'), autocomplete:'off', oninput:msgs});
  var mark = h('input', {type:'text', id:'landmark', placeholder:t(A + 'repereex'), autocomplete:'off', oninput:msgs});
  var manual = h('div', {class:'stack', hidden:true}, [h('label', {for:'place'}, [t(A + 'lieu'), place]), h('label', {for:'landmark'}, [t(A + 'repere'), mark])]);
  var retry = h('button', {class:'ghost', hidden:true, text:t(A + 'regps'), onclick:find});
  view.appendChild(ui.card(t(R + 'proche'), [procheBox, status, manual, retry]));

  /* 3. Service AVC destinataire + carte */
  var cibleBox = h('div', {class:'stack'});
  view.appendChild(ui.card(t(R + 'cible'), [cibleBox]));

  /* 4. Message au service AVC */
  var preNeuro = h('pre'), smsNeuro = h('a', {class:'btn ghost', href:'#', text:t(M + 'neuro_sms')});
  var sent = h('div', {class:'stack', hidden:true}, [
    h('p', {class:'pill moyen', style:'align-self:flex-start', text:t(R + 'attente')}),
    h('p', {class:'note', text:t(A + 'simulation')})
  ]);
  var send = h('button', {class:'primary', text:t(M + 'neuro_envoyer')});
  send.addEventListener('click', function(){ sent.hidden = false; send.hidden = true; CAA.track('alerte_envoyee', {type:o.type, cible:cx.cible ? cx.cible.id : null, mode:cx.mode, ref:ref}); });
  view.appendChild(ui.card(t(M + 'neuro_titre'), [h('p', {class:'small muted', text:t(M + 'neuro_intro')}), preNeuro, send, smsNeuro, h('p', {class:'small muted', text:t(M + 'neuro_smsnote')}), sent]));

  /* 5. Message aux proches */
  var preProches = h('pre'), smsProches = h('a', {class:'btn ghost', href:'#', text:t(M + 'proches_sms')});
  var whoProches = h('p', {class:'small muted'});
  view.appendChild(ui.card(t(M + 'proches_titre'), [h('p', {class:'small muted', text:t(M + 'proches_intro')}), preProches, whoProches, smsProches]));

  /* 6. Résumé et consignes */
  view.appendChild(ui.card(t(A + 'observe'), [h('p', {text:o.resume}),
    h('p', {class:'small muted', text:t(A + 'horloge', {heure:hhmm(at), debut:o.debut.toLowerCase()}) + ' · ' + ref})]));
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
      route(); msgs();
    });
  }

  function route(){
    procheBox.innerHTML = ''; cibleBox.innerHTML = '';
    var c = cx.cible, p = cx.proche;
    if (p){
      procheBox.appendChild(h('div', {class:'stack tight'}, [h('b', {class:'big-name', text:p.nom}),
        h('span', {class:'small muted', text:p.region + kmTxt(cx.dProche)})]));
      procheBox.appendChild(h('div', {class:'row2'}, [
        h('a', {class:'btn', href:'https://maps.google.com/?q=' + p.lat + ',' + p.lon, target:'_blank', rel:'noopener', text:t('hopitaux.itineraire')})
      ]));
      if (cx.proches.length > 1) procheBox.appendChild(h('p', {class:'small muted', text:t(R + 'autres', {liste:cx.proches.slice(1).map(function(x){ return x.nom + ' (' + Math.round(CAA.km(gps, x)) + ' km)'; }).join(' · ')})}));
      procheBox.appendChild(h('p', {class:'small muted', text:t(R + 'prochenote')}));
    } else {
      procheBox.appendChild(h('p', {class:'muted', text:t(R + 'procheinconnu')}));
      if (cx.proches.length) procheBox.appendChild(h('p', {class:'small muted', text:t(R + 'region_liste', {liste:cx.proches.map(function(x){ return x.nom; }).join(' · ')})}));
    }
    if (c){
      cibleBox.appendChild(h('div', {class:'stack tight'}, [h('b', {class:'big-name', text:c.nom}),
        h('span', {class:'small muted', text:c.ville + ' · ' + svc(c) + kmTxt(cx.dCible)}),
        c.tel ? h('span', {class:'small tab', text:c.tel + (c.valide ? '' : ' · ' + t(R + 'telavalider'))}) : null,
        h('span', {class:'small muted', text:t(R + ({gps:'modegps', filiere:'modefiliere', region:'moderegion'}[cx.mode] || 'modedefaut'))})]));
    }
    cibleBox.appendChild(CAA.carte({pos:gps, points:CAA.pays.avc, cible:c, proche:p}));
    cibleBox.appendChild(h('p', {class:'small muted', text:t(R + 'confirm')}));
  }

  /* Les deux messages restent en français, quelle que soit la langue de l'appli. */
  function msgs(){
    var c = cx.cible, p = cx.proche, lieu = place.value.trim(), rep = mark.value.trim();
    var lien = gps ? 'https://maps.google.com/?q=' + gps.lat.toFixed(5) + ',' + gps.lon.toFixed(5) : '';
    var mots = {oui:'oui', non:'non', doute:'incertain'};

    /* Au service AVC : factuel, structuré, sans question-réponse */
    var L = [];
    L.push('CAA.app · ALERTE ' + o.type.toUpperCase() + ' · Réf. ' + ref);
    L.push('Un cas possible ' + o.de + ' vous est signalé dans votre zone de référence par un témoin, via CAA.app. Merci de confirmer la prise en charge et de préparer l\'accueil.');
    L.push('');
    L.push('PATIENT');
    if (gps) L.push('- Position : ' + gps.lat.toFixed(5) + ', ' + gps.lon.toFixed(5) + (gps.approx ? ' (dernière position connue)' : '') + ' · ' + lien);
    if (lieu) L.push('- Lieu indiqué : ' + lieu);
    if (rep) L.push('- Repère : ' + rep);
    if (!gps && !lieu && !rep) L.push('- Position : non précisée');
    if (p) L.push('- Structure la plus proche du patient : ' + p.nom + (cx.dProche != null ? ' (' + Math.round(cx.dProche) + ' km)' : ''));
    L.push('');
    L.push('CHRONOLOGIE');
    L.push('- Début des signes : ' + o.debut.toLowerCase());
    L.push('- Alerte émise : ' + hhmm(at));
    L.push('');
    L.push('SIGNES OBSERVÉS PAR LE TÉMOIN');
    o.signes.forEach(function(s){ L.push('- ' + s[0] + ' : ' + (mots[s[1]] || s[1])); });
    L.push('');
    L.push('CONTACT SUR PLACE : ' + ((moi.nom || moi.tel) ? [moi.nom, moi.tel].filter(Boolean).join(', ') : 'non renseigné'));
    L.push('Message automatique. Observation par un témoin non médecin, ne constitue pas un diagnostic.');
    var neuro = L.join('\n');
    preNeuro.textContent = neuro;
    var num = (c && c.valide && c.tel) ? c.tel.replace(/[^\d+]/g, '') : '';
    smsNeuro.setAttribute('href', 'sms:' + num + '?body=' + encodeURIComponent(neuro));

    /* Aux proches : un appel à l'aide, calme, sans vocabulaire médical */
    var qui = moi.nom || 'un proche';
    var P = [];
    P.push('Bonjour, message envoyé par ' + qui + ' avec l\'appli CAA.app.');
    P.push('Une personne de notre entourage a eu un malaise. Les secours ont été prévenus à ' + hhmm(at) + ' et tout est en cours.');
    P.push('Si vous le pouvez, rejoignez-nous' + (moi.tel ? ' ou appelez ' + qui + ' au ' + moi.tel : '') + '.');
    var ou = [lieu, rep].filter(Boolean).join(', ');
    if (ou || lien) P.push('Où : ' + [ou, lien].filter(Boolean).join(' · '));
    var prochesTxt = P.join('\n');
    preProches.textContent = prochesTxt;
    var nums = proches.map(function(x){ return x.numero.replace(/[^\d+]/g, ''); }).join(',');
    smsProches.setAttribute('href', 'sms:' + nums + '?body=' + encodeURIComponent(prochesTxt));
    whoProches.textContent = proches.length ? t(A + 'proches', {noms:proches.map(function(x){ return x.nom; }).join(', ')}) : t(A + 'sansproches');
    smsProches.hidden = !proches.length;
  }

  route(); find(); msgs();
  CAA.say(o.voix, o.voixCle || 'fast.alerte.voix');
};
