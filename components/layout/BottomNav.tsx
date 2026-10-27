"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, MessageSquare, Phone, User, Users } from "lucide-react";
import { CLIENTS } from "@/lib/clients";

const navItems = [
  { href: "/dashboard", label: "À rappeler", icon: Phone },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/assistant", label: "Assistant", icon: Bot, principal: true },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/parametres", label: "Compte", icon: User },
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
      className="relative z-20 w-full overflow-visible border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,23,42,0.05)] md:hidden"
    >
      <div className="flex h-16 items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = estActif(item.href);
          const afficherBadge = item.href === "/dashboard" && enAttente > 0;

          if (item.principal) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-1 flex-col items-center justify-center transition-transform active:scale-95"
              >
                <span className="relative flex h-8 w-12 items-center justify-center">
                  <span
                    className={`absolute -top-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-white transition-all ${
                      isActive ? "scale-105" : ""
                    }`}
                  >
                    <Icon
                      className="h-6 w-6"
                      strokeWidth={isActive ? 2.6 : 2.2}
                      aria-hidden="true"
                    />
                  </span>
                </span>

                <span
                  className={`mt-0.5 text-[10px] leading-none tracking-tight transition-colors ${
                    isActive
                      ? "font-semibold text-blue-600"
                      : "font-medium text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

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
              <span
                className={`relative flex h-8 min-w-[48px] items-center justify-center rounded-full px-2 transition-colors ${
                  isActive ? "bg-blue-50" : "bg-transparent"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                  strokeWidth={isActive ? 2.6 : 2}
                  aria-hidden="true"
                />

                {afficherBadge && (
                  <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                    {enAttente}
                  </span>
                )}
              </span>

              <span
                className={`mt-0.5 text-[10px] leading-none tracking-tight transition-colors ${
                  isActive
                    ? "font-semibold text-blue-600"
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
