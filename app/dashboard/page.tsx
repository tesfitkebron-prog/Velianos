"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Phone,
} from "lucide-react";
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
  annulable: boolean;
};

const ACTIONS_INITIALES: ActionAssistant[] = [
  {
    id: "sms",
    rang: 1,
    heure: "14h02",
    texte: "SMS envoyé à M. Dupont",
    annulable: true,
  },
  {
    id: "notification",
    rang: 2,
    heure: "14h05",
    texte: "Notification envoyée à Karim",
    annulable: true,
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
  {
    label: "Argent gagné",
    valeur: "1 250",
    suffixe: "€",
    couleur: "text-[#10B981]",
  },
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
  const { actif, notifier } = useAssistant();
  const [clients, setClients] = useState<ClientFiche[]>(() =>
    trierParUrgence(CLIENTS),
  );
  const [clientOuvert, setClientOuvert] = useState<ClientFiche | null>(null);
  const [actions, setActions] = useState<ActionAssistant[]>(ACTIONS_INITIALES);

  const nbRappels = clients.length;
  const urgents = clients.filter((client) => client.urgence === "urgent").length;
  const resumeJour = `${nbRappels} rappel${nbRappels > 1 ? "s" : ""} · 2 RDV · 1 demande à valider`;

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
        <div className="mb-2.5 flex min-w-0 items-center gap-2 px-1">
          <h2 className="truncate text-[15px] font-bold text-[#0F172A]">
            À rappeler maintenant
          </h2>
          {urgents > 0 && (
            <span className="flex-shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
              🔥 {urgents} urgent{urgents > 1 ? "s" : ""}
            </span>
          )}
          <span className="ml-auto flex-shrink-0 text-[11px] font-normal text-slate-400">
            {nbRappels} en attente
          </span>
        </div>

        {clients.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">
              Aucun client à rappeler.
            </p>
            <p className="mt-1 text-xs font-normal text-slate-500">
              Votre assistant gère.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {clients.map((client) => {
              const style = STYLE_URGENCE[client.urgence];
              const badge =
                client.urgence === "urgent"
                  ? "🔥 Urgent"
                  : client.urgence === "a_verifier"
                    ? "À voir"
                    : null;

              return (
                <article
                  key={client.id}
                  className={`overflow-hidden rounded-2xl border border-slate-200 border-l-4 ${style.bordure} bg-white shadow-sm`}
                >
                  <div className="flex items-center gap-2.5 px-3 py-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {client.initiales}
                    </span>

                    <button
                      onClick={() => setClientOuvert(client)}
                      className="min-h-[44px] min-w-0 flex-1 text-left transition-colors active:opacity-70"
                    >
                      <span className="flex min-w-0 items-center gap-1">
                        <span className="truncate text-sm font-semibold text-[#0F172A]">
                          {client.nom}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] font-medium text-slate-600">
                        {client.probleme}
                      </span>
                      <span className="mt-0.5 flex min-w-0 items-center gap-1.5">
                        <span className="flex flex-shrink-0 items-center gap-1 text-[11px] font-normal text-slate-400">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          {client.moment}
                        </span>
                        {badge && (
                          <span
                            className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${style.badge}`}
                          >
                            {badge}
                          </span>
                        )}
                      </span>
                    </button>

                    <a
                      href={`tel:${client.telephone}`}
                      aria-label={`Appeler ${client.nom}`}
                      className="flex h-11 flex-shrink-0 items-center justify-center gap-1 rounded-lg bg-[#10B981] px-2 text-[11px] font-semibold text-white transition-transform active:scale-95"
                    >
                      <Phone className="h-4 w-4" />
                      Appeler
                    </a>

                    <button
                      onClick={() => setClientOuvert(client)}
                      aria-label={`Ouvrir la fiche de ${client.nom}`}
                      className="flex h-11 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors active:scale-95 active:text-slate-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. AUJOURD'HUI */}
      <section className="flex min-h-[52px] items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <p className="min-w-0 truncate text-[10px] font-normal text-slate-600">
          {resumeJour}
        </p>
        <Link
          href="/parametres"
          aria-label="Gérer mon assistant"
          className={`flex min-h-[44px] flex-shrink-0 items-center gap-1 rounded-lg px-2 text-[10px] font-semibold transition-transform active:scale-95 ${
            actif
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              actif ? "bg-[#10B981]" : "bg-amber-500"
            }`}
          />
          {actif ? "Assistant actif" : "En pause"}
        </Link>
      </section>

      {/* 3. CE QUE L'ASSISTANT A FAIT */}
      <section>
        <div className="mb-1 flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#0F172A]">
            Ce que l&apos;assistant a fait
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {actions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm font-normal text-slate-500">
              Aucune action pour l&apos;instant.
            </p>
          ) : (
            actions.map((action) => (
              <div
                key={action.id}
                className="flex min-h-[56px] items-start gap-2 border-b border-slate-100 px-4 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      🤖 Assistant
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {action.heure}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-normal leading-snug text-slate-700">
                    {action.texte}
                  </p>
                </div>
                {action.annulable && (
                  <button
                    onClick={() => annulerAction(action)}
                    className="min-h-[44px] flex-shrink-0 px-2 -mr-2 text-xs font-medium text-slate-500 transition-transform active:scale-95 active:text-slate-700"
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
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Ce mois-ci
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
            >
              <p className="text-[10px] font-medium leading-tight text-slate-500">
                {stat.label}
              </p>
              <p
                className={`mt-1.5 text-2xl font-extrabold leading-none tracking-tight ${stat.couleur}`}
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
