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
import { PageSkeleton } from "@/components/ui/PageState";
import { formaterTelephone } from "@/lib/clients";
import {
  EMPTY_WORKSPACE_PROFILE,
  loadWorkspaceProfile,
  type WorkspaceProfile,
} from "@/lib/workspace";

export default function ProfilPage() {
  return (
    <AppLayout>
      <ContenuProfil />
    </AppLayout>
  );
}

function ContenuProfil() {
  const [profil, setProfil] = useState<WorkspaceProfile>(EMPTY_WORKSPACE_PROFILE);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let monte = true;
    const charger = async () => {
      const donnees = await loadWorkspaceProfile();
      if (monte) {
        setProfil(donnees);
        setChargement(false);
      }
    };
    void charger();
    return () => {
      monte = false;
    };
  }, []);

  if (chargement) {
    return (
      <div className="pt-5">
        <PageSkeleton lignes={2} />
      </div>
    );
  }

  const initiales =
    profil.fullName
      .split(" ")
      .filter(Boolean)
      .map((partie) => partie.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "V";

  return (
    <div className="space-y-5 pt-5">
      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-xl font-extrabold text-white">
            {initiales}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
              {profil.fullName}
            </h1>
            <p className="mt-0.5 truncate text-base font-medium text-slate-500">
              {profil.email || "Adresse e-mail non renseignée"}
            </p>
            <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {profil.role}
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 px-2 text-sm font-extrabold uppercase tracking-wide text-slate-400">
          Mes informations
        </h2>
        <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
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
            href="/compte/securite"
          />
          <Ligne
            icone={Phone}
            label="Téléphone"
            valeur={
              formaterTelephone(profil.phone) || profil.phone || "Non renseigné"
            }
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

      <p className="px-2 text-sm font-medium leading-relaxed text-slate-500">
        Ces informations servent à votre assistant pour répondre correctement à
        vos clients.
      </p>

      <Link
        href="/entreprise"
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] px-4 text-base font-extrabold text-white transition-transform duration-200 active:scale-95"
      >
        <User className="h-5 w-5" aria-hidden="true" />
        Modifier mes informations
        <ChevronRight className="h-5 w-5 text-white/60" aria-hidden="true" />
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
      className="flex min-h-16 items-center gap-3.5 border-b border-slate-100 px-4 py-3 transition-colors last:border-0 active:bg-slate-50"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#2F6BFF]">
        <Icone className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-400">
          {label}
        </span>
        <span className="block truncate text-base font-semibold text-slate-900">
          {valeur}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" aria-hidden="true" />
    </Link>
  );
}
