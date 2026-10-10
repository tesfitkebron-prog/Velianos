"use client";

import { useState } from "react";
import {
  Search,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  ExternalLink,
  Check,
  ArrowLeft,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

type Statut = "Urgent" | "RDV pris" | "Devis" | "En attente";

type Evenement = {
  couleur: string;
  texte: string;
  heure: string;
};

type Client = {
  id: number;
  nom: string;
  initiales: string;
  numero: string;
  email: string;
  sujet: string;
  statut: Statut;
  nouveau: boolean;
  urgence: boolean;
  niveauUrgence: string;
  adresse: string;
  codePostal: string;
  disponibilite: string;
  creneau: string;
  description: string;
  tags: { texte: string; style: "blue" | "red" }[];
  moment: string;
  historique: Evenement[];
};

const stylesStatut: Record<Statut, string> = {
  Urgent: "bg-red-500 text-white",
  "RDV pris": "bg-emerald-500 text-white",
  Devis: "bg-blue-500 text-white",
  "En attente": "bg-slate-200 text-slate-600",
};

const clients: Client[] = [
  {
    id: 1,
    nom: "Jean Dupont",
    initiales: "JD",
    numero: "06 12 34 56 78",
    email: "jean.dupont@email.fr",
    sujet: "Fuite évier",
    statut: "Urgent",
    nouveau: true,
    urgence: true,
    niveauUrgence: "Élevée",
    adresse: "12 rue Gambetta",
    codePostal: "69003 Lyon 3e",
    disponibilite: "Aujourd'hui",
    creneau: "Après 14h",
    description:
      "Fuite sous l'évier de la cuisine, eau qui coule en continu depuis ce matin. Risque d'inondation dans l'appartement en dessous.",
    tags: [
      { texte: "Fuite d'eau", style: "blue" },
      { texte: "Cuisine", style: "blue" },
      { texte: "Urgent", style: "red" },
    ],
    moment: "il y a 5 minutes",
    historique: [
      { couleur: "bg-blue-500", texte: "Jean Dupont a appelé (appel manqué)", heure: "Aujourd'hui 14h02" },
      { couleur: "bg-emerald-500", texte: "Assistant : SMS automatique envoyé", heure: "Aujourd'hui 14h02" },
      { couleur: "bg-blue-500", texte: "Client : « Fuite sous mon évier »", heure: "Aujourd'hui 14h03" },
      { couleur: "bg-emerald-500", texte: "Assistant : adresse récupérée (12 rue Gambetta)", heure: "Aujourd'hui 14h04" },
      { couleur: "bg-amber-500", texte: "En attente de votre rappel", heure: "Aujourd'hui 14h05" },
    ],
  },
  {
    id: 2,
    nom: "Marie Martin",
    initiales: "MM",
    numero: "06 23 45 67 89",
    email: "marie.martin@email.fr",
    sujet: "Devis salle de bain",
    statut: "Devis",
    nouveau: true,
    urgence: false,
    niveauUrgence: "Standard",
    adresse: "45 cours Lafayette",
    codePostal: "69006 Lyon 6e",
    disponibilite: "Cette semaine",
    creneau: "Matin",
    description:
      "Demande de devis pour une rénovation complète de salle de bain de 6 m² avec douche italienne et nouveau meuble vasque.",
    tags: [
      { texte: "Salle de bain", style: "blue" },
      { texte: "Devis", style: "blue" },
    ],
    moment: "il y a 2 heures",
    historique: [
      { couleur: "bg-blue-500", texte: "Marie Martin a envoyé un SMS", heure: "Aujourd'hui 12h18" },
      { couleur: "bg-emerald-500", texte: "Assistant : informations projet collectées", heure: "Aujourd'hui 12h19" },
      { couleur: "bg-amber-500", texte: "Devis à chiffrer", heure: "Aujourd'hui 12h20" },
    ],
  },
  {
    id: 3,
    nom: "Paul Bernard",
    initiales: "PB",
    numero: "06 34 56 78 90",
    email: "paul.bernard@email.fr",
    sujet: "Chauffe-eau en panne",
    statut: "Urgent",
    nouveau: true,
    urgence: true,
    niveauUrgence: "Élevée",
    adresse: "8 rue Victor Hugo",
    codePostal: "69100 Villeurbanne",
    disponibilite: "Aujourd'hui",
    creneau: "Dès que possible",
    description:
      "Chauffe-eau électrique de 200 litres hors service après un bruit inhabituel. Plus d'eau chaude depuis hier soir.",
    tags: [
      { texte: "Chauffe-eau", style: "blue" },
      { texte: "Panne", style: "blue" },
      { texte: "Urgent", style: "red" },
    ],
    moment: "il y a 3 heures",
    historique: [
      { couleur: "bg-blue-500", texte: "Paul Bernard a appelé (appel manqué)", heure: "Aujourd'hui 09h15" },
      { couleur: "bg-emerald-500", texte: "Assistant : SMS automatique envoyé", heure: "Aujourd'hui 09h15" },
      { couleur: "bg-blue-500", texte: "Client : « Le chauffe-eau est complètement mort »", heure: "Aujourd'hui 09h18" },
      { couleur: "bg-amber-500", texte: "Diagnostic à planifier", heure: "Aujourd'hui 09h20" },
    ],
  },
  {
    id: 4,
    nom: "Sophie Leroy",
    initiales: "SL",
    numero: "06 45 67 89 01",
    email: "sophie.leroy@email.fr",
    sujet: "Entretien chaudière",
    statut: "RDV pris",
    nouveau: false,
    urgence: false,
    niveauUrgence: "Standard",
    adresse: "21 montée de la Grande Côte",
    codePostal: "69001 Lyon 1er",
    disponibilite: "Demain",
    creneau: "Matin 9h",
    description:
      "Entretien annuel de la chaudière gaz, contrat à jour. Intervention préventive avant l'hiver.",
    tags: [
      { texte: "Chaudière", style: "blue" },
      { texte: "Entretien", style: "blue" },
    ],
    moment: "il y a 5 heures",
    historique: [
      { couleur: "bg-blue-500", texte: "Sophie Leroy a demandé un entretien", heure: "Aujourd'hui 08h10" },
      { couleur: "bg-emerald-500", texte: "Assistant : créneau confirmé demain 9h", heure: "Aujourd'hui 08h12" },
      { couleur: "bg-emerald-500", texte: "Rendez-vous confirmé", heure: "Aujourd'hui 08h12" },
    ],
  },
  {
    id: 5,
    nom: "Thomas Petit",
    initiales: "TP",
    numero: "06 56 78 90 12",
    email: "thomas.petit@email.fr",
    sujet: "Débouchage",
    statut: "RDV pris",
    nouveau: false,
    urgence: false,
    niveauUrgence: "Faible",
    adresse: "3 impasse des Lilas",
    codePostal: "69230 Caluire-et-Cuire",
    disponibilite: "Aujourd'hui",
    creneau: "17h",
    description:
      "Évier de cuisine bouché, eau stagnante depuis deux jours. Débouchage mécanique attendu.",
    tags: [
      { texte: "Débouchage", style: "blue" },
      { texte: "Cuisine", style: "blue" },
    ],
    moment: "hier 16h05",
    historique: [
      { couleur: "bg-blue-500", texte: "Thomas Petit a signalé un évier bouché", heure: "Hier 16h02" },
      { couleur: "bg-emerald-500", texte: "Assistant : intervention confirmée 17h", heure: "Hier 16h03" },
      { couleur: "bg-emerald-500", texte: "Client : « Super, merci beaucoup »", heure: "Hier 16h05" },
    ],
  },
  {
    id: 6,
    nom: "Émilie Roux",
    initiales: "ER",
    numero: "06 67 89 01 23",
    email: "emilie.roux@email.fr",
    sujet: "Recherche fuite",
    statut: "En attente",
    nouveau: false,
    urgence: false,
    niveauUrgence: "À vérifier",
    adresse: "17 quai Saint-Vincent",
    codePostal: "69001 Lyon 1er",
    disponibilite: "À confirmer",
    creneau: "Selon disponibilité",
    description:
      "Suspicion de fuite dans une chasse d'eau. Le client n'a pas encore confirmé un créneau d'intervention.",
    tags: [
      { texte: "Fuite", style: "blue" },
      { texte: "À qualifier", style: "red" },
    ],
    moment: "il y a 6 heures",
    historique: [
      { couleur: "bg-blue-500", texte: "Émilie Roux a envoyé un SMS", heure: "Aujourd'hui 07h45" },
      { couleur: "bg-amber-500", texte: "Créneau à confirmer avec la cliente", heure: "Aujourd'hui 07h47" },
    ],
  },
];

type Filtre = "Tous" | "Récents" | "Avec RDV";

export default function ClientsPage() {
  const [selectedId, setSelectedId] = useState(1);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("Tous");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [traites, setTraites] = useState<number[]>([]);
  const [vueMobile, setVueMobile] = useState<"liste" | "fiche">("liste");

  const client = clients.find((item) => item.id === selectedId) ?? clients[0];

  const clientsFiltres = clients.filter((item) => {
    if (filtre === "Récents" && !item.nouveau) return false;
    if (filtre === "Avec RDV" && item.statut !== "RDV pris") return false;

    const terme = recherche.trim().toLowerCase();
    if (!terme) return true;

    return (
      item.nom.toLowerCase().includes(terme) ||
      item.numero.toLowerCase().includes(terme) ||
      item.sujet.toLowerCase().includes(terme)
    );
  });

  const selectionner = (id: number) => {
    setSelectedId(id);
    setVueMobile("fiche");
  };

  const marquerTraite = () => {
    setTraites((precedents) =>
      precedents.includes(client.id) ? precedents : [...precedents, client.id],
    );
  };

  /* ---------------------------- LISTE (GAUCHE) ---------------------------- */
  const liste = (
    <div className="bg-white border border-slate-200 rounded-xl h-full flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900">Clients</h1>
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            {clients.length}
          </span>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Rechercher un client..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="px-5 py-3 border-b border-slate-200 flex gap-2">
        {(["Tous", "Récents", "Avec RDV"] as Filtre[]).map((option) => (
          <button
            key={option}
            onClick={() => setFiltre(option)}
            className={`text-xs font-medium px-3 py-1 rounded-full transition ${
              filtre === option
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {clientsFiltres.map((item) => {
          const actif = item.id === client.id;

          return (
            <button
              key={item.id}
              onClick={() => selectionner(item.id)}
              className={`w-full text-left p-4 border-b border-slate-100 transition-colors ${
                actif
                  ? "bg-slate-50 border-l-4 border-l-emerald-500"
                  : "bg-white border-l-4 border-l-transparent hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    item.urgence ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.initiales}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-slate-900 truncate">
                    {item.nom}
                  </span>
                  <span className="block text-xs text-slate-500 font-mono">{item.numero}</span>
                </span>
                {item.nouveau && !traites.includes(item.id) && (
                  <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500 truncate">{item.sujet}</p>

              <div className="mt-2">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${stylesStatut[traites.includes(item.id) ? "En attente" : item.statut]}`}
                >
                  {traites.includes(item.id) ? "Traité" : item.statut}
                </span>
              </div>
            </button>
          );
        })}

        {clientsFiltres.length === 0 && (
          <p className="p-6 text-center text-xs text-slate-400">Aucun client trouvé.</p>
        )}
      </div>
    </div>
  );

  /* ---------------------------- FICHE (DROITE) ---------------------------- */
  const fiche = (
    <div className="flex flex-col min-w-0">
      {/* ZONE 1 — EN-TÊTE */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
              {client.initiales}
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-slate-900">{client.nom}</h2>
              <p className="text-sm text-slate-500 font-mono mt-1">{client.numero}</p>
              <p className="text-sm text-slate-500 mt-0.5">{client.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {client.urgence && (
              <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg animate-pulse text-center">
                🚨 URGENT
              </span>
            )}
            <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Phone className="w-4 h-4" />
              Appeler
            </button>
          </div>
        </div>
      </div>

      {/* ZONE 2 — 3 CARTES D'INFOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="p-5 rounded-xl bg-red-50 border-2 border-red-200">
          <p className="text-xs font-bold text-red-700 tracking-wide uppercase">Urgence</p>
          <AlertCircle className="w-5 h-5 text-red-600 mt-2" />
          <p className="text-2xl font-bold text-red-900 mt-1">{client.niveauUrgence}</p>
        </div>

        <div className="p-5 rounded-xl bg-blue-50 border-2 border-blue-200">
          <p className="text-xs font-bold text-blue-700 tracking-wide uppercase">Adresse</p>
          <MapPin className="w-5 h-5 text-blue-600 mt-2" />
          <p className="text-base font-bold text-blue-900 mt-1">{client.adresse}</p>
          <p className="text-sm text-blue-700 mt-0.5">{client.codePostal}</p>
          <button className="mt-3 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            Ouvrir Maps
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-200">
          <p className="text-xs font-bold text-amber-700 tracking-wide uppercase">
            Disponibilité
          </p>
          <Clock className="w-5 h-5 text-amber-600 mt-2" />
          <p className="text-base font-bold text-amber-900 mt-1">{client.disponibilite}</p>
          <p className="text-sm text-amber-700 mt-0.5">{client.creneau}</p>
        </div>
      </div>

      {/* ZONE 3 — DÉTAIL DE LA DEMANDE */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-1 h-5 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-bold text-slate-900">Détail de la demande</h3>
          <span className="text-sm text-slate-500 ml-auto">{client.moment}</span>
        </div>
        <p className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed">
          {client.description}
        </p>
        <div className="mt-4 flex gap-2 flex-wrap">
          {client.tags.map((tag) => (
            <span
              key={tag.texte}
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                tag.style === "red"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {tag.texte}
            </span>
          ))}
        </div>
      </div>

      {/* ZONE 4 — HISTORIQUE */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-1 h-5 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-bold text-slate-900">Historique</h3>
        </div>

        <div className="mt-4 space-y-4">
          {client.historique.map((evenement, index) => (
            <div key={`${client.id}-${index}`} className="flex gap-4">
              <span className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${evenement.couleur}`} />
              <div className="flex-1">
                <p className="text-sm text-slate-700">{evenement.texte}</p>
                <p className="text-xs text-slate-400 mt-1">{evenement.heure}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ZONE 5 — NOTES */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-1 h-5 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-bold text-slate-900">Notes</h3>
        </div>
        <textarea
          value={notes[client.id] ?? ""}
          onChange={(event) => setNotes((precedentes) => ({ ...precedentes, [client.id]: event.target.value }))}
          rows={3}
          placeholder="Ajoutez une note sur ce client..."
          className="mt-4 w-full p-4 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
      </div>

      {/* ZONE 6 — ACTIONS */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 rounded-b-xl flex gap-3">
        <button
          onClick={marquerTraite}
          className={`flex-1 font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            traites.includes(client.id)
              ? "bg-slate-200 text-slate-600"
              : "bg-emerald-500 hover:bg-emerald-600 text-slate-900"
          }`}
        >
          <Check className="w-4 h-4" />
          {traites.includes(client.id) ? "Déjà traité" : "Marquer comme traité"}
        </button>
        <button className="flex-1 border border-slate-200 text-slate-700 font-medium px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors">
          Créer un devis
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-4 lg:hidden">
        <button
          onClick={() => setVueMobile("liste")}
          className={`items-center gap-2 text-sm text-slate-600 ${vueMobile === "fiche" ? "flex" : "hidden"}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] gap-4 items-start">
        <div className={`lg:block ${vueMobile === "liste" ? "block" : "hidden"} lg:h-[calc(100vh-9rem)]`}>
          {liste}
        </div>
        <div className={`${vueMobile === "fiche" ? "block" : "hidden"} lg:block min-w-0`}>
          {fiche}
        </div>
      </div>
    </AppLayout>
  );
}