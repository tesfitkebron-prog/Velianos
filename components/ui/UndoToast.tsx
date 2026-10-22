"use client";

export type ToastAction = {
  message: string;
  onUndo?: () => void;
};

export function UndoToast({
  toast,
  onClose,
}: {
  toast: ToastAction | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-lg px-4 py-3 flex items-center gap-4 shadow-lg max-w-[calc(100vw-2rem)]">
      <p className="text-sm truncate">{toast.message}</p>
      {toast.onUndo && (
        <button
          onClick={() => {
            toast.onUndo?.();
            onClose();
          }}
          className="text-emerald-400 font-semibold text-sm flex-shrink-0"
        >
          Annuler
        </button>
      )}
    </div>
  );
}

export default UndoToast;