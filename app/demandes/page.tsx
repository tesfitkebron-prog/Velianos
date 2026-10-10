"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Download,
  Inbox,
  PhoneMissed,
  Clock,
  Check,
  ChevronRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

type Statut = "Nouveau" | "En attente" | "Traité" | "Sans réponse";

type Demande = {
  id: number;
  nom: string;
  initiales: string;
  numero: string;
  sujet: string;
  moment: string;
  statut: Statut;
  urgence: boolean;
  tags: string[];
};

const stylesStatut: Record<Statut, string> = {
  Nouveau: "bg-red-500 text-white",
  "En attente": "bg-amber-500 text-white",
  "Traité": "bg-emerald-500 text-white",
  "Sans réponse": "bg-slate-200 text-slate-600",
};

const demandes: Demande[] = [
  {
    id: 1,
    nom: "Jean Dupont",
    initiales: "JD",
    numero: "06 12 34 56 78",
    sujet: "Fuite sous l'évier de la cuisine",
    moment: "il y a 5 min",
    statut: "Nouveau",
    urgence: true,
    tags: ["Fuite", "Cuisine", "Urgent"],
  },
  {
    id: 2,
    nom: "Marie Martin",
    initiales: "MM",
    numero: "06 23 45 67 89",
    sujet: "Devis pour rénovation salle de bain",
    moment: "il y a 2h",
    statut: "Traité",
    urgence: false,
    tags: ["Devis", "SDB"],
  },
  {
    id: 3,
    nom: "Paul Bernard",
    initiales: "PB",
    numero: "06 34 56 78 90",
    sujet: "Chauffe-eau en panne, plus d'eau chaude",
    moment: "il y a 3h",
    statut: "En attente",
    urgence: true,
    tags: ["Chauffe-eau", "Urgent"],
  },
  {
    id: 4,
    nom: "Sophie Leroy",
    initiales: "SL",
    numero: "06 45 67 89 01",
    sujet: "Entretien annuel chaudière",
    moment: "il y a 5h",
    statut: "Traité",
    urgence: false,
    tags: ["Entretien", "Chaudière"],
  },
  {
    id: 5,
    nom: "Thomas Petit",
    initiales: "TP",
    numero: "06 56 78 90 12",
    sujet: "Débouchage évier bouché",
    moment: "hier",
    statut: "Traité",
    urgence: false,
    tags: ["Débouchage"],
  },
  {
    id: 6,
    nom: "Émilie Roux",
    initiales: "ER",
    numero: "06 67 89 01 23",
    sujet: "Recherche de fuite, tache au plafond",
    moment: "hier",
    statut: "Sans réponse",
    urgence: false,
    tags: ["Recherche fuite"],
  },
];

const stats = [
  { icone: Inbox, fond: "bg-blue-50", couleur: "text-blue-500", chiffre: "42", libelle: "Total", contexte: "depuis le début" },
  { icone: PhoneMissed, fond: "bg-red-50", couleur: "text-red-500", chiffre: "3", libelle: "Urgentes", contexte: "à traiter" },
  { icone: Clock, fond: "bg-amber-50", couleur: "text-amber-500", chiffre: "8", libelle: "En attente", contexte: "sans réponse" },
  { icone: Check, fond: "bg-emerald-50", couleur: "text-emerald-500", chiffre: "31", libelle: "Traitées", contexte: "ce mois" },
];

export default function DemandesPage() {
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [urgence, setUrgence] = useState("Toutes");
  const [statut, setStatut] = useState("Toutes");

  const demandesFiltrees = demandes.filter((demande) => {
    const terme = recherche.trim().toLowerCase();
    const correspondTexte =
      terme.length === 0 ||
      demande.nom.toLowerCase().includes(terme) ||
      demande.numero.toLowerCase().includes(terme) ||
      demande.sujet.toLowerCase().includes(terme);

    const correspondUrgence =
      urgence === "Toutes" ||
      (urgence === "Urgentes" && demande.urgence) ||
      (urgence === "Normales" && !demande.urgence);

    const correspondStatut = statut === "Toutes" || demande.statut === statut;

    return correspondTexte && correspondUrgence && correspondStatut;
  });

  return (
    <AppLayout>
      <div className="w-full">
        {/* ZONE 1 — EN-TÊTE */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Demandes</h1>
            <p className="text-sm text-slate-500 mt-1">
              Tous les appels manqués capturés par votre assistant.
            </p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle demande</span>
          </button>
        </div>

        {/* ZONE 2 — STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icone = stat.icone;
            return (
              <div
                key={stat.libelle}
                className="bg-white border border-slate-200 rounded-xl p-5 relative"
              >
                <span
                  className={`absolute top-5 right-5 w-10 h-10 rounded-lg ${stat.fond} flex items-center justify-center`}
                >
                  <Icone className={`w-5 h-5 ${stat.couleur}`} />
                </span>
                <p className="text-3xl font-bold text-slate-900">{stat.chiffre}</p>
                <p className="text-sm text-slate-600 mt-1">{stat.libelle}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.contexte}</p>
              </div>
            );
          })}
        </div>

        {/* ZONE 3 — FILTRES */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
              placeholder="Rechercher un client ou un numéro..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <select
            value={urgence}
            onChange={(event) => setUrgence(event.target.value)}
            aria-label="Filtrer par urgence"
            className="w-full md:w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="Toutes">Toutes les urgences</option>
            <option value="Urgentes">Urgentes</option>
            <option value="Normales">Normales</option>
          </select>

          <select
            value={statut}
            onChange={(event) => setStatut(event.target.value)}
            aria-label="Filtrer par statut"
            className="w-full md:w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="Toutes">Tous les statuts</option>
            <option value="Nouveau">Nouvelles</option>
            <option value="En attente">En attente</option>
            <option value="Traité">Traitées</option>
          </select>

          <button className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>

        {/* ZONE 4 — LISTE */}
        <div className="space-y-3">
          {demandesFiltrees.map((demande) => (
            <div
              key={demande.id}
              onClick={() => router.push("/messages")}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${
                    demande.urgence ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {demande.initiales}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 truncate">
                      {demande.nom}
                    </span>
                    {demande.urgence && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 font-mono">{demande.numero}</p>
                  <p className="mt-2 text-sm text-slate-700">{demande.sujet}</p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400">{demande.moment}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${stylesStatut[demande.statut]}`}
                  >
                    {demande.statut}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                {demande.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors">
                  Voir la conversation
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button className="border border-slate-200 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Appeler
                </button>
              </div>
            </div>
          ))}

          {demandesFiltrees.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <span className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6 text-slate-400" />
              </span>
              <p className="mt-4 text-base font-bold text-slate-900">
                Aucune demande pour l&apos;instant
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Vos appels manqués apparaîtront ici.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}