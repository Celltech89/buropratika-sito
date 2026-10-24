
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigin = "https://celltech89.github.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return reply({ error: "Metodo non consentito" }, 405);
  }

  if (req.headers.get("origin") !== allowedOrigin) {
    return reply({ error: "Origine non autorizzata" }, 403);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!apiKey || !supabaseUrl || !supabaseAnonKey) {
    return reply({
      error: "Configurazione server incompleta",
    }, 503);
  }

  const authorization =
    req.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return reply({
      error: "Effettua l'accesso per usare la chat AI",
    }, 401);
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: { Authorization: authorization },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const token = authorization.slice(7);

  const { data, error } =
    await supabase.auth.getUser(token);

  if (error || !data.user) {
    return reply({
      error: "Sessione non valida",
    }, 401);
  }

  let body;

  try {
    body = await req.json();
  } catch {
    return reply({
      error: "Richiesta non valida",
    }, 400);
  }

  const message =
    typeof body.message === "string"
      ? body.message.trim().slice(0, 2000)
      : "";

  if (!message) {
    return reply({
      error: "Scrivi una domanda",
    }, 400);
  }

  const profile =
    body.profile &&
    typeof body.profile === "object" &&
    !Array.isArray(body.profile)
      ? JSON.stringify(body.profile).slice(0, 3000)
      : "{}";

  const instructions = `
Sei il Copilota AI di BuroPratika.

Aiuti imprese, artigiani, commercianti
e professionisti italiani a comprendere
le pratiche amministrative.

Rispondi sempre in italiano.

Guida l'utente passo dopo passo.

Aiutalo a:
- comprendere gli adempimenti;
- individuare gli uffici competenti;
- preparare le verifiche preliminari;
- identificare i documenti da controllare;
- orientarsi tra SUAP e Registro Imprese;
- capire quali informazioni mancano.

Usa il profilo dell'attività come contesto,
ma considera i dati dichiarati non verificati.

Non inventare norme, autorizzazioni,
scadenze, costi o riferimenti ufficiali.

Non affermare di aver verificato un portale
istituzionale se non lo hai consultato.

Non dichiarare che una pratica è completa
o approvata senza verifica documentale.

Se mancano informazioni, fai domande
mirate, massimo due per volta.

Termina indicando il prossimo passo pratico.
`;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    20000,
  );

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: 0.2,
          max_tokens: 700,
          messages: [
            {
              role: "system",
              content: instructions,
            },
            {
              role: "system",
              content:
                "Profilo dichiarato dall'utente: " +
                profile,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "OpenAI HTTP status:",
        response.status,
      );

      return reply({
        error: "Servizio AI temporaneamente non disponibile",
      }, 502);
    }

    const result = await response.json();

    const answer =
      result.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer) {
      return reply({
        error: "Nessuna risposta generata",
      }, 502);
    }

    return reply({
      reply: answer,
    });
  } catch (err) {
    console.error("AI request failed:", String(err));

    return reply({
      error: "Impossibile contattare il servizio AI",
    }, 504);
  } finally {
    clearTimeout(timeout);
  }
});
