"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  MessageSquare,
  Sparkles,
  Settings,
  X,
  Bell,
  FileText,
} from "lucide-react";
import { UserMenu } from "./UserMenu";
import { AssistantSwitch } from "./AssistantSwitch";

type Lien = {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: string;
};

const liens: Lien[] = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: "3" },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: "2" },
  { href: "/clients", label: "Clients récupérés", icon: FileText, badge: "5" },
  { href: "/assistant", label: "Mon assistant", icon: Sparkles },
  { href: "/compte", label: "Mon compte", icon: Settings },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-3 left-4 z-50 w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm"
          aria-label="Ouvrir le menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-slate-950/60 z-40"
            onClick={() => setIsOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 h-full w-80 bg-slate-950 z-50 flex flex-col">
            <div className="p-5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-white font-extrabold text-lg tracking-tight">
                  Velianos
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
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

            <div className="px-3 pt-4">
              <AssistantSwitch />
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              {liens.map((lien) => {
                const Icone = lien.icon;
                const actif = pathname === lien.href;

                return (
                  <Link
                    key={lien.href}
                    href={lien.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-4 mx-2 rounded-lg text-base transition-colors ${
                      actif
                        ? "bg-slate-900 text-emerald-400 font-medium"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                    }`}
                  >
                    <Icone className="w-6 h-6 flex-shrink-0" />
                    {lien.label}
                    {lien.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                        {lien.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 flex-shrink-0">
              <UserMenu onSignOut={() => setIsOpen(false)} />
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Ligne active</span>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}