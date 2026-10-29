"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function NetworkBanner() {
  const [horsLigne, setHorsLigne] = useState(false);

  useEffect(() => {
    const maj = () => setHorsLigne(!navigator.onLine);
    maj();
    window.addEventListener("online", maj);
    window.addEventListener("offline", maj);
    return () => {
      window.removeEventListener("online", maj);
      window.removeEventListener("offline", maj);
    };
  }, []);

  if (!horsLigne) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full flex-shrink-0 items-center justify-center gap-2 border-b border-orange-200 bg-orange-100 px-4 py-3 text-center text-base font-extrabold text-orange-900"
    >
      <WifiOff className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      Pas de réseau. Mode hors-ligne activé.
    </div>
  );
}

export default NetworkBanner;
