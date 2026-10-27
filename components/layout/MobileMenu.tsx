"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Bot,
  Building2,
  Menu,
  MessageSquare,
  Phone,
  User,
  Users,
  X,
} from "lucide-react";
import { UserMenu } from "./UserMenu";
import { AssistantSwitch } from "./AssistantSwitch";
import { estSousPageAvecRetour, normaliserChemin } from "@/lib/navigation";

type Lien = {
  href: string;
  label: string;
  icon: typeof Phone;
  badge?: string;
};

const liens: Lien[] = [
  { href: "/dashboard", label: "À rappeler", icon: Phone, badge: "3" },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/parametres", label: "Compte", icon: User },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: "2" },
  { href: "/entreprise", label: "Mon entreprise", icon: Building2 },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const chemin = normaliserChemin(pathname);
  const estSousPage = estSousPageAvecRetour(chemin);

  const estActif = (href: string) => {
    if (href === "/parametres") {
      return (
        chemin === "/parametres" ||
        chemin.startsWith("/compte") ||
        chemin === "/entreprise"
      );
    }
    return chemin === href;
  };

  return (
    <>
      {!isOpen && !estSousPage && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-3 top-[calc(env(safe-area-inset-top)+0.85rem)] z-50 flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors active:scale-95 active:bg-slate-100 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-slate-900 md:hidden">
            <div className="flex-shrink-0 px-5 pb-4 pt-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Velianos
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-transform active:scale-95 active:bg-white/10"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-5 border-b border-white/10" />
            </div>

            <div className="px-3 pt-3">
              <AssistantSwitch />
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              {liens.map((lien, index) => {
                const Icone = lien.icon;
                const actif = estActif(lien.href);

                return (
                  <div key={lien.href}>
                    {index === 5 && (
                      <div className="mx-4 my-2 border-t border-white/10" />
                    )}
                    <Link
                      href={lien.href}
                      onClick={() => setIsOpen(false)}
                      className={`mx-2 flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] transition-colors active:scale-[0.99] ${
                        actif
                          ? "bg-white/10 font-semibold text-white"
                          : "font-medium text-slate-400 active:bg-white/5"
                      }`}
                    >
                      <Icone
                        className={`h-5 w-5 flex-shrink-0 ${
                          actif ? "text-white" : ""
                        }`}
                        strokeWidth={2}
                      />
                      {lien.label}
                      {lien.badge && (
                        <span className="ml-auto min-w-[20px] rounded-md bg-white/10 px-2 py-0.5 text-center text-[10px] font-semibold text-slate-200">
                          {lien.badge}
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </nav>

            <div className="flex-shrink-0 border-t border-white/10 p-4">
              <UserMenu onSignOut={() => setIsOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
