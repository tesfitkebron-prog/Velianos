"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
import { loadWorkspaceProfile } from "@/lib/workspace";

const titres: Record<string, string> = {
  "/dashboard": "Vue d'ensemble",
  "/demandes": "Demandes",
  "/clients": "Clients",
  "/messages": "Messagerie",
  "/entreprise": "Mon entreprise",
  "/parametres": "Configuration",
};

export function TopBar() {
  const pathname = usePathname();
  const [initiales, setInitiales] = useState("");

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (actif) setInitiales((profil.fullName.charAt(0) || "V").toUpperCase());
    };

    void charger();

    return () => {
      actif = false;
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <h1 className="text-xl font-bold text-slate-900 pl-12 md:pl-0">
        {titres[pathname] ?? "Velianos"}
      </h1>

      <div className="flex items-center gap-3">
        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <button className="hidden sm:flex items-center gap-2 h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Ces 30 derniers jours
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
          {initiales || "V"}
        </div>
      </div>
    </header>
  );
}

export default TopBar;