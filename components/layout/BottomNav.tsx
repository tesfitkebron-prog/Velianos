"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, MessageSquare, Users, Sparkles } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();
  const chemin = pathname.replace(/\/$/, "");

  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-16 items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = item.href.replace(/\/$/, "");
          const isActive = chemin === href || chemin.startsWith(href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <Icon
                className={`w-[22px] h-[22px] transition-colors ${
                  isActive ? "text-[#0F172A]" : "text-slate-400"
                }`}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span
                className={`text-[10px] leading-none tracking-tight transition-colors ${
                  isActive
                    ? "text-[#0F172A] font-semibold"
                    : "text-slate-400 font-medium"
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
