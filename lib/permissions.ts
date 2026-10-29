"use client";

export type PermissionId = "sms" | "rdv" | "devis" | "notes";

export type Permission = {
  id: PermissionId;
  label: string;
  description: string;
};

export const PERMISSIONS: Permission[] = [
  {
    id: "sms",
    label: "SMS aux clients",
    description: "Répondre automatiquement aux appels manqués.",
  },
  {
    id: "rdv",
    label: "Prise de rendez-vous",
    description: "Proposer et confirmer un créneau au client.",
  },
  {
    id: "devis",
    label: "Envoi de devis",
    description: "Préparer un devis à partir de votre grille tarifaire.",
  },
  {
    id: "notes",
    label: "Notes de fiche",
    description: "Résumer les échanges et compléter la fiche client.",
  },
];

const CLE = "velianos_ai_permissions";

const DEFAUT: Record<PermissionId, boolean> = {
  sms: true,
  rdv: true,
  devis: true,
  notes: true,
};

function estPermissionId(valeur: string): valeur is PermissionId {
  return valeur === "sms" || valeur === "rdv" || valeur === "devis" || valeur === "notes";
}

export function lirePermissions(): Record<PermissionId, boolean> {
  if (typeof window === "undefined") return { ...DEFAUT };
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return { ...DEFAUT };
    const valeur: unknown = JSON.parse(brut);
    if (!valeur || typeof valeur !== "object") return { ...DEFAUT };

    const permissions = { ...DEFAUT };
    for (const [cle, actif] of Object.entries(valeur)) {
      if (estPermissionId(cle) && typeof actif === "boolean") {
        permissions[cle] = actif;
      }
    }
    return permissions;
  } catch {
    return { ...DEFAUT };
  }
}

export function enregistrerPermission(
  id: PermissionId,
  actif: boolean,
): Record<PermissionId, boolean> {
  const permissions = { ...lirePermissions(), [id]: actif };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CLE, JSON.stringify(permissions));
      window.dispatchEvent(new Event("velianos:permissions"));
    } catch {
      // Le réglage reste actif pour la session.
    }
  }
  return permissions;
}
