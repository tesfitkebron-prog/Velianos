"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppToast } from "@/components/ui/AppToast";

const clientsRecents = [
  {
    id: 1,
    nom: "M. Dupont",
    initiales: "MD",
    probleme: "Fuite sous évier",
    moment: "il y a 5 min",
    telephone: "0612345678",
    urgent: true,
  },
  {
    id: 2,
    nom: "Mme Martin",
    initiales: "MM",
    probleme: "Chauffe-eau en panne",
    moment: "il y a 2 h",
    telephone: "0698765432",
    urgent: false,
  },
  {
    id: 3,
    nom: "M. Bernard",
    initiales: "MB",
    probleme: "Devis salle de bain",
    moment: "hier",
    telephone: "0711223344",
    urgent: false,
  },
];

const semaine = [38, 62, 45, 78, 56, 88, 70];

export default function DashboardPage() {
  const [assistantActif, setAssistantActif] = useState(true);
  const { show, toast } = useAppToast();

  const basculerAssistant = () => {
    setAssistantActif((actif) => !actif);
    show(assistantActif ? "Assistant mis en pause" : "Assistant activé");
  };

  return (
    <AppLayout>
      <div className="px-4 py-4 md:p-0 space-y-4">
        {/* SALUTATION */}
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h1 className="text-[26px] leading-tight font-bold text-slate-900 tracking-tight">
              Bonjour Karim.
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Votre assistant a travaillé pour vous.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00A857] bg-emerald-50 px-2.5 py-1.5 rounded-full flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse" />
            En direct
          </span>
        </div>

        {/* ALERTE */}
        <Link
          href="/messages"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 active:scale-[0.99] transition-transform"
        >
          <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-[18px] h-[18px] text-amber-600" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-amber-900">
              2 clients attendent votre rappel
            </span>
            <span className="block text-xs text-amber-700 mt-0.5">
              Ne les laissez pas appeler un concurrent.
            </span>
          </span>
          <ChevronRight className="w-5 h-5 text-amber-500 flex-shrink-0" />
        </Link>

        {/* BENTO */}
        <div className="grid grid-cols-2 gap-3">
          {/* ARGENT GÉNÉRÉ */}
          <div className="col-span-2 relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Argent généré ce mois-ci
                </p>
                <p className="mt-1.5 text-[38px] leading-none font-bold tracking-tight text-[#00C462]">
                  1 250 €
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  +240 € vs mois dernier
                </span>
              </div>

              <div className="flex items-end gap-1 h-16 flex-shrink-0">
                {semaine.map((hauteur, index) => (
                  <span
                    key={index}
                    className={`w-2 rounded-full ${
                      index === semaine.length - 1
                        ? "bg-[#00D26A]"
                        : "bg-emerald-100"
                    }`}
                    style={{ height: `${hauteur}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              5 chantiers récupérés · panier moyen 250 €
            </p>
          </div>

          {/* APPELS MANQUÉS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Appels manqués
            </p>
            <p className="mt-1.5 text-3xl leading-none font-bold text-slate-900">
              7
            </p>
            <span className="inline-block mt-2 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
              3 à rappeler
            </span>
          </div>

          {/* CLIENTS RÉCUPÉRÉS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Clients récupérés
            </p>
            <p className="mt-1.5 text-3xl leading-none font-bold text-slate-900">
              5
            </p>
            <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              +2 cette semaine
            </span>
          </div>
        </div>

        {/* DERNIERS CLIENTS */}
        <section>
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Derniers clients récupérés
            </h2>
            <Link
              href="/clients"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center active:scale-95 transition-transform"
            >
              Tout voir <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
            {clientsRecents.map((client) => (
              <div key={client.id} className="flex items-center gap-3 px-4 py-3">
                <Link
                  href={`/clients?client=${client.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0 active:opacity-70 transition-opacity"
                >
                  <span
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      client.urgent
                        ? "bg-red-50 text-red-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {client.initiales}
                    {client.urgent && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 truncate">
                      {client.nom}
                    </span>
                    <span className="block text-xs text-slate-500 truncate">
                      {client.probleme}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {client.moment}
                    </span>
                  </span>
                </Link>

                <a
                  href={`tel:${client.telephone}`}
                  aria-label={`Appeler ${client.nom}`}
                  className="w-12 h-12 rounded-full bg-[#00D26A] hover:bg-[#00B85D] active:scale-95 text-slate-900 flex items-center justify-center flex-shrink-0 transition-all shadow-sm"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* BARRE ASSISTANT */}
        <section className="rounded-2xl bg-slate-900 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#00D26A]" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm flex items-center gap-1.5">
                {assistantActif ? "Assistant actif" : "Assistant en pause"}
                {assistantActif && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00D26A]" />
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {assistantActif
                  ? "12 appels traités cette semaine"
                  : "Il ne répond plus à vos clients"}
              </p>
            </div>
            <button
              onClick={basculerAssistant}
              role="switch"
              aria-checked={assistantActif}
              aria-label="Activer ou mettre en pause l'assistant"
              className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 active:scale-95 ${
                assistantActif ? "bg-[#00D26A]" : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  assistantActif ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>
      </div>
      {toast}
    </AppLayout>
  );
}
