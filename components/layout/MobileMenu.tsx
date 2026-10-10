"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  LayoutDashboard,
  Inbox,
  MessageSquare,
  Users,
  Building2,
  Settings,
  X,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

type Lien = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

const sections: { titre: string; liens: Lien[] }[] = [
  {
    titre: "Principal",
    liens: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/demandes", label: "Demandes", icon: Inbox, badge: "3" },
      { href: "/messages", label: "Messagerie", icon: MessageSquare, badge: "2" },
    ],
  },
  {
    titre: "Gestion",
    liens: [{ href: "/clients", label: "Clients", icon: Users }],
  },
  {
    titre: "Configuration",
    liens: [
      { href: "/entreprise", label: "Mon entreprise", icon: Building2 },
      { href: "/parametres", label: "Paramètres", icon: Settings },
    ],
  },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-3 left-4 z-50 w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm"
          aria-label="Ouvrir le menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-slate-950/60 z-40"
            onClick={() => setIsOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 h-full w-72 bg-slate-950 z-50 flex flex-col">
            <div className="p-5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-white font-extrabold text-lg tracking-tight">
                  Velianos
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <span className="inline-block mt-2 bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
                v1.0
              </span>
              <div className="mt-4 border-b border-slate-800" />
            </div>

            <div className="px-4 mt-4 flex-shrink-0">
              <Link
                href="/demandes"
                onClick={() => setIsOpen(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle demande
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              {sections.map((section, index) => (
                <div key={section.titre} className={index > 0 ? "mt-6" : ""}>
                  <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase px-4 mb-2">
                    {section.titre}
                  </p>
                  {section.liens.map((lien) => {
                    const Icone = lien.icon;
                    const actif = pathname === lien.href;

                    return (
                      <Link
                        key={lien.href}
                        href={lien.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                          actif
                            ? "bg-slate-900 text-emerald-400 font-medium"
                            : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                        }`}
                      >
                        <Icone className="w-4 h-4 flex-shrink-0" />
                        {lien.label}
                        {lien.badge && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {lien.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800 flex-shrink-0">
              <UserMenu onSignOut={() => setIsOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}