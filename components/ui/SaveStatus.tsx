"use client";

import { CloudCheck, HardDrive, UploadCloud } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type EtatSauvegarde = "local" | "pending" | "accepted";

const ETATS: Record<
  EtatSauvegarde,
  {
    label: string;
    description: string;
    className: string;
    Icone: typeof CloudCheck;
  }
> = {
  local: {
    label: "Sauvegardé sur l'appareil",
    description: "Les données sont conservées sur ce téléphone.",
    className: "bg-slate-100 text-slate-700",
    Icone: HardDrive,
  },
  pending: {
    label: "En attente de transfert",
    description: "La synchronisation se fera au retour du réseau.",
    className: "bg-orange-50 text-orange-800",
    Icone: UploadCloud,
  },
  accepted: {
    label: "Accepté par le système",
    description: "La modification est enregistrée sur le serveur.",
    className: "bg-emerald-50 text-emerald-800",
    Icone: CloudCheck,
  },
};

export function SaveStatus({
  etat,
  className,
}: {
  etat: EtatSauvegarde;
  className?: string;
}) {
  const meta = ETATS[etat];
  const Icone = meta.Icone;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3",
        meta.className,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-base font-extrabold leading-snug">{meta.label}</p>
        <p className="mt-0.5 text-sm font-medium leading-snug opacity-80">
          {meta.description}
        </p>
      </div>
    </div>
  );
}

export default SaveStatus;
