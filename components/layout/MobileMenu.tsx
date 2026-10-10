"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Settings, X } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

const navigation = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/messages", label: "Messagerie", icon: MessageSquare, badge: true },
  { href: "/parametres", label: "Configuration", icon: Settings },
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
            <div className="p-6">
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
              <div className="mt-4 border-b border-slate-800" />
            </div>

            <nav className="p-4 flex flex-col space-y-2 flex-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const actif = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      actif
                        ? "bg-slate-900 text-emerald-400 font-medium"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                        3
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <UserMenu onSignOut={() => setIsOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}