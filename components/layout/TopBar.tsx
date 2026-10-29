"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { loadWorkspaceProfile } from "@/lib/workspace";
import { PageHeader } from "./PageHeader";
import { estSousPageAvecRetour, normaliserChemin } from "@/lib/navigation";

const titres: Record<string, string> = {
  "/notifications": "Notifications",
  "/controle": "Centre de contrôle",
  "/entreprise": "Mon entreprise",
  "/compte/profil": "Informations personnelles",
  "/compte/securite": "Sécurité",
  "/compte/notifications": "Notifications",
  "/compte/abonnement": "Abonnement",
  "/legal/confidentialite": "Confidentialité",
  "/legal/cgu": "Conditions d'utilisation",
  "/compte/aide": "Aide",
};

export function TopBar() {
  const pathname = usePathname();
  const [initiales, setInitiales] = useState("V");

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

  if (estSousPage) {
    return <PageHeader title={titres[chemin] ?? "Velianos"} />;
  }

  return (
    <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-3">
      <Link
        href="/dashboard"
        aria-label="Velianos, retour au planning"
        className="flex min-h-16 items-center gap-2.5 rounded-2xl px-2 transition-transform duration-200 active:scale-95"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A2540] text-white shadow-md shadow-[#0A2540]/20">
          <Wrench className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span className="text-xl font-extrabold tracking-tight text-slate-900">
          Velianos
        </span>
      </Link>

      <Link
        href="/parametres"
        aria-label="Mon compte"
        className="flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-200 active:scale-95"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A2540] text-base font-extrabold tracking-wide text-white shadow-md shadow-[#0A2540]/20">
          {initiales}
        </span>
      </Link>
    </div>
  );
}

export default TopBar;
