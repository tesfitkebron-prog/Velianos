import { NextResponse } from "next/server";
import {
  evenementDejaTraite,
  marquerEvenementTraite,
  type EvenementWebhook,
} from "@/lib/webhooks/idempotence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StripeEvent = {
  id?: unknown;
  type?: unknown;
  data?: unknown;
};

function texte(valeur: unknown): string {
  return typeof valeur === "string" ? valeur.trim() : "";
}

export async function POST(request: Request) {
  let payload: StripeEvent;

  try {
    payload = (await request.json()) as StripeEvent;
  } catch {
    return NextResponse.json(
      { error: "Payload JSON invalide." },
      { status: 400 },
    );
  }

  const eventId = texte(payload.id);
  if (!eventId) {
    return NextResponse.json(
      { error: "Event ID Stripe manquant." },
      { status: 400 },
    );
  }

  const evenement: EvenementWebhook = {
    provider: "stripe",
    eventId,
    eventType: texte(payload.type) || null,
    payload,
  };

  try {
    if (await evenementDejaTraite(evenement)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Point d'extension : exécuter ici l'action Stripe (abonnement, facture,
    // paiement). L'événement n'est marqué comme traité qu'après succès afin
    // qu'une relivraison puisse réessayer en cas d'erreur.

    await marquerEvenementTraite(evenement);

    return NextResponse.json({ received: true });
  } catch (erreur) {
    console.error("Webhook Stripe : traitement impossible.", erreur);
    return NextResponse.json(
      { error: "Traitement du webhook impossible." },
      { status: 500 },
    );
  }
}
