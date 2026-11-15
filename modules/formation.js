/* Mode formateur : des cas fictifs pour s'entraîner à reconnaître un AVC et à réagir.
   Pensé pour les agents de santé communautaires et les relais de la CAA. Les cas sont dans i18n (formation.cas). */
CAA.register({id:'formation', render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t;
  var CAS = t('formation.cas'), i = 0, score = 0, best = CAA.store.get('formation_best', null);

  function intro(){
    view.innerHTML = '';
    view.appendChild(ui.head('formation'));
    view.appendChild(h('p', {class:'muted', text:t('formation.intro', {n:CAS.length})}));
    if (best != null) view.appendChild(h('p', {class:'instr', text:t('formation.meilleur', {n:best, total:CAS.length})}));
    view.appendChild(h('button', {class:'primary big', text:t('formation.commencer'), onclick:function(){ i = 0; score = 0; cas(); }}));
    view.appendChild(ui.back());
  }

  function cas(){
    var c = CAS[i];
    view.innerHTML = '';
    view.appendChild(ui.dots(CAS.length, i));
    view.appendChild(h('div', {class:'stack'}, [ui.label(t('formation.cas_n', {n:i + 1, total:CAS.length})), h('h2', {text:c.titre})]));
    view.appendChild(h('p', {class:'instr', text:c.recit}));
    view.appendChild(h('p', {text:t('formation.question')}));
    view.appendChild(h('div', {class:'stack'}, c.choix.map(function(label, k){
      return h('button', {text:label, onclick:function(){ retour(k === c.bonne, c); }});
    })));
    view.appendChild(ui.back(intro, t('formation.quitter')));
  }

  function retour(ok, c){
    if (ok) score++;
    view.innerHTML = '';
    view.appendChild(h('div', {class:'level ' + (ok ? 'bas' : 'eleve')}, [h('h2', {text:t(ok ? 'formation.bravo' : 'formation.rate')})]));
    view.appendChild(ui.card(t('formation.explication'), [h('p', {text:c.explication})]));
    view.appendChild(h('button', {class:'primary', text:t(i + 1 < CAS.length ? 'formation.suivant' : 'formation.resultat'), onclick:function(){
      i++; if (i < CAS.length) cas(); else fin();
    }}));
  }

  function fin(){
    if (best == null || score > best){ best = score; CAA.store.set('formation_best', best); }
    CAA.track('formation', {score:score, total:CAS.length});
    var lvl = score === CAS.length ? 'bas' : score >= Math.ceil(CAS.length * 0.6) ? 'moyen' : 'eleve';
    view.innerHTML = '';
    view.appendChild(h('div', {class:'level ' + lvl}, [
      h('span', {class:'label', style:'color:inherit;opacity:.85', text:t('formation.score')}),
      h('h2', {text:score + ' / ' + CAS.length}),
      h('span', {class:'score', text:t('formation.niveau_' + lvl)})
    ]));
    if (lvl !== 'eleve'){
      var nom = h('input', {type:'text', id:'fnom', placeholder:t('formation.nomex'), autocomplete:'off'});
      var att = h('div', {class:'card attest', hidden:true});
      view.appendChild(ui.card(t('formation.attestation'), [
        h('label', {for:'fnom'}, [t('formation.nom'), nom]),
        h('button', {class:'primary', text:t('formation.generer'), onclick:function(){
          att.innerHTML = ''; att.hidden = false;
          att.appendChild(h('span', {class:'label', text:'CAA.app · ' + CAA.pays.nom}));
          att.appendChild(h('h2', {text:t('formation.attest_titre')}));
          att.appendChild(h('p', {text:t('formation.attest_texte', {nom:nom.value.trim() || '—', score:score, total:CAS.length, date:new Date().toLocaleDateString('fr-FR')})}));
          att.appendChild(h('p', {class:'small muted', text:t('formation.attest_note')}));
        }}),
        att
      ]));
    }
    view.appendChild(h('button', {class:'ghost', text:t('formation.refaire'), onclick:function(){ i = 0; score = 0; cas(); }}));
    view.appendChild(ui.back());
  }

  intro();
}});
