"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Phone } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { ClientSheet } from "@/components/clients/ClientSheet";
import {
  CLIENTS,
  STYLE_URGENCE,
  styleAvatar,
  trierParUrgence,
  type ClientFiche,
} from "@/lib/clients";

export default function ClientsPage() {
  return (
    <AppLayout>
      <ClientsContent />
    </AppLayout>
  );
}

function ClientsContent() {
  const { notifier } = useAssistant();
  const [clients, setClients] = useState<ClientFiche[]>(() =>
    trierParUrgence(CLIENTS),
  );
  const [selectedClient, setSelectedClient] = useState<ClientFiche | null>(null);
  const [filtre, setFiltre] = useState<"tous" | "urgents">("tous");

  const visibles = clients.filter(
    (client) => filtre === "tous" || client.urgence === "urgent",
  );

  const marquerTraite = (client: ClientFiche) => {
    setClients((precedent) =>
      precedent.filter((item) => item.id !== client.id),
    );
    setSelectedClient(null);
    notifier(`${client.nom} marqué comme traité.`, () =>
      setClients((precedent) => trierParUrgence([...precedent, client])),
    );
  };

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-3">
      {/* EN-TÊTE + FILTRES */}
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-normal text-slate-500">
          {filtre === "urgents"
            ? `${visibles.length} urgent${visibles.length > 1 ? "s" : ""}`
            : `${visibles.length} client${visibles.length > 1 ? "s" : ""} suivi${visibles.length > 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => setFiltre("tous")}
            className={`min-h-[44px] px-3 rounded-md text-xs transition-colors active:scale-95 ${
              filtre === "tous"
                ? "bg-white text-[#0F172A] shadow-sm font-semibold"
                : "text-slate-500 font-medium"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFiltre("urgents")}
            className={`min-h-[44px] px-3 rounded-md text-xs transition-colors active:scale-95 ${
              filtre === "urgents"
                ? "bg-white text-[#0F172A] shadow-sm font-semibold"
                : "text-slate-500 font-medium"
            }`}
          >
            Urgents
          </button>
        </div>
      </div>

      {/* LISTE */}
      {visibles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-[#0F172A]">
            {filtre === "urgents"
              ? "Aucun client urgent."
              : "Aucun client à rappeler."}
          </p>
          <p className="text-xs font-normal text-slate-500 mt-1">
            Tout est sous contrôle. Votre assistant continue de veiller.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibles.map((client) => {
            const style = STYLE_URGENCE[client.urgence];

            return (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition-all active:scale-[0.99] active:bg-slate-50"
              >
                <span
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${styleAvatar(client.id)}`}
                >
                  {client.initiales}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {client.nom}
                    </span>
                    <span
                      className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
                    >
                      {client.badge}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] font-medium text-slate-600">
                    {client.probleme}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[11px] font-normal text-slate-400">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    Appel {client.moment}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
              </button>
            );
          })}
        </div>
      )}

      {visibles.length > 0 && (
        <p className="text-center text-[11px] font-normal text-slate-400 pt-1 flex items-center justify-center gap-1.5">
          <Phone className="w-3 h-3" />
          Appelez le client, puis marquez la fiche comme traitée.
        </p>
      )}

      {/* FICHE CLIENT */}
      {selectedClient && (
        <ClientSheet
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onTreated={marquerTraite}
        />
      )}
    </div>
  );
}
