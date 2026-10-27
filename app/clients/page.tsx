"use client";

import { useState } from "react";
import {
  Phone,
  MapPin,
  Share2,
  FileDown,
  X,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

type Client = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  address: string;
  problem: string;
  details: string;
  urgent: boolean;
  date: string;
};

const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "M. Dupont",
    initials: "MD",
    phone: "06 12 34 56 78",
    address: "12 rue de la Paix, 75002 Paris",
    problem: "Fuite sous évier",
    details:
      "Le client a une fuite sous l'évier de la cuisine, l'eau coule en continu depuis ce matin. Il a peur que ça inonde le voisin du dessous.",
    urgent: true,
    date: "Aujourd'hui à 08h30",
  },
  {
    id: "2",
    name: "Mme Martin",
    initials: "MM",
    phone: "06 98 76 54 32",
    address: "45 avenue Victor Hugo, 75016 Paris",
    problem: "Chauffe-eau en panne",
    details:
      "Plus d'eau chaude depuis hier soir. Le voyant du chauffe-eau clignote rouge.",
    urgent: false,
    date: "Hier à 18h15",
  },
  {
    id: "3",
    name: "M. Bernard",
    initials: "MB",
    phone: "07 11 22 33 44",
    address: "8 rue des Lilas, 92100 Boulogne",
    problem: "Devis salle de bain",
    details:
      "Souhaite un devis pour la rénovation complète de sa salle de bain (douche italienne, carrelage).",
    urgent: false,
    date: "Il y a 2 jours",
  },
];

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleShare = (client: Client) => {
    const text = `Fiche client Velianos:\nNom: ${client.name}\nProblème: ${client.problem}\nAdresse: ${client.address}\nTél: ${client.phone}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: `Client ${client.name}`, text });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      alert("Les informations ont été copiées !");
    }
  };

  return (
    <AppLayout>
      <div className="px-4 py-4 md:p-0 space-y-4">
        <p className="text-sm text-slate-500 px-1">
          Toutes les demandes que votre assistant a qualifiées pour vous.
        </p>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50/50 border-b border-slate-200 px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Client</div>
            <div className="col-span-5">Demande</div>
            <div className="col-span-3 text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-100">
            {MOCK_CLIENTS.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="w-full text-left flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 items-start md:items-center hover:bg-slate-50 active:bg-slate-50 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-3 w-full">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      client.urgent
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {client.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {client.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {client.phone}
                    </p>
                  </div>
                  <span className="ml-auto md:hidden text-slate-300">›</span>
                </div>

                <div className="col-span-5 w-full">
                  <p className="text-sm font-medium text-slate-800">
                    {client.problem}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {client.address}
                  </p>
                  {client.urgent && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Urgent
                    </span>
                  )}
                </div>

                <div className="hidden md:flex col-span-3 justify-end w-full">
                  <span className="bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-lg">
                    Ouvrir la fiche
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] md:max-h-[90vh]">
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 flex items-start justify-between bg-white flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                    Récupéré par l&apos;assistant
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  {selectedClient.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Appel reçu {selectedClient.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6 bg-slate-50 flex-1">
              <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Ce qu&apos;il a demandé
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {selectedClient.details}
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-md">
                    Fuite d&apos;eau
                  </span>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                    Cuisine
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Téléphone
                  </h3>
                  <p className="text-base font-semibold text-slate-900">
                    {selectedClient.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Adresse
                  </h3>
                  <p className="text-base font-semibold text-slate-900">
                    {selectedClient.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex flex-col md:flex-row gap-2.5 md:gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 flex-shrink-0">
              <a
                href={`tel:${selectedClient.phone.replace(/\s/g, "")}`}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <Phone className="w-5 h-5" /> Appeler
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  selectedClient.address,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <MapPin className="w-5 h-5" /> Itinéraire
              </a>
              <div className="flex gap-2.5 md:gap-3 flex-1">
                <button
                  onClick={() => handleShare(selectedClient)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                  title="Partager"
                  aria-label="Partager la fiche"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
                  title="Enregistrer en PDF"
                  aria-label="Enregistrer en PDF"
                >
                  <FileDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
