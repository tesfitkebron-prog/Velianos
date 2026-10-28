"use client";

import { useEffect, useRef } from "react";

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
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-xl bg-slate-900 p-4 text-white shadow-2xl"
      role="status"
      aria-live="polite"
    >
      <p className="min-w-0 flex-1 text-lg font-medium leading-snug">{message}</p>
      <button
        type="button"
        onClick={() => {
          onUndo();
          onClose();
        }}
        className="min-h-14 flex-shrink-0 rounded-xl px-3 text-base font-extrabold text-emerald-400 transition-transform duration-200 active:scale-95"
      >
        Annuler
      </button>
    </div>
  );
}

export default UndoToast;
