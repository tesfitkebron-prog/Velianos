"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, MessageSquare, Phone, User, Users } from "lucide-react";
import { CLIENTS } from "@/lib/clients";

const navItems = [
  { href: "/dashboard", label: "À rappeler", icon: Phone },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/assistant", label: "Assistant", icon: Bot },
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
      className="md:hidden w-full bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-16 items-stretch">
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
              <span
                className={`relative flex h-8 min-w-[48px] items-center justify-center rounded-full px-2 transition-colors ${
                  isActive ? "bg-slate-100" : "bg-transparent"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-[#0F172A]" : "text-slate-400"
                  }`}
                  strokeWidth={isActive ? 2.6 : 2}
                  aria-hidden="true"
                />

                {afficherBadge && (
                  <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold leading-none text-white">
                    {enAttente}
                  </span>
                )}
              </span>

              <span
                className={`mt-0.5 text-[10px] leading-none tracking-tight transition-colors ${
                  isActive
                    ? "font-semibold text-[#0F172A]"
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
