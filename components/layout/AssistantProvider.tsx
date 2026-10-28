"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useToast,
  type ShowToastOptions,
} from "@/components/ui/ToastProvider";
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
  notifier: (
    message: string,
    onUndo?: () => void,
    options?: ShowToastOptions,
  ) => void;
};

const Contexte = createContext<ContexteAssistant | null>(null);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [etat, setEtat] = useState<EtatAssistant>(etatInitial);

  const notifier = useCallback(
    (
      message: string,
      onUndo?: () => void,
      options?: ShowToastOptions,
    ) => {
      showToast(message, {
        variant: options?.variant ?? "success",
        duration: options?.duration ?? 3000,
        actionLabel: onUndo ? "Annuler" : options?.actionLabel,
        onAction: onUndo ?? options?.onAction,
      });
    },
    [showToast],
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
    <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
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
