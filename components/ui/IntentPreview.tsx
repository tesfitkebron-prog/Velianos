"use client";

import { Sparkles } from "lucide-react";

export type ActionPrevue = {
  texte: string;
  detail?: string;
};

export function IntentPreview({
  ouvert,
  titre,
  actions,
  message,
  onConfirmer,
  onModifier,
  onAnnuler,
}: {
  ouvert: boolean;
  titre: string;
  actions: ActionPrevue[];
  message?: string;
  onConfirmer: () => void;
  onModifier?: () => void;
  onAnnuler: () => void;
}) {
  if (!ouvert) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onAnnuler}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">{titre}</h2>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Vous gardez le contrôle : rien n&apos;est envoyé sans votre accord.
        </p>

        {message && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-800">{message}</p>
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {actions.map((action) => (
            <li key={action.texte} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 flex-shrink-0" />
              <span>
                <span className="block text-sm text-slate-700">{action.texte}</span>
                {action.detail && (
                  <span className="block text-xs text-slate-500 mt-0.5">{action.detail}</span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
          <button
            onClick={onConfirmer}
            className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded-lg transition-colors"
          >
            Confirmer
          </button>
          {onModifier && (
            <button
              onClick={onModifier}
              className="h-11 px-4 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Modifier
            </button>
          )}
          <button
            onClick={onAnnuler}
            className="h-11 px-4 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntentPreview;