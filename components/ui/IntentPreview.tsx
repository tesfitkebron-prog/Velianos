"use client";

import { Phone, Send, X } from "lucide-react";
import { vibrer } from "@/lib/clients";

export type IntentDetail = {
  label: string;
  value: string;
};

type IntentPreviewProps = {
  open: boolean;
  message?: string;
  telephone?: string;
  titre?: string;
  description?: string;
  details?: IntentDetail[];
  confirmerLabel?: string;
  onConfirm: () => void;
  onModify: () => void;
  onCancel: () => void;
  enCours?: boolean;
};

/**
 * Aperçu exact d'une action critique (SMS, rendez-vous, devis)
 * avant son envoi définitif. Réservé aux nœuds critiques du workflow.
 */
export function IntentPreview({
  open,
  message = "",
  telephone = "",
  titre = "Vérifiez avant d'envoyer",
  description = "Voici ce qui va être envoyé :",
  details = [],
  confirmerLabel = "Confirmer",
  onConfirm,
  onModify,
  onCancel,
  enCours = false,
}: IntentPreviewProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-[3px] sm:items-center"
      onClick={enCours ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intent-preview-title"
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="intent-preview-title"
              className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900"
            >
              {titre}
            </h2>
            <p className="mt-1 text-lg font-medium leading-snug text-slate-600">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={enCours}
            aria-label="Fermer l'aperçu"
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {telephone && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-base font-semibold text-slate-700">
            <Phone
              className="h-5 w-5 flex-shrink-0 text-slate-500"
              aria-hidden="true"
            />
            <span className="truncate">{telephone}</span>
          </div>
        )}

        {details.length > 0 && (
          <dl className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <dt className="text-base font-semibold text-slate-500">
                  {detail.label}
                </dt>
                <dd className="min-w-0 text-right text-base font-extrabold leading-snug text-slate-900">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {message && (
          <p className="mt-4 whitespace-pre-wrap rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-lg font-medium leading-relaxed text-slate-800">
            {message}
          </p>
        )}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => {
              vibrer(50);
              onConfirm();
            }}
            disabled={enCours}
            className="flex min-h-20 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-lg font-extrabold text-white shadow-lg shadow-emerald-600/40 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            <Send className="h-6 w-6" aria-hidden="true" />
            {enCours ? "Envoi…" : confirmerLabel}
          </button>
          <button
            type="button"
            onClick={onModify}
            disabled={enCours}
            className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-slate-100 text-lg font-extrabold text-slate-800 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={enCours}
            className="min-h-16 w-full rounded-2xl text-base font-extrabold text-slate-600 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntentPreview;
