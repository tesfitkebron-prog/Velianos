"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function useAppToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((texte: string) => {
    setMessage(texte);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 5000);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const toast = message ? (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(100px+env(safe-area-inset-bottom))] z-[90] mx-auto max-w-md animate-[toastUp_.25s_ease-out]">
      <div className="flex min-h-14 items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-base font-medium text-white shadow-2xl">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
        {message}
      </div>
    </div>
  ) : null;

  return { show, toast };
}

export default useAppToast;
