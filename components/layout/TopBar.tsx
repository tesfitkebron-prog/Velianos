"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { loadWorkspaceProfile } from "@/lib/workspace";
import { PageHeader } from "./PageHeader";
import { estSousPageAvecRetour, normaliserChemin } from "@/lib/navigation";

const titres: Record<string, string> = {
  "/dashboard": "À rappeler",
  "/clients": "Clients",
  "/parametres": "Compte",
  "/messages": "Messages",
  "/entreprise": "Mon entreprise",
  "/compte/profil": "Informations personnelles",
  "/compte/securite": "Sécurité et mot de passe",
  "/compte/notifications": "Notifications",
  "/compte/abonnement": "Abonnement",
  "/compte/confidentialite": "Confidentialité",
  "/compte/conditions": "Conditions d'utilisation",
  "/compte/aide": "Aide",
  "/assistant": "Mon Assistant",
  "/appels": "Appels manqués",
  "/notifications": "Notifications",
};

const sousTitres: Record<string, string> = {
  "/clients": "Qualifiées par votre assistant.",
  "/parametres": "Votre assistant et vos informations.",
  "/messages": "Vos échanges SMS avec les clients.",
  "/entreprise": "Les informations que votre assistant connaît sur vous.",
  "/notifications": "Les dernières actions de votre assistant.",
  "/assistant": "Ce qu'il apprend sur votre entreprise.",
  "/appels": "Les clients que votre assistant a récupérés.",
};

const SOUS_TITRE_DASHBOARD =
  "Voici ce que votre assistant a fait pour vous aujourd'hui.";

export function TopBar() {
  const pathname = usePathname();
  const [initiales, setInitiales] = useState("V");
  const [prenom, setPrenom] = useState("Karim");

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
      setPrenom(prenom);
    };

    void charger();

    return () => {
      monte = false;
    };
  }, []);

  if (estSousPage) {
    return <PageHeader title={titres[chemin] ?? "Velianos"} />;
  }

  if (chemin === "/dashboard") {
    const prenomLong = prenom.length > 14;

    return (
      <header className="flex items-center justify-between gap-4 bg-white py-3 pl-14 pr-4 md:pl-6 md:pr-6">
        <div className="min-w-0 flex-1">
          <h1
            className={`truncate font-bold leading-tight tracking-tight text-slate-900 ${
              prenomLong ? "text-lg" : "text-2xl"
            }`}
          >
            Bonjour {prenom}
          </h1>
          <p className="mt-1 text-sm font-normal leading-snug text-slate-500">
            {SOUS_TITRE_DASHBOARD}
          </p>
        </div>

        <Link
          href="/parametres"
          aria-label="Mon compte"
          className="-mr-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold tracking-wide text-white ring-2 ring-emerald-500 ring-offset-2 ring-offset-white">
            {initiales}
          </span>
        </Link>
      </header>
    );
  }

  const titre = titres[chemin] ?? "Velianos";
  const sousTitre = sousTitres[chemin] ?? "";

  return (
    <header className="flex h-16 items-center justify-between gap-4 bg-white pl-14 pr-4 md:pl-6 md:pr-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold leading-tight tracking-tight text-slate-900">
          {titre}
        </h1>
        {sousTitre && (
          <p className="mt-0.5 truncate text-xs font-normal leading-tight text-slate-500">
            {sousTitre}
          </p>
        )}
      </div>

      <Link
        href="/parametres"
        aria-label="Mon compte"
        className="-mr-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold tracking-wide text-white ring-2 ring-emerald-500 ring-offset-2 ring-offset-white">
          {initiales}
        </span>
      </Link>
    </header>
  );
}

export default TopBar;
