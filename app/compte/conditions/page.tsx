"use client";

import { FileText } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function ConditionsPage() {
  return (
    <AppLayout>
      <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-4 max-w-2xl md:mx-auto">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Conditions d&apos;utilisation
              </h2>
              <p className="text-xs font-normal text-slate-500">
                Version du 1er janvier 2026.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Le service
          </h3>
          <p className="mt-1 text-sm font-normal leading-relaxed text-slate-600">
            Velianos est un assistant téléphonique destiné aux artisans. Il
            répond aux appels manqués, qualifie la demande et vous transmet les
            informations utiles.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Votre responsabilité
          </h3>
          <p className="mt-1 text-sm font-normal leading-relaxed text-slate-600">
            L&apos;assistant qualifie les demandes mais ne remplace pas votre
            intervention. Vous restez responsable du devis, du rendez-vous et de
            la réalisation des travaux.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Abonnement et résiliation
          </h3>
          <p className="mt-1 text-sm font-normal leading-relaxed text-slate-600">
            L&apos;abonnement Pro est sans engagement. Il peut être résilié à
            tout moment depuis votre compte. L&apos;accès reste actif
            jusqu&apos;à la fin du mois payé.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Utilisation raisonnable
          </h3>
          <p className="mt-1 text-sm font-normal leading-relaxed text-slate-600">
            Le service doit être utilisé pour votre activité professionnelle.
            Toute utilisation abusive ou frauduleuse peut entraîner la
            suspension du compte.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
