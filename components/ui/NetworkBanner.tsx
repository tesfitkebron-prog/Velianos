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
      className="flex w-full flex-shrink-0 items-center justify-center gap-2 bg-orange-50 px-4 py-2.5 text-center text-base font-semibold text-orange-600 shadow-sm"
    >
      <WifiOff className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      Pas de réseau
    </div>
  );
}

export default NetworkBanner;
