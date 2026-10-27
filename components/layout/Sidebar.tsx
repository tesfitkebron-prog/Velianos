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
  { href: "/compte", label: "Compte", icon: Settings },
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
    <aside className="hidden md:flex w-64 h-screen bg-[#0F172A] flex-col fixed left-0 top-0 z-30">
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
            className="w-5 h-5 text-[#10B981]"
            aria-hidden="true"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="text-white font-extrabold text-lg tracking-tight">Velianos</span>
        </Link>
        <span className="inline-block mt-2 text-slate-500 text-[10px] font-medium">
          Assistante pour artisans
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
              className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-[15px] transition-colors ${
                actif
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 font-medium hover:text-white hover:bg-white/5"
              }`}
            >
              <Icone
                className={`w-5 h-5 flex-shrink-0 ${actif ? "text-white" : ""}`}
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

      {/* PIED DE PAGE */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <UserMenu />
      </div>
    </aside>
  );
}

export default Sidebar;