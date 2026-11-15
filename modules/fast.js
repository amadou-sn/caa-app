/* Module urgence : test des signes d'AVC, puis écran d'alerte partagé */
CAA.register({id:'fast', icone:'alerte', urgent:true, render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t;
  var KEYS = ['visage','bras','parole','debut'], SIGNS = ['visage','bras','parole'];
  var step = 0, ans = {};

  function draw(){
    var k = KEYS[step], s = t('fast.etapes.' + k);
    var choix = k === 'debut'
      ? t('fast.debuts').map(function(d){ return {texte:d, clic:function(){ pick(k, d); }}; })
      : ['oui','non','doute'].map(function(c, i){ return {texte:t('fast.choix.' + c), classe: i === 0 ? 'danger' : '', clic:function(){ pick(k, c); }}; });
    var key = 'fast.etapes.' + k, picto = {visage:'visage', bras:'bras', parole:'parole', debut:'heure'}[k];
    ui.question(view, {n:step, total:KEYS.length, lettre:s.lettre, picto:picto, etiquette:t('fast.etape', {nom:s.nom, n:step + 1, total:KEYS.length}),
      q:s.q, aide:s.aide, choix:choix, ecouter:function(){ CAA.say(s.aide + ' ' + s.q, key); },
      retour:function(){ if (step === 0) CAA.go('home'); else { step--; draw(); } }});
    CAA.say(s.aide + ' ' + s.q, key);
  }

  function pick(k, v){
    ans[k] = v;
    if (step < KEYS.length - 1){ step++; draw(); return; }
    var n = SIGNS.filter(function(x){ return ans[x] !== 'non'; }).length;
    CAA.track('test_avc', {visage:ans.visage, bras:ans.bras, parole:ans.parole, debut:ans.debut, signes:n});
    if (n === 0) return clear();
    CAA.alerte(view, {
      sur:t('fast.alerte.sur'), titre:t('fast.alerte.titre'), voix:t('fast.alerte.voix'), debut:ans.debut,
      resume:SIGNS.map(function(x){ return t('fast.etapes.' + x).nom + ' : ' + t('fast.choix.' + ans[x]).toLowerCase(); }).join(' · '),
      smsTitre:t('fast.sms.titre'),
      smsSignes:SIGNS.map(function(x){ return t('fast.etapes.' + x).nom + ' ' + ans[x].toUpperCase(); }).join(' / '),
      refaire:restart
    });
  }

  function clear(){
    view.innerHTML = '';
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('fast.rien.sur')), h('h2', {text:t('fast.rien.titre')}), h('p', {class:'muted', text:t('fast.rien.texte')})]));
    view.appendChild(CAA.numbers());
    view.appendChild(h('button', {class:'primary', text:t('fast.rien.refaire'), onclick:restart}));
    view.appendChild(ui.back());
  }

  function restart(){ step = 0; ans = {}; draw(); }
  restart();
}});
