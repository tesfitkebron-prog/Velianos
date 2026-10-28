"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UndoToast, type ToastAction } from "@/components/ui/UndoToast";
import { loadWorkspaceProfile, setAssistantActive } from "@/lib/workspace";

export type NiveauAutonomie = "observer" | "suggerer" | "confirmer" | "autonome";

export type Notifications = {
  clientRepond: boolean;
  besoinVous: boolean;
};

export const MESSAGE_PAR_DEFAUT =
  "Bonjour, ici votre artisan. Désolé, je n'ai pas pu répondre. Dites-moi ce qu'il vous faut, je vous rappelle rapidement.";

type EtatAssistant = {
  actif: boolean;
  niveau: NiveauAutonomie;
  message: string;
  notifications: Notifications;
};

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
  const [toast, setToast] = useState<ToastAction | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifier = useCallback((message: string, onUndo?: () => void) => {
    setToast({ message, onUndo });

    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setToast(null), 5000);
  }, []);

  useEffect(
    () => () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    },
    [],
  );

  useEffect(() => {
    let monte = true;

    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (!monte || !profil.userId) return;
      setEtat((precedent) => ({
        ...precedent,
        actif: profil.assistantActive,
      }));
    };

    void charger();

    return () => {
      monte = false;
    };
  }, []);

  const changerActif = useCallback((valeur: boolean) => {
    setEtat((precedent) => ({ ...precedent, actif: valeur }));
    void setAssistantActive(valeur);
  }, []);

  const valeur = useMemo<ContexteAssistant>(
    () => ({
      actif: etat.actif,
      setActif: changerActif,
      niveau: etat.niveau,
      setNiveau: (niveau) =>
        setEtat((precedent) => ({ ...precedent, niveau })),
      message: etat.message,
      setMessage: (message) =>
        setEtat((precedent) => ({ ...precedent, message })),
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
    [etat, notifier, changerActif],
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
