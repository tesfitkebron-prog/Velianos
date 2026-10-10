"use client";

import Link from "next/link";
import { Phone, TrendingUp, Euro, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";

type StatutAppel = {
  heure: string;
  numero: string;
  statut: "Client capturé" | "En attente de réponse" | "Urgence absolue";
};

const appels: StatutAppel[] = [
  { heure: "Il y a 14 min", numero: "06 12 XX XX 78", statut: "Client capturé" },
  {
    heure: "Aujourd'hui à 11h20",
    numero: "06 45 XX XX 89",
    statut: "En attente de réponse",
  },
  {
    heure: "Aujourd'hui à 09h15",
    numero: "07 89 XX XX 12",
    statut: "Urgence absolue",
  },
  { heure: "Hier à 18h42", numero: "06 23 XX XX 45", statut: "Client capturé" },
  {
    heure: "Hier à 16h05",
    numero: "06 78 XX XX 90",
    statut: "En attente de réponse",
  },
];

const stylesStatut: Record<StatutAppel["statut"], string> = {
  "Client capturé": "bg-emerald-500 text-white",
  "En attente de réponse": "bg-slate-200 text-slate-700",
  "Urgence absolue": "bg-red-500 text-white animate-pulse",
};

const libelleStatut: Record<StatutAppel["statut"], string> = {
  "Client capturé": "Client capturé",
  "En attente de réponse": "En attente de réponse",
  "Urgence absolue": "Urgence absolue",
};

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="w-full">
        {/* ZONE 1 — 3 CARTES KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 rounded-xl border border-slate-200 bg-white relative">
            <div className="absolute top-6 right-6 w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              Appels manqués capturés
            </p>
            <p className="text-5xl font-bold text-slate-900 mt-4">42</p>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-600 font-medium">+14% vs mois dernier</span>
            </div>
          </Card>

          <Card className="p-6 rounded-xl border border-slate-200 bg-white">
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              Taux de réponse SMS
            </p>
            <p className="text-5xl font-bold text-slate-900 mt-4">68%</p>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-4">
              <div className="w-[68%] h-full bg-emerald-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              42 clients ont répondu à l&apos;assistant
            </p>
          </Card>

          <Card className="p-6 rounded-xl border border-slate-200 bg-white relative">
            <div className="absolute top-6 right-6 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Euro className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              Estimation revenus sécurisés
            </p>
            <p className="text-5xl font-bold text-emerald-600 mt-4">6 300 €</p>
            <p className="text-xs text-slate-400 italic mt-3">
              (Calculé sur la base de votre panier moyen enregistré de 150€ par chantier)
            </p>
          </Card>
        </div>

        {/* ZONE 2 — ACTIVITY FEED */}
        <Card className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              Derniers appels interceptés par le système
            </h2>
            <Link
              href="/messages"
              className="text-sm text-emerald-600 hover:underline flex-shrink-0"
            >
              Voir tout
            </Link>
          </div>

          <div className="mt-4">
            {/* EN-TÊTE DU TABLEAU */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span className="col-span-2">Heure</span>
              <span className="col-span-3">Numéro</span>
              <span className="col-span-4">Statut</span>
              <span className="col-span-3 text-right">Action</span>
            </div>

            {/* LIGNES */}
            {appels.map((appel, index) => (
              <div
                key={`${appel.heure}-${appel.numero}`}
                className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-4 items-center hover:bg-slate-50 transition-colors ${
                  index < appels.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <span className="md:col-span-2 text-sm text-slate-600">{appel.heure}</span>
                <span className="md:col-span-3 text-sm font-medium text-slate-900">
                  {appel.numero}
                </span>
                <span className="md:col-span-4">
                  <span
                    className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${stylesStatut[appel.statut]}`}
                  >
                    {appel.statut === "Urgence absolue"
                      ? `🚨 ${libelleStatut[appel.statut]}`
                      : libelleStatut[appel.statut]}
                  </span>
                </span>
                <span className="md:col-span-3 text-left md:text-right">
                  <Link
                    href="/messages"
                    className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm hover:underline"
                  >
                    Consulter le chat
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}