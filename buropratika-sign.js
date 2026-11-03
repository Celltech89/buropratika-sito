
/* BuroPratika Sign 4.6 — Archivio privato */
(() => {
  if (window.bpSignReady) return;
  window.bpSignReady = true;

  const start = async () => {
    const anchor = document.getElementById('demo-investitori')
      || document.getElementById('professionisti');

    if (!anchor) return;

    const section = document.createElement('section');
    section.id = 'buropratika-sign';
    section.className = 'vivo';
    section.style.cssText = 'max-width:1080px;margin:24px auto;padding:22px';

    section.innerHTML = `
      <h2>BuroPratika Sign 4.6</h2>
      <p>Archivio privato dei documenti PDF e P7M.
      Non verifica automaticamente la validità della firma digitale.</p>
      <input type="file" id="bpSignFile" accept=".pdf,.p7m">
      <button type="button" class="btn" id="bpSignUpload">
        Carica documento
      </button>
      <button type="button" class="btn outline" id="bpSignRefresh">
        Aggiorna archivio
      </button>
      <p id="bpSignStatus" role="status"></p>
      <div id="bpSignList"></div>
    `;

    anchor.after(section);

    const el = id => document.getElementById(id);
    const status = msg => el('bpSignStatus').textContent = msg;

    try {
      const cfg = JSON.parse(
        localStorage.getItem('buropratika_public_config') || '{}'
      );

      if (!cfg.key) {
        status('Configura prima Supabase nel Fascicolo Vivo.');
        return;
      }

      const { createClient } = await import(
        'https://esm.sh/@supabase/supabase-js@2'
      );

      const db = createClient(
        'https://bqcaohfochwweymgfjtd.supabase.co',
        cfg.key
      );

      const { data: auth, error: authError } =
        await db.auth.getUser();

      if (authError || !auth.user) {
        status('Effettua il login nel Fascicolo Vivo.');
        return;
      }

      const user = auth.user;

      async function refresh() {
        const { data, error } = await db
          .from('bp_sign_documenti')
          .select('nome_file,storage_path,creato_il,stato')
          .eq('user_id', user.id)
          .order('creato_il', { ascending: false });

        if (error) {
          status(error.message);
          return;
        }

        el('bpSignList').replaceChildren();

        for (const doc of data || []) {
          const row = document.createElement('div');
          row.className = 'rule-card';

          const title = document.createElement('strong');
          title.textContent = doc.nome_file;

          const note = document.createElement('p');
          note.textContent = 'Firma non verificata';

          const btn = document.createElement('button');
          btn.textContent = 'Scarica';
          btn.className = 'btn outline';

          btn.onclick = async () => {
            const { data: file, error: err } =
              await db.storage
                .from('bp-sign')
                .download(doc.storage_path);

            if (err) return status(err.message);

            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.nome_file;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          };

          row.append(title, note, btn);
          el('bpSignList').append(row);
        }

        status('Archivio aggiornato.');
      }

      el('bpSignUpload').onclick = async () => {
        const file = el('bpSignFile').files?.[0];
        if (!file) return status('Seleziona un documento.');

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'p7m'].includes(ext) ||
            file.size < 1 || file.size > 10485760) {
          return status('Sono ammessi PDF/P7M fino a 10 MB.');
        }

        const btn = el('bpSignUpload');
        btn.disabled = true;

        try {
          status('Caricamento in corso...');

          const bytes = await file.arrayBuffer();
          const digest = await crypto.subtle.digest('SHA-256', bytes);
          const sha256 = Array.from(new Uint8Array(digest))
            .map(x => x.toString(16).padStart(2, '0')).join('');

          const path = user.id + '/' +
            crypto.randomUUID() + '.' + ext;

          const { error: uploadError } =
            await db.storage.from('bp-sign').upload(
              path,
              new Blob([bytes], {
                type: ext === 'pdf'
                  ? 'application/pdf'
                  : 'application/octet-stream'
              }),
              { upsert: false }
            );

          if (uploadError) throw uploadError;

          const { error: saveError } =
            await db.from('bp_sign_documenti').insert({
              user_id: user.id,
              nome_file: file.name.slice(0, 200),
              storage_path: path,
              dimensione_bytes: file.size,
              sha256,
              formato: ext
            });

          if (saveError) throw saveError;

          status('Documento archiviato. Firma non verificata.');
          el('bpSignFile').value = '';
          await refresh();

        } catch (err) {
          status('Errore: ' + err.message);
        } finally {
          btn.disabled = false;
        }
      };

      el('bpSignRefresh').onclick = refresh;
      await refresh();

    } catch (err) {
      status('Connessione non disponibile: ' + err.message);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
