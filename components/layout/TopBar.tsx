"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { loadWorkspaceProfile } from "@/lib/workspace";

const titres: Record<string, string> = {
  "/assistant": "Mon assistant",
  "/appels": "Appels manqués",
  "/messages": "Messages",
  "/clients": "Clients",
  "/entreprise": "Mon entreprise",
  "/guide": "Guide de démarrage",
  "/compte": "Compte",
  "/notifications": "Notifications",
  "/parametres": "Réglages",
};

const sousTitres: Record<string, string> = {
  "/assistant": "Ce que votre assistant sait sur votre entreprise.",
  "/appels": "Les clients que votre assistant a récupérés.",
  "/messages": "Vos échanges SMS avec les clients.",
  "/clients": "Toutes les demandes qualifiées par votre assistant.",
  "/entreprise": "Les informations que votre assistant connaît sur vous.",
  "/guide": "Les étapes pour activer Velianos.",
  "/compte": "Votre profil, vos préférences et votre abonnement.",
  "/notifications": "Les dernières actions de votre assistant.",
  "/parametres": "Votre assistant et votre compte.",
};

export function TopBar() {
  const pathname = usePathname();
  const [initiales, setInitiales] = useState("V");
  const [prenom, setPrenom] = useState("");
  const [entreprise, setEntreprise] = useState("");

  const estAccueil = pathname === "/dashboard";

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
      const prenomProfil =
        profil.firstName ||
        (profil.fullName && profil.fullName !== "Utilisateur"
          ? profil.fullName.split(" ")[0]
          : "");
      setPrenom(prenomProfil);
      const nomEntreprise = profil.companyName || "";
      setEntreprise(
        nomEntreprise === "Mon entreprise" ? "" : nomEntreprise,
      );
    };

    void charger();

    return () => {
      monte = false;
    };
  }, []);

  const titre = estAccueil
    ? prenom
      ? `Bonjour, ${prenom}`
      : entreprise || "Bonjour"
    : titres[pathname] ?? "Velianos";

  const sousTitre = estAccueil
    ? "Voici ce qui s'est passé aujourd'hui."
    : sousTitres[pathname] ?? "";

  return (
    <header className="h-16 bg-white flex items-center justify-between gap-4 pl-14 pr-4 md:pl-6 md:pr-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-[17px] sm:text-xl font-bold tracking-tight text-[#0F172A] truncate leading-tight">
          {titre}
        </h1>
        {sousTitre && (
          <p className="text-[11px] sm:text-xs font-normal text-slate-500 truncate leading-tight mt-0.5">
            {sousTitre}
          </p>
        )}
      </div>

      <Link
        href="/compte"
        aria-label="Mon compte"
        className="w-11 h-11 -mr-1 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
      >
        <span className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[11px] font-semibold tracking-wide">
          {initiales}
        </span>
      </Link>
    </header>
  );
}

export default TopBar;
