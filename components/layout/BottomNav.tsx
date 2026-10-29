"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, Inbox, Settings, Users } from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Demandes",
    icon: Inbox,
    racines: ["/dashboard", "/messages"],
  },
  {
    href: "/assistant",
    label: "Assistant",
    icon: Bot,
    racines: ["/assistant", "/controle"],
  },
  {
    href: "/clients",
    label: "Clients",
    icon: Users,
    racines: ["/clients"],
  },
  {
    href: "/parametres",
    label: "Réglages",
    icon: Settings,
    racines: ["/parametres", "/compte"],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const chemin = pathname.replace(/\/$/, "");

  const estActif = (racines: string[]) =>
    racines.some(
      (racine) => chemin === racine || chemin.startsWith(`${racine}/`),
    );

  return (
    <nav
      aria-label="Navigation principale"
      className="flex-shrink-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-14 w-full max-w-2xl items-stretch">
        {navItems.map((item) => {
          const Icone = item.icon;
          const actif = estActif(item.racines);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={actif ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                actif
                  ? "text-[#0A2540]"
                  : "text-slate-400 active:text-slate-600"
              }`}
            >
              <Icone
                className="h-5 w-5"
                strokeWidth={actif ? 2.2 : 1.8}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] leading-none ${
                  actif ? "font-semibold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
