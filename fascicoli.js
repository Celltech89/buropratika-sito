
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
          'id,codice,tipo_pratica,comune,descrizione,stato,creato_il'
        )
        .eq('user_id', userId)
        .order('creato_il', { ascending: false })
        .limit(50);

      if (error) throw error;

      lista.replaceChildren();

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
            ).trim()
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

