"use client";

import { Phone, Send, X } from "lucide-react";
import { vibrer } from "@/lib/clients";

type IntentPreviewProps = {
  open: boolean;
  message: string;
  telephone: string;
  onConfirm: () => void;
  onModify: () => void;
  onCancel: () => void;
  enCours?: boolean;
};

/**
 * Aperçu exact d'une action visible par le client (SMS, rendez-vous)
 * avant son envoi définitif.
 */
export function IntentPreview({
  open,
  message,
  telephone,
  onConfirm,
  onModify,
  onCancel,
  enCours = false,
}: IntentPreviewProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[3px] sm:items-center"
      onClick={enCours ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intent-preview-title"
    >
      <div
        className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="intent-preview-title"
              className="text-2xl font-extrabold tracking-tight text-slate-900"
            >
              Vérifiez avant d&apos;envoyer
            </h2>
            <p className="mt-1 text-lg font-medium text-slate-600">
              Voici ce que l&apos;assistant va envoyer :
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={enCours}
            aria-label="Fermer l'aperçu"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-base font-semibold text-slate-600">
          <Phone className="h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">
            {telephone || "Numéro du destinataire manquant"}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-lg font-medium leading-relaxed text-slate-700">
          {message}
        </p>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              vibrer(50);
              onConfirm();
            }}
            disabled={enCours}
            className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            {enCours ? "Envoi…" : "Confirmer"}
          </button>
          <button
            type="button"
            onClick={onModify}
            disabled={enCours}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-slate-100 text-lg font-extrabold text-slate-700 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={enCours}
            className="min-h-14 w-full rounded-2xl text-base font-extrabold text-slate-500 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntentPreview;
