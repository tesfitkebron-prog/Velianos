import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  evenementDejaTraite,
  marquerEvenementTraite,
  oublierEvenement,
  type EvenementWebhook,
} from "@/lib/webhooks/idempotence";
import { chargerContexteAssistant } from "@/lib/ai/context";
import { genererReponseSms, type MessageOpenAi } from "@/lib/ai/openai";
import { reponseAntiHallucination } from "@/lib/ai-prompt";
import { envoyerNotificationPush } from "@/lib/push/server";
import { formaterTelephone } from "@/lib/clients";
import {
  normaliserNumero,
  numerosCorrespondent,
  variantesNumero,
} from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TwilioPayload = Record<string, string>;

const MESSAGE_REPONSE_VIDE =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function reponseTwiml(message?: string): NextResponse {
  const contenu = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${echapperXml(
        message,
      )}</Message></Response>`
    : MESSAGE_REPONSE_VIDE;

  return new NextResponse(contenu, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function echapperXml(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function texte(valeur: unknown): string {
  return typeof valeur === "string" ? valeur.trim() : "";
}

async function lirePayload(
  request: Request,
): Promise<{ payload: TwilioPayload; brut: string } | null> {
  try {
    const brut = await request.text();
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const data: unknown = JSON.parse(brut);
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return null;
      }

      const payload: TwilioPayload = {};
      Object.entries(data as Record<string, unknown>).forEach(([cle, valeur]) => {
        if (
          typeof valeur === "string" ||
          typeof valeur === "number" ||
          typeof valeur === "boolean"
        ) {
          payload[cle] = String(valeur);
        }
      });
      return { payload, brut };
    }

    return {
      payload: Object.fromEntries(new URLSearchParams(brut).entries()),
      brut,
    };
  } catch {
    return null;
  }
}

function urlWebhook(request: Request): string {
  const configuree = process.env.TWILIO_WEBHOOK_URL?.trim();
  if (configuree) return configuree;

  const url = new URL(request.url);
  const protocole =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    url.protocol.replace(":", "");
  const hote =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    url.host;

  return `${protocole}://${hote}${url.pathname}${url.search}`;
}

/**
 * Vérifie la signature HMAC-SHA1 de Twilio :
 * URL exacte + paramètres triés par nom, concaténés « clé + valeur ».
 */
function signatureTwilioValide(
  url: string,
  payload: TwilioPayload,
  signature: string,
  authToken: string,
  corpsBrut = "",
): boolean {
  const parametresTries = Object.keys(payload)
    .sort()
    .reduce((acc, cle) => acc + cle + payload[cle], url);

  const candidates = [parametresTries];
  if (corpsBrut) candidates.push(`${url}${corpsBrut}`);

  return candidates.some((donnees) => {
    const attendue = createHmac("sha1", authToken)
      .update(donnees, "utf8")
      .digest("base64");

    const recue = Buffer.from(signature, "utf8");
    const calculee = Buffer.from(attendue, "utf8");

    return (
      recue.length === calculee.length && timingSafeEqual(recue, calculee)
    );
  });
}

/**
 * Twilio Event Streams fournit un `id`. Les callbacks SMS/voix classiques
 * n'envoient pas d'Event ID : on construit alors une clé stable à partir du
 * SID et du statut, ce qui rend les relivraisons idempotentes.
 */
function extraireEventId(request: Request, payload: TwilioPayload): string {
  const entete = request.headers.get("x-twilio-event-id")?.trim();
  if (entete) return entete;

  const identifiantDirect =
    texte(payload.id) ||
    texte(payload.EventSid) ||
    texte(payload.SmsSid) ||
    texte(payload.MessageSid) ||
    texte(payload.CallSid);

  if (!identifiantDirect) return "";

  const statut =
    texte(payload.MessageStatus) ||
    texte(payload.SmsStatus) ||
    texte(payload.CallStatus);

  return statut ? `${identifiantDirect}:${statut}` : identifiantDirect;
}

