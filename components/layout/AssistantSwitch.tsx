"use client";

import { useAssistant } from "./AssistantProvider";

export function AssistantSwitch() {
  const { actif, setActif } = useAssistant();

  return (
    <button
      onClick={() => setActif(!actif)}
      role="switch"
      aria-checked={actif}
      aria-label={actif ? "Mettre l'assistant en pause" : "Activer l'assistant"}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        actif ? "bg-emerald-500/10" : "bg-slate-900"
      }`}
    >
      <span
        className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors flex-shrink-0 ${
          actif ? "bg-emerald-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${
            actif ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>

      <span className="text-left min-w-0">
        <span className="block text-xs font-semibold text-white">État de l&apos;assistant</span>
        <span className={`block text-xs ${actif ? "text-emerald-400" : "text-slate-500"}`}>
          {actif ? "Assistant actif" : "Assistant en pause"}
        </span>
      </span>
    </button>
  );
}

export default AssistantSwitch;