"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { PhoneCall, User, Users } from "lucide-react";
import { CLIENTS } from "@/lib/clients";

const navItems = [
  { href: "/dashboard", label: "À rappeler", icon: PhoneCall },
  { href: "/clients", label: "Mes clients", icon: Users },
  { href: "/parametres", label: "Mon compte", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const chemin = pathname.replace(/\/$/, "");
  const enAttente = CLIENTS.length;

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
    <nav
      aria-label="Navigation principale"
      className="md:hidden w-full bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-16 items-stretch justify-around">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = estActif(item.href);
          const afficherBadge = index === 0 && enAttente > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={
                afficherBadge
                  ? `${item.label}, ${enAttente} client${enAttente > 1 ? "s" : ""} en attente`
                  : item.label
              }
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center justify-center transition-transform active:scale-95"
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isActive ? "text-emerald-500" : "text-slate-400"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              <span
                className={`mt-1 text-[11px] leading-none tracking-tight transition-colors ${
                  isActive
                    ? "font-semibold text-emerald-500"
                    : "font-medium text-slate-400"
                }`}
              >
                {item.label}
              </span>

              {afficherBadge && (
                <span className="pointer-events-none absolute top-2 right-[calc(50%-20px)] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {enAttente}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
