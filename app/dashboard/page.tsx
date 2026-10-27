"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
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

  return (
    <AppLayout>
      <div className="px-4 py-4 md:p-0 space-y-5">
        {/* À FAIRE MAINTENANT */}
        <section>
          <div className="flex items-baseline justify-between px-1 mb-2">
            <h2 className="text-sm font-bold text-slate-900">
              À faire maintenant
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              3 actions
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
            <Link
              href="/clients"
              className="flex items-center gap-3 px-4 py-3 min-h-[62px] active:bg-slate-50 transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-[18px] h-[18px] text-red-500" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  2 clients attendent votre rappel
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  Ne les laissez pas appeler un concurrent
                </span>
              </span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full flex-shrink-0">
                URGENT
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </Link>

            <Link
              href="/messages"
              className="flex items-center gap-3 px-4 py-3 min-h-[62px] active:bg-slate-50 transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="w-[18px] h-[18px] text-blue-600" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  14h30 · Chauffe-eau
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  Mme Martin · 45 av. Victor Hugo
                </span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0">
                Aujourd&apos;hui
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </Link>

            <Link
              href="/entreprise"
              className="flex items-center gap-3 px-4 py-3 min-h-[62px] active:bg-slate-50 transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-[18px] h-[18px] text-amber-600" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  Complétez votre fiche entreprise
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  Votre assistant la connaît à 80 %
                </span>
              </span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full flex-shrink-0">
                80 %
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </Link>
          </div>
        </section>

        {/* BENTO */}
        <section>
          <h2 className="text-sm font-bold text-slate-900 px-1 mb-2">
            Ce que Velianos vous a rapporté
          </h2>

          <div className="grid grid-cols-2 gap-3">
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
        </section>

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

          {clientsRecents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-[#00A857]" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Aucun client en attente
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Votre assistant veille. Vous serez prévenu dès qu&apos;un client
                appelle.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
              {clientsRecents.map((client) => (
                <div key={client.id} className="flex items-center gap-2 pr-3">
                  <button
                    onClick={() => setClientOuvert(client)}
                    className="flex-1 min-w-0 text-left px-4 py-3 active:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          client.urgence === "Urgent"
                            ? "bg-red-50 text-red-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {client.initiales}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {client.nom}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                              urgenceStyle[client.urgence]
                            }`}
                          >
                            {client.urgence.toUpperCase()}
                          </span>
                        </span>
                        <span className="block text-sm text-slate-700 truncate mt-0.5">
                          {client.probleme}
                        </span>
                        <span className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 min-w-0">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {client.adresseCourte}
                          </span>
                          <span className="mx-0.5">·</span>
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-shrink-0">
                            {client.moment}
                          </span>
                        </span>
                      </span>
                    </div>
                  </button>

                  <a
                    href={`tel:${client.telephone}`}
                    aria-label={`Appeler ${client.nom}`}
                    className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 flex items-center justify-center flex-shrink-0 transition-all"
                  >
                    <Phone className="w-[18px] h-[18px]" />
                  </a>
                </div>
              ))}
            </div>
          )}
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

      {/* FICHE CLIENT */}
      {clientOuvert && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setClientOuvert(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[88vh] overflow-hidden animate-[sheetUp_.25s_ease-out]"
          >
            <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
              <span className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="px-5 py-3 md:py-5 flex items-start justify-between gap-3 flex-shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    clientOuvert.urgence === "Urgent"
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {clientOuvert.initiales}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                      {clientOuvert.nom}
                    </h2>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                        urgenceStyle[clientOuvert.urgence]
                      }`}
                    >
                      {clientOuvert.urgence.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Appel reçu {clientOuvert.moment}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClientOuvert(null)}
                aria-label="Fermer"
                className="w-10 h-10 rounded-full bg-slate-100 active:scale-95 text-slate-600 flex items-center justify-center flex-shrink-0 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pb-4 overflow-y-auto space-y-3 flex-1">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Ce qu&apos;il demande
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {clientOuvert.details}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Adresse
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {clientOuvert.adresse}
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    clientOuvert.adresse,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#00A857] mt-2 active:scale-95 transition-transform"
                >
                  <MapPin className="w-3.5 h-3.5" /> Ouvrir l&apos;itinéraire
                </a>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Notes de l&apos;assistant
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {clientOuvert.notes}
                </p>
              </div>
            </div>

            <div className="px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 border-t border-slate-100 flex gap-2.5 flex-shrink-0">
              <a
                href={`tel:${clientOuvert.telephone}`}
                className="flex-1 h-14 rounded-2xl bg-[#00D26A] hover:bg-[#00B85D] active:scale-[0.98] text-slate-900 font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-5 h-5" /> Appeler {clientOuvert.nom}
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  clientOuvert.adresse,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Itinéraire"
                className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center flex-shrink-0 transition-all"
              >
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {toast}
    </AppLayout>
  );
}
