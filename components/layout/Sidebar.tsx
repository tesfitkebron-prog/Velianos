"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  MessageSquare,
  Sparkles,
  Settings,
  Building2,
  Users,
} from "lucide-react";
import { UserMenu } from "./UserMenu";
import { AssistantSwitch } from "./AssistantSwitch";
import { loadWorkspaceProfile } from "@/lib/workspace";

type Lien = {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: string;
};

const liens: Lien[] = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: "3" },
  { href: "/clients", label: "Clients", icon: Users, badge: "5" },
  { href: "/assistant", label: "Mon assistant", icon: Sparkles },
  { href: "/entreprise", label: "Mon entreprise", icon: Building2 },
  { href: "/parametres", label: "Réglages", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [nomEntreprise, setNomEntreprise] = useState("");

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (actif && profil.companyName) setNomEntreprise(profil.companyName);
    };

    void charger();

    return () => {
      actif = false;
    };
  }, []);

  return (
    <aside className="hidden md:flex w-64 h-screen bg-slate-950 flex-col fixed left-0 top-0 z-30">
      {/* EN-TÊTE */}
      <div className="p-5 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-emerald-500"
            aria-hidden="true"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="text-white font-extrabold text-lg tracking-tight">Velianos</span>
        </Link>
        <span className="inline-block mt-2 bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
          v1.0
        </span>
        {nomEntreprise && (
          <p className="mt-3 text-xs font-medium text-slate-300 truncate">{nomEntreprise}</p>
        )}
        <div className="mt-4 border-b border-slate-800" />
      </div>

      {/* CONTRÔLE DE L'ASSISTANT */}
      <div className="px-3 pt-4">
        <AssistantSwitch />
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-4">
        {liens.map((lien) => {
          const Icone = lien.icon;
          const actif = pathname === lien.href;

          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-lg text-base transition-colors ${
                actif
                  ? "bg-slate-900 text-emerald-400 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <Icone className="w-5 h-5 flex-shrink-0" />
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

      {/* PIED DE PAGE */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0">
        <UserMenu />
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Ligne active</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;