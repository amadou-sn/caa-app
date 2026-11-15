/* Module urgence : signes de rupture d'anévrisme. Règle de décision À VALIDER par le neurochirurgien référent :
   un mal de tête brutal suffit à déclencher l'alerte ; les deux autres signes seuls conduisent à consulter. */
CAA.register({id:'anevrisme', render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t;
  var KEYS = ['tete','nuque','lumiere','debut'], SIGNS = ['tete','nuque','lumiere'];
  var step = 0, ans = {};

  function draw(){
    var k = KEYS[step], s = k === 'debut' ? t('fast.etapes.debut') : t('anevrisme.etapes.' + k);
    var choix = k === 'debut'
      ? t('fast.debuts').map(function(d){ return {texte:d, clic:function(){ pick(k, d); }}; })
      : ['oui','non','doute'].map(function(c, i){ return {texte:t('fast.choix.' + c), classe: i === 0 ? 'danger' : '', clic:function(){ pick(k, c); }}; });
    var key = k === 'debut' ? 'fast.etapes.debut' : 'anevrisme.etapes.' + k, picto = k === 'debut' ? 'heure' : k;
    ui.question(view, {n:step, total:KEYS.length, picto:picto, etiquette:t('fast.etape', {nom:s.nom, n:step + 1, total:KEYS.length}),
      q:s.q, aide:s.aide, choix:choix, ecouter:function(){ CAA.say(s.aide + ' ' + s.q, key); },
      retour:function(){ if (step === 0) CAA.go('home'); else { step--; draw(); } }});
    CAA.say(s.aide + ' ' + s.q, key);
  }

  function pick(k, v){
    ans[k] = v;
    if (step < KEYS.length - 1){ step++; draw(); return; }
    var n = SIGNS.filter(function(x){ return ans[x] !== 'non'; }).length;
    CAA.track('test_anevrisme', {tete:ans.tete, nuque:ans.nuque, lumiere:ans.lumiere, debut:ans.debut, signes:n});
    if (ans.tete === 'non') return calm(n > 0 ? 'doute' : 'rien');
    CAA.alerte(view, {
      sur:t('anevrisme.alerte.sur'), titre:t('fast.alerte.titre'), voix:t('anevrisme.alerte.voix'), voixCle:'anevrisme.alerte.voix', debut:ans.debut,
      resume:SIGNS.map(function(x){ return t('anevrisme.etapes.' + x).nom + ' : ' + t('fast.choix.' + ans[x]).toLowerCase(); }).join(' · '),
      smsTitre:t('anevrisme.alerte.sms'),
      smsSignes:SIGNS.map(function(x){ return t('anevrisme.etapes.' + x).nom + ' ' + ans[x].toUpperCase(); }).join(' / '),
      refaire:restart
    });
  }

  function calm(kind){
    view.innerHTML = '';
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('fast.rien.sur')), h('h2', {text:t('anevrisme.' + kind + '.titre')}), h('p', {class:'muted', text:t('anevrisme.' + kind + '.texte')})]));
    view.appendChild(CAA.numbers());
    view.appendChild(h('button', {class:'primary', text:t('fast.rien.refaire'), onclick:restart}));
    view.appendChild(ui.back());
  }

  function restart(){ step = 0; ans = {}; draw(); }
  restart();
}});
