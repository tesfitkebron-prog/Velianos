"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock, Phone } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { ClientSheet } from "@/components/clients/ClientSheet";
import {
  CLIENTS,
  STYLE_URGENCE,
  trierParUrgence,
  type ClientFiche,
} from "@/lib/clients";

type ActionAssistant = {
  id: string;
  rang: number;
  heure: string;
  texte: string;
  badge?: string;
  annulable: boolean;
};

const ACTIONS_INITIALES: ActionAssistant[] = [
  {
    id: "sms",
    rang: 1,
    heure: "14h02",
    texte: "SMS envoyé à M. Dupont",
    badge: "Assistant",
    annulable: true,
  },
  {
    id: "notification",
    rang: 2,
    heure: "14h05",
    texte: "Notification envoyée à Karim",
    annulable: false,
  },
  {
    id: "rdv",
    rang: 3,
    heure: "14h06",
    texte: "RDV confirmé pour M. Dupont",
    annulable: true,
  },
];

const STATS = [
  { label: "Argent gagné", valeur: "1 250", suffixe: "€", couleur: "text-[#10B981]" },
  { label: "Chantiers", valeur: "5", suffixe: "", couleur: "text-[#0F172A]" },
  { label: "Temps sauvé", valeur: "4", suffixe: "h", couleur: "text-[#0F172A]" },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}

