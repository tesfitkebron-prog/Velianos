"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function useAppToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((texte: string) => {
    setMessage(texte);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const toast = message ? (
    <div className="pointer-events-none fixed right-4 top-[calc(env(safe-area-inset-top)+4.5rem)] z-[70] animate-[slideIn_.2s_ease-out] md:top-6">
      <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </div>
    </div>
  ) : null;

  return { show, toast };
}

export default useAppToast;
