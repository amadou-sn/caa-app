/* Module urgence : test des signes d'AVC puis écran d'alerte */
CAA.register({id:'fast', urgent:true, render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t;
  var KEYS = ['visage','bras','parole','debut'], SIGNS = ['visage','bras','parole'];
  var step = 0, ans = {};

  function draw(){
    view.innerHTML = '';
    var k = KEYS[step], s = t('fast.etapes.' + k);
    var choices = k === 'debut'
      ? t('fast.debuts').map(function(d){ return [d, d]; })
      : ['oui','non','doute'].map(function(c){ return [c, t('fast.choix.' + c)]; });
    view.appendChild(ui.dots(KEYS.length, step));
    view.appendChild(h('div', {class:'letter', text:s.lettre}));
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('fast.etape', {nom:s.nom, n:step + 1, total:KEYS.length})), h('h2', {text:s.q})]));
    view.appendChild(h('p', {class:'instr', text:s.aide}));
    view.appendChild(h('div', {class:'stack'}, choices.map(function(c, i){
      return h('button', {class: (k !== 'debut' && i === 0) ? 'danger' : '', text:c[1], onclick:function(){ ans[k] = c[0]; next(); }});
    })));
    view.appendChild(h('button', {class:'ghost', text:t('fast.ecouter'), onclick:function(){ CAA.say(s.aide + ' ' + s.q); }}));
    view.appendChild(ui.back(function(){ if (step === 0) CAA.go('home'); else { step--; draw(); } }, t('commun.retour')));
    CAA.say(s.aide + ' ' + s.q);
  }

  function next(){
    if (step < KEYS.length - 1){ step++; draw(); return; }
    var n = SIGNS.filter(function(k){ return ans[k] !== 'non'; }).length;
    CAA.track('test_avc', {visage:ans.visage, bras:ans.bras, parole:ans.parole, debut:ans.debut, signes:n});
    if (n === 0) clear(); else alertScreen();
  }

  function clear(){
    view.innerHTML = '';
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('fast.rien.sur')), h('h2', {text:t('fast.rien.titre')}), h('p', {class:'muted', text:t('fast.rien.texte')})]));
    view.appendChild(CAA.numbers());
    view.appendChild(h('button', {class:'primary', text:t('fast.rien.refaire'), onclick:restart}));
    view.appendChild(ui.back());
  }

  function restart(){ step = 0; ans = {}; draw(); }
  function hhmm(d){ return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

  function alertScreen(){
    view.innerHTML = '';
    var at = new Date(), gps = null, main = CAA.principal();
    var other = CAA.pays.urgences.filter(function(u){ return u !== main; })[0];
    var proches = CAA.store.get('proches', []);
    var A = 'fast.alerte.';

    var copyBtn = h('button', {class:'second', text:t(A + 'copier')});
    copyBtn.addEventListener('click', function(){ ui.copy(main.numero, copyBtn); });
    view.appendChild(h('div', {class:'alertband'}, [
      h('span', {class:'label', style:'color:inherit;opacity:.85', text:t(A + 'sur')}),
      h('h2', {text:t(A + 'titre')}),
      h('div', {class:'callnum', text:main.numero}),
      h('div', {class:'row'}, [h('a', {class:'btn', href:'tel:' + main.numero, text:t(A + 'appeler', {numero:main.numero})}), copyBtn]),
      other ? h('p', {class:'small', text:t(A + 'sinon', {nom:t('urgence.' + other.id), numero:other.numero})}) : null
    ]));

    var words = SIGNS.map(function(k){ return t('fast.etapes.' + k).nom + ' : ' + t('fast.choix.' + ans[k]).toLowerCase(); }).join(' · ');
    view.appendChild(ui.card(t(A + 'observe'), [h('p', {text:words}), h('p', {class:'small muted', text:t(A + 'horloge', {heure:hhmm(at), debut:ans.debut.toLowerCase()})})]));

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
    view.appendChild(ui.back(restart, t(A + 'refaire')));

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

    function sms(){
      var S = 'fast.sms.', w = function(k){ return t('fast.etapes.' + k).nom + ' ' + ans[k].toUpperCase(); };
      var lines = [t(S + 'titre'), t(S + 'heure') + hhmm(at), t(S + 'debut') + ans.debut, SIGNS.map(w).join(' / ')];
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
    CAA.say(t(A + 'voix'));
  }

  restart();
}});
