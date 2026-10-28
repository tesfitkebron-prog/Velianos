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
