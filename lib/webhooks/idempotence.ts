import { createAdminClient } from "@/lib/supabase/admin";

export type FournisseurWebhook = "stripe" | "twilio";

export type EvenementWebhook = {
  provider: FournisseurWebhook;
  eventId: string;
  eventType?: string | null;
  payload?: unknown;
};

const DUREE_CACHE_MS = 24 * 60 * 60 * 1000;
const TAILLE_MAX_CACHE = 5000;

const cacheMemoire = new Map<string, number>();
let avertissementCacheAffiche = false;

function cleEvenement(evenement: EvenementWebhook): string {
  return `${evenement.provider}:${evenement.eventId}`;
}

function memoriser(cle: string): void {
  const maintenant = Date.now();

  if (cacheMemoire.size >= TAILLE_MAX_CACHE) {
    cacheMemoire.forEach((date, entree) => {
      if (maintenant - date > DUREE_CACHE_MS) cacheMemoire.delete(entree);
    });

    if (cacheMemoire.size >= TAILLE_MAX_CACHE) {
      let plusAncienne: string | null = null;
      let datePlusAncienne = Number.POSITIVE_INFINITY;
      cacheMemoire.forEach((date, entree) => {
        if (date < datePlusAncienne) {
          datePlusAncienne = date;
          plusAncienne = entree;
        }
      });
      if (plusAncienne) cacheMemoire.delete(plusAncienne);
    }
  }

  cacheMemoire.set(cle, maintenant);
}

function presentDansCache(cle: string): boolean {
  const date = cacheMemoire.get(cle);
  if (!date) return false;
  if (Date.now() - date > DUREE_CACHE_MS) {
    cacheMemoire.delete(cle);
    return false;
  }
  return true;
}

function oublierDuCache(cle: string): void {
  cacheMemoire.delete(cle);
}

function tableIndisponible(erreur: {
  code?: string;
  message?: string;
}): boolean {
  return (
    erreur.code === "42P01" ||
    erreur.code === "PGRST205" ||
    /webhook_events.*(does not exist|schema cache)/i.test(erreur.message ?? "")
  );
}

function utiliserCacheSecours(erreur: {
  code?: string;
  message?: string;
}): void {
  if (avertissementCacheAffiche) return;
  avertissementCacheAffiche = true;
  console.warn(
    "Table webhook_events indisponible : repli sur le cache mémoire. ",
    erreur.message ?? erreur.code ?? "Erreur inconnue",
  );
}

/**
 * Indique si l'événement a déjà été traité.
 *
 * La vérification se fait dans la table `webhook_events` quand elle est
 * disponible, sinon dans un cache mémoire borné (utile en développement ou
 * avant l'application de la migration 006).
 */
export async function evenementDejaTraite(
  evenement: EvenementWebhook,
): Promise<boolean> {
  const cle = cleEvenement(evenement);
  const admin = createAdminClient();

  if (!admin) return presentDansCache(cle);

  const { data, error } = await admin
    .from("webhook_events")
    .select("id")
    .eq("provider", evenement.provider)
    .eq("event_id", evenement.eventId)
    .maybeSingle();

  if (error) {
    if (tableIndisponible(error)) {
      utiliserCacheSecours(error);
      return presentDansCache(cle);
    }
    throw error;
  }

  if (data) {
    memoriser(cle);
    return true;
  }

  return false;
}

/**
 * Enregistre l'événement comme traité. La contrainte unique
 * `(provider, event_id)` garantit qu'une livraison concurrente ne peut pas
 * créer deux lignes.
 */
export async function marquerEvenementTraite(
  evenement: EvenementWebhook,
): Promise<void> {
  const cle = cleEvenement(evenement);
  const admin = createAdminClient();

  if (!admin) {
    memoriser(cle);
    return;
  }

  const { error } = await admin.from("webhook_events").insert({
    provider: evenement.provider,
    event_id: evenement.eventId,
    event_type: evenement.eventType ?? null,
    payload: evenement.payload ?? null,
    processed_at: new Date().toISOString(),
  });

  if (error && error.code !== "23505") {
    if (tableIndisponible(error)) {
      utiliserCacheSecours(error);
      memoriser(cle);
      return;
    }
    throw error;
  }

  memoriser(cle);
}

/**
 * Retire l'événement après un échec de traitement afin de permettre à Stripe
 * ou Twilio de le relivrer.
 */
export async function oublierEvenement(
  evenement: EvenementWebhook,
): Promise<void> {
  const cle = cleEvenement(evenement);
  oublierDuCache(cle);

  const admin = createAdminClient();
  if (!admin) return;

  const { error } = await admin
    .from("webhook_events")
    .delete()
    .eq("provider", evenement.provider)
    .eq("event_id", evenement.eventId);

  if (error && !tableIndisponible(error)) throw error;
}
