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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-2xl items-stretch">
        {navItems.map((item) => {
          const Icone = item.icon;
          const actif = estActif(item.racines);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={actif ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors"
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                  actif
                    ? "bg-[#2F6BFF]/10 text-[#2F6BFF]"
                    : "text-slate-400 active:bg-slate-100"
                }`}
              >
                <Icone
                  className="h-5 w-5"
                  strokeWidth={actif ? 2.2 : 1.8}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`text-[11px] leading-none ${
                  actif
                    ? "font-bold text-[#2F6BFF]"
                    : "font-medium text-slate-400"
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
