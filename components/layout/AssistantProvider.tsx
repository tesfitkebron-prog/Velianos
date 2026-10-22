"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { UndoToast, type ToastAction } from "@/components/ui/UndoToast";

export type NiveauAutonomie = "observer" | "suggerer" | "confirmer" | "autonome";

export type Notifications = {
  clientRepond: boolean;
  besoinVous: boolean;
};

export const MESSAGE_PAR_DEFAUT =
  "Bonjour, ici Plomberie Martin. Désolé, je n'ai pas pu répondre. Dites-moi ce qu'il vous faut, je vous rappelle rapidement.";

type EtatAssistant = {
  actif: boolean;
  niveau: NiveauAutonomie;
  message: string;
  notifications: Notifications;
};

const CLE = "velianos-assistant";

const etatInitial: EtatAssistant = {
  actif: true,
  niveau: "suggerer",
  message: MESSAGE_PAR_DEFAUT,
  notifications: {
    clientRepond: true,
    besoinVous: true,
  },
};

type ContexteAssistant = {
  actif: boolean;
  setActif: (valeur: boolean) => void;
  niveau: NiveauAutonomie;
  setNiveau: (valeur: NiveauAutonomie) => void;
  message: string;
  setMessage: (valeur: string) => void;
  notifications: Notifications;
  basculerNotification: (cle: keyof Notifications) => void;
  reinitialiser: () => void;
  notifier: (message: string, onUndo?: () => void) => void;
};

const Contexte = createContext<ContexteAssistant | null>(null);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [etat, setEtat] = useState<EtatAssistant>(etatInitial);
  const [charge, setCharge] = useState(false);
  const [toast, setToast] = useState<ToastAction | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifier = useCallback((message: string, onUndo?: () => void) => {
    setToast({ message, onUndo });

    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setToast(null), 10000);
  }, []);

  useEffect(
    () => () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    },
    [],
  );

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE);
      if (brut) {
        const enregistre = JSON.parse(brut) as Partial<EtatAssistant>;
        setEtat((precedent) => ({
          ...precedent,
          ...enregistre,
          notifications: { ...precedent.notifications, ...enregistre.notifications },
        }));
      }
    } catch {}

    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;

    try {
      window.localStorage.setItem(CLE, JSON.stringify(etat));
    } catch {}
  }, [etat, charge]);

  const valeur = useMemo<ContexteAssistant>(
    () => ({
      actif: etat.actif,
      setActif: (valeur) => setEtat((precedent) => ({ ...precedent, actif: valeur })),
      niveau: etat.niveau,
      setNiveau: (niveau) => setEtat((precedent) => ({ ...precedent, niveau })),
      message: etat.message,
      setMessage: (message) => setEtat((precedent) => ({ ...precedent, message })),
      notifications: etat.notifications,
      basculerNotification: (cle) =>
        setEtat((precedent) => ({
          ...precedent,
          notifications: {
            ...precedent.notifications,
            [cle]: !precedent.notifications[cle],
          },
        })),
      reinitialiser: () => setEtat(etatInitial),
      notifier,
    }),
    [etat, notifier],
  );

  return (
    <Contexte.Provider value={valeur}>
      {children}
      <UndoToast toast={toast} onClose={() => setToast(null)} />
    </Contexte.Provider>
  );
}

export function useAssistant() {
  const contexte = useContext(Contexte);

  if (!contexte) {
    // Pendant le build/SSR, retourner des valeurs par défaut
    return {
      actif: true,
      setActif: () => {},
      niveau: "suggerer" as NiveauAutonomie,
      setNiveau: () => {},
      message: MESSAGE_PAR_DEFAUT,
      setMessage: () => {},
      notifications: {
        clientRepond: true,
        besoinVous: true,
      },
      basculerNotification: () => {},
      reinitialiser: () => {},
      notifier: () => {},
    };
  }

  return contexte;
}