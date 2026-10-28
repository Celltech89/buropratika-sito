
/* BuroPratika - Pannello amministratore
   Versione di prova: sola lettura.
   Non inserire chiavi segrete nel browser.
*/
(async function () {
  'use strict';

  const section = document.getElementById('professionisti');
  if (!section || document.getElementById('bpAdmin')) return;

  const panel = document.createElement('section');
  panel.id = 'bpAdmin';
  panel.hidden = true;
  panel.style.cssText =
    'margin-top:24px;padding:20px;background:white;' +
    'border:1px solid #cbd9d9;border-radius:16px';

  panel.innerHTML = `
    <h2>Amministrazione BuroPratika</h2>
    <p>Gestione riservata delle richieste professionali.</p>
    <button type="button" id="bpAdminReload">
      Aggiorna domande
    </button>
    <p id="bpAdminStatus" role="status"></p>
    <div id="bpAdminList"></div>
  `;

  section.appendChild(panel);

  const status = document.getElementById('bpAdminStatus');
  const list = document.getElementById('bpAdminList');

  const url =
    'https://bqcaohfochwweymgfjtd.supabase.co';

  let client = null;

  async function connect() {
    let config = {};
    try {
      config = JSON.parse(
        localStorage.getItem('buropratika_public_config') || '{}'
      );
    } catch {}

    const key = config.key;
    if (typeof key !== 'string' ||
        !(key.startsWith('sb_publishable_') ||
          key.startsWith('eyJ'))) {
      return null;
    }

    const {createClient} = await import(
      'https://esm.sh/@supabase/supabase-js@2'
    );

    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    const {data, error} = await client.auth.getUser();
    if (error || !data?.user) return null;

    const {data: admin, error: adminError} = await client
      .from('bp_amministratori')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (adminError) throw adminError;

    return admin ? data.user : null;
  }

  function addText(parent, tag, value) {
    const element = document.createElement(tag);
    element.textContent = String(value ?? '');
    parent.appendChild(element);
  }

  async function reload() {
    status.textContent = 'Caricamento richieste...';
    list.replaceChildren();

    const {data, error} = await client
      .from('bp_domande_verifica')
      .select(
        'user_id,nome,cognome,professione,' +
        'ordine_territoriale,numero_iscrizione,' +
        'fonte_albo,created_at'
      )
      .order('created_at', {ascending: false})
      .limit(100);

    if (error) throw error;

    status.textContent =
      'Domande visualizzate: ' + data.length;

    if (!data.length) {
      addText(list, 'p', 'Nessuna domanda presente.');
      return;
    }

    for (const item of data) {
      const card = document.createElement('article');
      card.style.cssText =
        'border:1px solid #d9e3e3;border-radius:12px;' +
        'padding:15px;margin-top:12px';

      addText(card, 'h3',
        item.nome + ' ' + item.cognome
      );
      addText(card, 'p',
        'Professione: ' + item.professione
      );
      addText(card, 'p',
        'Ordine: ' + item.ordine_territoriale
      );
      addText(card, 'p',
        'Iscrizione: ' + item.numero_iscrizione
      );
      addText(card, 'p',
        'Presentata: ' + (item.created_at || 'N/D')
      );
      addText(card, 'p',
        'Fonte dichiarata: ' + (item.fonte_albo || 'Assente')
      );
      addText(card, 'strong',
        'Da verificare: nessuna approvazione automatica'
      );

      list.appendChild(card);
    }
  }

  try {
    const user = await connect();
    if (!user) return;

    panel.hidden = false;

    const button = document.getElementById('bpAdminReload');
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await reload();
      } catch (error) {
        status.textContent = 'Errore: ' + error.message;
      } finally {
        button.disabled = false;
      }
    });

    await reload();
  } catch (error) {
    if (!panel.hidden) {
      status.textContent = 'Errore: ' + error.message;
    }
    console.error('BuroPratika amministrazione:', error);
  }
})();
