/* Modules simples : proches, hôpitaux, après l'AVC, réglages, et les modules à venir */

CAA.register({id:'proches', render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t;
  function draw(){
    view.innerHTML = '';
    var list = CAA.store.get('proches', []);
    view.appendChild(ui.head('proches'));
    view.appendChild(h('p', {class:'muted', text:t('proches.intro')}));
    view.appendChild(ui.card(null, list.length ? [h('div', {class:'rows'}, list.map(function(p, i){
      return h('div', {class:'rowline'}, [h('b', {text:p.nom}), h('span', {class:'tab muted', text:p.numero}),
        h('button', {class:'mini', text:t('commun.supprimer'), onclick:function(){ list.splice(i, 1); CAA.store.set('proches', list); draw(); }})]);
    }))] : [h('p', {class:'muted', text:t('proches.vide')})]));
    if (list.length >= 5){ view.appendChild(h('p', {class:'small muted', text:t('proches.max')})); }
    else {
      var nom = h('input', {type:'text', id:'pnom', placeholder:t('proches.exnom'), autocomplete:'off'});
      var num = h('input', {type:'text', id:'pnum', inputmode:'tel', placeholder:t('proches.exnum'), autocomplete:'off'});
      var err = h('p', {class:'note', hidden:true, text:t('proches.erreur')});
      view.appendChild(ui.card(t('commun.ajouter'), [
        h('label', {for:'pnom'}, [t('proches.nom'), nom]), h('label', {for:'pnum'}, [t('proches.numero'), num]), err,
        h('button', {class:'primary', text:t('commun.ajouter'), onclick:function(){
          var n = nom.value.trim(), x = num.value.trim();
          if (!n || x.replace(/\D/g, '').length < 7){ err.hidden = false; return; }
          list.push({nom:n, numero:x}); CAA.store.set('proches', list); draw();
        }})
      ]));
    }
    view.appendChild(ui.back());
  }
  draw();
}});

CAA.register({id:'hopitaux', render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t, pos = null, region = CAA.pref('region') || '';
  var regions = CAA.pays.hopitaux.map(function(x){ return x.region; }).filter(function(r, i, a){ return a.indexOf(r) === i; });
  function draw(msg){
    view.innerHTML = '';
    view.appendChild(ui.head('hopitaux'));
    var cx = CAA.centres(pos);
    view.appendChild(CAA.carte({pos:pos, points:CAA.pays.hopitaux, cible: pos ? cx.cible : null, proche: pos ? cx.proche : null}));
    if (pos && cx.cible) view.appendChild(h('p', {class:'instr', text:t('routage.resume', {proche:cx.proche.nom, kmp:Math.round(cx.dProche), cible:cx.cible.nom, kmc:Math.round(cx.dCible)})}));
    var sel = h('select', {id:'region', onchange:function(){ region = sel.value; draw(); }},
      [h('option', {value:'', text:t('hopitaux.toutes')})].concat(regions.map(function(r){ return h('option', {value:r, text:r, selected: r === region ? 'selected' : null}); })));
    view.appendChild(h('div', {class:'stack'}, [
      h('button', {class:'primary', text:t('hopitaux.autour'), onclick:function(){
        draw(t('hopitaux.cherche'));
        CAA.locate(function(p){ pos = p; draw(p ? null : t('hopitaux.gpsko')); });
      }}),
      msg ? h('p', {class:'status', text:msg}) : null, sel
    ]));
    var list = CAA.pays.hopitaux.filter(function(x){ return !region || x.region === region; })
      .map(function(x){ return {x:x, d: pos ? CAA.km(pos, x) : null}; });
    if (pos) list.sort(function(a, b){ return a.d - b.d; });
    view.appendChild(h('div', {class:'stack'}, list.map(function(o){
      return h('div', {class:'card'}, [
        h('b', {text:o.x.nom}),
        h('span', {class:'small muted', text:o.x.ville + (o.d != null ? ' · ' + t('hopitaux.distance', {km:Math.round(o.d)}) : '')}),
        h('div', {class:'pills'}, o.x.services.map(function(s){ return h('span', {class:'pill', text:t('hopitaux.services.' + s)}); })),
        o.x.tel ? h('a', {class:'small tab', href:'tel:' + o.x.tel.replace(/[^\d+]/g, ''), text:o.x.tel + (o.x.valide ? '' : ' · ' + t('routage.telavalider'))}) : null,
        h('a', {class:'small', href:'https://maps.google.com/?q=' + o.x.lat + ',' + o.x.lon, target:'_blank', rel:'noopener', text:t('hopitaux.itineraire')})
      ]);
    })));
    view.appendChild(h('p', {class:'small muted', text:t('hopitaux.note', {numero:CAA.principal().numero})}));
    view.appendChild(ui.back());
  }
  draw();
}});

