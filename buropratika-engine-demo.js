/* BuroPratika Engine — Demo non operativa v1.0
 * Aggiunge una dimostrazione isolata; NON cambia login, pratiche, 5.1 o database.
 * I dati di esempio NON sono una verifica normativa, né sono ottenuti dall'API Supabase.
 */
(function () {
  'use strict';
  if (document.getElementById('bp-engine-demo-host')) return;
  const profiles = [
    { id:'P01', title:'Apertura parrucchiere', ateco:'96.21.00', operation:'apertura', focus:'Qualificazione professionale, responsabile tecnico e SCIA' },
    { id:'P02', title:'Variazione attività di parrucchiere', ateco:'96.21.00', operation:'variazione', focus:'Specificare la variazione: trasferimento di sede oppure altra modifica' },
    { id:'P03', title:'Apertura estetista', ateco:'96.22.01', operation:'apertura', focus:'Requisiti professionali, attività svolte e locali' },
    { id:'P04', title:'Apertura gelateria da asporto', ateco:'56.11.22', operation:'apertura', focus:'Distinguere laboratorio, asporto e requisiti sanitari' },
    { id:'P05', title:'Apertura gelateria con tavoli', ateco:'56.11.21', operation:'apertura', focus:'Somministrazione, requisiti locali e adempimenti sanitari' },
    { id:'P06', title:'Apertura ristorante con servizio al tavolo', ateco:'56.11.11', operation:'apertura', focus:'Somministrazione, sicurezza e adempimenti sanitari' },
    { id:'P07', title:'Apertura negozio di abbigliamento', ateco:'47.12.50', operation:'apertura', focus:'Verificare che si tratti di esercizio di vicinato' },
    { id:'P08', title:'Cessazione negozio di abbigliamento', ateco:'47.12.50', operation:'cessazione', focus:'Distinguere cessazione del punto vendita e dell’impresa' },
    { id:'P09', title:'Apertura commercio all’ingrosso', ateco:'46.31.10', operation:'apertura', focus:'Distinguere attività, depositi e requisiti specifici' },
    { id:'P10', title:'Apertura bed & breakfast', ateco:'55.20.41', operation:'apertura', focus:'Verificare forma dell’attività e disciplina ricettiva applicabile' }
  ];
  const styles = `
    :host{all:initial;display:block;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#162334}
    *{box-sizing:border-box} .wrap{max-width:1024px;margin:28px auto;padding:25px;border:1px solid #cad4df;border-radius:18px;background:#fff;box-shadow:0 12px 32px #0a254014}
    .heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}.heading h2{font-size:26px;line-height:1.2;margin:0;color:#15293d}
    .eyebrow{font-weight:750;color:#21667d;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
    .pill{font-size:12px;border-radius:18px;background:#fff2dc;color:#805000;padding:7px 10px;font-weight:700}
    .intro{color:#536171;margin:12px 0 19px;font-size:14px;line-height:1.55}
    .fields{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:14px}.field label{display:block;font-size:12px;font-weight:700;color:#516378;margin-bottom:5px}
    select,.value{width:100%;border:1px solid #aabbd0;background:#f9fbfe;border-radius:10px;padding:11px 12px;font-size:15px;min-height:43px;color:#132638}
    .note{border-left:3px solid #257d9f;background:#ecf7fb;padding:13px;border-radius:5px;margin:19px 0;font-size:14px;line-height:1.55}
    .steps{display:grid;gap:9px}.step{border:1px solid #dae1e9;border-radius:12px;overflow:hidden}
    details summary{padding:13px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;gap:10px;list-style:none}
    details summary::-webkit-details-marker{display:none} .num{display:inline-grid;place-items:center;min-width:27px;height:27px;background:#e8f4f7;border-radius:8px;color:#12647a;font-size:12px}
    .stepcontent{padding:0 14px 15px 50px;font-size:13px;color:#4a5a68;line-height:1.55}
    .stepcontent strong{color:#20364d}.controls{display:flex;justify-content:flex-end;gap:8px;margin-top:18px;flex-wrap:wrap}
    button{border:0;border-radius:9px;background:#125d83;color:#fff;padding:11px 17px;font-weight:700;cursor:pointer;font-size:14px}
    button.secondary{background:#e8eff5;color:#204159} .foot{font-size:12px;color:#687888;line-height:1.5;margin-top:14px}
    @media(max-width:600px){.wrap{padding:17px;margin:14px 0}.heading h2{font-size:21px}.fields{grid-template-columns:1fr}}
  `;
  const host = document.createElement('section');
  host.id='bp-engine-demo-host';
  host.setAttribute('aria-label','Demo BuroPratika Engine');
  const shadow = host.attachShadow({mode:'open'});
  const sheet=document.createElement('style');sheet.textContent=styles;shadow.append(sheet);
  const root=document.createElement('div');root.className='wrap';shadow.append(root);
  function elem(tag, className, content){const el=document.createElement(tag);if(className) el.className=className;if(content!==undefined)el.textContent=content;return el;}
  const header=elem('div','heading');
  const titleGroup=elem('div');titleGroup.append(elem('div','eyebrow','Prototipo dimostrativo'),elem('h2','', 'BuroPratika Engine'));
  header.append(titleGroup,elem('span','pill','Percorsi da validare'));
  root.append(header,elem('p','intro','Mostra come un gestionale potrebbe presentare i passaggi per preparare un fascicolo. I 10 esempi sono illustrativi: nessuna pratica viene inviata e nessun dato viene salvato.'));
  const fields=elem('div','fields');
  const choice=elem('div','field');choice.append(elem('label','', 'Procedimento pilota'));
  const select=elem('select');select.setAttribute('aria-label','Procedimento pilota');
  profiles.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.title;select.append(o)});choice.append(select);
  const code=elem('div','field');code.append(elem('label','', 'ATECO / Operazione'));const codeText=elem('div','value');code.append(codeText);fields.append(choice,code);root.append(fields);
  const info=elem('div','note');root.append(info);
  const stepsBox=elem('div','steps');root.append(stepsBox);
  const controls=elem('div','controls');
  const download=elem('button','','Esporta fascicolo demo (.txt)');
  const reset=elem('button','secondary','Ripristina');reset.type='button';download.type='button';
  controls.append(reset,download);root.append(controls);
  root.append(elem('p','foot','Solo percorso illustrativo di preparazione: non sostituisce fonti ufficiali, verifica del professionista o presentazione agli sportelli competenti. La versione server-side dei 10 profili è separata in Supabase e non è collegata a questa demo.'));
  const stepsFor=p=>[
    ['Definire la richiesta','Raccogliere informazioni su attività, titolare, sede e specifica operazione.','Impresa / professionista','Descrizione dell’attività e codice ATECO da confermare'],
    ['Controllare i locali','Verificare destinazione d’uso, caratteristiche della sede e altre condizioni applicabili.','SUAP / tecnici competenti','Dati dei locali ed eventuale documentazione tecnica'],
    ['Verifica specifica per attività',p.focus+'. La procedura esatta va confermata con il SUAP.','SUAP / uffici competenti','Allegati specifici da individuare con il professionista'],
    ['Individuare procedimento e moduli','Consultare la modulistica ufficiale più recente del SUAP competente.','SUAP del Comune','Moduli, dichiarazioni e allegati applicabili'],
    ['Controllare comunicazioni camerali','Coordinare, ove previste, le comunicazioni verso Camera di Commercio e altri enti.','Camera di Commercio / SUAP','Dati dell’impresa e documenti richiesti'],
    ['Archiviare e verificare gli obblighi successivi','Conservare protocolli e ricevute ottenute dopo la presentazione.','Impresa / professionista','Ricevute e verifiche successive']
  ];
  function refresh(){
    const p=profiles.find(x=>x.id===select.value)||profiles[0];codeText.textContent=p.ateco+' · '+p.operation;
    info.textContent='Focus: '+p.focus+'. Questa è una bozza di percorso; i requisiti concreti dipendono anche dal Comune e dal caso specifico.';
    stepsBox.replaceChildren();
    stepsFor(p).forEach((s,i)=>{
      const d=elem('details','step');const summary=elem('summary');const number=elem('span','num',String(i+1));summary.append(number,document.createTextNode(s[0]));
      const detail=elem('div','stepcontent');
      const l1=elem('div');l1.append(elem('strong','', 'Controllo: '),document.createTextNode(s[1]));
      const l2=elem('div');l2.append(elem('strong','', 'Ente: '),document.createTextNode(s[2]));
      const l3=elem('div');l3.append(elem('strong','', 'Documenti da verificare: '),document.createTextNode(s[3]));
      detail.append(l1,l2,l3);d.append(summary,detail);stepsBox.append(d);
    });
  }
  select.addEventListener('change',refresh);reset.addEventListener('click',()=>{select.value='P01';refresh()});
  download.addEventListener('click',()=>{
    const p=profiles.find(x=>x.id===select.value)||profiles[0];
    const text=['BUROPRATIKA ENGINE — FASCICOLO DIMOSTRATIVO',p.title,`ATECO ${p.ateco} · ${p.operation}`,'ATTENZIONE: BOZZA, NON VALIDA PER INVIO.','',...stepsFor(p).flatMap((s,i)=>[`${i+1}. ${s[0]}`,`Controllo: ${s[1]}`,`Ente: ${s[2]}`,`Documenti: ${s[3]}`,''])].join('\n');
    const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='buropratika-'+p.id.toLowerCase()+'-demo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
  });
  const target=document.getElementById('demo-investitori')||document.getElementById('bp50-guide')||document.querySelector('main')||document.body;
  if(target.id==='demo-investitori'){target.append(host)} else target.insertAdjacentElement('afterend',host);
  refresh();
  if(location.hash==='#demo-engine'){host.scrollIntoView({behavior:'smooth',block:'start'})}
})();
