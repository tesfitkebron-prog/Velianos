"use client";

export type AuditAutorite = "vous" | "autonome";

export type AuditEntry = {
  id: string;
  titre: string;
  rationale: string;
  autorite: AuditAutorite;
  reversible: boolean;
  date: string;
};

const CLE = "velianos_audit_actions";
const MAX_ENTREES = 30;

function estEntreeValide(valeur: unknown): valeur is AuditEntry {
  if (!valeur || typeof valeur !== "object") return false;
  const entree = valeur as Partial<AuditEntry>;
  return (
    typeof entree.id === "string" &&
    typeof entree.titre === "string" &&
    typeof entree.rationale === "string" &&
    (entree.autorite === "vous" || entree.autorite === "autonome") &&
    typeof entree.reversible === "boolean" &&
    typeof entree.date === "string"
  );
}

export function lireAudit(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return [];
    const valeur: unknown = JSON.parse(brut);
    if (!Array.isArray(valeur)) return [];
    return valeur.filter(estEntreeValide);
  } catch {
    return [];
  }
}

export function enregistrerAudit(
  entree: Omit<AuditEntry, "id" | "date"> & { date?: string },
): AuditEntry {
  const nouvelle: AuditEntry = {
    ...entree,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: entree.date ?? new Date().toISOString(),
  };

  if (typeof window === "undefined") return nouvelle;

  try {
    const suivantes = [nouvelle, ...lireAudit()].slice(0, MAX_ENTREES);
    window.localStorage.setItem(CLE, JSON.stringify(suivantes));
    window.dispatchEvent(new Event("velianos:audit"));
  } catch {
    // Le journal reste local et best-effort.
  }

  return nouvelle;
}
