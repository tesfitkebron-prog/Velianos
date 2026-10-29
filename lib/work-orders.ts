"use client";

/**
 * Cycle de vie d'un travail Velianos.
 *
 * Un job ne doit jamais disparaître : il passe par des états explicites,
 * avec une raison et un prochain responsable lorsqu'il est en attente.
 */
export type WorkOrderStatus =
  | "request"
  | "assigned"
  | "in_progress"
  | "on_hold"
  | "submitted"
  | "closed";

export type WorkOrderEvent = {
  id: string;
  status: WorkOrderStatus;
  label: string;
  at: string;
  holdReason?: string;
  nextOwner?: string;
};

export type WorkOrderState = {
  status: WorkOrderStatus;
  holdReason?: string;
  nextOwner?: string;
  updatedAt: string;
  /** Journal local des changements d'état. */
  history?: WorkOrderEvent[];
};

export const WORK_ORDER_META: Record<
  WorkOrderStatus,
  {
    label: string;
    description: string;
    badge: string;
    pastille: string;
  }
> = {
  request: {
    label: "Demande reçue",
    description: "Le client a été qualifié. Le rendez-vous reste à confirmer.",
    badge: "bg-blue-50 text-blue-800",
    pastille: "bg-blue-600",
  },
  assigned: {
    label: "Assigné",
    description: "Le rendez-vous est confirmé et vous êtes attendu.",
    badge: "bg-indigo-50 text-indigo-800",
    pastille: "bg-indigo-600",
  },
  in_progress: {
    label: "En cours",
    description: "Vous êtes sur place ou l'intervention a démarré.",
    badge: "bg-emerald-50 text-emerald-800",
    pastille: "bg-emerald-600",
  },
  on_hold: {
    label: "En attente",
    description: "Le travail est suspendu. La raison et le responsable sont affichés.",
    badge: "bg-orange-50 text-orange-800",
    pastille: "bg-orange-500",
  },
  submitted: {
    label: "Soumis à validation",
    description: "Le travail est terminé. Il attend votre validation ou celle du client.",
    badge: "bg-violet-50 text-violet-800",
    pastille: "bg-violet-600",
  },
  closed: {
    label: "Terminé",
    description: "Le travail est clôturé et archivé.",
    badge: "bg-slate-100 text-slate-700",
    pastille: "bg-slate-500",
  },
};

export const ORDRE_TRAVAIL: WorkOrderStatus[] = [
  "request",
  "assigned",
  "in_progress",
  "submitted",
  "closed",
];

const SUIVANT: Record<WorkOrderStatus, WorkOrderStatus | null> = {
  request: "assigned",
  assigned: "in_progress",
  in_progress: "submitted",
  submitted: "closed",
  closed: null,
  on_hold: "in_progress",
};

export type MotifAttente = {
  value: string;
  label: string;
  nextOwner: string;
};

export const MOTIFS_ATTENTE: MotifAttente[] = [
  {
    value: "piece",
    label: "En attente de pièce",
    nextOwner: "Fournisseur",
  },
  {
    value: "client",
    label: "En attente du client",
    nextOwner: "Client",
  },
  {
    value: "collegue",
    label: "En attente d'un collègue",
    nextOwner: "Collègue",
  },
];

const CLE = "velianos_work_orders";

function etatDepuisRdv(statutRdv?: string | null): WorkOrderStatus {
  switch ((statutRdv ?? "").toLowerCase()) {
    case "completed":
    case "closed":
    case "cancelled":
      return "closed";
    case "in_progress":
    case "started":
      return "in_progress";
    case "on_hold":
    case "hold":
      return "on_hold";
    case "submitted":
    case "review":
      return "submitted";
    case "confirmed":
    case "assigned":
      return "assigned";
    case "pending":
    case "request":
    default:
      return "request";
  }
}

function lireTous(): Record<string, WorkOrderState> {
  if (typeof window === "undefined") return {};
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return {};
    const valeur: unknown = JSON.parse(brut);
    if (!valeur || typeof valeur !== "object") return {};
    return valeur as Record<string, WorkOrderState>;
  } catch {
    return {};
  }
}

function ecrireTous(etats: Record<string, WorkOrderState>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(etats));
    window.dispatchEvent(new Event("velianos:work-orders"));
  } catch {
    // Le stockage local est optionnel : l'état reste en mémoire.
  }
}

export function lireEtatTravail(
  clientId: string,
  statutRdv?: string | null,
): WorkOrderState {
  const enregistre = lireTous()[clientId];
  if (enregistre && WORK_ORDER_META[enregistre.status]) {
    return enregistre;
  }

  const status = etatDepuisRdv(statutRdv);
  return {
    status,
    nextOwner: status === "closed" ? "—" : "Vous",
    updatedAt: new Date().toISOString(),
    history: [],
  };
}

export function enregistrerEtatTravail(
  clientId: string,
  etat: Omit<WorkOrderState, "updatedAt">,
): WorkOrderState {
  const maintenant = new Date().toISOString();
  const evenement: WorkOrderEvent = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    status: etat.status,
    label: WORK_ORDER_META[etat.status].label,
    at: maintenant,
    holdReason: etat.holdReason,
    nextOwner: etat.nextOwner,
  };

  const suivant: WorkOrderState = {
    ...etat,
    updatedAt: maintenant,
    history: [...(etat.history ?? []), evenement].slice(-20),
  };
  const tous = lireTous();
  tous[clientId] = suivant;
  ecrireTous(tous);
  return suivant;
}

export function prochainEtat(status: WorkOrderStatus): WorkOrderStatus | null {
  return SUIVANT[status];
}

export function prochainEtatLabel(status: WorkOrderStatus): string | null {
  const suivant = prochainEtat(status);
  return suivant ? WORK_ORDER_META[suivant].label : null;
}

export function creerEtatAttente(motif: MotifAttente): WorkOrderState {
  return {
    status: "on_hold",
    holdReason: motif.label,
    nextOwner: motif.nextOwner,
    updatedAt: new Date().toISOString(),
  };
}
