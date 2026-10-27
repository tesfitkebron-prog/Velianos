"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Bot,
  Building2,
  MessageSquare,
  Phone,
  User,
  Users,
} from "lucide-react";
import { UserMenu } from "./UserMenu";
import { AssistantSwitch } from "./AssistantSwitch";
import { loadWorkspaceProfile } from "@/lib/workspace";
import { normaliserChemin } from "@/lib/navigation";

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

export function Sidebar() {
  const pathname = usePathname();
  const chemin = normaliserChemin(pathname);
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
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-[#0F172A] md:flex">
      {/* EN-TÊTE */}
      <div className="flex-shrink-0 p-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-[#00D26A]"
            aria-hidden="true"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Velianos
          </span>
        </Link>
        <span className="mt-2 inline-block text-[10px] font-medium text-slate-500">
          Assistante pour artisans
        </span>
        {nomEntreprise && (
          <p className="mt-3 truncate text-xs font-medium text-slate-300">
            {nomEntreprise}
          </p>
        )}
        <div className="mt-4 border-b border-slate-800" />
      </div>

      {/* CONTRÔLE DE L'ASSISTANT */}
      <div className="px-3 pt-4">
        <AssistantSwitch />
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-4">
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
                className={`mx-2 flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] transition-colors active:scale-[0.99] ${
                  actif
                    ? "bg-white/10 font-semibold text-white"
                    : "font-medium text-slate-400 hover:bg-white/5 hover:text-white"
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

      {/* PIED DE PAGE */}
      <div className="flex-shrink-0 border-t border-white/10 p-4">
        <UserMenu />
      </div>
    </aside>
  );
}

export default Sidebar;
