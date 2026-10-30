
/* BuroPratika 4.6 - Fascicoli DEMO
   Usare esclusivamente dati inventati.
*/
(async function () {
  'use strict';

  if (document.getElementById('bpFascicoliDemo')) return;

  const anchor =
    document.getElementById('professionisti') ||
    document.querySelector('main');

  if (!anchor) return;

  const section = document.createElement('section');
  section.id = 'bpFascicoliDemo';
  section.style.cssText =
    'margin:24px auto;padding:22px;background:white;' +
    'border:1px solid #d9e3e3;border-radius:18px;' +
    'max-width:1080px;color:#152d33';

  section.innerHTML = `
    <h2>Le mie pratiche - DEMO</h2>
    <p>
      Crea fascicoli di prova sul tuo account.
      Non inserire dati personali o documenti reali.
    </p>

    <p id="bpFascicoliStatus" role="status">
      Connessione in corso...
    </p>

    <form id="bpFascicoliForm" hidden>
      <label>
        Codice pratica fittizio
        <input name="codice" required
          maxlength="40"
          placeholder="DEMO-001">
      </label>

      <label>
        Tipo di pratica
        <select name="tipo" required>
          <option value="apertura">Apertura attività</option>
          <option value="cessazione">Cessazione attività</option>
          <option value="subingresso">Subingresso</option>
        </select>
      </label>

      <label>
        Comune di esempio
        <input name="comune"
          maxlength="80"
          placeholder="Ancona">
      </label>

      <label>
        Descrizione fittizia
        <textarea name="descrizione"
          maxlength="400"
          placeholder="Apertura gelateria immaginaria">
        </textarea>
      </label>

<label>
  Cerca attività o codice ATECO
  <input
    type="search"
    id="bpAtecoRicerca"
    placeholder="Es. gelateria, parrucchiere, 56"
    autocomplete="off">
</label>

<label>
  Seleziona attività ATECO
  <select name="codice_ateco" id="bpAtecoSelect">
    <option value="">Seleziona un'attività</option>
  </select>
</label>

<input
  type="hidden"
  name="denominazione_attivita"
  id="bpAtecoDescrizione">

      <button type="submit">
        Salva pratica DEMO
      </button>

      <button type="button" id="bpFascicoliReload">
        Aggiorna elenco
      </button>
    </form>

    <div id="bpFascicoliLista"></div>
  `;

  anchor.insertAdjacentElement('afterend', section);

  const status =
    section.querySelector('#bpFascicoliStatus');
  const form =
    section.querySelector('#bpFascicoliForm');
  const lista =
    section.querySelector('#bpFascicoliLista');

  section.querySelectorAll(
    'input,select,textarea'
  ).forEach(el => {
    el.style.cssText =
      'display:block;width:100%;box-sizing:border-box;' +
      'padding:10px;margin:8px 0 14px;' +
      'border:1px solid #a9c2c2;border-radius:8px';
  });

  section.querySelectorAll('button').forEach(el => {
    el.style.cssText =
      'padding:12px;margin:6px;border:1px solid #176577;' +
      'border-radius:8px;background:#176577;color:white';
  });

  const setStatus = message => {
    status.textContent = message;
  };

  function addText(parent, tag, value) {
    const node = document.createElement(tag);
    node.textContent = String(value ?? '');
    parent.appendChild(node);
    return node;
  }

  try {
    const cfg = JSON.parse(
      localStorage.getItem('buropratika_public_config') || '{}'
    );

    if (!cfg.key || !(
      cfg.key.startsWith('sb_publishable_') ||
      cfg.key.startsWith('eyJ')
    )) {
      setStatus(
        'Configura Supabase nel Fascicolo Vivo.'
      );
      return;
    }

    const { createClient } = await import(
      'https://esm.sh/@supabase/supabase-js@2'
    );

    const sb = createClient(
      'https://bqcaohfochwweymgfjtd.supabase.co',
      cfg.key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
const atecoRicerca = section.querySelector('#bpAtecoRicerca');
const atecoSelect = section.querySelector('#bpAtecoSelect');
const atecoDescrizione = section.querySelector('#bpAtecoDescrizione');

if (atecoRicerca && atecoSelect && atecoDescrizione) {
  let atecoTimer;
  let ultimaRicerca = 0;

  atecoRicerca.addEventListener('input', () => {
    clearTimeout(atecoTimer);
    const richiesta = ++ultimaRicerca;
    const termine = atecoRicerca.value.trim();

    atecoSelect.replaceChildren(
      new Option("Seleziona un'attività", '')
    );
    atecoDescrizione.value = '';

    if (termine.length < 2) return;

    atecoTimer = setTimeout(async () => {
      try {
        const { data, error } = await sb
          .from('bp_ateco_catalogo_v1')
          .select('codice,descrizione')
          .or(`codice.ilike.%${termine}%,descrizione.ilike.%${termine}%`)
          .limit(30);

        if (error) throw error;
        if (richiesta !== ultimaRicerca) return;

        for (const voce of data || []) {
          atecoSelect.add(
            new Option(
              `${voce.codice} - ${voce.descrizione}`,
              voce.codice
            )
          );
        }
      } catch (error) {
        console.error('Ricerca ATECO:', error);
        setStatus('Ricerca ATECO non disponibile.');
      }
    }, 350);
  });

  atecoSelect.addEventListener('change', () => {
    const opzione = atecoSelect.selectedOptions[0];
    atecoDescrizione.value = opzione?.value
      ? opzione.textContent.slice(opzione.value.length + 3)
      : '';
  });
}
    const { data: authData, error: authError } =
      await sb.auth.getUser();

    if (authError || !authData?.user) {
      setStatus(
        'Accedi al Fascicolo Vivo e aggiorna la pagina.'
      );
      return;
    }

    const userId = authData.user.id;
    form.hidden = false;

    async function reload() {
      setStatus('Caricamento fascicoli...');

      const { data, error } = await sb
        .from('bp_fascicoli_demo_v1')
        .select(
          'id,codice,tipo_pratica,comune,descrizione,stato,creato_il,codice_ateco,denominazione_attivita'
        )
        .eq('user_id', userId)
        .order('creato_il', { ascending: false })
        .limit(50);

      if (error) throw error;

      lista.replaceChildren();

const pratiche = data || [];
const totale = pratiche.length;
const inLavorazione = pratiche.filter(
  p => p.stato === 'in_lavorazione'
).length;
const completate = pratiche.filter(
  p => p.stato === 'completata'
).length;

const dashboard = document.createElement('div');
dashboard.style.cssText =
  'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));' +
  'gap:12px;margin:20px 0;';

[
  ['Pratiche totali', totale],
  ['In lavorazione', inLavorazione],
  ['Completate', completate],
  ['Da gestire', totale - completate]
].forEach(([titolo, numero]) => {
  const scheda = document.createElement('div');
  scheda.style.cssText =
    'padding:16px;border:1px solid #d9e5e8;' +
    'border-radius:12px;background:#f7fafb;';

  const etichetta = document.createElement('div');
  etichetta.textContent = titolo;
  etichetta.style.cssText =
    'font-size:13px;color:#526970;';

  const valore = document.createElement('strong');
  valore.textContent = String(numero);
  valore.style.cssText =
    'display:block;font-size:28px;color:#176577;';

  scheda.append(etichetta, valore);
  dashboard.appendChild(scheda);
});

lista.appendChild(dashboard);

const boxScadenze = document.createElement('div');
boxScadenze.style.cssText =
  'padding:16px;margin:12px 0;' +
  'border:1px solid #d9e5e8;border-radius:12px;' +
  'background:#f7fafb;';

const titoloScadenze = document.createElement('strong');
titoloScadenze.textContent = 'Scadenze delle pratiche';
boxScadenze.appendChild(titoloScadenze);

const idsPratiche = data.map(p => p.id);

if (idsPratiche.length) {
  const { data: scadenze, error: erroreScadenze } = await sb
    .from('bp_scadenze_demo_v1')
    .select('fascicolo_id,data_scadenza')
    .in('fascicolo_id', idsPratiche);

  if (erroreScadenze) {
    boxScadenze.appendChild(
      document.createTextNode(' — Dati non disponibili')
    );
  } else {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const limite = new Date(oggi);
    limite.setDate(limite.getDate() + 7);

    let scadute = 0;
    let imminenti = 0;

    (scadenze || []).forEach(s => {
      if (!s.data_scadenza) return;

      const giorno = new Date(s.data_scadenza + 'T00:00:00');

      if (giorno < oggi) scadute++;
      else if (giorno <= limite) imminenti++;
    });

    const riepilogo = document.createElement('p');
    riepilogo.textContent =
      'Scadute: ' + scadute +
      ' | Entro 7 giorni: ' + imminenti;
    boxScadenze.appendChild(riepilogo);
  }
} else {
  boxScadenze.appendChild(
    document.createTextNode(' — Nessuna pratica presente')
  );
}

lista.appendChild(boxScadenze);

      if (!data.length) {
        addText(
          lista,
          'p',
          'Non hai ancora fascicoli DEMO.'
        );
      }

      for (const item of data) {
        const card = document.createElement('article');

        card.style.cssText =
          'border:1px solid #d9e3e3;border-radius:12px;' +
          'padding:14px;margin-top:12px';

        addText(
          card, 'h3',
          item.codice + ' - ' + item.tipo_pratica
        );

        addText(
          card, 'p',
          'Comune: ' + (item.comune || 'non indicato')
        );

        addText(
          card, 'p',
          'Descrizione: ' + (item.descrizione || 'nessuna')
        );

        addText(
          card, 'p',
          'Stato: ' + item.stato
        );

const checklist = {
  
apertura: (
  String(item.codice_ateco || '').startsWith('96.21')
    ? [
        'Verificare i requisiti professionali per acconciatori e il responsabile tecnico',
        'Verificare il procedimento SUAP e la SCIA eventualmente applicabile',
        'Verificare i requisiti igienico-sanitari, urbanistici e di sicurezza dei locali',
        'Verificare gli adempimenti al Registro Imprese',
        'Verificare partita IVA e posizioni INPS e INAIL applicabili',
        'Verificare eventuali ulteriori autorizzazioni'
      ]

    : [
  'Verificare la destinazione d’uso e i requisiti dei locali',
  'Definire se la gelateria è laboratorio artigianale, vendita o somministrazione',
  'Verificare il procedimento applicabile presso il SUAP di Ancona',
  'Predisporre e presentare la notifica sanitaria quando richiesta',
  'Verificare gli adempimenti al Registro Imprese',
  'Verificare partita IVA e posizioni INPS e INAIL applicabili',
  'Predisporre autocontrollo HACCP e gestione degli allergeni',
  'Verificare eventuali autorizzazioni aggiuntive'
]),

  cessazione: [
    'Verificare la procedura di cessazione',
    'Controllare gli adempimenti al Registro Imprese',
    'Verificare la chiusura delle posizioni fiscali e previdenziali'
  ],
  subingresso: [
    'Verificare titolo e requisiti del subentrante',
    'Controllare gli adempimenti SUAP',
    'Verificare le comunicazioni al Registro Imprese'
  ]
};

const descrizioneAttivita =
  String(item.descrizione || '').toLowerCase();

if (
  descrizioneAttivita.includes('abbigliamento') ||
  descrizioneAttivita.includes('negozio')
) {
  checklist.apertura = [
    'Verificare destinazione d’uso e agibilità dei locali',
    'Verificare i requisiti per il commercio al dettaglio',
    'Individuare la procedura SUAP applicabile ad Ancona',
    'Verificare se occorre una SCIA commerciale',
    'Verificare iscrizione al Registro Imprese',
    'Verificare partita IVA e posizioni previdenziali',
    'Controllare sicurezza dei locali e accessibilità',
    'Verificare insegne ed eventuali autorizzazioni aggiuntive'
  ];
}

if (
  descrizioneAttivita.includes('laboratorio artigianale')
) {
  checklist.apertura = [
    'Verificare destinazione d’uso e compatibilità dei locali',
    'Identificare la lavorazione artigianale specifica',
    'Verificare procedimento applicabile presso il SUAP',
    'Verificare iscrizione all’Albo imprese artigiane',
    'Verificare partita IVA e posizioni INPS e INAIL',
    'Valutare obblighi di sicurezza sul lavoro',
    'Verificare eventuali emissioni, scarichi e rifiuti',
    'Verificare eventuali autorizzazioni ambientali'
  ];
}

const listaControlli = document.createElement('div');

addText(listaControlli, 'h4', 'Checklist preliminare');

const { data: spunte, error: erroreSpunte } = await sb
  .from('bp_checklist_demo_v1')
  .select('voce,completata')
  .eq('fascicolo_id', item.id);

if (erroreSpunte) throw erroreSpunte;

const completate = new Set(
  (spunte || [])
    .filter(s => s.completata)
    .map(s => s.voce)
);

for (const voce of checklist[item.tipo_pratica] || []) {
  const riga = document.createElement('label');
  riga.style.cssText =
    'display:block;margin:10px 0';

  const casella = document.createElement('input');
  casella.type = 'checkbox';

casella.checked = completate.has(voce);

casella.addEventListener('change', async () => {
  casella.disabled = true;
  const nuovaSpunta = casella.checked;

  try {
    const { error } = await sb
      .from('bp_checklist_demo_v1')
      .upsert({
        fascicolo_id: item.id,
        user_id: userId,
        voce: voce,
        completata: nuovaSpunta,
        aggiornato_il: new Date().toISOString()
      }, {
        onConflict: 'fascicolo_id,voce'
      });

    if (error) throw error;
    setStatus('Checklist salvata');
  } catch (error) {
    casella.checked = !nuovaSpunta;
    setStatus('Errore checklist: ' + error.message);
  } finally {
    casella.disabled = false;
  }
});

  riga.appendChild(casella);
  riga.appendChild(
    document.createTextNode(' ' + voce)
  );

  listaControlli.appendChild(riga);
}

card.appendChild(listaControlli);

const totaleControlli =
  (checklist[item.tipo_pratica] || []).length;

const controlliCompletati =
  (checklist[item.tipo_pratica] || [])
    .filter(voce => completate.has(voce)).length;

const avanzamento = totaleControlli
  ? Math.round(controlliCompletati / totaleControlli * 100)
  : 0;

const boxAvanzamento = document.createElement('div');
boxAvanzamento.style.cssText =
  'margin:18px 0;padding:14px;' +
  'border:1px solid #ccd9dd;border-radius:10px';

addText(
  boxAvanzamento,
  'h4',
  'Avanzamento checklist: ' + avanzamento + '%'
);

const barra = document.createElement('progress');
barra.max = 100;
barra.value = avanzamento;
barra.style.cssText =
  'width:100%;height:18px;accent-color:#176577;';

boxAvanzamento.appendChild(barra);

addText(
  boxAvanzamento,
  'p',
  controlliCompletati + ' controlli completati su ' +
  totaleControlli +
  '. Indicatore operativo, non certificazione normativa.'
);

card.appendChild(boxAvanzamento);

const selettore = document.createElement('select');

const stati = {
  bozza: 'Bozza',
  da_completare: 'Da completare',
  in_lavorazione: 'In lavorazione',
  completata: 'Completata'
};

for (const [valore, etichetta] of Object.entries(stati)) {
  const opzione = document.createElement('option');
  opzione.value = valore;
  opzione.textContent = etichetta;
  selettore.appendChild(opzione);
}

selettore.value = item.stato;
selettore.setAttribute('aria-label', 'Stato della pratica');
selettore.style.cssText =
  'padding:10px;margin:10px 0;width:100%;';

const salvaStato = document.createElement('button');
salvaStato.type = 'button';
salvaStato.textContent = 'Aggiorna stato';

salvaStato.addEventListener('click', async () => {
  salvaStato.disabled = true;
  setStatus('Aggiornamento in corso...');

  try {
    const { data: aggiornato, error } = await sb
      .from('bp_fascicoli_demo_v1')
      .update({
        stato: selettore.value,
        aggiornato_il: new Date().toISOString()
      })
      .eq('id', item.id)
      .eq('user_id', userId)
      .select('id')
      .single();

    if (error) throw error;
    if (!aggiornato) {
      throw new Error('Aggiornamento non autorizzato.');
    }

    await reload();
  } catch (error) {
    setStatus('Errore: ' + error.message);
  } finally {
    salvaStato.disabled = false;
  }
});

card.appendChild(selettore);
card.appendChild(salvaStato);

const boxAdempimenti = document.createElement('div');
boxAdempimenti.style.cssText =
  'margin-top:18px;padding:12px;' +
  'border:1px solid #ccd9dd;border-radius:10px';

addText(
  boxAdempimenti,
  'h4',
  'Adempimenti amministrativi'
);

const descrizione = String(
  item.descrizione || ''
).toLowerCase();

const settore = descrizione.includes('gelateria')
  ? 'gelateria'
  : null;

if (!settore) {
  addText(
    boxAdempimenti,
    'p',
    'Settore non ancora classificato. ' +
    'Occorre verificare gli adempimenti applicabili.'
  );
} else {
  const { data: regole, error: erroreRegole } =
    await sb.rpc('bp_cerca_adempimenti', {
      p_regione: 'Marche',
      p_settore: settore,
      p_operazione: item.tipo_pratica
    });

  if (erroreRegole) {
    addText(
      boxAdempimenti,
      'p',
      'Ricerca non disponibile: ' + erroreRegole.message
    );
  } else if (!regole || regole.length === 0) {
    addText(
      boxAdempimenti,
      'p',
      'Nessuna regola verificata disponibile. ' +
      'La ricerca non è completa: ' +
      'sono necessarie ulteriori verifiche.'
    );
  } else {
    for (const regola of regole) {
      const voce = document.createElement('div');
      addText(voce, 'strong', regola.titolo);

      addText(
        voce,
        'p',
        'Ente: ' + (regola.ente_competente || 'Da verificare')
      );

      const link = document.createElement('a');
      const url = regola.fonte_ufficiale;

      if (url && /^https:\/\//i.test(url)) {
        link.href = url;
        link.textContent = 'Consulta la fonte ufficiale';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        voce.appendChild(link);
      }

      boxAdempimenti.appendChild(voce);
    }
  }
}

card.appendChild(boxAdempimenti);

const questionario = document.createElement('div');
questionario.style.cssText =
  'padding:14px;margin-top:18px;' +
  'border:1px solid #ccd9dd;border-radius:10px';

addText(questionario, 'h4', 'Questionario autorizzazioni');

const creaScelta = (titolo, opzioni, valore) => {
  addText(questionario, 'p', titolo);
  const select = document.createElement('select');

  for (const [codice, etichetta] of opzioni) {
    const option = document.createElement('option');
    option.value = codice;
    option.textContent = etichetta;
    select.appendChild(option);
  }

  select.value = valore;
  select.style.cssText =
    'width:100%;padding:10px;margin-bottom:12px';
  questionario.appendChild(select);
  return select;
};

const { data: risposte, error: erroreLettura } =
  await sb.from('bp_questionari_demo_v1')
    .select('*')
    .eq('fascicolo_id', item.id)
    .maybeSingle();

if (erroreLettura) throw erroreLettura;

const modello = creaScelta(
  'Modello attività',
  [
    ['da_verificare', 'Da definire'],
    ['produzione', 'Produzione e vendita'],
    ['rivendita', 'Solo rivendita'],
    ['laboratorio', 'Solo laboratorio']
  ],
  risposte?.modello_attivita || 'da_verificare'
);

const somministrazione = creaScelta(
  'Somministrazione al pubblico',
  [
    ['da_verificare', 'Da verificare'],
    ['si', 'Sì'],
    ['no', 'No']
  ],
  risposte?.somministrazione || 'da_verificare'
);

const locali = creaScelta(
  'Situazione dei locali',
  [
    ['da_verificare', 'Da verificare'],
    ['esistenti', 'Locale già destinato all’attività'],
    ['lavori', 'Lavori o cambio destinazione d’uso'],
    ['non_scelto', 'Locale non ancora individuato']
  ],
  risposte?.situazione_locali || 'da_verificare'
);

const isNegozio =
  descrizioneAttivita.includes('abbigliamento') ||
  descrizioneAttivita.includes('negozio');

const isLaboratorio =
  descrizioneAttivita.includes('laboratorio artigianale');

let superficieVendita = null;
let accessoPubblico = null;
let tipoLavorazione = null;
let emissioniScarichi = null;

if (isNegozio) {
  superficieVendita = creaScelta(
    'Superficie di vendita',
    [
      ['da_verificare', 'Da verificare'],
      ['fino_150', 'Fino a 150 m²'],
      ['151_250', 'Da 151 a 250 m²'],
      ['oltre_250', 'Oltre 250 m²']
    ],
    risposte?.superficie_vendita || 'da_verificare'
  );

  accessoPubblico = creaScelta(
    'Accesso del pubblico',
    [
      ['da_verificare', 'Da verificare'],
      ['si', 'Sì'],
      ['no', 'No']
    ],
    risposte?.accesso_pubblico || 'da_verificare'
  );
}

if (isLaboratorio) {
  tipoLavorazione = creaScelta(
    'Tipo di lavorazione',
    [
      ['da_verificare', 'Da verificare'],
      ['legno', 'Lavorazione legno'],
      ['metalli', 'Lavorazione metalli'],
      ['tessile', 'Lavorazione tessile'],
      ['altro', 'Altra lavorazione']
    ],
    risposte?.tipo_lavorazione || 'da_verificare'
  );

  emissioniScarichi = creaScelta(
    'Emissioni o scarichi da verificare',
    [
      ['da_verificare', 'Da verificare'],
      ['si', 'Sì'],
      ['no', 'No']
    ],
    risposte?.emissioni_scarichi || 'da_verificare'
  );
}

const salvaRisposte = document.createElement('button');
salvaRisposte.type = 'button';
salvaRisposte.textContent = 'Salva risposte';

salvaRisposte.onclick = async () => {
  salvaRisposte.disabled = true;
  try {
    const { error } = await sb
      .from('bp_questionari_demo_v1')
      .upsert({
        fascicolo_id: item.id,
        user_id: userId,
        tipo_attivita: String(item.codice_ateco || '').startsWith('96.21') ? 'parrucchiere' : 
  descrizioneAttivita.includes('negozio')
    ? 'commercio'
    : descrizioneAttivita.includes('laboratorio artigianale')
      ? 'artigianato'
      : 'gelateria',
        modello_attivita: modello.value,
        somministrazione: somministrazione.value,
        situazione_locali: locali.value,
         
superficie_vendita: superficieVendita?.value ?? null,
accesso_pubblico: accessoPubblico?.value ?? null,
tipo_lavorazione: tipoLavorazione?.value ?? null,
emissioni_scarichi: emissioniScarichi?.value ?? null,

        aggiornato_il: new Date().toISOString()
      }, { onConflict: 'fascicolo_id' });

    if (error) throw error;
    setStatus('Questionario salvato correttamente');
  } catch (error) {
    setStatus('Errore questionario: ' + error.message);
  } finally {
    salvaRisposte.disabled = false;
  }
};

questionario.appendChild(salvaRisposte);
card.appendChild(questionario);

const valutazioneBox = document.createElement('div');
valutazioneBox.style.cssText =
  'margin-top:18px;padding:14px;' +
  'border:1px solid #ccd9dd;border-radius:10px';

addText(
  valutazioneBox,
  'h4',
  'Valutazione autorizzazioni'
);

const { data: valutazioni, error: erroreValutazione } =
  await sb.rpc('bp_valuta_adempimenti_v1', {
    p_fascicolo_id: item.id
  });

if (erroreValutazione) {
  addText(
    valutazioneBox,
    'p',
    'Errore valutazione: ' + erroreValutazione.message
  );
} else if (!valutazioni || valutazioni.length === 0) {
  addText(
    valutazioneBox,
    'p',
    'Nessuna valutazione disponibile. ' +
    'Verificare questionario, settore e regole.'
  );
} else {
  for (const v of valutazioni) {
    const dettaglio = document.createElement('div');
    dettaglio.style.marginBottom = '16px';

    addText(dettaglio, 'strong', v.titolo);
    addText(dettaglio, 'p', 'Esito: ' + v.esito);
    addText(dettaglio, 'p', v.motivazione);

    valutazioneBox.appendChild(dettaglio);
  }
}

const verifichePersonalizzate = [];

if (isNegozio) {
  if (risposte?.superficie_vendita &&
      risposte.superficie_vendita !== 'da_verificare') {
    verifichePersonalizzate.push(
      'Verificare il procedimento commerciale applicabile ' +
      'in base alla superficie di vendita dichiarata.'
    );
  }

  if (risposte?.accesso_pubblico === 'si') {
    verifichePersonalizzate.push(
      'Verificare accessibilità, sicurezza e requisiti ' +
      'dei locali aperti al pubblico.'
    );
  }
}

if (isLaboratorio) {
  if (risposte?.tipo_lavorazione &&
      risposte.tipo_lavorazione !== 'da_verificare') {
    verifichePersonalizzate.push(
      'Verificare gli adempimenti specifici per la lavorazione: ' +
      risposte.tipo_lavorazione + '.'
    );
  }

  if (risposte?.emissioni_scarichi === 'si') {
    verifichePersonalizzate.push(
      'Approfondire gli eventuali obblighi ambientali ' +
      'relativi a emissioni o scarichi.'
    );
  }
}

if (verifichePersonalizzate.length) {
  addText(
    valutazioneBox,
    'h4',
    'Verifiche aggiuntive in base al questionario'
  );

  for (const verifica of verifichePersonalizzate) {
    addText(valutazioneBox, 'p', '• ' + verifica);
  }

  addText(
    valutazioneBox,
    'p',
    'Indicazioni preliminari da validare con fonti ufficiali.'
  );
}

card.appendChild(valutazioneBox);

if (item.codice_ateco) {
  const regoleBox = document.createElement('div');
  regoleBox.style.cssText =
    'padding:14px;margin-top:18px;border:1px solid #ccd9dd;border-radius:12px;';

  addText(regoleBox, 'h4', 'Verifiche collegate al codice ATECO');
  addText(regoleBox, 'p',
    'Codice: ' + item.codice_ateco +
    ' — Indicazioni preliminari da verificare.');

  const { data: regole, error: erroreRegole } = await sb
    .from('bp_regole_ateco_v1')
    .select('prefisso_ateco,regione,comune,titolo,descrizione,stato_verifica')
    .eq('tipo_pratica', item.tipo_pratica)
    .eq('attiva', true)
    .limit(500);

  if (erroreRegole) {
    addText(regoleBox, 'p',
      'Impossibile caricare le verifiche ATECO.');
    console.error(erroreRegole);
  } else {
    const applicabili = (regole || []).filter(r =>
      item.codice_ateco.startsWith(r.prefisso_ateco) &&
      (!r.regione || r.regione === 'Marche') &&
      (!r.comune ||
        r.comune.toLowerCase() ===
        String(item.comune || '').toLowerCase())
    );

    if (!applicabili.length) {
      addText(regoleBox, 'p',
        'Nessuna regola preliminare disponibile per questa attività.');
    }

    for (const r of applicabili) {
      addText(regoleBox, 'strong', r.titolo);
      addText(regoleBox, 'p', r.descrizione);
      addText(regoleBox, 'p',
        'Stato: ' + r.stato_verifica);
    }
  }

  card.appendChild(regoleBox);
}

const scadenzeBox = document.createElement('div');
scadenzeBox.style.cssText =
  'padding:14px;margin-top:18px;' +
  'border:1px solid #ccd9dd;border-radius:10px';

addText(scadenzeBox, 'h4', 'Scadenze della pratica');

const titoloScadenza = document.createElement('input');
titoloScadenza.placeholder = 'Descrizione scadenza';
titoloScadenza.maxLength = 200;

const dataScadenza = document.createElement('input');
dataScadenza.type = 'date';

dataScadenza.style.cssText =
  'display:block;width:100%;min-height:48px;' +
  'padding:10px;border:1px solid #ccd9dd;' +
  'border-radius:8px;background:white;' +
  'color:#183039;font-size:16px;' +
  'box-sizing:border-box;';

const salvaScadenza = document.createElement('button');
salvaScadenza.type = 'button';
salvaScadenza.textContent = 'Aggiungi scadenza';

const elencoScadenze = document.createElement('div');

const mostraScadenze = async () => {
  elencoScadenze.replaceChildren();

  const { data, error } = await sb
    .from('bp_scadenze_demo_v1')
    .select('titolo,data_scadenza,completata')
    .eq('fascicolo_id', item.id)
    .order('data_scadenza', { ascending: true });

  if (error) {
    addText(elencoScadenze, 'p', 'Errore: ' + error.message);
    return;
  }

  if (!data || data.length === 0) {
    addText(elencoScadenze, 'p', 'Nessuna scadenza inserita');
  }

  for (const scadenza of data || []) {
    addText(
      elencoScadenze,
      'p',
      (scadenza.completata ? 'Completata - ' : '') +
      scadenza.titolo + ' - ' +
      (scadenza.data_scadenza || 'Senza data')
    );
  }
};

salvaScadenza.onclick = async () => {
  const titolo = titoloScadenza.value.trim();

  if (!titolo) {
    setStatus('Inserisci una descrizione');
    return;
  }

  salvaScadenza.disabled = true;

  try {
    const { error } = await sb
      .from('bp_scadenze_demo_v1')
      .insert({
        fascicolo_id: item.id,
        user_id: userId,
        titolo: titolo,
        data_scadenza: dataScadenza.value || null
      });

    if (error) throw error;

    titoloScadenza.value = '';
    dataScadenza.value = '';
    setStatus('Scadenza salvata');
    await mostraScadenze();
  } catch (error) {
    setStatus('Errore scadenza: ' + error.message);
  } finally {
    salvaScadenza.disabled = false;
  }
};

for (const elemento of [
  titoloScadenza,
  dataScadenza,
  salvaScadenza,
  elencoScadenze
]) {
  elemento.style.margin = '8px 0';
  scadenzeBox.appendChild(elemento);
}

card.appendChild(scadenzeBox);
await mostraScadenze();

const esporta = document.createElement('button');
esporta.type = 'button';
esporta.textContent = 'Esporta fascicolo PDF';

esporta.onclick = async () => {
  const finestra = window.open('', '_blank');

  if (!finestra) {
    setStatus('Consenti le finestre popup per esportare.');
    return;
  }

  const doc = finestra.document;
  doc.title = 'BuroPratika - ' + item.codice;
  
doc.body.style.cssText =
  'font-family:Arial,sans-serif;' +
  'line-height:1.6;max-width:800px;' +
  'margin:35px auto;padding:28px;' +
  'color:#17333c;background:#fff;';

const stilePDF = doc.createElement('style');
stilePDF.textContent = `
  h1 {
    color:#176577;
    font-size:32px;
    border-bottom:3px solid #176577;
    padding-bottom:14px;
  }
  h2 {
    color:#176577;
    margin-top:30px;
    border-bottom:1px solid #d9e5e8;
    padding-bottom:7px;
  }
  h3 { font-size:17px; }
  p { margin:9px 0; }
  a { color:#176577; }
  @media print {
    body { margin:0 !important; }
    button { display:none !important; }
    h2, h3 { break-after:avoid; }
  }
`;
doc.head.appendChild(stilePDF);


  const aggiungi = (tag, testo) => {
    const el = doc.createElement(tag);
    el.textContent = String(testo ?? '');
    doc.body.appendChild(el);
    return el;
  };

  aggiungi('h1', 'BuroPratika');
  aggiungi('h2', 'Dossier pratica - DEMO');
  aggiungi('p', 'Codice: ' + item.codice);
  aggiungi('p', 'Operazione: ' + item.tipo_pratica);
  aggiungi('p', 'Comune: ' + (item.comune || 'Non indicato'));
  aggiungi('p', 'Descrizione: ' + (item.descrizione || ''));
  aggiungi('p', 'Stato: ' + item.stato);

  aggiungi('h2', 'Questionario');
  aggiungi('p', 'Modello: ' + (risposte?.modello_attivita || 'Da verificare'));
  aggiungi('p', 'Somministrazione: ' + (risposte?.somministrazione || 'Da verificare'));
  aggiungi('p', 'Locali: ' + (risposte?.situazione_locali || 'Da verificare'));

  aggiungi('h2', 'Checklist');
  for (const voce of checklist[item.tipo_pratica] || []) {
    aggiungi('p', (completate.has(voce) ? '[X] ' : '[ ] ') + voce);
  }

  aggiungi('h2', 'Valutazione autorizzazioni');
  for (const v of valutazioni || []) {
    aggiungi('h3', v.titolo);
    aggiungi('p', 'Esito: ' + v.esito);
    aggiungi('p', v.motivazione);

    if (v.fonte_ufficiale &&
        /^https:\/\//i.test(v.fonte_ufficiale)) {
      const a = doc.createElement('a');
      a.href = v.fonte_ufficiale;
      a.textContent = 'Fonte ufficiale';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      doc.body.appendChild(a);
    }
  }

  aggiungi('h2', 'Scadenze');

  const { data: scadenze, error } = await sb
    .from('bp_scadenze_demo_v1')
    .select('titolo,data_scadenza,completata')
    .eq('fascicolo_id', item.id);

  if (error) {
    aggiungi('p', 'Scadenze non disponibili: ' + error.message);
  } else {
    for (const s of scadenze || []) {
      aggiungi(
        'p',
        s.titolo + ' - ' + (s.data_scadenza || 'Senza data')
      );
    }
  }

  aggiungi('h2', 'Avvertenza');
  aggiungi(
    'p',
    'DOCUMENTO DIMOSTRATIVO - NON VALIDO COME ' +
    'PRATICA AMMINISTRATIVA. Gli adempimenti ' +
    'devono essere verificati presso gli enti competenti.'
  );

  const stampa = doc.createElement('button');
  stampa.textContent = 'Stampa / Salva PDF';
  stampa.style.cssText =
    'padding:12px;background:#176577;color:white;' +
    'border:0;border-radius:8px;margin:20px 0;';
  stampa.onclick = () => finestra.print();
  doc.body.appendChild(stampa);
};

card.appendChild(esporta);

        lista.appendChild(card);
      }

      setStatus(
        'Fascicoli visualizzati: ' + data.length
      );
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const button =
        form.querySelector('[type="submit"]');

      button.disabled = true;

      try {
        const values = new FormData(form);
        const codice =
          String(values.get('codice') || '').trim();

        if (!/^DEMO-[A-Za-z0-9-]{1,35}$/.test(codice)) {
          throw new Error(
            'Usa un codice come DEMO-001.'
          );
        }

        setStatus('Salvataggio in corso...');

        const { error } = await sb
          .from('bp_fascicoli_demo_v1')
          .insert({
            user_id: userId,
            codice: codice,
            tipo_pratica: values.get('tipo'),
            comune: String(
              values.get('comune') || ''
            ).trim(),
            descrizione: String(
  values.get('descrizione') || ''
).trim(),
codice_ateco: String(
  values.get('codice_ateco') || ''
).trim() || null,
denominazione_attivita: String(
  values.get('denominazione_attivita') || ''
).trim() || null
          });

        if (error) throw error;

        form.reset();
        await reload();

      } catch (error) {
        setStatus('Errore: ' + error.message);
      } finally {
        button.disabled = false;
      }
    });

    section.querySelector(
      '#bpFascicoliReload'
    ).addEventListener('click', () => {
      reload().catch(error => {
        setStatus('Errore: ' + error.message);
      });
    });

    await reload();

  } catch (error) {
    setStatus('Errore: ' + error.message);
  }
})();

