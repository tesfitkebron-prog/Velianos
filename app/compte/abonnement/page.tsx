"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, CreditCard, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageSkeleton } from "@/components/ui/PageState";
import {
  EMPTY_WORKSPACE_PROFILE,
  loadWorkspaceProfile,
  type WorkspaceProfile,
} from "@/lib/workspace";

const AVANTAGES = [
  "Les appels manqués traités par SMS",
  "Les fiches clients et leur historique",
  "Le suivi des rendez-vous",
  "Les alertes d'urgence",
  "Les documents et tarifs appris par l'assistant",
];

export default function AbonnementPage() {
  return (
    <AppLayout>
      <ContenuAbonnement />
    </AppLayout>
  );
}

function ContenuAbonnement() {
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

  const essaiActif = profil.subscriptionStatus === "trialing";
  const statut = essaiActif
    ? profil.trialEndsAt
      ? `Essai jusqu'au ${new Date(profil.trialEndsAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`
      : "Essai en cours"
    : profil.subscriptionStatus === "active"
      ? "Abonnement actif"
      : "Statut à vérifier";

  return (
    <div className="space-y-5 pt-5">
      <section className="rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
              <CreditCard className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Plan Pro
              </h1>
              <p className="text-base font-semibold text-emerald-600">
                {statut}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-extrabold text-emerald-600">
            {essaiActif ? "Essai" : "Actif"}
          </span>
        </div>

        <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
          49 €
          <span className="text-base font-medium text-slate-500"> / mois</span>
        </p>
        <p className="mt-1 text-base font-medium text-slate-500">
          Sans engagement. Résiliable à tout moment.
        </p>

        <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5">
          {AVANTAGES.map((avantage) => (
            <li
              key={avantage}
              className="flex items-start gap-2.5 text-base font-medium text-slate-600"
            >
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" aria-hidden="true" />
              {avantage}
            </li>
          ))}
        </ul>
      </section>

      {essaiActif && (
        <div className="flex items-start gap-2.5 rounded-[24px] bg-emerald-50 p-4 text-base font-semibold text-emerald-700">
          <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Votre essai est en cours. Aucun prélèvement avant la fin de l&apos;essai.
        </div>
      )}

      <Link
        href="mailto:support@velianos.fr?subject=Mon%20abonnement%20Velianos"
        className="flex min-h-16 items-center gap-3 rounded-[24px] bg-white px-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-slate-900">
            Gérer mon abonnement
          </span>
          <span className="block text-sm font-medium text-slate-400">
            Écrire au support
          </span>
        </span>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" aria-hidden="true" />
      </Link>

      <p className="px-2 text-sm font-medium leading-relaxed text-slate-500">
        Votre accès reste actif jusqu&apos;à la fin du mois payé. Aucun
        prélèvement n&apos;est effectué après la résiliation.
      </p>
    </div>
  );
}
