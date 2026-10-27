"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
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
  heure: string;
  texte: string;
  annulable: boolean;
};

const ACTIONS_INITIALES: ActionAssistant[] = [
  {
    id: "sms",
    heure: "14:02",
    texte: "SMS envoyé à M. Dupont",
    annulable: true,
  },
  {
    id: "appel",
    heure: "14:05",
    texte: "Appel manqué récupéré pour Mme Martin",
    annulable: false,
  },
  {
    id: "rdv",
    heure: "14:06",
    texte: "RDV confirmé pour Mme Martin",
    annulable: true,
  },
];

const STATS = [
  { label: "Récupérés", valeur: "12", suffixe: "" },
  { label: "Argent", valeur: "1 250", suffixe: " €" },
  { label: "Temps", valeur: "4", suffixe: " h" },
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

  const clientUrgent =
    clients.find((client) => client.urgence === "urgent") ?? null;
  const autresClients = clients.filter(
    (client) => client.id !== clientUrgent?.id,
  );

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
        [...precedent, action].sort((a, b) =>
          a.heure.localeCompare(b.heure),
        ),
      ),
    );
  };

  return (
    <div className="space-y-6 px-4 pb-10 pt-4 md:px-0 md:pt-0">
      {/* 1. URGENCE */}
      {clientUrgent && (
        <section>
          <div className="overflow-hidden rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent
                </span>

                <button
                  onClick={() => setClientOuvert(clientUrgent)}
                  className="mt-2 block min-h-[44px] w-full text-left transition-opacity active:opacity-70"
                >
                  <span className="block text-lg font-bold leading-tight text-[#0F172A]">
                    {clientUrgent.nom}
                  </span>
                  <span className="mt-0.5 block text-sm font-normal leading-snug text-slate-600">
                    {clientUrgent.probleme}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1 text-xs font-normal text-slate-500">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    {clientUrgent.moment} · {clientUrgent.heure}
                  </span>
                </button>
              </div>

              <button
                onClick={() => setClientOuvert(clientUrgent)}
                aria-label={`Ouvrir la fiche de ${clientUrgent.nom}`}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-slate-500 transition-all active:scale-95 active:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <a
              href={`tel:${clientUrgent.telephone}`}
              aria-label={`Appeler ${clientUrgent.nom} maintenant`}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00D26A] text-sm font-semibold text-white transition-transform active:scale-[0.99]"
            >
              <Phone className="h-4 w-4" />
              Appeler maintenant
            </a>
          </div>
        </section>
      )}

      {clients.length === 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-[#00D26A]" />
          </div>
          <p className="text-sm font-semibold text-[#0F172A]">
            Aucun client à rappeler.
          </p>
          <p className="mt-1 text-sm font-normal text-slate-500">
            Votre assistant gère. Tout est sous contrôle.
          </p>
        </section>
      )}

      {/* 2. CHIFFRES DU MOIS */}
      <section>
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Ce mois-ci
          </h2>
          <Link
            href="/assistant"
            className="-my-2 flex min-h-[44px] flex-shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-500 transition-colors active:text-slate-700"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                actif ? "bg-[#00D26A]" : "bg-amber-500"
              }`}
            />
            Assistant {actif ? "actif" : "en pause"}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3"
            >
              <p className="truncate text-[11px] font-medium leading-tight text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 whitespace-nowrap text-2xl font-bold leading-none tracking-tight text-[#0F172A]">
                {stat.valeur}
                {stat.suffixe && (
                  <span className="text-sm font-semibold text-slate-500">
                    {stat.suffixe}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. AUTRES RAPPELS */}
      {autresClients.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              À rappeler
            </h2>
            <span className="text-xs font-normal text-slate-400">
              {clients.length} en attente
            </span>
          </div>

          <div className="space-y-3">
            {autresClients.map((client) => {
              const style = STYLE_URGENCE[client.urgence];
              const badge =
                client.urgence === "urgent"
                  ? "Urgent"
                  : client.urgence === "a_verifier"
                    ? "À vérifier"
                    : null;

              return (
                <article
                  key={client.id}
                  className="rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-2.5 p-3.5">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {client.initiales}
                    </span>

                    <button
                      onClick={() => setClientOuvert(client)}
                      className="min-h-[44px] min-w-0 flex-1 text-left transition-opacity active:opacity-70"
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-[#0F172A]">
                          {client.nom}
                        </span>
                        {badge && (
                          <span
                            className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${style.badge}`}
                          >
                            {badge}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] font-normal text-slate-600">
                        {client.probleme}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] font-normal text-slate-400">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        {client.moment}
                      </span>
                    </button>

                    <a
                      href={`tel:${client.telephone}`}
                      aria-label={`Appeler ${client.nom}`}
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#00D26A] text-white transition-transform active:scale-95"
                    >
                      <Phone className="h-4 w-4" />
                    </a>

                    <button
                      onClick={() => setClientOuvert(client)}
                      aria-label={`Ouvrir la fiche de ${client.nom}`}
                      className="flex h-11 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors active:scale-95 active:text-slate-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. ACTIVITÉ RÉCENTE */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Activité récente
        </h2>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {actions.length === 0 ? (
            <p className="py-2 text-center text-sm font-normal text-slate-500">
              Aucune action pour l&apos;instant.
            </p>
          ) : (
            actions.map((action, index) => (
              <div
                key={action.id}
                className={`relative flex items-start gap-3 ${
                  index < actions.length - 1 ? "pb-5" : ""
                }`}
              >
                {index < actions.length - 1 && (
                  <span className="absolute bottom-0 left-[5px] top-4 w-px bg-slate-200" />
                )}
                <span className="relative z-10 mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#00D26A] ring-4 ring-white" />

                <p className="min-w-0 flex-1 text-sm font-normal leading-snug text-slate-600">
                  <span className="font-semibold text-[#0F172A]">
                    {action.heure}
                  </span>{" "}
                  · {action.texte}
                </p>

                {action.annulable && (
                  <button
                    onClick={() => annulerAction(action)}
                    className="-my-3 min-h-[44px] flex-shrink-0 px-1 text-xs font-medium text-slate-400 transition-all active:scale-95 active:text-slate-700"
                  >
                    Annuler
                  </button>
                )}
              </div>
            ))
          )}
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
