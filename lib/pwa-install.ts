"use client";

import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type PwaInstallOutcome = "accepted" | "dismissed" | "unavailable";

let evenementInstallation: BeforeInstallPromptEvent | null = null;
const abonnes = new Set<() => void>();

function prevenirAbonnes() {
  abonnes.forEach((abonne) => abonne());
}

function estIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !("MSStream" in window)
  );
}

function estApplicationInstallee(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    evenementInstallation = event as BeforeInstallPromptEvent;
    prevenirAbonnes();
  });

  window.addEventListener("appinstalled", () => {
    evenementInstallation = null;
    prevenirAbonnes();
  });
}

export function usePwaInstall() {
  const [disponible, setDisponible] = useState(false);
  const [installee, setInstallee] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const maj = () => {
      setDisponible(Boolean(evenementInstallation));
      setInstallee(estApplicationInstallee());
    };

    maj();
    setIos(estIOS());
    abonnes.add(maj);
    return () => {
      abonnes.delete(maj);
    };
  }, []);

  const installer = useCallback(async (): Promise<PwaInstallOutcome> => {
    if (!evenementInstallation) return "unavailable";

    const evenement = evenementInstallation;
    await evenement.prompt();
    const choix = await evenement.userChoice;

    if (choix.outcome === "accepted") {
      evenementInstallation = null;
      prevenirAbonnes();
    }

    return choix.outcome;
  }, []);

  return { disponible, installee, installer, estIOS: ios };
}

export type PwaPlateforme = "iphone" | "android";

export function instructionsInstallation(
  plateforme: PwaPlateforme = estIOS() ? "iphone" : "android",
): string[] {
  if (plateforme === "iphone") {
    return [
      "Ouvrez cette page dans Safari.",
      "Appuyez sur le bouton Partager en bas de l'écran.",
      "Choisissez « Sur l'écran d'accueil », puis « Ajouter ».",
    ];
  }

  return [
    "Ouvrez le menu de votre navigateur (les 3 petits points).",
    "Choisissez « Installer l'application ».",
    "Validez l'installation pour retrouver Velianos sur votre écran d'accueil.",
  ];
}
