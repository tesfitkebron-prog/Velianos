"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { accesAutorise } from "@/lib/subscription";
import { loadWorkspaceProfile } from "@/lib/workspace";

/**
 * Garde client du paywall : si l'essai est terminé et que l'abonnement n'est
 * pas actif, l'utilisateur est renvoyé vers la page d'abonnement.
 */
export function usePaywallGuard(): void {
  const router = useRouter();

  useEffect(() => {
    let monte = true;

    const verifier = async () => {
      const profil = await loadWorkspaceProfile();
      if (!monte || !profil.companyId) return;

      const autorise = accesAutorise(
        profil.subscriptionStatus,
        profil.subscriptionPlan,
        profil.trialEndsAt,
      );

      if (!autorise) {
        router.replace("/abonnement");
      }
    };

    void verifier();

    return () => {
      monte = false;
    };
  }, [router]);
}
