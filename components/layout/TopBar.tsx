"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { loadWorkspaceProfile } from "@/lib/workspace";
import { PageHeader } from "./PageHeader";
import { estSousPageAvecRetour, normaliserChemin } from "@/lib/navigation";

const titres: Record<string, string> = {
  "/dashboard": "À rappeler",
  "/clients": "Mes clients",
  "/parametres": "Mon compte",
  "/messages": "Messages",
  "/entreprise": "Mon entreprise",
  "/compte/profil": "Informations personnelles",
  "/compte/securite": "Sécurité et mot de passe",
  "/compte/notifications": "Notifications",
  "/compte/abonnement": "Abonnement",
  "/compte/confidentialite": "Confidentialité",
  "/compte/conditions": "Conditions d'utilisation",
  "/compte/aide": "Aide",
  "/assistant": "Mon assistant",
  "/appels": "Appels manqués",
  "/notifications": "Notifications",
};

const sousTitres: Record<string, string> = {
  "/dashboard": "Les clients qui attendent votre appel.",
  "/clients": "Tous vos clients et leur historique.",
  "/parametres": "Vos réglages et votre assistant.",
  "/messages": "Vos conversations SMS.",
  "/entreprise": "Les informations que votre assistant connaît sur vous.",
  "/notifications": "Les dernières actions de votre assistant.",
  "/assistant": "Ce que votre assistant sait sur votre entreprise.",
  "/appels": "Les clients que votre assistant a récupérés.",
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

      const lettres = profil.fullName
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

  const titre = titres[chemin] ?? "Velianos";
  const sousTitre = sousTitres[chemin] ?? "";

  return (
    <header className="flex h-16 items-center justify-between gap-4 pl-14 pr-4 md:pl-6 md:pr-6 bg-white">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-bold leading-tight tracking-tight text-[#0F172A] sm:text-xl">
          {titre}
        </h1>
        {sousTitre && (
          <p className="mt-0.5 truncate text-[11px] font-normal leading-tight text-slate-500 sm:text-xs">
            {sousTitre}
          </p>
        )}
      </div>

      <Link
        href="/parametres"
        aria-label="Mon compte"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full -mr-1 transition-transform active:scale-95"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F172A] text-[11px] font-semibold tracking-wide text-white">
          {initiales}
        </span>
      </Link>
    </header>
  );
}

export default TopBar;
