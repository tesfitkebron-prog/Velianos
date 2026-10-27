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
      doc.setFontSize(18);
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
      <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-3">
        {/* EN-TÊTE + FILTRES */}
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-xs font-normal text-slate-500">
            {clients.length} demande{clients.length > 1 ? "s" : ""} qualifiée
            {clients.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setFiltre("tous")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors active:scale-95 ${
                filtre === "tous"
                  ? "bg-white text-[#0F172A] shadow-sm font-semibold"
                  : "text-slate-500"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFiltre("urgents")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors active:scale-95 ${
                filtre === "urgents"
                  ? "bg-white text-[#0F172A] shadow-sm font-semibold"
                  : "text-slate-500"
              }`}
            >
              Urgents
            </button>
          </div>
        </div>

        {/* LISTE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="w-full text-left flex items-center gap-3 px-5 py-4 border-b border-slate-100 last:border-0 active:bg-slate-50 transition-colors"
            >
              <span className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {client.initials}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#0F172A] truncate">
                    {client.name}
                  </span>
                  {client.urgent && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 rounded-md px-2 py-0.5 flex-shrink-0">
                      Urgent
                    </span>
                  )}
                </span>
                <span className="block text-[13px] font-medium text-slate-600 truncate mt-0.5">
                  {client.problem}
                </span>
                <span className="block text-[11px] font-normal text-slate-400 truncate mt-0.5">
                  {client.address} · {client.date}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </button>
          ))}

          {clients.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 text-[#0F172A]" />
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">
                Aucun client urgent
              </p>
              <p className="text-xs font-normal text-slate-500 mt-1">
                Tout est sous contrôle. Votre assistant continue de veiller.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] font-normal text-slate-400 pt-1">
          Vos fiches sont générées automatiquement après chaque appel.
        </p>
      </div>

      {/* FICHE CLIENT — BOTTOM SHEET */}
      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px]"
          onClick={() => setSelectedClient(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[88vh] overflow-hidden animate-[sheetUp_.25s_ease-out]"
          >
            {/* POIGNÉE */}
            <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
              <span className="w-9 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="px-5 py-3 md:py-5 flex items-start justify-between gap-3 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[10px] font-semibold text-[#047857] uppercase tracking-wider">
                    Récupéré par l&apos;assistant
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                    {selectedClient.name}
                  </h2>
                  {selectedClient.urgent && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 rounded-md px-2 py-0.5">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-xs font-normal text-slate-500 mt-0.5">
                  Appel reçu {selectedClient.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                aria-label="Fermer"
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 active:scale-95 flex items-center justify-center flex-shrink-0 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border-t border-slate-100">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ce qu&apos;il a demandé
                </p>
                <p className="text-sm font-normal text-slate-700 leading-relaxed">
                  {selectedClient.details}
                </p>
              </div>

              <div className="px-5 py-4 border-b border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Téléphone
                  </p>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {selectedClient.phone}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Adresse
                  </p>
                  <p className="text-sm font-medium text-[#0F172A] truncate">
                    {selectedClient.address}
                  </p>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Qualification
                  </p>
                  <p className="text-sm font-normal text-slate-700 leading-relaxed">
                    {selectedClient.problem} ·{" "}
                    {selectedClient.urgent ? "Urgent" : "À planifier"}
                  </p>
                </div>
              </div>
            </div>

            {/* BARRE D'ACTIONS */}
            <div className="px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-5 border-t border-slate-100 flex-shrink-0">
              <a
                href={`tel:${selectedClient.phone.replace(/\s/g, "")}`}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] text-[15px] font-semibold text-white active:scale-[0.99] transition-transform"
              >
                <Phone className="w-5 h-5" /> Appeler
              </a>

              <div className="mt-4 flex items-start justify-center gap-9">
                <ActionSecondaire
                  icone={MapPin}
                  label="Maps"
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    selectedClient.address,
                  )}`}
                />
                <ActionSecondaire
                  icone={Share2}
                  label="Partager"
                  onClick={() => void handleShare(selectedClient)}
                />
                <ActionSecondaire
                  icone={FileDown}
                  label="PDF"
                  onClick={() => void exporterPdf(selectedClient)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {toast}
    </AppLayout>
  );
}

function ActionSecondaire({
  icone: Icone,
  label,
  href,
  onClick,
}: {
  icone: typeof MapPin;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const contenu = (
    <>
      <span className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center active:scale-95 transition-transform">
        <Icone className="w-5 h-5" />
      </span>
      <span className="text-[10px] font-medium text-slate-500">{label}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="flex flex-col items-center gap-1.5"
      >
        {contenu}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center gap-1.5"
    >
      {contenu}
    </button>
  );
}
