"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { loadWorkspaceProfile, type WorkspaceProfile } from "@/lib/workspace";

const profilVide: WorkspaceProfile = {
  userId: null,
  firstName: "",
  lastName: "",
  fullName: "Utilisateur",
  email: "",
  role: "Compte",
  companyId: null,
  companyName: "Mon entreprise",
};

export default function ProfilPage() {
  return (
    <AppLayout>
      <ContenuProfil />
    </AppLayout>
  );
}

function ContenuProfil() {
  const [profil, setProfil] = useState<WorkspaceProfile>(profilVide);

  useEffect(() => {
    let monte = true;
    const charger = async () => {
      const donnees = await loadWorkspaceProfile();
      if (monte) setProfil(donnees);
    };
    void charger();
    return () => {
      monte = false;
    };
  }, []);

  const initiales =
    profil.fullName
      .split(" ")
      .filter(Boolean)
      .map((partie) => partie.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "V";

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-4 max-w-2xl md:mx-auto">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-base font-semibold text-slate-700">
            {initiales}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-slate-900">
              {profil.fullName}
            </h2>
            <p className="mt-0.5 truncate text-sm font-normal text-slate-500">
              {profil.email || "Adresse e-mail non renseignée"}
            </p>
            <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {profil.role}
            </span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Mes informations
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <Ligne
            icone={Building2}
            label="Entreprise"
            valeur={profil.companyName}
            href="/entreprise"
          />
          <Ligne
            icone={Mail}
            label="E-mail"
            valeur={profil.email || "Non renseigné"}
            href="/entreprise"
          />
          <Ligne
            icone={Phone}
            label="Téléphone"
            valeur={profil.phone || "Non renseigné"}
            href="/entreprise"
          />
          <Ligne
            icone={MapPin}
            label="Adresse"
            valeur={profil.address || "Non renseignée"}
            href="/entreprise"
          />
        </div>
      </section>

      <p className="px-1 text-xs font-normal leading-relaxed text-slate-500">
        Ces informations servent à votre assistant pour répondre correctement à
        vos clients.
      </p>

      <Link
        href="/entreprise"
        className="flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition-transform active:scale-95"
      >
        <User className="h-4 w-4" />
        Modifier mes informations
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </Link>
    </div>
  );
}

type LigneProps = {
  icone: typeof User;
  label: string;
  valeur: string;
  href: string;
};

function Ligne({ icone: Icone, label, valeur, href }: LigneProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[56px] items-center gap-3 border-b border-slate-100 px-4 transition-colors last:border-0 active:bg-slate-50 active:scale-[0.99]"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
        <Icone className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-normal text-slate-400">
          {label}
        </span>
        <span className="block truncate text-sm font-medium text-slate-900">
          {valeur}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
    </Link>
  );
}
