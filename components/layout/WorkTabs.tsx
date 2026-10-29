"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MessageSquare, Users } from "lucide-react";

const TRAVAIL = [
  { href: "/dashboard", label: "Planning", icon: CalendarDays },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

/**
 * Navigation interne de l'onglet « Mon Travail ».
 * Trois destinations maximum pour rester lisible sur le terrain.
 */
export function WorkTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mon travail"
      className="grid grid-cols-3 gap-1 rounded-[20px] bg-white p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
    >
      {TRAVAIL.map((item) => {
        const Icone = item.icon;
        const actif =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={actif ? "page" : undefined}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-center transition-transform duration-200 active:scale-95 ${
              actif
                ? "bg-[#0A2540] text-white shadow-lg shadow-[#0A2540]/20"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Icone
              className={`h-6 w-6 ${actif ? "text-white" : "text-slate-500"}`}
              strokeWidth={actif ? 2.5 : 2}
              aria-hidden="true"
            />
            <span className="text-sm font-extrabold leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default WorkTabs;
