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
    <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 z-[60] bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8 animate-[toastUp_.2s_ease-out]">
      <div className="flex items-center gap-2 bg-[#0F172A] text-white text-sm font-medium pl-3 pr-4 py-3 rounded-full shadow-xl">
        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
        {message}
      </div>
    </div>
  ) : null;

  return { show, toast };
}

export default useAppToast;
