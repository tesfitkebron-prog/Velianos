"use client";

export type ToastAction = {
  message: string;
  onUndo?: () => void;
};

type UndoToastProps = {
  toast: ToastAction | null;
  onClose: () => void;
  positionClass?: string;
};

const POSITION_PAR_DEFAUT =
  "bottom-[calc(100px+env(safe-area-inset-bottom))] md:bottom-8";

export function UndoToast({
  toast,
  onClose,
  positionClass = POSITION_PAR_DEFAUT,
}: UndoToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed ${positionClass} left-1/2 z-[90] flex min-h-14 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-5 py-2 text-white shadow-2xl animate-[toastUp_.25s_ease-out]`}
      role="status"
      aria-live="polite"
    >
      <p className="min-w-0 flex-1 text-base font-medium leading-snug">
        {toast.message}
      </p>
      {toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            toast.onUndo?.();
            onClose();
          }}
          className="min-h-11 flex-shrink-0 rounded-xl px-3 text-base font-extrabold text-emerald-400 transition-transform duration-200 active:scale-95"
        >
          Annuler
        </button>
      )}
    </div>
  );
}

export default UndoToast;
