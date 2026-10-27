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
  Menu,
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
  { href: "/clients", label: "Clients", icon: FileText, badge: "5" },
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
          className="md:hidden fixed left-3 top-[calc(env(safe-area-inset-top)+0.85rem)] z-50 w-10 h-10 rounded-lg text-slate-500 active:bg-slate-100 flex items-center justify-center transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-[#0F172A]/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 h-full w-72 bg-[#0F172A] z-50 flex flex-col">
            <div className="px-5 pt-6 pb-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Velianos
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 active:bg-white/10"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-5 border-b border-white/10" />
            </div>

            <div className="px-3 pt-3">
              <AssistantSwitch />
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              {liens.map((lien) => {
                const Icone = lien.icon;
                const actif = pathname === lien.href;

                return (
                  <Link
                    key={lien.href}
                    href={lien.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-lg text-[15px] transition-colors ${
                      actif
                        ? "bg-white/10 text-white font-semibold"
                        : "text-slate-400 font-medium active:bg-white/5"
                    }`}
                  >
                    <Icone
                      className={`w-5 h-5 flex-shrink-0 ${
                        actif ? "text-white" : ""
                      }`}
                      strokeWidth={2}
                    />
                    {lien.label}
                    {lien.badge && (
                      <span className="ml-auto bg-white/10 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-md min-w-[20px] text-center">
                        {lien.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <UserMenu onSignOut={() => setIsOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
