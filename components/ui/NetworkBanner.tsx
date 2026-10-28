"use client";

import { useEffect, useState } from "react";

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
      className="w-full flex-shrink-0 bg-orange-100 p-2 text-center text-xs text-orange-800"
    >
      📡 Mode hors-ligne. Vos actions seront synchronisées.
    </div>
  );
}

export default NetworkBanner;
