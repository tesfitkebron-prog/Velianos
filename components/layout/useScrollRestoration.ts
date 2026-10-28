"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const CLE_PREFIXE = "velianos:scroll:";

function lirePosition(cle: string): number {
  try {
    const valeur = Number(window.sessionStorage.getItem(cle) ?? "0");
    return Number.isFinite(valeur) && valeur > 0 ? valeur : 0;
  } catch {
    return 0;
  }
}

function ecrirePosition(cle: string, position: number): void {
  try {
    window.sessionStorage.setItem(cle, String(Math.max(0, Math.round(position))));
  } catch {
    // Le stockage de session est indisponible : la position n'est pas mémorisée.
  }
}

/**
 * Mémorise et restaure la position de défilement de la zone principale.
 * Le scroll de l'application se fait dans <main>, pas dans window : Next.js
 * ne peut donc pas restaurer nativement la position au retour.
 */
export function useScrollRestoration() {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Restauration : déclarée avant l'enregistrement pour ne pas écraser la
  // position mémorisée avec un scrollTop initial à 0.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const cle = `${CLE_PREFIXE}${pathname}`;
    const cible = lirePosition(cle);
    if (cible <= 0) return;

    let arret = false;
    let minuteur: number | null = null;

    const arreter = () => {
      arret = true;
      if (minuteur) {
        clearTimeout(minuteur);
        minuteur = null;
      }
    };

    const restaurer = () => {
      if (arret || !mainRef.current) return;
      mainRef.current.scrollTop = cible;
    };

    restaurer();
    const premiereFrame = window.requestAnimationFrame(restaurer);

    const contenu = contentRef.current;
    const observateur =
      contenu && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(restaurer)
        : null;
    if (contenu && observateur) observateur.observe(contenu);

    // Une interaction de l'utilisateur reprend immédiatement la main.
    const interrompre = () => arreter();
    main.addEventListener("wheel", interrompre, { passive: true });
    main.addEventListener("touchstart", interrompre, { passive: true });
    main.addEventListener("keydown", interrompre);
    minuteur = window.setTimeout(arreter, 8000);

    return () => {
      arreter();
      window.cancelAnimationFrame(premiereFrame);
      observateur?.disconnect();
      main.removeEventListener("wheel", interrompre);
      main.removeEventListener("touchstart", interrompre);
      main.removeEventListener("keydown", interrompre);
    };
  }, [pathname]);

  // Enregistrement continu de la position courante.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const cle = `${CLE_PREFIXE}${pathname}`;
    let frame = 0;

    const enregistrer = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ecrirePosition(cle, main.scrollTop));
    };

    main.addEventListener("scroll", enregistrer, { passive: true });

    return () => {
      main.removeEventListener("scroll", enregistrer);
      cancelAnimationFrame(frame);
      ecrirePosition(cle, main.scrollTop);
    };
  }, [pathname]);

  return { mainRef, contentRef };
}
