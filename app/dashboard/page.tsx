"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileDown,
  MapPin,
  Phone,
  Share2,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppToast } from "@/components/ui/AppToast";

type Urgence = "Urgent" | "À planifier" | "Devis";

type ClientRecupere = {
  id: number;
  nom: string;
  initiales: string;
  probleme: string;
  urgence: Urgence;
  adresseCourte: string;
  adresse: string;
  moment: string;
  telephone: string;
  details: string;
  notes: string;
};

const clientsRecents: ClientRecupere[] = [
  {
    id: 1,
    nom: "M. Dupont",
    initiales: "MD",
    probleme: "Fuite évier",
    urgence: "Urgent",
    adresseCourte: "12 rue de la Paix, Paris 2e",
    adresse: "12 rue de la Paix, 75002 Paris",
    moment: "il y a 5 min",
    telephone: "0612345678",
    details:
      "Le client a une fuite sous l'évier de la cuisine. L'eau coule en continu depuis ce matin et commence à passer au plafond du voisin du dessous.",
    notes:
      "Le client a coupé l'arrivée d'eau. Il est disponible toute la matinée et préfère un appel avant 10h.",
  },
  {
    id: 2,
    nom: "Mme Martin",
    initiales: "MM",
    probleme: "Chauffe-eau en panne",
    urgence: "À planifier",
    adresseCourte: "45 av. Victor Hugo, Paris 16e",
    adresse: "45 avenue Victor Hugo, 75016 Paris",
    moment: "il y a 2 h",
    telephone: "0698765432",
    details:
      "Plus d'eau chaude depuis hier soir. Le voyant du chauffe-eau clignote rouge, le client pense à une résistance morte.",
    notes:
      "Souhaite un rendez-vous demain matin. A déjà fait vérifier le disjoncteur, sans résultat.",
  },
  {
    id: 3,
    nom: "M. Bernard",
    initiales: "MB",
    probleme: "Devis salle de bain",
    urgence: "Devis",
    adresseCourte: "8 rue des Lilas, Boulogne",
    adresse: "8 rue des Lilas, 92100 Boulogne-Billancourt",
    moment: "hier",
    telephone: "0711223344",
    details:
      "Souhaite un devis pour la rénovation complète de sa salle de bain : douche italienne, carrelage et remplacement du lavabo.",
    notes:
      "Budget annoncé autour de 6 000 €. Préfère être rappelé en fin de journée après 18h.",
  },
];

const semaine = [38, 62, 45, 78, 56, 88, 70];

const urgenceStyle: Record<Urgence, string> = {
  Urgent: "bg-red-50 text-red-600",
  "À planifier": "bg-amber-50 text-amber-700",
  Devis: "bg-slate-100 text-slate-600",
};

