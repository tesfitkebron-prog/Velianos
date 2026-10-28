"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, MessageSquare, Phone, User, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Appels", icon: Phone },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/assistant", label: "Assistant", icon: Bot, principal: true },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/parametres", label: "Compte", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const chemin = pathname.replace(/\/$/, "");

  const estActif = (href: string) => {
    if (href === "/parametres") {
      return (
        chemin === "/parametres" ||
        chemin.startsWith("/compte") ||
        chemin === "/entreprise"
      );
    }
    return chemin === href || chemin.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 w-full bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgb(0,0,0,0.08)]"
    >
      <div className="mx-auto flex h-[76px] w-full max-w-2xl items-stretch px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = estActif(item.href);

          if (item.principal) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-1 flex-col items-center justify-end pb-2.5 transition-transform duration-200 active:scale-95"
              >
                <span
                  className={`absolute -top-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#0A2540] text-white shadow-xl shadow-[#0A2540]/30 ring-4 ring-white transition-transform duration-200 ${
                    isActive ? "scale-105" : ""
                  }`}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
                </span>
                <span
                  className={`mt-1 text-xs leading-none tracking-tight ${
                    isActive
                      ? "font-extrabold text-[#0A2540]"
                      : "font-semibold text-slate-400"
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
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-transform duration-200 active:scale-95"
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isActive ? "text-[#0A2540]" : "text-slate-400"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive ? "currentColor" : "none"}
                aria-hidden="true"
              />
              <span
                className={`text-xs leading-none tracking-tight ${
                  isActive
                    ? "font-extrabold text-[#0A2540]"
                    : "font-semibold text-slate-400"
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
