"use client";

import { createClient } from "@/lib/supabase/client";

export type OfflineActionInput =
  | {
      type: "appointment-complete";
      appointmentId: string;
      clientId?: string;
      statutPrecedent?: string;
    }
  | {
      type: "client-note";
      clientId: string;
      note: string;
    }
  | {
      type: "appointment-status";
      appointmentId: string;
      clientId?: string;
      statut: string;
      statutPrecedent?: string;
    };

export type OfflineAction = OfflineActionInput & {
  id: string;
  createdAt: string;
};

const CLE = "velianos_offline_queue";

function estActionValide(valeur: unknown): valeur is OfflineAction {
  if (!valeur || typeof valeur !== "object") return false;
  const action = valeur as {
    id?: unknown;
    createdAt?: unknown;
    type?: unknown;
    appointmentId?: unknown;
    clientId?: unknown;
    note?: unknown;
    statut?: unknown;
  };

  if (typeof action.id !== "string" || typeof action.createdAt !== "string") {
    return false;
  }
  if (action.type === "appointment-complete") {
    return (
      typeof action.appointmentId === "string" &&
      (action.clientId === undefined || typeof action.clientId === "string")
    );
  }
  if (action.type === "client-note") {
    return typeof action.clientId === "string" && typeof action.note === "string";
  }
  if (action.type === "appointment-status") {
    return (
      typeof action.appointmentId === "string" &&
      typeof action.statut === "string" &&
      (action.clientId === undefined || typeof action.clientId === "string")
    );
  }
  return false;
}

export function lireFileActions(): OfflineAction[] {
  if (typeof window === "undefined") return [];

  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return [];
    const valeur: unknown = JSON.parse(brut);
    if (!Array.isArray(valeur)) return [];
    return valeur.filter(estActionValide);
  } catch {
    return [];
  }
}

function ecrireFileActions(actions: OfflineAction[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CLE, JSON.stringify(actions));
    window.dispatchEvent(new Event("velianos:offline-queue"));
  } catch {
    // Stockage local indisponible : la file reste vide.
  }
}

export function ajouterAction(input: OfflineActionInput): OfflineAction {
  const action: OfflineAction = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
  };

  ecrireFileActions([...lireFileActions(), action]);
  return action;
}

export function retirerAction(id: string): void {
  ecrireFileActions(lireFileActions().filter((action) => action.id !== id));
}

/** Indique qu'une fiche a une action en attente de synchronisation. */
export function clientEnAttente(
  clientId: string,
  appointmentId?: string | null,
): boolean {
  return lireFileActions().some(
    (action) =>
      ("clientId" in action && action.clientId === clientId) ||
      (Boolean(appointmentId) &&
        "appointmentId" in action &&
        action.appointmentId === appointmentId),
  );
}

export async function synchroniserFile(): Promise<{
  synchronisees: number;
  restantes: number;
  erreurs: number;
}> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { synchronisees: 0, restantes: lireFileActions().length, erreurs: 0 };
  }

  const actions = lireFileActions();
  if (actions.length === 0) {
    return { synchronisees: 0, restantes: 0, erreurs: 0 };
  }

  const supabase = createClient();
  const restantes: OfflineAction[] = [];
  let synchronisees = 0;
  let erreurs = 0;

  for (const action of actions) {
    let erreur: unknown = null;

    if (action.type === "appointment-complete") {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", action.appointmentId);
      erreur = error;
    } else if (action.type === "appointment-status") {
      const { error } = await supabase
        .from("appointments")
        .update({ status: action.statut })
        .eq("id", action.appointmentId);
      erreur = error;
    } else {
      const { error } = await supabase
        .from("clients")
        .update({ notes: action.note })
        .eq("id", action.clientId);
      erreur = error;
    }

    if (erreur) {
      erreurs += 1;
      restantes.push(action);
    } else {
      synchronisees += 1;
    }
  }

  ecrireFileActions(restantes);

  return {
    synchronisees,
    restantes: restantes.length,
    erreurs,
  };
}
