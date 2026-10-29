"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

type UndoToastProps = {
  isVisible: boolean;
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
};

export function UndoToast({
  isVisible,
  message,
  onUndo,
  onClose,
  duration = 6000,
}: UndoToastProps) {
  const fermeture = useRef(onClose);

  useEffect(() => {
    fermeture.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isVisible) return;
    const minuteur = window.setTimeout(() => fermeture.current(), duration);
    return () => window.clearTimeout(minuteur);
  }, [isVisible, duration]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[90] mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-2xl"
      role="status"
      aria-live="polite"
    >
      <p className="flex min-w-0 flex-1 items-center gap-2 text-lg font-semibold leading-snug">
        <CheckCircle2
          className="h-5 w-5 flex-shrink-0 text-emerald-400"
          aria-hidden="true"
        />
        <span>{message}</span>
      </p>
      <button
        type="button"
        onClick={() => {
          onUndo();
          onClose();
        }}
        className="min-h-14 flex-shrink-0 rounded-xl bg-white/10 px-4 text-base font-extrabold text-emerald-300 transition-transform duration-200 active:scale-95"
      >
        Annuler
      </button>
    </div>
  );
}

export default UndoToast;
