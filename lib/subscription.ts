export type AbonnementTone = "orange" | "green" | "red";

export type AbonnementStatut = {
  label: string;
  tone: AbonnementTone;
  essai: boolean;
  actif: boolean;
  joursRestants: number | null;
};

export const STYLE_ABONNEMENT: Record<AbonnementTone, string> = {
  orange: "bg-orange-50 text-orange-600",
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
};

/**
 * Autorise l'accès tant que l'abonnement est actif ou que l'essai gratuit
 * n'est pas terminé. Une date de fin d'essai absente ne bloque jamais l'accès.
 */
export function accesAutorise(
  subscriptionStatus?: string | null,
  subscriptionPlan?: string | null,
  trialEndsAt?: string | null,
): boolean {
  if (statutAbonnement(subscriptionStatus, subscriptionPlan, trialEndsAt).actif) {
    return true;
  }

  if (!trialEndsAt) return true;

  const finEssai = new Date(trialEndsAt).getTime();
  return Number.isNaN(finEssai) || finEssai > Date.now();
}

export function statutAbonnement(
  subscriptionStatus?: string | null,
  subscriptionPlan?: string | null,
  trialEndsAt?: string | null,
): AbonnementStatut {
  const maintenant = Date.now();
  const finEssai = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
  const essaiEnCours =
    subscriptionStatus === "trialing" &&
    (finEssai === null || Number.isNaN(finEssai) || finEssai > maintenant);

  const joursRestants =
    finEssai !== null && !Number.isNaN(finEssai)
      ? Math.max(0, Math.ceil((finEssai - maintenant) / 86_400_000))
      : null;

  if (essaiEnCours) {
    return {
      label:
        joursRestants !== null
          ? `Essai gratuit - J-${joursRestants}`
          : "Essai gratuit",
      tone: "orange",
      essai: true,
      actif: true,
      joursRestants,
    };
  }

  if (subscriptionStatus === "active") {
    const nomPlan =
      subscriptionPlan?.toLowerCase() === "pro"
        ? "Pro"
        : subscriptionPlan
          ? `${subscriptionPlan.charAt(0).toUpperCase()}${subscriptionPlan.slice(1)}`
          : "Pro";

    return {
      label: `Plan ${nomPlan} - Actif`,
      tone: "green",
      essai: false,
      actif: true,
      joursRestants,
    };
  }

  return {
    label: "Abonnement inactif",
    tone: "red",
    essai: false,
    actif: false,
    joursRestants,
  };
}
