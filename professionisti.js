
/* BuroPratika 4.5 - area professionisti: PILOTA, non usare dati reali prima dei test RLS.
   Pubblicare solo nel ramo di prova. Non inserire chiavi private in questo file. */
(async function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const section = byId('professionisti');
  if (!section) return;
  const style = document.createElement('style');
  style.textContent = `
    #bpLive {margin-top:20px;padding:18px;border:1px solid #bed6d7;background:#fff;border-radius:16px}
    #bpLive h3 {margin:0 0 8px} #bpLive p {color:#516c72;font-size:14px}
    .bpl-card{border:1px solid #d6e4e2;border-radius:12px;padding:14px;margin:12px 0;background:#f9fcfb}
    .bpl-card strong{display:block}.bpl-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center}
    .bpl-actions button,#bpReload{padding:10px 12px;border-radius:9px;background:#176577;color:white;border:0;font-weight:650}
    .bpl-actions button:disabled{opacity:.5}.bpl-actions input,.bpl-actions textarea{padding:10px;border:1px solid #bbd1d3;border-radius:9px;max-width:100%;font:inherit}
    .bpl-actions textarea{width:100%;min-height:66px}.bpl-tag{font-size:12px;color:#42626a}
    #bpLiveStatus{white-space:pre-wrap;background:#edf5f3;padding:10px;border-radius:8px;margin:12px 0}
    #bpLive [hidden]{display:none!important}`;
  document.head.append(style);
  const wrap = document.createElement('section');
  wrap.id = 'bpLive';
  wrap.setAttribute('aria-label', 'Area professionisti collegata al database - prova');
  wrap.innerHTML = `<h3>Area operativa — anteprima collegata a Supabase</h3>
    <p>Questa area usa l'account del Fascicolo Vivo. Le richieste e i preventivi sono riservati ai soggetti autorizzati. <strong>Usa solo account e contenuti fittizi per i test.</strong> Non crea automaticamente nuove richieste né carica documenti.</p>
    <button type="button" id="bpReload">Aggiorna e verifica accesso</button>
    <div id="bpLiveStatus" role="status">Connessione in preparazione…</div>
    <div id="bpLiveContent"></div>`;
  section.append(wrap);
  const status = msg => {byId('bpLiveStatus').textContent = msg;};
  const content = byId('bpLiveContent');
  const el = (tag, text, cls) => {const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;};
  const action = (label, fn) => {const b=el('button',label);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;try{await fn();await reload();}catch(e){status('Operazione non riuscita: '+e.message);}finally{b.disabled=false;}});return b;};
  let sb, activeUser, rows=[];
  const maybeOne = async query => {const {data,error}=await query.maybeSingle();if(error)throw error;return data;};
  function publicConfig(){
    let saved={};try{saved=JSON.parse(localStorage.getItem('buropratika_public_config')||'{}')||{};}catch{}
    return {url:'https://bqcaohfochwweymgfjtd.supabase.co',key:typeof saved.key==='string'?saved.key:''};
  }
  async function connect(){
    const c=publicConfig();
    if(!c.key || !(c.key.startsWith('sb_publishable_') || c.key.startsWith('eyJ'))){
      status('Chiave pubblica Supabase non presente su questo browser. Collegala prima dalla sezione Bandi. Mai utilizzare chiavi secret o service_role.');return false;
    }
    if(!sb){const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');sb=createClient(c.url,c.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});}
    const {data,error}=await sb.auth.getUser();
    activeUser=error?null:data?.user;
    if(!activeUser){status('Non hai effettuato l’accesso. Accedi dal Fascicolo Vivo e premi Aggiorna.');return false;}
    return true;
  }
  async function must(query){const {data,error}=await query;if(error)throw error;return data||[];}
  async function reload(){
    content.replaceChildren();
    status('Verifica dell’accesso…');
    try{
      if(!await connect())return;
      // RLS deve limitare i risultati ai due soggetti autorizzati.
      rows=await must(sb.from('bp_richieste_consulenza')
        .select('id,impresa_user_id,professionista_user_id').limit(50));
      status('Accesso: '+activeUser.email+' · '+rows.length+' richieste visibili. Anteprima di prova, non utilizzabile con dati reali.');
      if(!rows.length){content.append(el('p','Nessuna richiesta associata al tuo account. La richiesta demo della pagina non viene inviata online.'));return;}
      for(const r of rows){
        const isImpresa=r.impresa_user_id===activeUser.id;
        const isPro=r.professionista_user_id===activeUser.id;
        if(!isImpresa&&!isPro)continue;
        const card=el('article',undefined,'bpl-card');
        card.append(el('strong',(isImpresa?'Impresa':'Professionista')+' · richiesta '+r.id.slice(0,8)),el('div','Richiesta collegata all’account','bpl-tag'));
        const p=await maybeOne(sb.from('bp_preventivi').select('id,richiesta_id,professionista_user_id,importo_euro,descrizione').eq('richiesta_id',r.id));
        if(!p){
          card.append(el('p','Preventivo non ancora disponibile.'));
          if(isPro){
            const controls=el('div',undefined,'bpl-actions');const amount=el('input');amount.type='number';amount.min='0';amount.max='9999999';amount.step='0.01';amount.placeholder='Importo €';amount.setAttribute('aria-label','Importo preventivo in euro');
            const description=el('textarea');description.maxLength=1800;description.placeholder='Descrizione del servizio e limiti del preventivo';description.setAttribute('aria-label','Descrizione preventivo');
            controls.append(amount,description,action('Proponi preventivo',async()=>{
              const value=Number(amount.value);
              if(!amount.value || !Number.isFinite(value) || value<0 || value>9999999 || !description.value.trim())throw Error('Inserisci importo e descrizione validi.');
              await must(sb.from('bp_preventivi').insert({richiesta_id:r.id,professionista_user_id:activeUser.id,importo_euro:value,descrizione:description.value.trim()}));
            }));card.append(controls);
          }
        } else {
          card.append(el('p','Preventivo: € '+Number(p.importo_euro).toLocaleString('it-IT',{minimumFractionDigits:2})+' — '+p.descrizione));
          const d=await maybeOne(sb.from('bp_decisioni_preventivi').select('preventivo_id,impresa_user_id,decisione').eq('preventivo_id',p.id));
          if(!d){
            card.append(el('p','In attesa della decisione dell’impresa.'));
            if(isImpresa){const controls=el('div',undefined,'bpl-actions');
              for(const decisione of ['accettato','rifiutato'])controls.append(action(decisione==='accettato'?'Accetta preventivo':'Rifiuta preventivo',async()=>{
                if(!confirm('Confermi: '+decisione+'? Questa è una registrazione di prova e NON firma un incarico professionale.'))return;
                await must(sb.from('bp_decisioni_preventivi').insert({preventivo_id:p.id,impresa_user_id:activeUser.id,decisione}));
              }));card.append(controls);}
          }else{
            card.append(el('p','Decisione dell’impresa: '+d.decisione+'. Questa conferma non sostituisce la sottoscrizione dell’incarico.'));
            if(d.decisione==='accettato'){
              const incarico=await maybeOne(sb.from('bp_incarichi').select('preventivo_id,stato').eq('preventivo_id',p.id));
              if(!incarico){if(isImpresa)card.append(action('Apri incarico da formalizzare',async()=>{await must(sb.from('bp_incarichi').insert({preventivo_id:p.id}));}));}
              else{
                card.append(el('p','Incarico: '+incarico.stato+'.'));
                const access=await maybeOne(sb.from('bp_accessi_fascicolo').select('preventivo_id,autorizzato').eq('preventivo_id',p.id));
                const authorized=access?.autorizzato===true;
                card.append(el('p','Collaborazione tramite messaggi: '+(authorized?'autorizzata':'non autorizzata')+'. I documenti del Fascicolo Vivo non sono condivisi da questa funzione.'));
                if(isImpresa){
                  card.append(action(authorized?'Revoca accesso ai messaggi':'Autorizza messaggi di incarico',async()=>{
                    if(access){await must(sb.from('bp_accessi_fascicolo').update({autorizzato:!authorized,aggiornato_il:new Date().toISOString(),autorizzato_il:!authorized?new Date().toISOString():null}).eq('preventivo_id',p.id));}
                    else await must(sb.from('bp_accessi_fascicolo').insert({preventivo_id:p.id,autorizzato:true,autorizzato_il:new Date().toISOString()}));
                  }));
                }
                if(authorized){
                  const messages=await must(sb.from('bp_messaggi_incarico').select('id,mittente_user_id,messaggio,created_at').eq('preventivo_id',p.id).order('created_at',{ascending:true}).limit(30));
                  const list=el('div');for(const m of messages)list.append(el('p',(m.mittente_user_id===activeUser.id?'Tu':'Altro partecipante')+': '+m.messaggio));
                  card.append(list);
                  const entry=el('textarea');entry.maxLength=5000;entry.placeholder='Messaggio di prova, senza dati personali';entry.setAttribute('aria-label','Messaggio di incarico');
                  card.append(entry,action('Invia messaggio',async()=>{
                    if(!entry.value.trim())throw Error('Il messaggio è vuoto.');
                    await must(sb.from('bp_messaggi_incarico').insert({preventivo_id:p.id,mittente_user_id:activeUser.id,messaggio:entry.value.trim()}));
                  }));
                }
              }
            }
          }
        }
        content.append(card);
      }
    }catch(e){status('Verifica non completata: '+e.message+' Controllare RLS, permessi e struttura delle tabelle. Non caricare dati reali.');}
  }
  byId('bpReload').addEventListener('click',reload);
  await reload();
})();
