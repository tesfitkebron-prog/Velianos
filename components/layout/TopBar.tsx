"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HelpCircle, Settings, Wrench } from "lucide-react";
import { loadWorkspaceProfile } from "@/lib/workspace";
import { PageHeader } from "./PageHeader";
import { estSousPageAvecRetour, normaliserChemin } from "@/lib/navigation";

const titres: Record<string, string> = {
  "/dashboard": "Demandes",
  "/assistant": "Assistant",
  "/clients": "Clients",
  "/messages": "Messages",
  "/parametres": "Réglages",
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
    <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#2F6BFF] text-white shadow-md shadow-[#2F6BFF]/25">
          <Wrench className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
          {titres[chemin] ?? "Velianos"}
        </h1>
      </div>

      {chemin === "/assistant" ? (
        <Link
          href="/controle"
          aria-label="Configurer l'assistant"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EDF3FF] text-[#2F6BFF] transition-colors active:bg-[#DDE8FF]"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Link>
      ) : chemin === "/parametres" ? (
        <Link
          href="/compte/aide"
          aria-label="Aide"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100"
        >
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </Link>
      ) : (
        <Link
          href="/parametres"
          aria-label="Ouvrir les réglages"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors active:bg-slate-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {initiales}
          </span>
        </Link>
      )}
    </div>
  );
}

export default TopBar;
