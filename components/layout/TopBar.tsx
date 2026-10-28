"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { loadWorkspaceProfile } from "@/lib/workspace";
import {
  EVENEMENT_NOTIFICATIONS_LUES,
  compterNotificationsNonLues,
} from "@/lib/notifications";
import { PageHeader } from "./PageHeader";
import { estSousPageAvecRetour, normaliserChemin } from "@/lib/navigation";

const titres: Record<string, string> = {
  "/notifications": "Notifications",
  "/entreprise": "Mon entreprise",
  "/compte/profil": "Informations personnelles",
  "/compte/securite": "Sécurité",
  "/compte/notifications": "Notifications",
  "/compte/abonnement": "Abonnement",
  "/compte/confidentialite": "Confidentialité",
  "/compte/conditions": "Conditions d'utilisation",
  "/compte/aide": "Aide",
};

export function TopBar() {
  const pathname = usePathname();
  const [initiales, setInitiales] = useState("V");
  const [nonLues, setNonLues] = useState(0);

  const chemin = normaliserChemin(pathname);
  const estSousPage = estSousPageAvecRetour(chemin);

  useEffect(() => {
    let monte = true;

    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (!monte) return;

      const nomConnu =
        profil.fullName && profil.fullName !== "Utilisateur"
          ? profil.fullName
          : "";
      const lettres = nomConnu
        .split(" ")
        .filter(Boolean)
        .map((partie) => partie.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

      setInitiales(lettres || "V");
    };

    void charger();

    return () => {
      monte = false;
    };
  }, []);

  useEffect(() => {
    let monte = true;

    const rafraichir = async () => {
      const nombre = await compterNotificationsNonLues();
      if (monte) setNonLues(nombre);
    };

    void rafraichir();
    window.addEventListener(EVENEMENT_NOTIFICATIONS_LUES, rafraichir);
    window.addEventListener("focus", rafraichir);

    return () => {
      monte = false;
      window.removeEventListener(EVENEMENT_NOTIFICATIONS_LUES, rafraichir);
      window.removeEventListener("focus", rafraichir);
    };
  }, []);

  if (estSousPage) {
    return <PageHeader title={titres[chemin] ?? "Velianos"} />;
  }

  return (
    <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-3">
      <Link
        href="/notifications"
        aria-label={
          nonLues > 0
            ? `Notifications, ${nonLues} non lue${nonLues > 1 ? "s" : ""}`
            : "Notifications"
        }
        className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-slate-700 transition-transform duration-200 active:scale-95 active:bg-slate-100"
      >
        <Bell className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        {nonLues > 0 && (
          <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-extrabold leading-none text-white ring-2 ring-white">
            {nonLues > 9 ? "9+" : nonLues}
          </span>
        )}
      </Link>

      <Link
        href="/parametres"
        aria-label="Mon compte"
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-200 active:scale-95"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A2540] text-sm font-extrabold tracking-wide text-white shadow-md shadow-[#0A2540]/20">
          {initiales}
        </span>
      </Link>
    </div>
  );
}

export default TopBar;
