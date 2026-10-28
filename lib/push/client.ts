"use client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function base64UrlVersArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalise = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const brut = window.atob(normalise);
  const buffer = new ArrayBuffer(brut.length);
  const octets = new Uint8Array(buffer);

  for (let index = 0; index < brut.length; index += 1) {
    octets[index] = brut.charCodeAt(index);
  }

  return buffer;
}

async function enregistrerAbonnement(
  subscription: PushSubscription,
): Promise<void> {
  const json = subscription.toJSON();

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      },
    }),
  });
}

/** Crée (ou récupère) l'abonnement Web Push et l'enregistre côté serveur. */
export async function synchroniserAbonnementPush(): Promise<void> {
  if (
    !VAPID_PUBLIC_KEY ||
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existant = await registration.pushManager.getSubscription();
    const subscription =
      existant ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlVersArrayBuffer(VAPID_PUBLIC_KEY),
      }));

    await enregistrerAbonnement(subscription);
  } catch (erreur) {
    console.warn("Abonnement push indisponible.", erreur);
  }
}

/** Demande la permission une seule fois, au premier geste utilisateur. */
export async function demanderPermissionPush(): Promise<void> {
  if (
    !VAPID_PUBLIC_KEY ||
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "default"
  ) {
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await synchroniserAbonnementPush();
    }
  } catch {
    // L'utilisateur peut refuser ou le navigateur peut ne pas supporter.
  }
}

/**
 * Prévient les autres appareils de l'entreprise qu'un nouveau client vient
 * d'être créé. Le serveur vérifie l'appartenance de l'utilisateur.
 */
export async function notifierNouveauClient(params: {
  companyId: string;
  nom: string;
}): Promise<void> {
  try {
    await fetch("/api/push/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: params.companyId,
        title: "Nouveau client",
        body: `${params.nom} vient d'être ajouté à votre liste.`,
        url: "/clients",
        tag: "velianos-nouveau-client",
      }),
      keepalive: true,
    });
  } catch {
    // Une notification manquée ne doit jamais bloquer la création du client.
  }
}
