"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Gère le bouton retour Android sur les sous-pages.
 *
 * Quand une sous-page est ouverte directement (sans historique), une entrée
 * d'historique est ajoutée pour que le bouton retour du téléphone ne ferme pas
 * l'application. Le `popstate` ramène alors vers la liste parente.
 */
export function useRetourAndroid(repli: string | null): void {
  const router = useRouter();

  useEffect(() => {
    if (!repli || typeof window === "undefined") return;

    const chemin = window.location.pathname;

    if (window.history.length <= 1) {
      window.history.pushState(
        { ...window.history.state, velianosRetour: chemin },
        "",
        window.location.href,
      );
    }

    const surRetour = () => {
      if (window.location.pathname === chemin) {
        router.replace(repli);
      }
    };

    window.addEventListener("popstate", surRetour);

    return () => {
      window.removeEventListener("popstate", surRetour);
    };
  }, [repli, router]);
}
