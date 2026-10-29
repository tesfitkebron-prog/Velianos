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
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="intent-preview-title"
              className="text-lg font-semibold leading-tight tracking-tight text-slate-900"
            >
              {titre}
            </h2>
            <p className="mt-1 text-sm leading-snug text-slate-600">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={enCours}
            aria-label="Fermer l'aperçu"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors active:bg-slate-200 disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {telephone && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <Phone
              className="h-4 w-4 flex-shrink-0 text-slate-500"
              aria-hidden="true"
            />
            <span className="truncate">{telephone}</span>
          </div>
        )}

        {details.length > 0 && (
          <dl className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="flex items-start justify-between gap-4 px-3 py-2.5"
              >
                <dt className="text-sm text-slate-500">{detail.label}</dt>
                <dd className="min-w-0 text-right text-sm font-semibold leading-snug text-slate-900">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {message && (
          <p className="mt-3 whitespace-pre-wrap rounded-xl rounded-tl-md bg-slate-100 px-3 py-2.5 text-sm leading-relaxed text-slate-800">
            {message}
          </p>
        )}

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              vibrer(50);
              onConfirm();
            }}
            disabled={enCours}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] text-sm font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {enCours ? "Envoi…" : confirmerLabel}
          </button>
          <button
            type="button"
            onClick={onModify}
            disabled={enCours}
            className="h-11 w-full rounded-xl bg-slate-100 text-sm font-medium text-slate-800 transition-colors active:bg-slate-200 disabled:opacity-50"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={enCours}
            className="h-10 w-full rounded-xl text-sm font-medium text-slate-500 transition-colors active:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntentPreview;
