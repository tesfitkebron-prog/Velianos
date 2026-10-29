"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";

type ConfirmationSuppressionProps = {
  open: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  enCours?: boolean;
  erreur?: string | null;
};

/**
 * Friction maximale pour les actions irréversibles :
 * le bouton rouge ne s'active qu'après avoir tapé « SUPPRIMER ».
 */
export function ConfirmationSuppression({
  open,
  title,
  description,
  actionLabel = "Supprimer définitivement",
  onClose,
  onConfirm,
  enCours = false,
  erreur = null,
}: ConfirmationSuppressionProps) {
  const [saisie, setSaisie] = useState("");

  useEffect(() => {
    if (!open) setSaisie("");
  }, [open]);

  if (!open) return null;

  const confirme = saisie.trim().toUpperCase() === "SUPPRIMER";

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[3px] sm:items-center"
      onClick={enCours ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-suppression-title"
    >
      <div
        className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Trash2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={enCours}
            aria-label="Fermer"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <h2
          id="confirmation-suppression-title"
          className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-lg font-medium leading-relaxed text-slate-600">
          {description}
        </p>

        <label
          htmlFor="confirmation-suppression-saisie"
          className="mt-5 block px-1 text-base font-semibold text-slate-700"
        >
          Tapez <span className="font-extrabold text-red-600">SUPPRIMER</span> pour
          confirmer
        </label>
        <input
          id="confirmation-suppression-saisie"
          value={saisie}
          onChange={(event) => setSaisie(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="SUPPRIMER"
          className="mt-2 h-16 w-full rounded-2xl bg-slate-100 px-4 text-lg font-extrabold uppercase tracking-wide text-slate-900 outline-none placeholder:text-slate-500 focus:bg-slate-50 focus:ring-4 focus:ring-red-500/15"
        />

        {erreur && (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
            {erreur}
          </p>
        )}

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirme || enCours}
            className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 text-lg font-extrabold text-white transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            {enCours ? "Suppression…" : actionLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={enCours}
            className="min-h-16 w-full rounded-2xl bg-slate-100 text-lg font-extrabold text-slate-700 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationSuppression;
