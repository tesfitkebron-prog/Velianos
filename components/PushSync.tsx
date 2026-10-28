"use client";

import { useEffect } from "react";
import {
  demanderPermissionPush,
  synchroniserAbonnementPush,
} from "@/lib/push/client";

const CLE_DEMANDE = "velianos_push_demande";

/**
 * Synchronise l'abonnement Web Push sans ajouter d'élément visuel.
 *
 * La permission est demandée une seule fois, au premier geste de
 * l'utilisateur (exigence des navigateurs, notamment iOS).
 */
export function PushSync() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    if (Notification.permission === "granted") {
      void synchroniserAbonnementPush();
      return;
    }

    if (Notification.permission !== "default") return;
    if (localStorage.getItem(CLE_DEMANDE) === "1") return;

    let actif = true;

    function retirerEcouteurs() {
      window.removeEventListener("pointerdown", demander);
      window.removeEventListener("keydown", demander);
    }

    function demander() {
      if (!actif) return;
      actif = false;
      retirerEcouteurs();
      localStorage.setItem(CLE_DEMANDE, "1");
      void demanderPermissionPush();
    }

    window.addEventListener("pointerdown", demander, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", demander, { once: true });

    return () => {
      actif = false;
      retirerEcouteurs();
    };
  }, []);

  return null;
}
