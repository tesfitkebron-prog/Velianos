"use client";

import { useEffect, useRef } from "react";
import { synchroniserFile } from "@/lib/offline-queue";
import { useToast } from "./ui/ToastProvider";

export function OfflineSync() {
  const { showToast } = useToast();
  const enCours = useRef(false);

  useEffect(() => {
    let monte = true;

    const synchroniser = async (afficher: boolean) => {
      if (!navigator.onLine || enCours.current) return;
      enCours.current = true;

      try {
        const resultat = await synchroniserFile();
        if (!monte || !afficher) return;

        if (resultat.synchronisees > 0) {
          showToast("✅ Actions en attente synchronisées.", {
            variant: "success",
          });
        } else if (resultat.erreurs > 0) {
          showToast(
            "Certaines actions n'ont pas pu être synchronisées. Elles restent en attente.",
            { variant: "warning" },
          );
        }
      } catch {
        if (monte && afficher) {
          showToast(
            "La synchronisation n'a pas abouti. Vos actions restent en attente.",
            { variant: "warning" },
          );
        }
      } finally {
        enCours.current = false;
      }
    };

    void synchroniser(false);

    const online = () => {
      void synchroniser(true);
    };

    window.addEventListener("online", online);
    return () => {
      monte = false;
      window.removeEventListener("online", online);
    };
  }, [showToast]);

  return null;
}

export default OfflineSync;
