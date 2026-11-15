/* Module suivi : carnet de tension, gardé sur le téléphone */
CAA.register({id:'tension', render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t;
  function level(s, d){ return (s >= 180 || d >= 120) ? 'eleve' : (s >= 140 || d >= 90) ? 'moyen' : 'bas'; }
  function day(iso){ var d = new Date(iso); return d.toLocaleDateString('fr-FR', {day:'numeric', month:'short'}); }

  function chart(list){
    var pts = list.slice(-12), W = 300, H = 90, lo = 90, hi = 200;
    var y = function(v){ return H - 10 - (Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo) * (H - 20); };
    var x = function(i){ return 10 + i * (W - 20) / (pts.length - 1); };
    var line = pts.map(function(p, i){ return x(i).toFixed(1) + ',' + y(p.s).toFixed(1); }).join(' ');
    var last = pts[pts.length - 1];
    var box = h('div', {class:'chart'});
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + t('tension.evolution') + '">' +
      '<line x1="10" x2="' + (W - 10) + '" y1="' + y(140) + '" y2="' + y(140) + '" stroke="var(--line)" stroke-dasharray="4 4" fill="none"/>' +
      '<text x="12" y="' + (y(140) - 4) + '" font-size="9" fill="var(--muted)">' + t('tension.seuil') + '</text>' +
      '<polyline points="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + x(pts.length - 1).toFixed(1) + '" cy="' + y(last.s).toFixed(1) + '" r="4" fill="var(--accent)"/></svg>';
    return box;
  }

  function draw(){
    view.innerHTML = '';
    var list = CAA.store.get('tension', []);
    view.appendChild(ui.head('tension'));

    var sys = h('input', {type:'number', id:'sys', inputmode:'numeric', placeholder:t('tension.exsys')});
    var dia = h('input', {type:'number', id:'dia', inputmode:'numeric', placeholder:t('tension.exdia')});
    var err = h('p', {class:'note', hidden:true, text:t('tension.erreur')});
    view.appendChild(ui.card(t('tension.nouvelle'), [
      h('div', {class:'two'}, [h('label', {for:'sys'}, [t('tension.sys'), sys]), h('label', {for:'dia'}, [t('tension.dia'), dia])]),
      err,
      h('button', {class:'primary', text:t('tension.noter'), onclick:function(){
        var s = parseInt(sys.value, 10), d = parseInt(dia.value, 10);
        if (!(s >= 60 && s <= 260 && d >= 30 && d <= 160 && s > d)){ err.hidden = false; return; }
        list.push({d:new Date().toISOString(), s:s, di:d});
        CAA.store.set('tension', list.slice(-200));
        CAA.track('tension', {niveau:level(s, d)});
        draw();
      }})
    ]));

    if (!list.length){ view.appendChild(h('p', {class:'muted', text:t('tension.vide')})); }
    else {
      var last = list[list.length - 1], lvl = level(last.s, last.di);
      view.appendChild(h('div', {class:'level ' + lvl}, [
        h('span', {class:'label', style:'color:inherit;opacity:.85', text:t('tension.derniere')}),
        h('h2', {text:last.s + ' / ' + last.di}),
        h('span', {class:'score', text:t('tension.niveaux.' + lvl) + '. ' + t('tension.messages.' + lvl, {numero:CAA.principal().numero})})
      ]));
      if (list.length >= 2) view.appendChild(ui.card(t('tension.evolution'), [chart(list)]));
      view.appendChild(ui.card(t('tension.historique'), [h('div', {class:'rows'}, list.slice(-10).reverse().map(function(m){
        var l = level(m.s, m.di);
        return h('div', {class:'rowline'}, [h('span', {class:'muted', text:day(m.d)}), h('b', {class:'tab', text:m.s + ' / ' + m.di}), h('span', {class:'pill ' + l, text:t('tension.niveaux.' + l)})]);
      }))]));
    }
    view.appendChild(h('p', {class:'small muted', text:t('tension.note')}));
    view.appendChild(ui.back());
  }
  draw();
}});