/* Fiches d'information : pour en ajouter une, écrire ses « blocs » dans i18n et ajouter son nom ici */
['comprendre', 'apres'].forEach(function(id){
  CAA.register({id:id, render:function(view){
    var ui = CAA.ui, h = ui.h, t = CAA.t;
    view.appendChild(ui.head(id));
    t(id + '.blocs').forEach(function(b){ view.appendChild(ui.card(b.titre, [ui.list(b.points)])); });
    view.appendChild(h('p', {class:'small muted', text:t(id + '.note')}));
    view.appendChild(ui.back());
  }});
});

/* À venir : il suffira d'écrire leur fonction render pour les activer */
['association'].forEach(function(id){ CAA.register({id:id, bientot:true}); });

CAA.register({id:'reglages', hors:true, render:function(view){
  var ui = CAA.ui, h = ui.h, t = CAA.t, S = CAA.store;
  function check(key, text, note){
    var c = h('input', {type:'checkbox', id:'p_' + key, onchange:function(){ S.set(key, c.checked); CAA.applyLook(); draw(); }});
    c.checked = !!CAA.pref(key);
    return h('label', {class:'check', for:'p_' + key}, [c, h('span', {class:'stack tight'}, [h('span', {text:text}), note ? h('span', {class:'small muted', text:note}) : null])]);
  }
  function draw(msg){
    view.innerHTML = '';
    view.appendChild(ui.head('reglages'));
    view.appendChild(h('p', {class:'muted', text:t('reglages.intro')}));

    var sel = h('select', {id:'langue', onchange:function(){ S.set('langue', sel.value); draw(); }}, CAA.pays.langues.map(function(l){
      return h('option', {value:l.code, text:l.nom + (l.pret ? '' : ' (' + t('reglages.avenir') + ')'), disabled: l.pret ? null : 'disabled', selected: CAA.pref('langue') === l.code ? 'selected' : null});
    }));
    view.appendChild(ui.card(t('reglages.langue'), [sel, check('voix', t('reglages.voix'), t('reglages.voixnote'))]));

    var regions = CAA.pays.hopitaux.map(function(x){ return x.region; }).filter(function(r, i, a){ return a.indexOf(r) === i; });
    var reg = h('select', {id:'region', onchange:function(){ S.set('region', reg.value); draw(); }},
      [h('option', {value:'', text:t('reglages.sansregion')})].concat(regions.map(function(r){ return h('option', {value:r, text:r, selected: CAA.pref('region') === r ? 'selected' : null}); })));
    view.appendChild(ui.card(t('reglages.urgence'), [
      check('gps', t('reglages.gps'), t('reglages.gpsnote')),
      check('routage', t('reglages.routage'), t('reglages.routagenote')),
      h('label', {for:'region'}, [t('reglages.region'), reg]),
      check('proches', t('reglages.proches')),
      check('vibre', t('reglages.vibre')),
      check('eveil', t('reglages.eveil'))
    ]));

    view.appendChild(ui.card(t('reglages.affichage'), [
      check('picto', t('reglages.picto')),
      check('grand', t('reglages.grand')),
      check('contraste', t('reglages.contraste'))
    ]));

    var journal = S.get('journal', []);
    view.appendChild(ui.card(t('reglages.donnees'), [
      check('accord', t('reglages.accord')),
      h('p', {class:'small muted', text:t('reglages.accordnote')}),
      h('p', {class:'small', text:t('reglages.journal', {n:journal.length})}),
      journal.length ? h('p', {class:'small muted', text:t('reglages.apercu')}) : null,
      journal.length ? h('pre', {text:JSON.stringify(journal[journal.length - 1], null, 1)}) : null
    ]));

    var armed = false, erase = h('button', {class:'ghost', text:t('reglages.effacer')});
    erase.addEventListener('click', function(){
      if (!armed){ armed = true; erase.textContent = t('reglages.confirmer'); erase.className = 'danger'; return; }
      S.clear(); CAA.applyLook(); draw(t('reglages.efface'));
    });
    view.appendChild(h('button', {class:'ghost', text:t('reglages.defauts'), onclick:function(){
      Object.keys(CAA.DEFAUTS).forEach(function(k){ if (k !== 'accord' && k !== 'langue') S.set(k, CAA.DEFAUTS[k]); });
      CAA.applyLook(); draw(t('reglages.defautsok'));
    }}));
    view.appendChild(erase);
    if (msg) view.appendChild(h('p', {class:'note', text:msg}));
    view.appendChild(ui.back());
  }
  draw();
}});
