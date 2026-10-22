"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  MessageSquare,
  Users,
  Sparkles,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/parametres", label: "Réglages", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Handle trailing slashes in pathname
        const normalizedPathname = pathname.replace(/\/$/, "");
        const normalizedHref = item.href.replace(/\/$/, "");
        const isActive = normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors min-h-[56px]"
            aria-label={item.label}
          >
            <Icon
              className={`w-7 h-7 transition-colors ${isActive ? "text-emerald-500" : "text-slate-400"}`}
              aria-hidden="true"
            />
            <span
              className={`text-[11px] font-semibold transition-colors ${isActive ? "text-emerald-500" : "text-slate-400"}`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}