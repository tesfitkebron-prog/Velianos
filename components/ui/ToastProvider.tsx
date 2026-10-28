"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GlobalToast,
  type GlobalToastData,
  type ToastVariant,
} from "./GlobalToast";

export type ShowToastOptions = {
  variant?: ToastVariant;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  showToast: (message: string, options?: ShowToastOptions) => void;
  dismissToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<GlobalToastData | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (minuteur.current) clearTimeout(minuteur.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, options: ShowToastOptions = {}) => {
      setToast({
        id: Date.now(),
        message,
        variant: options.variant ?? "success",
        actionLabel: options.actionLabel,
        onAction: options.onAction,
      });

      if (minuteur.current) clearTimeout(minuteur.current);
      minuteur.current = setTimeout(
        () => setToast(null),
        options.duration ?? 3000,
      );
    },
    [],
  );

  useEffect(
    () => () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    },
    [],
  );

  const valeur = useMemo<ToastContextValue>(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={valeur}>
      {children}
      <GlobalToast toast={toast} onClose={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const contexte = useContext(ToastContext);
  if (!contexte) {
    return {
      showToast: () => {},
      dismissToast: () => {},
    };
  }
  return contexte;
}
