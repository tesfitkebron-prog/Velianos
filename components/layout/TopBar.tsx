"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, Plus, Mic } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 gap-4 overflow-hidden">
      {/* ESPACE POUR LE BURGER sur mobile */}
      <div className="w-12 md:hidden flex-shrink-0" />

      {/* RECHERCHE - visible UNIQUEMENT sur desktop */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Rechercher un client, un RDV..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* ACTIONS À DROITE */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto flex-shrink-0">
        {/* Nouveau RDV - desktop seulement */}
        <button className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-gray-50 whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">Nouveau RDV</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-text-secondary hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Aide - desktop seulement */}
        <button className="hidden md:block p-2 text-text-secondary hover:bg-gray-100 rounded-lg">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Bouton Nova - toujours visible, texte raccourci sur mobile */}
        <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover whitespace-nowrap flex-shrink-0">
          <Mic className="w-4 h-4" />
          <span className="hidden md:inline">Qu'est-ce que Nova a fait ?</span>
          <span className="md:hidden">Nova</span>
        </button>
      </div>
    </header>
  );
}