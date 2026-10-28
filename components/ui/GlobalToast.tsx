"use client";

import { CheckCircle2, Info, TriangleAlert, WifiOff } from "lucide-react";

export type ToastVariant = "success" | "info" | "warning" | "error";

export type GlobalToastData = {
  id: number;
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
};

const STYLES: Record<
  ToastVariant,
  { fond: string; Icone: typeof CheckCircle2 }
> = {
  success: { fond: "bg-emerald-600", Icone: CheckCircle2 },
  info: { fond: "bg-blue-600", Icone: Info },
  warning: { fond: "bg-orange-500", Icone: WifiOff },
  error: { fond: "bg-red-600", Icone: TriangleAlert },
};

type GlobalToastProps = {
  toast: GlobalToastData | null;
  onClose: () => void;
};

export function GlobalToast({ toast, onClose }: GlobalToastProps) {
  if (!toast) return null;

  const { fond, Icone } = STYLES[toast.variant];

  return (
    <div
      className={`print-hidden fixed bottom-[calc(100px+env(safe-area-inset-bottom))] left-1/2 z-[110] flex min-h-14 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-2.5 text-white shadow-2xl animate-[toastUp_.25s_ease-out] ${fond}`}
      role="status"
      aria-live="polite"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
        <Icone className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-base font-medium leading-snug">
        {toast.message}
      </p>
      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.();
            onClose();
          }}
          className="min-h-11 flex-shrink-0 rounded-xl px-3 text-base font-extrabold text-white/90 transition-transform duration-200 active:scale-95"
        >
          {toast.actionLabel}
        </button>
      )}
    </div>
  );
}

export default GlobalToast;