export default function DashboardPage() {
  const [assistantActif, setAssistantActif] = useState(true);
  const [clientOuvert, setClientOuvert] = useState<ClientRecupere | null>(null);
  const { show, toast } = useAppToast();

  const basculerAssistant = () => {
    setAssistantActif((actif) => !actif);
    show(assistantActif ? "Assistant mis en pause" : "Assistant activé");
  };

  const partager = async (client: ClientRecupere) => {
    const texte = `Fiche client Velianos\n${client.nom}\n${client.probleme}\n${client.adresse}\n${client.telephone}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `Client ${client.nom}`, text: texte });
        show("Fiche partagée");
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(texte);
        show("Fiche copiée");
      }
    } catch {
      // Partage annulé par l'utilisateur.
    }
  };

  const exporterPdf = async (client: ClientRecupere) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Fiche client — ${client.nom}`, 14, 22);
      doc.setFontSize(11);
      doc.text(`Téléphone : ${client.telephone}`, 14, 40);
      doc.text(`Adresse : ${client.adresse}`, 14, 48);
      doc.text(`Demande : ${client.probleme}`, 14, 56);
      doc.text(`Reçu ${client.moment}`, 14, 64);
      doc.text(doc.splitTextToSize(client.details, 180), 14, 78);
      doc.save(`fiche-${client.nom.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      show("PDF téléchargé");
    } catch {
      show("Export PDF indisponible");
    }
  };

  return (
    <AppLayout>
      <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-7">
        {/* À FAIRE MAINTENANT */}
        <section>
          <div className="flex items-baseline justify-between px-1 mb-2.5">
            <h2 className="text-[15px] font-bold text-[#0F172A]">
              À faire maintenant
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              3 actions
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <Link
              href="/clients"
              className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 active:bg-slate-50 transition-colors"
            >
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-[#0F172A]">
                  2 clients attendent votre rappel
                </span>
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Ne les laissez pas appeler un concurrent
                </span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 rounded-md px-2 py-0.5 flex-shrink-0">
                Urgent
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </Link>

            <Link
              href="/messages"
              className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 active:bg-slate-50 transition-colors"
            >
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="w-5 h-5 text-[#0F172A]" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-[#0F172A]">
                  14h30 · Chauffe-eau
                </span>
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Mme Martin · 45 av. Victor Hugo
                </span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
                Aujourd&apos;hui
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </Link>

            <Link
              href="/entreprise"
              className="flex items-center gap-3 px-5 py-4 active:bg-slate-50 transition-colors"
            >
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#0F172A]" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-[#0F172A]">
                  Complétez votre fiche entreprise
                </span>
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Votre assistant la connaît à 80 %
                </span>
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 rounded-md px-2 py-0.5 flex-shrink-0">
                80 %
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </Link>
          </div>
        </section>

        {/* BENTO */}
        <section>
          <h2 className="text-[15px] font-bold text-[#0F172A] px-1 mb-2.5">
            Ce que Velianos vous a rapporté
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Argent généré ce mois-ci
                  </p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#10B981]">
                    1 250 €
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-semibold text-[#047857] bg-[#10B981]/10 px-2 py-0.5 rounded-md">
                    <TrendingUp className="w-3 h-3" />
                    +240 € vs mois dernier
                  </span>
                </div>

                <div className="flex items-end gap-1.5 h-16 flex-shrink-0 pt-1">
                  {semaine.map((hauteur, index) => (
                    <span
                      key={index}
                      className={`w-1.5 rounded-full ${
                        index === semaine.length - 1
                          ? "bg-[#047857]"
                          : "bg-slate-100"
                      }`}
                      style={{ height: `${hauteur}%` }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs font-normal text-slate-400 mt-4">
                5 chantiers récupérés · panier moyen 250 €
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Appels manqués
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A]">
                7
              </p>
              <span className="inline-block mt-2.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-md px-2 py-0.5">
                3 à rappeler
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Clients récupérés
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A]">
                5
              </p>
              <span className="inline-block mt-2.5 text-[10px] font-semibold text-[#047857] bg-[#10B981]/10 rounded-md px-2 py-0.5">
                +2 cette semaine
              </span>
            </div>
          </div>
        </section>

        {/* DERNIERS CLIENTS */}
        <section>
          <div className="flex items-center justify-between px-1 mb-2.5">
            <h2 className="text-[15px] font-bold text-[#0F172A]">
              Derniers clients récupérés
            </h2>
            <Link
              href="/clients"
              className="text-xs font-medium text-slate-500 active:scale-95 transition-transform flex items-center"
            >
              Tout voir <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {clientsRecents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 text-[#0F172A]" />
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">
                Aucun client en attente
              </p>
              <p className="text-xs font-normal text-slate-500 mt-1 max-w-xs mx-auto">
                Votre assistant veille. Vous serez prévenu dès qu&apos;un client
                appelle.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {clientsRecents.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-2 pr-4 border-b border-slate-100 last:border-0"
                >
                  <button
                    onClick={() => setClientOuvert(client)}
                    className="flex-1 min-w-0 text-left px-5 py-4 active:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {client.initiales}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#0F172A] truncate">
                            {client.nom}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md flex-shrink-0 ${
                              urgenceStyle[client.urgence]
                            }`}
                          >
                            {client.urgence}
                          </span>
                        </span>
                        <span className="block text-[13px] font-medium text-slate-600 truncate mt-0.5">
                          {client.probleme}
                        </span>
                        <span className="flex items-center gap-1 mt-1 text-[11px] font-normal text-slate-400 min-w-0">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.adresseCourte}</span>
                          <span className="mx-0.5">·</span>
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-shrink-0">{client.moment}</span>
                        </span>
                      </span>
                    </span>
                  </button>

                  <a
                    href={`tel:${client.telephone}`}
                    aria-label={`Appeler ${client.nom}`}
                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 active:scale-95 flex items-center justify-center flex-shrink-0 transition-transform"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BARRE ASSISTANT */}
        <section className="rounded-2xl bg-[#0F172A] p-5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm flex items-center gap-1.5">
                {assistantActif ? "Assistant actif" : "Assistant en pause"}
              </p>
              <p className="text-xs font-normal text-slate-400 mt-0.5">
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
              className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 active:scale-95 ${
                assistantActif ? "bg-[#10B981]" : "bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  assistantActif ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>
      </div>

      {/* FICHE CLIENT */}
      {clientOuvert && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px]"
          onClick={() => setClientOuvert(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[88vh] overflow-hidden animate-[sheetUp_.25s_ease-out]"
          >
            <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
              <span className="w-9 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="px-5 py-3 md:py-5 flex items-start justify-between gap-3 flex-shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {clientOuvert.initiales}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-[#0F172A] truncate">
                      {clientOuvert.nom}
                    </h2>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md flex-shrink-0 ${
                        urgenceStyle[clientOuvert.urgence]
                      }`}
                    >
                      {clientOuvert.urgence}
                    </span>
                  </div>
                  <p className="text-xs font-normal text-slate-500 mt-0.5">
                    Appel reçu {clientOuvert.moment}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClientOuvert(null)}
                aria-label="Fermer"
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 active:scale-95 flex items-center justify-center flex-shrink-0 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border-t border-slate-100">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ce qu&apos;il demande
                </p>
                <p className="text-sm font-normal text-slate-700 leading-relaxed">
                  {clientOuvert.details}
                </p>
              </div>

              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Adresse
                </p>
                <p className="text-sm font-medium text-[#0F172A]">
                  {clientOuvert.adresse}
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    clientOuvert.adresse,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0F172A] underline underline-offset-4 decoration-slate-300 mt-2 active:opacity-60 transition-opacity"
                >
                  <MapPin className="w-3.5 h-3.5" /> Ouvrir l&apos;itinéraire
                </a>
              </div>

              <div className="px-5 py-4">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                    Notes de l&apos;assistant
                  </p>
                  <p className="text-sm font-normal text-slate-700 leading-relaxed">
                    {clientOuvert.notes}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-5 border-t border-slate-100 flex-shrink-0">
              <a
                href={`tel:${clientOuvert.telephone}`}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] text-[15px] font-semibold text-white active:scale-[0.99] transition-transform"
              >
                <Phone className="w-5 h-5" /> Appeler {clientOuvert.nom}
              </a>

              <div className="mt-4 flex items-start justify-center gap-9">
                <ActionSecondaire
                  icone={MapPin}
                  label="Maps"
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    clientOuvert.adresse,
                  )}`}
                />
                <ActionSecondaire
                  icone={Share2}
                  label="Partager"
                  onClick={() => void partager(clientOuvert)}
                />
                <ActionSecondaire
                  icone={FileDown}
                  label="PDF"
                  onClick={() => void exporterPdf(clientOuvert)}
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
