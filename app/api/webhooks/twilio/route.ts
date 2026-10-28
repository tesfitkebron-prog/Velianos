import { NextResponse } from "next/server";
import {
  evenementDejaTraite,
  marquerEvenementTraite,
  type EvenementWebhook,
} from "@/lib/webhooks/idempotence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TwilioPayload = Record<string, unknown>;

async function lirePayload(request: Request): Promise<TwilioPayload | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const data: unknown = await request.json();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        return data as TwilioPayload;
      }
      return null;
    } catch {
      return null;
    }
  }

  try {
    const corps = await request.text();
    return Object.fromEntries(new URLSearchParams(corps).entries());
  } catch {
    return null;
  }
}

function texte(valeur: unknown): string {
  return typeof valeur === "string" ? valeur.trim() : "";
}

/**
 * Twilio Event Streams fournit un `id`. Les callbacks SMS/voix classiques
 * n'envoient pas d'Event ID : on construit alors une clé stable à partir du
 * SID et du statut, ce qui rend les relivraisons idempotentes.
 */
function extraireEventId(
  request: Request,
  payload: TwilioPayload,
): string {
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

export async function POST(request: Request) {
  const payload = await lirePayload(request);
  if (!payload) {
    return NextResponse.json(
      { error: "Payload Twilio invalide." },
      { status: 400 },
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
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Point d'extension : exécuter ici l'action Twilio (statut SMS, fin
    // d'appel, transcription). L'événement n'est marqué comme traité qu'après
    // succès afin qu'une relivraison puisse réessayer en cas d'erreur.

    await marquerEvenementTraite(evenement);

    return NextResponse.json({ received: true });
  } catch (erreur) {
    console.error("Webhook Twilio : traitement impossible.", erreur);
    return NextResponse.json(
      { error: "Traitement du webhook impossible." },
      { status: 500 },
    );
  }
}
