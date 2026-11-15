/* Écran d'alerte partagé par tous les modules d'urgence (AVC, anévrisme, et les suivants).
   o = {sur, titre, voix, resume, debut, smsTitre, smsSignes, refaire, refaireTexte} */
CAA.alerte = function(view, o){
  var ui = CAA.ui, h = ui.h, t = CAA.t, A = 'fast.alerte.', S = 'fast.sms.';
  var at = new Date(), gps = null, main = CAA.principal();
  var other = CAA.pays.urgences.filter(function(u){ return u !== main; })[0];
  var proches = CAA.store.get('proches', []);
  function hhmm(d){ return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

  view.innerHTML = '';
  var copyBtn = h('button', {class:'second', text:t(A + 'copier')});
  copyBtn.addEventListener('click', function(){ ui.copy(main.numero, copyBtn); });
  view.appendChild(h('div', {class:'alertband'}, [
    h('span', {class:'label', style:'color:inherit;opacity:.85', text:o.sur}),
    h('h2', {text:o.titre}),
    h('div', {class:'callnum', text:main.numero}),
    h('div', {class:'row'}, [h('a', {class:'btn', href:'tel:' + main.numero, text:t(A + 'appeler', {numero:main.numero})}), copyBtn]),
    other ? h('p', {class:'small', text:t(A + 'sinon', {nom:t('urgence.' + other.id), numero:other.numero})}) : null
  ]));

  view.appendChild(ui.card(t(A + 'observe'), [h('p', {text:o.resume}),
    h('p', {class:'small muted', text:t(A + 'horloge', {heure:hhmm(at), debut:o.debut.toLowerCase()})})]));

  var status = h('p', {class:'status'}), near = h('p', {class:'small muted', hidden:true});
  var place = h('input', {type:'text', id:'place', placeholder:t(A + 'lieuex'), autocomplete:'off', oninput:sms});
  var mark = h('input', {type:'text', id:'landmark', placeholder:t(A + 'repereex'), autocomplete:'off', oninput:sms});
  var manual = h('div', {class:'stack', hidden:true}, [h('label', {for:'place'}, [t(A + 'lieu'), place]), h('label', {for:'landmark'}, [t(A + 'repere'), mark])]);
  var retry = h('button', {class:'ghost', hidden:true, text:t(A + 'regps'), onclick:find});
  view.appendChild(ui.card(t(A + 'ou'), [status, near, manual, retry]));

  var pre = h('pre'), sent = h('p', {class:'note', hidden:true, text:t(A + 'simulation')});
  var send = h('button', {class:'primary', text:t(A + 'envoyer')});
  send.addEventListener('click', function(){ sent.hidden = false; send.hidden = true; });
  var who = h('p', {class:'small muted', text: proches.length
    ? t(A + 'proches', {noms:proches.map(function(p){ return p.nom; }).join(', ')}) : t(A + 'sansproches')});
  view.appendChild(ui.card(t(A + 'message'), [pre, who, send, sent]));

  view.appendChild(ui.card(t(A + 'attente'), [ui.list(t(A + 'gestes')), h('p', {class:'small muted', text:t('commun.avalider')})]));
  view.appendChild(ui.back(o.refaire, o.refaireTexte || t(A + 'refaire')));

  function find(){
    status.textContent = t(A + 'cherche'); manual.hidden = true; retry.hidden = true; near.hidden = true;
    CAA.locate(function(p){
      gps = p; manual.hidden = false;
      if (p){
        status.textContent = t(A + 'gpsok', {lat:p.lat.toFixed(5), lon:p.lon.toFixed(5)});
        var best = CAA.pays.hopitaux.map(function(x){ return {x:x, d:CAA.km(p, x)}; }).sort(function(a, b){ return a.d - b.d; })[0];
        if (best){ near.textContent = t(A + 'proche', {nom:best.x.nom, km:Math.round(best.d)}); near.hidden = false; }
      } else { status.textContent = t(A + 'gpsko'); retry.hidden = false; }
      sms();
    });
  }

  /* Le message à l'hôpital reste en français, quelle que soit la langue de l'appli */
  function sms(){
    var lines = [o.smsTitre, t(S + 'heure') + hhmm(at), t(S + 'debut') + o.debut, o.smsSignes];
    if (gps){
      lines.push(t(S + 'gps') + gps.lat.toFixed(5) + ', ' + gps.lon.toFixed(5));
      lines.push('https://maps.google.com/?q=' + gps.lat.toFixed(5) + ',' + gps.lon.toFixed(5));
    }
    if (place.value.trim()) lines.push(t(S + 'lieu') + place.value.trim());
    if (mark.value.trim()) lines.push(t(S + 'repere') + mark.value.trim());
    if (!gps && !place.value.trim() && !mark.value.trim()) lines.push(t(S + 'inconnu'));
    pre.textContent = lines.join('\n');
  }

  find(); sms();
  CAA.say(o.voix);
};
