
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

/* BUROPRATIKA 4.7 - REGISTRAZIONE PROFESSIONISTI */

(async function () {
  'use strict';

  const section = document.getElementById('professionisti');
  if (!section) return;

  const box = document.createElement('div');
  box.className = 'vivo-card';
  box.style.marginTop = '20px';

  box.innerHTML = `
    <h2>Diventa professionista BuroPratika</h2>
    <p>
      Registrati e richiedi la verifica della tua
      iscrizione professionale.
      L'approvazione non è automatica.
    </p>

    <label for="bp47studio">Nome studio</label>
    <input id="bp47studio" maxlength="150"
      placeholder="Studio Rossi">

    <label for="bp47nome">Nome</label>
    <input id="bp47nome" maxlength="100"
      placeholder="Mario">

    <label for="bp47cognome">Cognome</label>
    <input id="bp47cognome" maxlength="100"
      placeholder="Rossi">

    <label for="bp47professione">Professione</label>
    <select id="bp47professione">
      <option value="">Seleziona</option>
      <option>Commercialista</option>
      <option>Esperto contabile</option>
      <option>Ingegnere</option>
      <option>Architetto</option>
      <option>Geometra</option>
      <option>Consulente del lavoro</option>
      <option>Avvocato</option>
      <option>Altro professionista</option>
    </select>

    <label for="bp47ordine">Ordine o Collegio territoriale</label>
    <input id="bp47ordine" maxlength="150"
      placeholder="Es. ODCEC Ancona">

    <label for="bp47numero">Numero di iscrizione all'albo</label>
    <input id="bp47numero" maxlength="50"
      placeholder="Numero iscrizione">

    <label for="bp47provincia">Provincia dello studio</label>
    <input id="bp47provincia" maxlength="100"
      placeholder="Es. Ancona">

    <label for="bp47fonte">Link all'albo ufficiale (facoltativo)</label>
    <input id="bp47fonte" type="url"
      placeholder="https://...">

    <p>
      <label>
        <input type="checkbox" id="bp47consenso"
          style="width:auto">
        Dichiaro che i dati inseriti sono veritieri
        e che richiedo la verifica professionale.
      </label>
    </p>

    <button type="button" class="btn" id="bp47invia">
      Invia domanda di verifica
    </button>

    <button type="button" class="btn outline" id="bp47stato">
      Controlla la mia domanda
    </button>

    <div id="bp47risultato" role="status"
      style="margin-top:15px;padding:12px;
      background:#edf5f4;border-radius:10px">
      Effettua prima l'accesso nel Fascicolo Vivo.
    </div>

    <p style="font-size:12px">
      La domanda non certifica l'identità o l'iscrizione.
      BuroPratika dovrà effettuare i controlli
      sulle fonti ufficiali prima dell'abilitazione.
    </p>
  `;

  section.appendChild(box);

  const get = id => document.getElementById(id);
  const val = id => get(id).value.trim();
  const output = message => {
    get('bp47risultato').textContent = message;
  };

  let client = null;

  async function accesso() {
    let config = {};

    try {
      config = JSON.parse(
        localStorage.getItem('buropratika_public_config') || '{}'
      );
    } catch {}

    const key = config?.key;

    if (!key ||
        !(key.startsWith('sb_publishable_') ||
          key.startsWith('eyJ'))) {
      throw Error('Configura prima la chiave pubblica Supabase.');
    }

    if (!client) {
      const lib = await import(
        'https://esm.sh/@supabase/supabase-js@2'
      );

      client = lib.createClient(
        'https://bqcaohfochwweymgfjtd.supabase.co',
        key,
        {auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }}
      );
    }

    const {data, error} = await client.auth.getUser();

    if (error || !data?.user) {
      throw Error('Accedi prima dal Fascicolo Vivo.');
    }

    return data.user;
  }

  async function query(q) {
    const {data, error} = await q;
    if (error) throw error;
    return data;
  }

  get('bp47invia').addEventListener('click', async () => {
    const button = get('bp47invia');
    button.disabled = true;

    try {
      const user = await accesso();

      const ids = [
        'bp47studio',
        'bp47nome',
        'bp47cognome',
        'bp47professione',
        'bp47ordine',
        'bp47numero',
        'bp47provincia'
      ];

      if (ids.some(id => !val(id))) {
        throw Error('Compila tutti i campi obbligatori.');
      }

      if (!get('bp47consenso').checked) {
        throw Error('Conferma la dichiarazione di veridicità.');
      }

      const source = val('bp47fonte');

      if (source && !/^https:\/\//i.test(source)) {
        throw Error('Il link all’albo deve iniziare con https://');
      }

      const {data: existing, error: checkError} =
        await client
          .from('bp_domande_verifica')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        output(
          'Hai già presentato una domanda. ' +
          'Non è possibile inviarne un’altra ' +
          'da questo modulo.'
        );
        return;
      }

      await query(
        client.from('bp_professionisti').insert({
          user_id: user.id,
          nome_studio: val('bp47studio'),
          professione: val('bp47professione'),
          provincia: val('bp47provincia'),
          descrizione: 'Profilo in attesa di verifica'
        })
      );

      await query(
        client.from('bp_domande_verifica')..insert({
          user_id: user.id,
          nome: val('bp47nome'),
          cognome: val('bp47cognome'),
          professione: val('bp47professione'),
          ordine_territoriale: val('bp47ordine'),
          numero_iscrizione: val('bp47numero'),
          fonte_albo: source || null,
          dichiarazione_veridicita: true
        })
      );

      output(
        'Domanda inviata correttamente! ' +
        'Stato: IN ATTESA DI VERIFICA. ' +
        'Non sei ancora abilitato come professionista verificato.'
      );

    } catch (error) {
      output('Errore: ' + error.message);
    } finally {
      button.disabled = false;
    }
  });

  get('bp47stato').addEventListener('click', async () => {
    try {
      const user = await accesso();

      const {data, error} = await client
        .from('bp_domande_verifica')
        .select('nome,cognome,professione,created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        output('Non risulta ancora presentata alcuna domanda.');
        return;
      }

      output(
        'Domanda ricevuta per ' +
        data.nome + ' ' + data.cognome +
        ' (' + data.professione + '). ' +
        'Il controllo dell’albo e dell’identità ' +
        'non è ancora attestato da questo modulo.'
      );

    } catch (error) {
      output('Errore: ' + error.message);
    }
  });

})();
