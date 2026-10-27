"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export function Toast({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: ToastType;
  onClose: () => void;
}) {
  const icone =
    type === "error" ? (
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
    ) : type === "info" ? (
      <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
    ) : (
      <CheckCircle2 className="w-5 h-5 text-[#00D26A] flex-shrink-0" />
    );

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[280px] animate-[slideIn_.2s_ease-out]">
      {icone}
      <p className="text-sm text-slate-700 flex-1">{message}</p>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;