"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, Inbox, Settings, Users } from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Demandes",
    icon: Inbox,
    racines: ["/dashboard"],
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
      className="fixed inset-x-0 bottom-0 z-40 w-full border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex w-full max-w-2xl items-stretch">
        {navItems.map((item) => {
          const Icone = item.icon;
          const actif = estActif(item.racines);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={actif ? "page" : undefined}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 px-1 transition-colors duration-200 ${
                actif
                  ? "text-[#0A2540]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icone
                className="h-6 w-6"
                strokeWidth={actif ? 2.5 : 2}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold leading-none">
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