function extraireEventType(payload: TwilioPayload): string | null {
  const type = texte(payload.type) || texte(payload.EventType);
  if (type) return type;

  const statut =
    texte(payload.MessageStatus) ||
    texte(payload.SmsStatus) ||
    texte(payload.CallStatus);

  return statut ? `twilio.${statut.toLowerCase()}` : null;
}

type EntrepriseTwilio = {
  id: string;
  name: string | null;
  twilio_phone_number: string | null;
  assistant_active: boolean | null;
};

async function trouverEntreprise(
  to: string,
): Promise<EntrepriseTwilio | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("companies")
    .select("id, name, twilio_phone_number, assistant_active")
    .not("twilio_phone_number", "is", null);

  if (error) throw error;

  return (
    ((data ?? []) as EntrepriseTwilio[]).find((entreprise) =>
      numerosCorrespondent(entreprise.twilio_phone_number, to),
    ) ?? null
  );
}

async function trouverOuCreerClient(
  companyId: string,
  from: string,
): Promise<{ id: string; nouveau: boolean; nom: string } | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const variantes = variantesNumero(from);
  let client:
    | { id: string; first_name: string | null; last_name: string | null }
    | null = null;

  if (variantes.length > 0) {
    const { data, error } = await admin
      .from("clients")
      .select("id, first_name, last_name")
      .eq("company_id", companyId)
      .in("phone", variantes)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    client = data;
  }

  if (!client) {
    const { data: candidats, error: candidatsError } = await admin
      .from("clients")
      .select("id, first_name, last_name, phone")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (candidatsError) throw candidatsError;

    client =
      (candidats ?? []).find((candidat) =>
        numerosCorrespondent(candidat.phone as string | null, from),
      ) ?? null;
  }

  if (client) {
    const nom = [client.first_name, client.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return {
      id: client.id,
      nouveau: false,
      nom: nom || "Client",
    };
  }

  const { data, error } = await admin
    .from("clients")
    .insert({
      company_id: companyId,
      first_name: "Client SMS",
      phone: normaliserNumero(from) || from,
      source: "sms",
    })
    .select("id")
    .single();

  if (error) throw error;

  return { id: data.id as string, nouveau: true, nom: formaterTelephone(from) || from };
}

