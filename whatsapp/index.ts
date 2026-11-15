// Robot WhatsApp CAA.app : le même test des signes, par messages.
// À déployer comme fonction Supabase (gratuit) : supabase functions deploy whatsapp --no-verify-jwt
// Variables à définir dans Supabase > Edge Functions > Secrets :
//   WA_TOKEN         jeton d'accès de l'application Meta
//   WA_PHONE_ID      identifiant du numéro WhatsApp Business
//   WA_VERIFY        mot de passe choisi pour la vérification du webhook
// L'état de chaque conversation est gardé en mémoire : suffisant pour un test, une table Supabase sera nécessaire ensuite.

const SAMU = "1515";
const ETAPES = [
  { cle: "visage", q: "1/4 — Demandez-lui de sourire. Un côté du visage tombe-t-il ?\nRépondez OUI, NON ou DOUTE." },
  { cle: "bras",   q: "2/4 — Demandez-lui de lever les deux bras. Un bras retombe-t-il ?\nRépondez OUI, NON ou DOUTE." },
  { cle: "parole", q: "3/4 — Demandez-lui de répéter une phrase. La parole est-elle confuse ?\nRépondez OUI, NON ou DOUTE." },
  { cle: "debut",  q: "4/4 — Depuis combien de temps ? Répondez : MAINTENANT, 1H, 4H, PLUS ou INCONNU." },
];
const sessions = new Map<string, { etape: number; rep: Record<string, string> }>();

function normalise(s: string) {
  return s.trim().toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function reponse(de: string, texte: string): string {
  const t = normalise(texte);
  let s = sessions.get(de);
  if (!s || ["AVC", "TEST", "START", "BONJOUR", "SALAM", "MENU"].includes(t)) {
    s = { etape: 0, rep: {} };
    sessions.set(de, s);
    return "CAA.app — Test des signes d'AVC. Je vais vous poser 4 questions.\n" +
      "En cas de doute à tout moment, appelez le " + SAMU + ".\n\n" + ETAPES[0].q;
  }
  const etape = ETAPES[s.etape];
  if (etape.cle !== "debut" && !["OUI", "NON", "DOUTE"].includes(t)) return "Répondez OUI, NON ou DOUTE.\n\n" + etape.q;
  s.rep[etape.cle] = t;
  s.etape++;
  if (s.etape < ETAPES.length) return ETAPES[s.etape].q;
  sessions.delete(de);
  const signes = ["visage", "bras", "parole"].filter((k) => s!.rep[k] !== "NON").length;
  if (signes === 0) {
    return "Aucun des trois signes repéré. Cela ne garantit pas l'absence d'AVC : dans le doute, appelez le " + SAMU + ".\n" +
      "Envoyez AVC pour refaire le test.";
  }
  return "⚠️ SIGNES D'AVC POSSIBLES.\n\n" +
    "APPELEZ LE " + SAMU + " MAINTENANT (ou le 18).\n\n" +
    "Dites : « AVC possible, visage " + s.rep.visage + ", bras " + s.rep.bras + ", parole " + s.rep.parole + ", début " + s.rep.debut + " ».\n\n" +
    "En attendant : allongez la personne, rien à boire ni à manger, restez avec elle.\n" +
    "Envoyez votre position (trombone > Position) pour que je vous indique le centre le plus proche.";
}

async function envoyer(a: string, texte: string) {
  await fetch(`https://graph.facebook.com/v21.0/${Deno.env.get("WA_PHONE_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("WA_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: a, type: "text", text: { body: texte } }),
  });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  // Vérification du webhook par Meta
  if (req.method === "GET") {
    if (url.searchParams.get("hub.verify_token") === Deno.env.get("WA_VERIFY")) {
      return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
    }
    return new Response("refusé", { status: 403 });
  }
  const corps = await req.json().catch(() => null);
  const msg = corps?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (msg?.type === "text") {
    await envoyer(msg.from, reponse(msg.from, msg.text.body));
  } else if (msg?.type === "location") {
    const { latitude, longitude } = msg.location;
    await envoyer(msg.from, `Position reçue (${latitude.toFixed(3)}, ${longitude.toFixed(3)}). ` +
      `Le choix du centre le plus proche sera branché avec la même liste que l'appli. En attendant, suivez les consignes du ${SAMU}.`);
  }
  return new Response("ok", { status: 200 });
});
