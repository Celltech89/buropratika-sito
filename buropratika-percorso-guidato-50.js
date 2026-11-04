/* BuroPratika 5.0 — Percorso guidato. Dati dichiarati, non attestazioni normative. */
(() => {
  'use strict';
  if (window.BP_GUIDA_50) return;
  window.BP_GUIDA_50 = true;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const el = id => document.getElementById(id);
  const operations = {
    apertura:'Apertura attività',cessione:'Cessione / subingresso',modifica:'Variazione attività',cessazione:'Cessazione attività',trasferimento:'Trasferimento sede',bandi:'Bandi e incentivi'
  };
  const stages = {
    apertura:[
      ['Definisci attività e inquadramento','Descrivi precisamente cosa farai, la forma d’impresa e il codice ATECO da confermare.','Registro Imprese / commercialista','https://www.registroimprese.it/'],
      ['Verifica requisiti personali e professionali','Individua eventuali titoli, qualifiche, responsabili tecnici e requisiti soggettivi.','SUAP / enti di settore','https://www.impresainungiorno.gov.it/'],
      ['Controlla i locali','Verifica destinazione d’uso, conformità e idoneità dei locali prima di assumere impegni.','Comune / tecnico abilitato','https://www.impresainungiorno.gov.it/'],
      ['Identifica il procedimento comunale','Verifica se servano comunicazione, SCIA, autorizzazione o altri titoli e quale sia la sequenza prevista.','SUAP competente','https://www.impresainungiorno.gov.it/'],
      ['Predisponi impresa e posizioni','Valuta P.IVA, Registro Imprese, previdenza, assicurazione e ulteriori enti applicabili.','Commercialista / Registro Imprese','https://www.registroimprese.it/'],
      ['Prepara moduli e allegati','Scarica i modelli attuali e raccogli solo gli allegati richiesti per attività e Comune.','SUAP competente','https://www.impresainungiorno.gov.it/'],
      ['Firma e presenta attraverso il canale competente','Controlla la necessità di firma digitale, delega, versamenti e presentazione sul portale autorizzato.','SUAP / professionista','https://www.impresainungiorno.gov.it/'],
      ['Conserva ricevute e monitora prescrizioni','Registra protocolli, richieste di integrazione, condizioni e controlli successivi.','Enti competenti','https://www.impresainungiorno.gov.it/']
    ],
    cessione:[
      ['Definisci la natura dell’operazione','Distingui cessione d’azienda, ramo, affitto d’azienda, quote o subingresso: i percorsi non coincidono.','Professionista / notaio','https://www.registroimprese.it/'],
      ['Verifica il perimetro dell’attività','Individua autorizzazioni, beni, contratti, personale, passività e soggetti coinvolti.','Commercialista / legale','https://www.registroimprese.it/'],
      ['Verifica i requisiti del subentrante','Controlla i requisiti professionali e quelli richiesti dall’attività.','SUAP / professionista','https://www.impresainungiorno.gov.it/'],
      ['Definisci gli atti e le scadenze','Con il professionista competente chiarisci forma dell’atto, sequenza e data di efficacia.','Professionista / notaio','https://www.registroimprese.it/'],
      ['Prepara comunicazioni e allegati','Controlla procedimento SUAP e adempimenti camerali, fiscali e settoriali.','SUAP / Registro Imprese','https://www.impresainungiorno.gov.it/'],
      ['Firma e presenta gli atti dovuti','Usa gli strumenti ufficiali, previa verifica di atti e titoli necessari.','Professionista / enti','https://www.registroimprese.it/'],
      ['Conserva protocolli e passaggio consegne','Registra le ricevute e verifica eventuali integrazioni dopo il trasferimento.','Enti competenti','https://www.impresainungiorno.gov.it/']
    ],
    modifica:[
      ['Definisci precisamente la variazione','Indica cosa cambia: attività, superficie, legale rappresentante, locali o organizzazione.','Impresa / consulente','https://www.registroimprese.it/'],
      ['Controlla effetti su titoli e requisiti','Verifica se la variazione richiede nuove verifiche tecniche, sanitarie o professionali.','SUAP / tecnico','https://www.impresainungiorno.gov.it/'],
      ['Individua comunicazioni e aggiornamenti','Verifica pratica SUAP, Registro Imprese e altri adempimenti effettivamente applicabili.','SUAP / Registro Imprese','https://www.impresainungiorno.gov.it/'],
      ['Raccogli e firma gli allegati','Prepara modelli correnti ed eventuali asseverazioni.','Professionista competente','https://www.impresainungiorno.gov.it/'],
      ['Presenta e conserva le ricevute','Segui il canale richiesto e monitora eventuali integrazioni.','Enti competenti','https://www.impresainungiorno.gov.it/']
    ],
    trasferimento:[
      ['Verifica i nuovi locali','Controlla destinazione d’uso, requisiti e vincoli prima del trasferimento.','Comune / tecnico','https://www.impresainungiorno.gov.it/'],
      ['Individua enti e titoli interessati','Definisci se varia sede legale, unità locale e/o luogo di esercizio.','SUAP / Registro Imprese','https://www.registroimprese.it/'],
      ['Predisponi gli aggiornamenti','Verifica moduli, allegati, eventuali SCIA o autorizzazioni, e ordine degli invii.','SUAP competente','https://www.impresainungiorno.gov.it/'],
      ['Firma, presenta e aggiorna i registri','Utilizza i canali ufficiali pertinenti.','Professionista / enti','https://www.registroimprese.it/'],
      ['Archivia le ricevute','Controlla prescrizioni e integrazioni.','Enti competenti','https://www.impresainungiorno.gov.it/']
    ],
    cessazione:[
      ['Definisci cosa termina','Distingui cessazione dell’esercizio, chiusura impresa e chiusura P.IVA.','Commercialista','https://www.agenziaentrate.gov.it/'],
      ['Controlla i rapporti pendenti','Valuta contratti, dipendenti, licenze, beni, obblighi fiscali e previdenziali.','Professionisti competenti','https://www.registroimprese.it/'],
      ['Verifica i procedimenti di cessazione','Individua comunicazioni SUAP, camerali e settoriali richieste.','SUAP / Registro Imprese','https://www.impresainungiorno.gov.it/'],
      ['Predisponi, firma e trasmetti','Controlla i termini applicabili prima dell’invio.','Professionista / enti','https://www.registroimprese.it/'],
      ['Conserva le ricevute e concludi','Verifica le chiusure effettive e gli obblighi residui.','Enti competenti','https://www.registroimprese.it/']
    ],
    bandi:[
      ['Definisci progetto e costi','Stabilisci obiettivo, spese e tempi senza assumere che siano ammissibili.','Impresa / consulente','https://www.incentivi.gov.it/'],
      ['Cerca opportunità pertinenti','Filtra per territorio, settore, beneficiari e finalità.','Portali ufficiali','https://www.incentivi.gov.it/'],
      ['Leggi il bando integrale','Verifica ammissibilità, ATECO, dimensione, requisiti, scadenze e risorse.','Ente emanante','https://www.incentivi.gov.it/'],
      ['Raccogli preventivi e documenti','Controlla allegati, dichiarazioni e requisiti prima della domanda.','Ente / consulente','https://www.incentivi.gov.it/'],
      ['Presenta tramite il canale ufficiale','Rispetta modalità e termini effettivi indicati dal bando.','Ente emanante','https://www.incentivi.gov.it/'],
      ['Monitora istruttoria e rendicontazione','Conserva protocolli, spese e comunicazioni.','Ente emanante','https://www.incentivi.gov.it/']
    ]
  };
  const init = () => {
    if(el('bp50-guide'))return;
    const section=document.createElement('section');section.id='bp50-guide';section.className='vivo';
    section.style.cssText='max-width:1080px;margin:24px auto;padding:22px;scroll-margin-top:22px';
    section.innerHTML=`<div class="plan-label">BuroPratika 5.0 · Percorso guidato</div><h2>Dimmi cosa vuoi fare: ti mostro l'ordine dei passaggi</h2><p>Un percorso orientativo e personalizzato. La presenza di uno step non prova che sia obbligatorio nel tuo caso; gli adempimenti normativi specifici richiedono una fonte ufficiale verificata.</p><div class="vivo-grid">
      <div class="vivo-card"><label for="bp50-op">Operazione</label><select id="bp50-op">${Object.entries(operations).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('')}</select></div>
      <div class="vivo-card"><label for="bp50-activity">Attività da svolgere</label><input id="bp50-activity" maxlength="120" placeholder="Es. gelateria, parrucchiere, negozio"></div>
      <div class="vivo-card"><label for="bp50-ateco">ATECO (se noto)</label><input id="bp50-ateco" maxlength="20" placeholder="Es. 96.21.00"></div>
      <div class="vivo-card"><label for="bp50-region">Regione</label><select id="bp50-region"><option>Marche</option><option>Abruzzo</option><option>Emilia-Romagna</option><option>Lazio</option><option>Umbria</option><option>Toscana</option><option>Altra regione</option></select><label for="bp50-city">Comune</label><input id="bp50-city" maxlength="80" placeholder="Es. Ancona"></div>
      <div class="vivo-card"><label for="bp50-food">Attività alimentare o somministrazione?</label><select id="bp50-food"><option value="incerto">Da definire</option><option value="si">Sì</option><option value="no">No</option></select></div>
      <div class="vivo-card"><label for="bp50-premises">Situazione dei locali</label><select id="bp50-premises"><option value="incerto">Da verificare</option><option value="esistenti">Già individuati</option><option value="nuovi">Da scegliere / modificare</option><option value="nessuno">Non necessari / da confermare</option></select></div>
      </div><div class="vivo-actions"><button class="btn" id="bp50-generate" type="button">Genera percorso ordinato</button><button class="btn outline" id="bp50-export" type="button" disabled>Scarica checklist</button><button class="btn outline" id="bp50-copy" type="button" disabled>Copia riepilogo</button></div><div id="bp50-status" class="mini" role="status"></div><div id="bp50-results" aria-live="polite"></div>`;
    const anchor=el('workspace')||el('pratiche')||document.querySelector('main')||document.body;anchor.before(section);
    const nav=document.querySelector('.navline .shell');if(nav){const a=document.createElement('a');a.href='#bp50-guide';a.textContent='Percorso guidato';nav.prepend(a);}
    let current=null;
    const read=()=>({op:el('bp50-op').value,activity:el('bp50-activity').value.trim(),ateco:el('bp50-ateco').value.trim(),region:el('bp50-region').value,city:el('bp50-city').value.trim(),food:el('bp50-food').value,premises:el('bp50-premises').value});
    const key=d=>'bp50_checked_'+JSON.stringify([d.op,d.activity.toLowerCase(),d.ateco,d.region,d.city.toLowerCase()]);
    const status=t=>el('bp50-status').textContent=t;
    function additions(d){const a=[];
      if(['apertura','modifica','trasferimento','cessione'].includes(d.op)&&d.food!=='no')a.push(['Accertamento eventuali obblighi sanitari','Se si trattano alimenti o vi è somministrazione, verificare notifica sanitaria, HACCP e requisiti applicabili; non sono automatici.','ASL / SUAP','https://www.impresainungiorno.gov.it/']);
      if(['apertura','modifica','trasferimento'].includes(d.op)&&d.premises!=='nessuno')a.push(['Verifica approfondita dei locali','Controlla destinazione urbanistica, impianti, accessibilità, sicurezza e requisiti di settore nella situazione concreta.','Comune / tecnico','https://www.impresainungiorno.gov.it/']);
      return a;}
    function render(d){const saved=JSON.parse(localStorage.getItem(key(d))||'{}');const base=stages[d.op]||stages.apertura;const steps=[...base];
      const extra=additions(d);if(extra.length)steps.splice(Math.min(3,steps.length),0,...extra);
      current={d,steps};
      const done=steps.filter((s,i)=>saved[i]===true).length;
      const cap=`<div class="vivo-status"><strong>${esc(operations[d.op])}</strong> · ${esc(d.activity||'attività da specificare')} · ${esc(d.city||'Comune da indicare')}, ${esc(d.region)} · ATECO ${esc(d.ateco||'non indicato')}<p>${done}/${steps.length} controlli segnati svolti dall'utente, non certificati.</p></div>`;
      el('bp50-results').innerHTML=cap+steps.map((s,i)=>`<article class="rule-card"><label style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" data-bp50="${i}" ${saved[i]?'checked':''} style="width:auto;margin-top:5px"><span><strong>Passo ${i+1}. ${esc(s[0])}</strong></span></label><p>${esc(s[1])}</p><div class="rule-meta">Da confrontare con: ${esc(s[2])} · <a href="${esc(s[3])}" target="_blank" rel="noopener noreferrer">Consulta il portale ufficiale</a></div><small>Stato: orientamento preliminare — applicabilità non attestata.</small></article>`).join('')+'<div id="bp50-specific" class="vivo-status">Ricerca di regole specifiche revisionate…</div>';
      el('bp50-results').querySelectorAll('[data-bp50]').forEach(b=>b.addEventListener('change',()=>{const m=JSON.parse(localStorage.getItem(key(d))||'{}');m[b.dataset.bp50]=b.checked;localStorage.setItem(key(d),JSON.stringify(m));render(d);}));
      el('bp50-export').disabled=false;el('bp50-copy').disabled=false;
      loadVerified(d);
    }
    async function loadVerified(d){const out=el('bp50-specific');if(!out)return;
      let conf={};try{conf=JSON.parse(localStorage.getItem('buropratika_public_config')||'{}')}catch{}
      if(!conf.key){out.textContent='Regole aggiuntive non caricate: collega Supabase. La sequenza organizzativa è utilizzabile come guida preliminare.';return;}
      try{const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');const client=createClient('https://bqcaohfochwweymgfjtd.supabase.co',conf.key);const {data,error}=await client.from('bp_regole_adempimenti_v1').select('titolo,regione,comune,settore,operazione,ente_competente,fonte_ufficiale,verificata_il,attiva').eq('attiva',true).not('verificata_il','is',null).eq('operazione',d.op).limit(150);
       if(error)throw error;const lower=s=>String(s||'').trim().toLocaleLowerCase('it');const matches=(data||[]).filter(r=>(!r.regione||lower(r.regione)===lower(d.region))&&(!r.comune||lower(r.comune)===lower(d.city))&&(!r.settore||lower(r.settore)===lower(d.activity)));
       if(!matches.length){out.textContent='Nessuna regola territoriale revisionata corrisponde esattamente ai dati indicati. Verifica gli obblighi presso il SUAP; questa checklist non è esaustiva.';return;}
       out.replaceChildren();const h=document.createElement('h3');h.textContent='Regole territoriali presenti nel catalogo revisionato';out.append(h);
       matches.forEach(r=>{const p=document.createElement('p');p.textContent=`${r.titolo} — ${r.ente_competente||'Ente da verificare'} · Revisione ${r.verificata_il}. Da confermare per il caso concreto.`;out.append(p);if(/^https:\/\//.test(r.fonte_ufficiale||'')){const a=document.createElement('a');a.href=r.fonte_ufficiale;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Fonte istituzionale';out.append(a);}});
      }catch(e){out.textContent='Catalogo online non consultabile: '+e.message+'. Usa i collegamenti ufficiali indicati nei passi.';}
    }
    function printable(){if(!current)return '';const {d,steps}=current;const checked=JSON.parse(localStorage.getItem(key(d))||'{}');return [`BUROPRATIKA — PERCORSO GUIDATO (NON CERTIFICATO)`,`Operazione: ${operations[d.op]}`,`Attività: ${d.activity||'Non specificata'}`,`ATECO: ${d.ateco||'Da verificare'}`,`Territorio: ${d.city||'Comune da indicare'}, ${d.region}`,'',...steps.flatMap((s,i)=>[`${i+1}. ${checked[i]?'[SVOLTO DICHIARATO]':'[DA VERIFICARE]'} ${s[0]}`,s[1],`Ente: ${s[2]}`,`Portale: ${s[3]}`,'']),'AVVERTENZA: Percorso indicativo. Non sostituisce istruzioni aggiornate del SUAP o di professionisti abilitati.'].join('\n');}
    el('bp50-generate').onclick=()=>{const d=read();render(d);status('Percorso creato. I passi organizzativi non equivalgono ad autorizzazioni o obblighi accertati.');};
    el('bp50-export').onclick=()=>{const blob=new Blob([printable()],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='BuroPratika-percorso-guidato.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
    el('bp50-copy').onclick=async()=>{try{await navigator.clipboard.writeText(printable());status('Percorso copiato negli appunti.');}catch{status('Copia non disponibile su questo browser: usa Scarica checklist.');}};
    // Riuso non invasivo dei dati del fascicolo già compilato.
    el('bp50-activity').value=el('firmName')?.value||'';el('bp50-ateco').value=el('firmAteco')?.value||'';el('bp50-city').value=el('firmCity')?.value||'';
    if(el('firmRegion')?.value&&[...el('bp50-region').options].some(o=>o.value===el('firmRegion').value))el('bp50-region').value=el('firmRegion').value;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
