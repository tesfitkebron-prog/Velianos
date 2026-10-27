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
  "bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6";

export function UndoToast({
  toast,
  onClose,
  positionClass = POSITION_PAR_DEFAUT,
}: UndoToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed ${positionClass} left-1/2 -translate-x-1/2 z-[60] bg-[#0F172A] text-white rounded-xl pl-4 pr-2 py-2 flex items-center gap-2 shadow-xl max-w-[calc(100vw-2rem)] animate-[toastUp_.2s_ease-out]`}
      role="status"
    >
      <p className="text-sm font-normal truncate">{toast.message}</p>
      {toast.onUndo ? (
        <button
          onClick={() => {
            toast.onUndo?.();
            onClose();
          }}
          className="text-blue-400 font-semibold text-sm flex-shrink-0 min-h-[44px] px-2 rounded-lg active:bg-white/10 transition-colors"
        >
          Annuler
        </button>
      ) : (
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="text-slate-400 font-medium text-sm flex-shrink-0 min-h-[44px] px-2 rounded-lg active:bg-white/10 transition-colors"
        >
          Fermer
        </button>
      )}
    </div>
  );
}

export default UndoToast;
