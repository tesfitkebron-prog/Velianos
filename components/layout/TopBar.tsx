"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { loadWorkspaceProfile } from "@/lib/workspace";
import { PageHeader } from "./PageHeader";
import { estSousPageAvecRetour, normaliserChemin } from "@/lib/navigation";

const titres: Record<string, string> = {
  "/entreprise": "Mon entreprise",
  "/compte/profil": "Informations personnelles",
  "/compte/securite": "Sécurité et mot de passe",
  "/compte/notifications": "Notifications",
  "/compte/abonnement": "Abonnement",
  "/compte/confidentialite": "Confidentialité",
  "/compte/conditions": "Conditions d'utilisation",
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
      const prenom = profil.firstName || nomConnu.split(" ")[0] || "Karim";

      const lettres = nomConnu
        .split(" ")
        .filter(Boolean)
        .map((partie) => partie.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

      setInitiales(lettres || prenom.charAt(0).toUpperCase() || "V");
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
    <div className="flex h-14 items-center justify-end gap-3 pl-14 pr-4 md:pl-6 md:pr-6">
      <Link
        href="/parametres"
        aria-label="Mon compte"
        className="-mr-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold tracking-wide text-white">
          {initiales}
        </span>
      </Link>
    </div>
  );
}

export default TopBar;
