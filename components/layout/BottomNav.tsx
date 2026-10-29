"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, BriefcaseBusiness } from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Mon Travail",
    icon: BriefcaseBusiness,
    racines: ["/dashboard", "/clients", "/messages"],
  },
  {
    href: "/assistant",
    label: "Mon Assistant",
    icon: Bot,
    racines: ["/assistant", "/controle"],
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
      className="fixed inset-x-0 bottom-0 z-40 w-full border-t border-slate-200/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-2xl items-stretch gap-2 px-2 py-2">
        {navItems.map((item) => {
          const Icone = item.icon;
          const actif = estActif(item.racines);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={actif ? "page" : undefined}
              className={`flex min-h-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-2 transition-transform duration-200 active:scale-95 ${
                actif
                  ? "bg-[#0A2540] text-white shadow-lg shadow-[#0A2540]/25"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icone
                className={`h-7 w-7 ${actif ? "text-white" : "text-slate-500"}`}
                strokeWidth={actif ? 2.5 : 2}
                aria-hidden="true"
              />
              <span className="text-sm font-extrabold leading-none">
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