function DashboardContent() {
  const { actif, setActif, notifier } = useAssistant();
  const [clients, setClients] = useState<ClientFiche[]>(() =>
    trierParUrgence(CLIENTS),
  );
  const [clientOuvert, setClientOuvert] = useState<ClientFiche | null>(null);
  const [actions, setActions] = useState<ActionAssistant[]>(ACTIONS_INITIALES);

  const urgents = clients.filter((client) => client.urgence === "urgent").length;
  const nbRappels = clients.length;
  const resumeJour = `${nbRappels} rappel${nbRappels > 1 ? "s" : ""} · 2 RDV · 1 à valider`;

  const basculerAssistant = () => {
    const suivant = !actif;
    setActif(suivant);
    notifier(
      suivant ? "Assistant activé." : "Assistant mis en pause.",
      () => setActif(!suivant),
    );
  };

  const marquerTraite = (client: ClientFiche) => {
    setClients((precedent) =>
      precedent.filter((item) => item.id !== client.id),
    );
    setClientOuvert(null);
    notifier(`${client.nom} marqué comme traité.`, () =>
      setClients((precedent) => trierParUrgence([...precedent, client])),
    );
  };

  const annulerAction = (action: ActionAssistant) => {
    setActions((precedent) => precedent.filter((item) => item.id !== action.id));
    notifier(`${action.texte} annulé.`, () =>
      setActions((precedent) =>
        [...precedent, action].sort((a, b) => a.rang - b.rang),
      ),
    );
  };

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-5">
      {/* 1. À RAPPELER MAINTENANT */}
      <section>
        <div className="flex items-center gap-2 px-1 mb-2.5 min-w-0">
          <h2 className="text-[15px] font-bold text-[#0F172A] truncate">
            À rappeler maintenant
          </h2>
          {urgents > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 rounded-md px-2 py-0.5 flex-shrink-0">
              🔥 {urgents} urgent{urgents > 1 ? "s" : ""}
            </span>
          )}
          <span className="ml-auto text-[11px] font-normal text-slate-400 flex-shrink-0">
            {nbRappels} en attente
          </span>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">
              Aucun client à rappeler.
            </p>
            <p className="text-xs font-normal text-slate-500 mt-1">
              Votre assistant gère.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {clients.map((client) => (
              <article
                key={client.id}
                className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${
                  client.urgence === "urgent"
                    ? "border-l-red-500"
                    : "border-l-amber-400"
                } shadow-sm overflow-hidden`}
              >
                <button
                  onClick={() => setClientOuvert(client)}
                  className="w-full text-left px-4 pt-3.5 pb-2.5 active:bg-slate-50 transition-colors"
                >
                  <span className="flex items-start gap-3">
                    <span className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {client.initiales}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0F172A] truncate">
                          {client.nom}
                        </span>
                        {client.urgence !== "normal" && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md flex-shrink-0 ${
                              STYLE_URGENCE[client.urgence].badge
                            }`}
                          >
                            {client.urgence === "urgent"
                              ? "🔥 Urgent"
                              : "À vérifier"}
                          </span>
                        )}
                      </span>
                      <span className="block text-[13px] font-medium text-slate-600 truncate mt-0.5">
                        {client.probleme}
                      </span>
                      <span className="flex items-center gap-1 mt-1 text-[11px] font-normal text-slate-400">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        Appel {client.moment}
                      </span>
                    </span>
                  </span>
                </button>

                <div className="flex gap-2 px-4 pb-3.5 md:max-w-md">
                  <a
                    href={`tel:${client.telephone}`}
                    className="flex-1 h-11 rounded-lg bg-[#10B981] text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-transform"
                  >
                    <Phone className="w-4 h-4" /> Appeler
                  </a>
                  <button
                    onClick={() => setClientOuvert(client)}
                    className="flex-1 h-11 rounded-lg bg-slate-100 text-[#0F172A] text-sm font-semibold flex items-center justify-center active:scale-[0.99] transition-transform"
                  >
                    Voir la fiche
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 2. AUJOURD'HUI */}
      <section className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-2">
        <Link
          href="/messages"
          className="flex-1 min-w-0 min-h-[44px] flex items-center active:opacity-60 transition-opacity"
        >
          <span className="text-[13px] font-normal text-slate-600 leading-snug whitespace-nowrap">
            {resumeJour}
          </span>
        </Link>
        <button
          onClick={basculerAssistant}
          role="switch"
          aria-checked={actif}
          aria-label="Activer ou mettre en pause l'assistant"
          className={`flex-shrink-0 min-h-[44px] inline-flex items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold active:scale-95 transition-transform ${
            actif
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              actif ? "bg-[#10B981]" : "bg-amber-500"
            }`}
          />
          {actif ? "Assistant actif" : "En pause"}
        </button>
      </section>

      {/* 3. CE QUE L'ASSISTANT A FAIT */}
      <section>
        <div className="flex items-center justify-between px-1 mb-1">
          <h2 className="text-[15px] font-bold text-[#0F172A]">
            Ce que l&apos;assistant a fait
          </h2>
          <Link
            href="/messages"
            className="min-h-[44px] inline-flex items-center text-xs font-medium text-slate-500 active:opacity-60 transition-opacity"
          >
            Tout voir <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {actions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm font-normal text-slate-500">
              Aucune action pour l&apos;instant.
            </p>
          ) : (
            actions.map((action) => (
              <div
                key={action.id}
                className="flex items-start gap-2 px-4 py-3 border-b border-slate-100 last:border-0 min-h-[56px]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-normal text-slate-700 leading-snug">
                    <span className="text-slate-400">{action.heure} — </span>
                    {action.texte}
                  </p>
                  {action.badge && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-md px-2 py-0.5">
                      {action.badge}
                    </span>
                  )}
                </div>
                {action.annulable && (
                  <button
                    onClick={() => annulerAction(action)}
                    className="flex-shrink-0 min-h-[44px] px-2 -mr-2 text-xs font-medium text-slate-400 active:text-slate-600 transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. STATS */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
          Ce mois-ci
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm min-w-0"
            >
              <p className="text-[10px] font-medium text-slate-500 leading-tight">
                {stat.label}
              </p>
              <p
                className={`mt-1.5 text-2xl font-extrabold tracking-tight leading-none ${stat.couleur}`}
              >
                {stat.valeur}
                {stat.suffixe && (
                  <span className="text-base font-bold">
                    {stat.suffixe === "€" ? " €" : ` ${stat.suffixe}`}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FICHE CLIENT */}
      {clientOuvert && (
        <ClientSheet
          client={clientOuvert}
          onClose={() => setClientOuvert(null)}
          onTreated={marquerTraite}
        />
      )}
    </div>
  );
}