async function chargerHistorique(
  companyId: string,
  clientId: string,
): Promise<MessageOpenAi[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("messages")
    .select("body, direction, sent_at")
    .eq("company_id", companyId)
    .eq("client_id", clientId)
    .order("sent_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  return (data ?? [])
    .slice()
    .reverse()
    .filter((message) => Boolean(message.body))
    .map((message) => ({
      role:
        message.direction === "inbound"
          ? ("user" as const)
          : ("assistant" as const),
      content: message.body as string,
    }));
}

async function enregistrerMessage(params: {
  companyId: string;
  clientId: string;
  from: string;
  to: string;
  body: string;
  direction: "inbound" | "outbound";
  externalId: string;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { error } = await admin.from("messages").insert({
    company_id: params.companyId,
    client_id: params.clientId,
    from_number: params.from,
    to_number: params.to,
    body: params.body,
    direction: params.direction,
    status: params.direction === "inbound" ? "received" : "sent",
    external_id: params.externalId,
    sent_at: new Date().toISOString(),
  });

  if (error && error.code !== "23505") throw error;
}

async function traiterMessageEntrant(payload: TwilioPayload): Promise<string> {
  const from = texte(payload.From);
  const to = texte(payload.To);
  const body = texte(payload.Body);
  const messageSid = texte(payload.MessageSid) || texte(payload.SmsSid);

  if (!from || !to || !body) return "";

  const entreprise = await trouverEntreprise(to);
  if (!entreprise) {
    console.warn(`Aucune entreprise associée au numéro Twilio ${to}.`);
    return "";
  }

  const client = await trouverOuCreerClient(entreprise.id, from);
  if (!client) return "";

  const historique = await chargerHistorique(entreprise.id, client.id);

  if (client.nouveau) {
    await envoyerNotificationPush(entreprise.id, {
      title: "Nouveau client",
      body: `${client.nom} vous a contacté par SMS.`,
      url: "/clients",
      tag: "velianos-nouveau-client",
    });
  }

  await enregistrerMessage({
    companyId: entreprise.id,
    clientId: client.id,
    from,
    to,
    body,
    direction: "inbound",
    externalId: messageSid ? `twilio:${messageSid}` : `sms:${Date.now()}`,
  });

  if (entreprise.assistant_active === false) {
    return "";
  }

  const contexte = await chargerContexteAssistant(entreprise.id);
  const systemPrompt = contexte?.systemPrompt ?? "";
  const fallback = reponseAntiHallucination(
    entreprise.name ?? "l'artisan",
  );

  const reponse =
    (systemPrompt
      ? await genererReponseSms([
          { role: "system", content: systemPrompt },
          ...historique,
          { role: "user", content: body },
        ])
      : null) ?? fallback;

  await enregistrerMessage({
    companyId: entreprise.id,
    clientId: client.id,
    from: to,
    to: from,
    body: reponse,
    direction: "outbound",
    externalId: messageSid
      ? `twilio:${messageSid}:reply`
      : `sms:${Date.now()}:reply`,
  });

  return reponse;
}

async function mettreAJourStatutMessage(
  payload: TwilioPayload,
): Promise<void> {
  const sid = texte(payload.MessageSid) || texte(payload.SmsSid);
  const statut = texte(payload.MessageStatus) || texte(payload.SmsStatus);
  if (!sid || !statut) return;

  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("messages")
    .update({ status: statut.toLowerCase() })
    .eq("external_id", `twilio:${sid}`);
}

export async function POST(request: Request) {
  const lecture = await lirePayload(request);
  if (!lecture) {
    return NextResponse.json(
      { error: "Payload Twilio invalide." },
      { status: 400 },
    );
  }

  const { payload, brut } = lecture;
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";

  if (!authToken) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "TWILIO_AUTH_TOKEN absente : impossible de vérifier la signature.",
      );
      return NextResponse.json(
        { error: "Configuration Twilio incomplète." },
        { status: 500 },
      );
    }
    console.warn(
      "TWILIO_AUTH_TOKEN absente : signature ignorée en développement.",
    );
  } else if (
    !signature ||
    !signatureTwilioValide(
      urlWebhook(request),
      payload,
      signature,
      authToken,
      brut,
    )
  ) {
    console.warn("Signature Twilio invalide : requête rejetée.");
    return NextResponse.json(
      { error: "Signature Twilio invalide." },
      { status: 403 },
    );
  }

  const eventId = extraireEventId(request, payload);
  if (!eventId) {
    return NextResponse.json(
      { error: "Event ID Twilio manquant." },
      { status: 400 },
    );
  }

  const evenement: EvenementWebhook = {
    provider: "twilio",
    eventId,
    eventType: extraireEventType(payload),
    payload,
  };

  try {
    if (await evenementDejaTraite(evenement)) {
      return reponseTwiml();
    }

    const body = texte(payload.Body);
    const from = texte(payload.From);
    const to = texte(payload.To);

    if (body && from && to) {
      const reponse = await traiterMessageEntrant(payload);
      await marquerEvenementTraite(evenement);
      return reponseTwiml(reponse);
    }

    if (texte(payload.MessageSid) && texte(payload.MessageStatus)) {
      await mettreAJourStatutMessage(payload);
    }

    await marquerEvenementTraite(evenement);
    return reponseTwiml();
  } catch (erreur) {
    console.error("Webhook Twilio : traitement impossible.", erreur);
    await oublierEvenement(evenement).catch(() => {});
    return NextResponse.json(
      { error: "Traitement du webhook impossible." },
      { status: 500 },
    );
  }
}
