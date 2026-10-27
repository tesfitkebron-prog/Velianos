"use client";

import { Phone, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="px-4 py-4 md:p-0 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bonjour Karim.
          </h1>
          <p className="text-sm text-slate-500">
            Voici ce que votre assistant a fait pour vous aujourd&apos;hui.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">
                2 clients attendent votre rappel.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Ne les laissez pas appeler un concurrent.
              </p>
            </div>
          </div>
          <Link
            href="/messages"
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors text-center"
          >
            Voir mes messages
          </Link>
        </div>

        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
            Ce que Velianos vous a rapporté
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm text-center">
              <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wide">
                Chantiers
              </p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">5</p>
              <p className="text-[10px] md:text-xs text-slate-400 mt-1 leading-tight">
                ce mois-ci
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 md:p-4 shadow-sm text-center">
              <p className="text-[10px] md:text-xs font-medium text-emerald-700 uppercase tracking-wide">
                Gagné
              </p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600 mt-1">
                1 250 €
              </p>
              <p className="text-[10px] md:text-xs text-emerald-600/70 mt-1 leading-tight">
                panier moyen
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm text-center">
              <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wide">
                Temps
              </p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">4h</p>
              <p className="text-[10px] md:text-xs text-slate-400 mt-1 leading-tight">
                économisées
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clients récupérés récemment
            </h2>
            <Link
              href="/clients"
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center"
            >
              Voir tout <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
            {[1, 2, 3].map((i) => (
              <Link
                key={i}
                href={`/clients?client=${i}`}
                className="flex flex-col md:grid md:grid-cols-12 gap-3 px-4 py-4 items-start md:items-center hover:bg-slate-50 active:bg-slate-50 transition-colors"
              >
                <div className="col-span-5 flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                    MD
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      M. Dupont
                    </p>
                    <p className="text-xs text-slate-400 md:hidden">
                      Fuite sous évier · Il y a 5 min
                    </p>
                    <p className="text-xs text-slate-400 hidden md:block">
                      Il y a 5 min
                    </p>
                  </div>
                </div>
                <div className="col-span-4 hidden md:block min-w-0">
                  <p className="text-sm text-slate-700 truncate">
                    Fuite sous l&apos;évier de la cuisine
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Urgent
                  </span>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2 w-full md:w-auto mt-1 md:mt-0">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors active:scale-95">
                    <Phone className="w-3.5 h-3.5" /> Appeler
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors active:scale-95">
                    Détails
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-1">
          <div className="bg-slate-900 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-base md:text-lg">
                  Votre assistant est actif
                </p>
                <p className="text-sm text-slate-400">
                  Il a traité 12 appels cette semaine.
                </p>
              </div>
            </div>
            <button
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-emerald-500 transition-colors focus:outline-none flex-shrink-0"
              aria-label="Activer ou mettre en pause l'assistant"
            >
              <span className="inline-block h-6 w-6 transform translate-x-7 rounded-full bg-white transition-transform shadow-sm" />
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
