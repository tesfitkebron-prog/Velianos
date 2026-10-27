"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  FileDown,
  MapPin,
  Phone,
  Share2,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppToast } from "@/components/ui/AppToast";

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
    date: "aujourd'hui à 08h30",
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
    date: "hier à 18h15",
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
    date: "il y a 2 jours",
  },
];

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filtre, setFiltre] = useState<"tous" | "urgents">("tous");
  const { show, toast } = useAppToast();

  const clients =
    filtre === "urgents"
      ? MOCK_CLIENTS.filter((client) => client.urgent)
      : MOCK_CLIENTS;

  const handleShare = async (client: Client) => {
    const text = `Fiche client Velianos\n${client.name}\n${client.problem}\n${client.address}\n${client.phone}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `Client ${client.name}`, text });
        show("Fiche partagée");
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        show("Fiche copiée");
      }
    } catch {
      // Partage annulé par l'utilisateur.
    }
  };

  const exporterPdf = async (client: Client) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`Fiche client — ${client.name}`, 14, 22);
      doc.setFontSize(11);
      doc.text(`Téléphone : ${client.phone}`, 14, 40);
      doc.text(`Adresse : ${client.address}`, 14, 48);
      doc.text(`Demande : ${client.problem}`, 14, 56);
      doc.text(`Reçu ${client.date}`, 14, 64);
      doc.text(doc.splitTextToSize(client.details, 180), 14, 78);
      doc.save(`fiche-${client.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      show("PDF téléchargé");
    } catch {
      show("Export PDF indisponible");
    }
  };

  return (
    <AppLayout>
      <div className="px-4 py-4 md:p-0 space-y-3">
        {/* EN-TÊTE + FILTRES */}
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-xs text-slate-500">
            {MOCK_CLIENTS.length} demandes qualifiées
          </p>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setFiltre("tous")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors active:scale-95 ${
                filtre === "tous"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFiltre("urgents")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors active:scale-95 ${
                filtre === "urgents"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Urgents
            </button>
          </div>
        </div>

        {/* LISTE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors"
            >
              <span
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  client.urgent
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {client.initials}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {client.name}
                  </span>
                  {client.urgent && (
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex-shrink-0">
                      URGENT
                    </span>
                  )}
                </span>
                <span className="block text-xs text-slate-500 truncate mt-0.5">
                  {client.problem} · {client.date}
                </span>
              </span>
              <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
            </button>
          ))}

          {clients.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Aucun client urgent. Tout est sous contrôle.
            </p>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 pt-1">
          Vos fiches sont générées automatiquement après chaque appel.
        </p>
      </div>

      {/* FICHE CLIENT — BOTTOM SHEET */}
      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSelectedClient(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[88vh] overflow-hidden animate-[sheetUp_.25s_ease-out]"
          >
            {/* POIGNÉE */}
            <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
              <span className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="px-5 py-3 md:py-5 flex items-start justify-between gap-3 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C462]" />
                  <span className="text-[10px] font-bold text-[#00A857] uppercase tracking-wide">
                    Récupéré par l&apos;assistant
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                  {selectedClient.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appel reçu {selectedClient.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                aria-label="Fermer"
                className="w-10 h-10 rounded-full bg-slate-100 active:scale-95 text-slate-600 flex items-center justify-center flex-shrink-0 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pb-4 overflow-y-auto space-y-3 flex-1">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Ce qu&apos;il a demandé
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedClient.details}
                </p>
                <div className="flex gap-1.5 mt-3">
                  <span className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                    {selectedClient.problem}
                  </span>
                  <span className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                    {selectedClient.urgent ? "Urgent" : "Planifié"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-2xl p-3.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Téléphone
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedClient.phone}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3.5 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Adresse
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                    {selectedClient.address}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS MASSIVES */}
            <div className="px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 border-t border-slate-100 flex-shrink-0">
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${selectedClient.phone.replace(/\s/g, "")}`}
                  className="h-14 rounded-2xl bg-[#00D26A] hover:bg-[#00B85D] active:scale-95 text-slate-900 font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-5 h-5" /> Appeler
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    selectedClient.address,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <MapPin className="w-5 h-5" /> Maps
                </a>
                <button
                  onClick={() => handleShare(selectedClient)}
                  className="h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-5 h-5" /> Partager
                </button>
                <button
                  onClick={() => exporterPdf(selectedClient)}
                  className="h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <FileDown className="w-5 h-5" /> PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast}
    </AppLayout>
  );
}
