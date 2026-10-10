"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

const navigation = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/messages", label: "Messagerie", icon: MessageSquare, badge: true },
  { href: "/parametres", label: "Configuration", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 h-screen bg-slate-950 flex-col fixed left-0 top-0 z-30">
      {/* LOGO */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-emerald-500"
            aria-hidden="true"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="text-white font-extrabold text-lg tracking-tight">Velianos</span>
        </Link>
        <div className="mt-4 border-b border-slate-800" />
      </div>

      {/* MENU */}
      <nav className="p-4 flex flex-col space-y-2 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const actif = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* UTILISATEUR */}
      <div className="p-4 border-t border-slate-800">
        <UserMenu />
      </div>
    </aside>
  );
}

export default Sidebar;