/* BuroPratika 5.1 — Percorso universale ATECO. Dati dichiarati, non attestazioni normative. */
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
    section.innerHTML=`<div class="plan-label">BuroPratika 5.1 · Percorso universale ATECO</div><h2>Dimmi cosa vuoi fare: ti mostro l'ordine dei passaggi</h2><p>Un percorso orientativo e personalizzato. La presenza di uno step non prova che sia obbligatorio nel tuo caso; gli adempimenti normativi specifici richiedono una fonte ufficiale verificata.</p><div class="vivo-grid">
      <div class="vivo-card"><label for="bp50-op">Operazione</label><select id="bp50-op">${Object.entries(operations).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('')}</select></div>
      <div class="vivo-card"><label for="bp50-activity">Attività da svolgere</label><input id="bp50-activity" maxlength="120" placeholder="Es. gelateria, parrucchiere, negozio"></div>
      <div class="vivo-card"><label for="bp50-ateco">Codice ATECO (tutte le attività)</label><input id="bp50-ateco" maxlength="20" placeholder="Es. 96.21.00" autocomplete="off"><label for="bp51-search">Oppure cerca codice / attività ATECO</label><input id="bp51-search" maxlength="100" placeholder="Es. gelateria, acconciatore, commercio"><div id="bp51-choices" class="mini" aria-live="polite"></div></div>
      <div class="vivo-card"><label for="bp50-region">Regione</label><select id="bp50-region"><option>Marche</option><option>Abruzzo</option><option>Basilicata</option><option>Calabria</option><option>Campania</option><option>Emilia-Romagna</option><option>Friuli-Venezia Giulia</option><option>Lazio</option><option>Liguria</option><option>Lombardia</option><option>Molise</option><option>Piemonte</option><option>Puglia</option><option>Sardegna</option><option>Sicilia</option><option>Toscana</option><option>Trentino-Alto Adige</option><option>Umbria</option><option>Valle d’Aosta</option><option>Veneto</option></select><label for="bp50-city">Comune</label><input id="bp50-city" maxlength="80" placeholder="Es. Ancona"></div>
      <div class="vivo-card"><label for="bp50-food">Attività alimentare o somministrazione?</label><select id="bp50-food"><option value="incerto">Da definire</option><option value="si">Sì</option><option value="no">No</option></select></div>
      <div class="vivo-card"><label for="bp51-emission">Scarichi / emissioni potenzialmente rilevanti?</label><select id="bp51-emission"><option value="incerto">Da verificare</option><option value="si">Sì</option><option value="no">No</option></select><label for="bp51-public">Accesso del pubblico nei locali?</label><select id="bp51-public"><option value="incerto">Da verificare</option><option value="si">Sì</option><option value="no">No</option></select></div><div class="vivo-card"><label for="bp50-premises">Situazione dei locali</label><select id="bp50-premises"><option value="incerto">Da verificare</option><option value="esistenti">Già individuati</option><option value="nuovi">Da scegliere / modificare</option><option value="nessuno">Non necessari / da confermare</option></select></div>
      </div><div class="vivo-actions"><button class="btn" id="bp50-generate" type="button">Genera percorso ordinato</button><button class="btn outline" id="bp50-export" type="button" disabled>Scarica checklist</button><button class="btn outline" id="bp50-copy" type="button" disabled>Copia riepilogo</button></div><div id="bp50-status" class="mini" role="status"></div><div id="bp50-results" aria-live="polite"></div>`;
    const anchor=el('workspace')||el('pratiche')||document.querySelector('main')||document.body;anchor.before(section);
    const nav=document.querySelector('.navline .shell');if(nav){const a=document.createElement('a');a.href='#bp50-guide';a.textContent='Percorso guidato';nav.prepend(a);}
    let current=null;
    const read=()=>({op:el('bp50-op').value,activity:el('bp50-activity').value.trim(),ateco:el('bp50-ateco').value.trim(),region:el('bp50-region').value,city:el('bp50-city').value.trim(),food:el('bp50-food').value,emission:el('bp51-emission').value,publicAccess:el('bp51-public').value,premises:el('bp50-premises').value});
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
    // Ogni catalogo fornisce INDIZI documentali: non si può dedurre automaticamente
    // completezza normativa da una descrizione ATECO o dal flag di revisione.
    let catalogClient=null;
    async function getClient(){
      if(catalogClient)return catalogClient;
      let conf={};try{conf=JSON.parse(localStorage.getItem('buropratika_public_config')||'{}')}catch{}
      if(!conf.key)throw Error('Collega Supabase nel Fascicolo Vivo');
      const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
      catalogClient=createClient('https://bqcaohfochwweymgfjtd.supabase.co',conf.key);
      return catalogClient;
    }
    const clean=s=>String(s||'').trim().toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const validLink=s=>/^https:\/\/[^\s]+$/i.test(s||'');
    const sectorMatch=(s,d)=>{
      if(!s)return true;
      const a=clean(d.activity),r=clean(s);
      return r===a || (!!a && (a.includes(r)||r.includes(a)));
    };
    const phase=t=>/abilitaz|requisit|responsabile|qualific/i.test(t)?2:/locali|urbanist|sicurezza|accessibil|scarich|emission/i.test(t)?3:/scia|suap|notifica|sanitari|autorizz|modulistica/i.test(t)?4:/camera|comunica|registro|previdenz|fiscal/i.test(t)?5:/firma|presentaz|invio/i.test(t)?7:6;
    const NORM_OP={cessione:['cessione','subingresso'],modifica:['modifica','variazione'],trasferimento:['trasferimento','trasferimento sede']};
    async function loadVerified(d){
      const out=el('bp50-specific');if(!out)return;
      out.textContent='Verifico gli adempimenti disponibili nei cataloghi...';
      try{
        const client=await getClient();
        const accepted=NORM_OP[d.op]||[d.op];
        const results=await Promise.allSettled([
          client.from('bp_regole_adempimenti_v1').select('titolo,regione,comune,settore,operazione,ente_competente,fonte_ufficiale,verificata_il,attiva').eq('attiva',true).in('operazione',accepted).limit(250),
          client.from('bp_adempimenti_universali').select('titolo,tipo_pratica,prefisso_ateco,campo_condizione,valore_condizione,ente,fonte_ufficiale,verificato,attivo').eq('attivo',true).in('tipo_pratica',accepted).limit(300),
          client.from('bp_regole_ateco_v1').select('titolo,prefisso_ateco,tipo_pratica,regione,comune,descrizione,fonte_ufficiale,stato_verifica,attiva').eq('attiva',true).in('tipo_pratica',accepted).limit(250)
        ]);
        const rows=[];const errors=[];
        function collect(i){const r=results[i];if(r.status!=='fulfilled'||r.value.error){errors.push(['territoriali','generali','ATECO'][i]);return [];}return r.value.data||[];}
        for(const r of collect(0)){
          if(r.regione&&clean(r.regione)!==clean(d.region))continue;
          if(r.comune&&clean(r.comune)!==clean(d.city))continue;
          if(!sectorMatch(r.settore,d))continue;
          rows.push({title:r.titolo,ente:r.ente_competente,url:r.fonte_ufficiale,verified:!!r.verificata_il,source:'Territoriale',review:r.verificata_il});
        }
        for(const r of collect(1)){
          if(r.prefisso_ateco && !d.ateco.startsWith(r.prefisso_ateco))continue;
          if(r.campo_condizione){
            const map={alimenti:d.food,emissioni_scarichi:d.emission,accesso_pubblico:d.publicAccess};
            let v=map[r.campo_condizione];
            if(v==='no')continue;
            // Una risposta mancante non trasforma il requisito in obbligo.
            if(!v)v='incerto';
          }
          rows.push({title:r.titolo,ente:r.ente,url:r.fonte_ufficiale,verified:r.verificato===true,source:'Generale',conditional:!!r.campo_condizione});
        }
        for(const r of collect(2)){
          if(r.prefisso_ateco && !d.ateco.startsWith(r.prefisso_ateco))continue;
          if(r.regione&&clean(r.regione)!==clean(d.region))continue;
          if(r.comune&&clean(r.comune)!==clean(d.city))continue;
          rows.push({title:r.titolo,ente:'Ente competente da verificare',url:r.fonte_ufficiale,verified:clean(r.stato_verifica)==='verificato',source:'ATECO'});
        }
        const unique=new Map();
        for(const r of rows){const k=clean(r.title).replace(/\s+/g,' ');if(!unique.has(k)||(!unique.get(k).verified&&r.verified))unique.set(k,r);}
        const ordered=[...unique.values()].sort((a,b)=>phase(a.title)-phase(b.title)||a.title.localeCompare(b.title,'it'));
        out.replaceChildren();
        const h=document.createElement('h3');h.textContent='Controlli specifici disponibili — in ordine di fase';out.append(h);
        const intro=document.createElement('p');intro.textContent=`${ordered.length} voci pertinenti individuate nei cataloghi; ${ordered.filter(x=>x.verified).length} con revisione segnalata. La revisione della fonte non certifica l'applicabilità al caso concreto.`;out.append(intro);
        if(!d.ateco){const p=document.createElement('p');p.textContent='ATECO non indicato: le regole specifiche per codice non possono essere selezionate correttamente.';out.append(p);}
        if(errors.length){const p=document.createElement('p');p.textContent='Cataloghi temporaneamente non consultabili: '+errors.join(', ')+'. Il risultato potrebbe essere incompleto.';out.append(p);}
        if(!ordered.length){const p=document.createElement('p');p.textContent='Nessuna regola specifica corrispondente nel catalogo attuale. Il percorso generale resta utilizzabile, ma NON significa che non siano previsti adempimenti. Controlla SUAP e norme settoriali.';out.append(p);}
        for(const r of ordered){
          const card=document.createElement('article');card.className='rule-card';
          const title=document.createElement('strong');title.textContent='Fase '+phase(r.title)+' · '+r.title;
          const note=document.createElement('p');note.textContent=(r.verified?'Fonte revisionata in catalogo':'Da verificare / fonte non revisionata')+' · '+r.source+(r.conditional?' · dipende dalle caratteristiche effettive dell’attività':'')+' · '+(r.ente||'Ente da determinare');
          card.append(title,note);
          if(validLink(r.url)){const a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Consulta fonte ufficiale';card.append(a);}
          out.append(card);
        }
        const warning=document.createElement('p');warning.className='vivo-action-note';warning.textContent='Copertura normativa non esaustiva: gli adempimenti obbligatori, l’ordine vincolante e i termini devono essere confermati per attività, Comune e condizioni concrete. Nessun invio automatico.';out.append(warning);
      }catch(e){out.textContent='Cataloghi non disponibili: '+e.message+'. Il percorso generale resta una guida di preparazione, non una verifica normativa.';}
    }
    let lookupTicket=0;
    async function searchAteco(){
      const query=el('bp51-search').value.trim(),out=el('bp51-choices');
      const ticket=++lookupTicket;out.replaceChildren();
      if(query.length<2){out.textContent='Digita almeno due caratteri per cercare tra i codici ATECO.';return;}
      out.textContent='Ricerca ATECO...';
      try{
        const client=await getClient();
        const cleanQuery=query.replace(/[%_,()]/g,' ').trim();
        const {data,error}=await client.from('bp_ateco_catalogo_v1').select('codice,descrizione').or('codice.ilike.%'+cleanQuery+'%,descrizione.ilike.%'+cleanQuery+'%').limit(25);
        if(error)throw error;if(ticket!==lookupTicket)return;
        out.replaceChildren();
        if(!data?.length){out.textContent='Nessuna corrispondenza: puoi comunque inserire manualmente attività e codice.';return;}
        for(const a of data){const b=document.createElement('button');b.type='button';b.className='btn outline';b.style.cssText='display:block;text-align:left;width:100%;margin:5px 0';b.textContent=a.codice+' — '+a.descrizione;b.onclick=()=>{el('bp50-ateco').value=a.codice;el('bp50-activity').value=a.descrizione;el('bp51-search').value=a.codice+' — '+a.descrizione;out.replaceChildren();};out.append(b);}
      }catch(e){if(ticket===lookupTicket)out.textContent='Ricerca ATECO non disponibile: '+e.message+'. Inserisci il codice manualmente.';}
    }
    let searchTimer;
    el('bp51-search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(searchAteco,350);});
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
