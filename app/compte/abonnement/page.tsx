"use client";

import Link from "next/link";
import { Check, ChevronRight, CreditCard } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const AVANTAGES = [
  "Les appels manqués traités par SMS",
  "Les fiches clients et leur historique",
  "Le suivi des rendez-vous",
  "Les alertes d'urgence",
];

export default function AbonnementPage() {
  return (
    <AppLayout>
      <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-4 max-w-2xl md:mx-auto">
        <p className="px-1 text-xs font-normal leading-relaxed text-slate-500">
          Votre abonnement et vos moyens de paiement.
        </p>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Plan Pro
                </h2>
                <p className="text-xs font-medium text-emerald-600">
                  Abonnement actif
                </p>
              </div>
            </div>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Actif
            </span>
          </div>

          <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
            49 €<span className="text-sm font-medium text-slate-500"> / mois</span>
          </p>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Sans engagement. Résiliable à tout moment.
          </p>

          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {AVANTAGES.map((avantage) => (
              <li
                key={avantage}
                className="flex items-start gap-2 text-sm font-normal text-slate-600"
              >
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-700" />
                {avantage}
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="mailto:support@velianos.fr?subject=Mon%20abonnement%20Velianos"
          className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-colors active:bg-slate-50 active:scale-[0.99]"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-slate-900">
              Gérer mon abonnement
            </span>
            <span className="block text-[11px] font-normal text-slate-400">
              Écrire au support
            </span>
          </span>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
        </Link>

        <p className="px-1 text-xs font-normal leading-relaxed text-slate-500">
          Votre accès reste actif jusqu&apos;à la fin du mois payé. Aucun
          prélèvement n&apos;est effectué après la résiliation.
        </p>
      </div>
    </AppLayout>
  );
}
