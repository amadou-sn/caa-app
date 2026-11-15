/* Module prévention : questionnaire de risque. Les points sont ici, les textes dans i18n. */
CAA.register({id:'risque', render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t;
  /* points par option, dans l'ordre des options ; inconnu = index de « Je ne sais pas » */
  var BAREME = [
    {key:'age', pts:[0,1,2,3]}, {key:'sexe', pts:[0,1]},
    {key:'hta', pts:[3,0,0], inconnu:2}, {key:'diabete', pts:[2,0,0], inconnu:2},
    {key:'tabac', pts:[2,0]}, {key:'sedentaire', pts:[1,0]},
    {key:'cholesterol', pts:[1,0,0], inconnu:2}, {key:'famille', pts:[2,0,0], inconnu:2}
  ];
  var MAX = BAREME.reduce(function(s, b){ return s + Math.max.apply(null, b.pts); }, 0);
  var step = 0, ans = {};

  function draw(){
    view.innerHTML = '';
    var b = BAREME[step], q = t('risque.questions.' + b.key);
    view.appendChild(ui.dots(BAREME.length, step));
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('risque.etape', {n:step + 1, total:BAREME.length})), h('h2', {text:q.q})]));
    if (q.aide) view.appendChild(h('p', {class:'instr', text:q.aide}));
    view.appendChild(h('div', {class:'stack'}, q.opts.map(function(label, i){
      return h('button', {text:label, onclick:function(){ ans[b.key] = i; if (step < BAREME.length - 1){ step++; draw(); } else result(); }});
    })));
    view.appendChild(ui.back(function(){ if (step === 0) CAA.go('home'); else { step--; draw(); } }, t('commun.retour')));
  }

  function result(){
    var total = 0, conseils = [], verifs = [], rec = {};
    BAREME.forEach(function(b){
      var i = ans[b.key], q = t('risque.questions.' + b.key), unknown = b.inconnu === i;
      total += b.pts[i];
      rec[b.key] = unknown ? 'inconnu' : b.pts[i];
      if (b.pts[i] > 0 && q.conseil) conseils.push(q.conseil);
      if (unknown && q.verifier) verifs.push(q.verifier);
    });
    var lvl = total >= 8 ? 'eleve' : total >= 4 ? 'moyen' : 'bas';
    rec.score = total; rec.niveau = lvl;
    CAA.track('risque', rec);

    view.innerHTML = '';
    view.appendChild(h('div', {class:'level ' + lvl}, [
      h('span', {class:'label', style:'color:inherit;opacity:.85', text:t('risque.sur')}),
      h('h2', {text:t('risque.niveaux.' + lvl)}),
      h('span', {class:'score', text:t('risque.score', {n:total, max:MAX})})
    ]));
    view.appendChild(h('p', {text:t('risque.messages.' + lvl)}));
    if (conseils.length) view.appendChild(ui.card(t('risque.changer'), [ui.list(conseils)]));
    if (verifs.length) view.appendChild(ui.card(t('risque.verifier'), [ui.list(verifs)]));
    view.appendChild(h('p', {class:'small muted', text:t('risque.note')}));
    view.appendChild(h('button', {class:'primary', text:t('risque.suite'), onclick:function(){ CAA.go('tension'); }}));
    view.appendChild(h('button', {class:'ghost', text:t('risque.refaire'), onclick:function(){ step = 0; ans = {}; draw(); }}));
    view.appendChild(ui.back());
  }

  draw();
}});
