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
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={enCours}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors active:bg-slate-200 disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h2
          id="confirmation-suppression-title"
          className="mt-3 text-lg font-semibold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {description}
        </p>

        <label
          htmlFor="confirmation-suppression-saisie"
          className="mt-4 block text-sm font-medium text-slate-700"
        >
          Tapez <span className="font-semibold text-red-600">SUPPRIMER</span> pour
          confirmer
        </label>
        <input
          id="confirmation-suppression-saisie"
          value={saisie}
          onChange={(event) => setSaisie(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="SUPPRIMER"
          className="mt-2 h-11 w-full rounded-xl bg-slate-100 px-3 text-base font-medium uppercase tracking-wide text-slate-900 outline-none placeholder:text-slate-500 focus:bg-slate-50"
        />

        {erreur && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {erreur}
          </p>
        )}

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirme || enCours}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition-opacity active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {enCours ? "Suppression…" : actionLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={enCours}
            className="h-11 w-full rounded-xl bg-slate-100 text-sm font-medium text-slate-700 transition-colors active:bg-slate-200 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationSuppression;
