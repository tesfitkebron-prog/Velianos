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
        actif ? "bg-white/5" : "bg-white/5"
      }`}
    >
      <span
        className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors flex-shrink-0 ${
          actif ? "bg-[#00D26A]" : "bg-slate-600"
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
            actif ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>

      <span className="text-left min-w-0">
        <span className="block text-xs font-semibold text-white">
          État de l&apos;assistant
        </span>
        <span
          className={`block text-[11px] font-normal ${
            actif ? "text-[#00D26A]" : "text-slate-400"
          }`}
        >
          {actif ? "Assistant actif" : "Assistant en pause"}
        </span>
      </span>
    </button>
  );
}

export default AssistantSwitch;
