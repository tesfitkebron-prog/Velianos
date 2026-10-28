import "server-only";

import webPush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationPush = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export type ResultatEnvoiPush = {
  configure: boolean;
  envoyees: number;
  echouees: number;
};

let configurationEffectuee = false;
let configurationValide = false;

function configurerWebPush(): boolean {
  if (configurationEffectuee) return configurationValide;
  configurationEffectuee = true;

  const clePublique = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const clePrivee = process.env.VAPID_PRIVATE_KEY?.trim();
  const sujet =
    process.env.VAPID_SUBJECT?.trim() || "mailto:contact@velianos.app";

  if (!clePublique || !clePrivee) {
    console.warn(
      "Clés VAPID absentes : les notifications push sont désactivées.",
    );
    configurationValide = false;
    return false;
  }

  try {
    webPush.setVapidDetails(sujet, clePublique, clePrivee);
    configurationValide = true;
  } catch (erreur) {
    console.error("Configuration VAPID invalide.", erreur);
    configurationValide = false;
  }

  return configurationValide;
}

/**
 * Envoie une notification à tous les appareils abonnés d'une entreprise.
 *
 * Les abonnements expirés (404/410) sont supprimés automatiquement.
 */
export async function envoyerNotificationPush(
  companyId: string,
  notification: NotificationPush,
): Promise<ResultatEnvoiPush> {
  if (!configurerWebPush()) {
    return { configure: false, envoyees: 0, echouees: 0 };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { configure: false, envoyees: 0, echouees: 0 };
  }

  const { data: abonnements, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("company_id", companyId)
    .limit(200);

  if (error) {
    console.error("Lecture des abonnements push impossible.", error);
    return { configure: true, envoyees: 0, echouees: 0 };
  }

  if (!abonnements || abonnements.length === 0) {
    return { configure: true, envoyees: 0, echouees: 0 };
  }

  const url =
    notification.url && notification.url.startsWith("/")
      ? notification.url
      : "/clients";

  const payload = JSON.stringify({
    title: notification.title.slice(0, 120),
    body: notification.body.slice(0, 300),
    url,
    tag: notification.tag ?? "velianos-notification",
  });

  let envoyees = 0;
  let echouees = 0;

  await Promise.allSettled(
    abonnements.map(async (abonnement) => {
      const subscription = {
        endpoint: abonnement.endpoint as string,
        keys: {
          p256dh: abonnement.p256dh as string,
          auth: abonnement.auth as string,
        },
      };

      try {
        await webPush.sendNotification(subscription, payload, { TTL: 3600 });
        envoyees += 1;
      } catch (erreur) {
        echouees += 1;
        const statut = (erreur as { statusCode?: number }).statusCode;
        if (statut === 404 || statut === 410) {
          await admin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
        } else {
          console.error("Envoi push impossible.", erreur);
        }
      }
    }),
  );

  return { configure: true, envoyees, echouees };
}
