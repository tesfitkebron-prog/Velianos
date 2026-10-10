"use client";

import { useState } from "react";
import {
  Search,
  Phone,
  PhoneMissed,
  MoreVertical,
  Send,
  Sparkles,
  MapPin,
  Check,
  ArrowLeft,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

type Auteur = "systeme" | "client" | "assistant" | "vous";
type Statut = "Nouveau" | "Urgent" | "RDV pris" | "Terminé";

type Message = {
  id: number;
  auteur: Auteur;
  texte: string;
  heure: string;
};

type Conversation = {
  id: number;
  nom: string;
  initiales: string;
  numero: string;
  moment: string;
  dernierMessage: string;
  statut: Statut;
  urgence: boolean;
  messages: Message[];
};

const conversationsInitiales: Conversation[] = [
  {
    id: 1,
    nom: "Jean Dupont",
    initiales: "JD",
    numero: "06 12 34 56 78",
    moment: "il y a 5 min",
    dernierMessage: "Oui c'est urgent, l'eau coule en continu",
    statut: "Nouveau",
    urgence: true,
    messages: [
      {
        id: 1,
        auteur: "systeme",
        texte: "10 Octobre 2026 à 14h02 - Appel manqué sur votre mobile",
        heure: "14h02",
      },
      {
        id: 2,
        auteur: "client",
        texte: "Bonjour, j'ai une fuite sous mon évier",
        heure: "14h02",
      },
      {
        id: 3,
        auteur: "assistant",
        texte: "Bonjour, je suis l'assistant de Plomberie Martin. Depuis quand avez-vous cette fuite ?",
        heure: "14h02",
      },
      {
        id: 4,
        auteur: "client",
        texte: "Depuis ce matin, ça coule en continu",
        heure: "14h03",
      },
      {
        id: 5,
        auteur: "assistant",
        texte: "Pouvez-vous me donner votre adresse ?",
        heure: "14h03",
      },
      {
        id: 6,
        auteur: "client",
        texte: "12 rue Gambetta, Lyon 3e",
        heure: "14h04",
      },
      {
        id: 7,
        auteur: "assistant",
        texte: "Merci. Karim vous rappelle dans 30 minutes. En attendant, coupez l'eau au robinet d'arrêt.",
        heure: "14h04",
      },
      {
        id: 8,
        auteur: "client",
        texte: "Oui c'est urgent, l'eau coule en continu",
        heure: "14h05",
      },
    ],
  },
  {
    id: 2,
    nom: "Marie Martin",
    initiales: "MM",
    numero: "06 23 45 67 89",
    moment: "il y a 2h",
    dernierMessage: "Parfait, à demain 10h",
    statut: "RDV pris",
    urgence: false,
    messages: [
      { id: 1, auteur: "client", texte: "Mon chauffe-eau ne fonctionne plus.", heure: "09h12" },
      {
        id: 2,
        auteur: "assistant",
        texte: "Bonjour, je transmets la demande. Un créneau demain 10h vous conviendrait-il ?",
        heure: "09h13",
      },
      { id: 3, auteur: "client", texte: "Parfait, à demain 10h", heure: "09h14" },
    ],
  },
  {
    id: 3,
    nom: "Paul Bernard",
    initiales: "PB",
    numero: "06 34 56 78 90",
    moment: "il y a 3h",
    dernierMessage: "Le chauffe-eau est complètement mort",
    statut: "Urgent",
    urgence: true,
    messages: [
      { id: 1, auteur: "client", texte: "Le chauffe-eau est complètement mort", heure: "08h41" },
      {
        id: 2,
        auteur: "assistant",
        texte: "Je comprends. Pouvez-vous me préciser s'il est électrique ou gaz ?",
        heure: "08h42",
      },
      { id: 3, auteur: "client", texte: "Électrique, 200 litres.", heure: "08h44" },
    ],
  },
  {
    id: 4,
    nom: "Sophie Leroy",
    initiales: "SL",
    numero: "06 45 67 89 01",
    moment: "il y a 5h",
    dernierMessage: "Merci, à tout à l'heure",
    statut: "RDV pris",
    urgence: false,
    messages: [
      { id: 1, auteur: "assistant", texte: "Bonjour Sophie, votre entretien de chaudière est prévu demain 9h.", heure: "10h02" },
      { id: 2, auteur: "client", texte: "Merci, à tout à l'heure", heure: "10h05" },
    ],
  },
  {
    id: 5,
    nom: "Thomas Petit",
    initiales: "TP",
    numero: "06 56 78 90 12",
    moment: "hier",
    dernierMessage: "Super, merci beaucoup",
    statut: "Terminé",
    urgence: false,
    messages: [
      { id: 1, auteur: "client", texte: "Mon évier est bouché.", heure: "hier 16h02" },
      {
        id: 2,
        auteur: "assistant",
        texte: "Bonjour, intervention prévue aujourd'hui à 17h.",
        heure: "hier 16h03",
      },
      { id: 3, auteur: "client", texte: "Super, merci beaucoup", heure: "hier 16h05" },
    ],
  },
];

const stylesStatut: Record<Statut, string> = {
  Nouveau: "bg-red-500 text-white",
  Urgent: "bg-amber-500 text-white",
  "RDV pris": "bg-emerald-500 text-white",
  "Terminé": "bg-slate-200 text-slate-600",
};

type Filtre = "Toutes" | "Non lues" | "Urgentes";

export default function MessagesPage() {
  const [conversations, setConversations] = useState(conversationsInitiales);
  const [selectedId, setSelectedId] = useState(1);
  const [filtre, setFiltre] = useState<Filtre>("Toutes");
  const [recherche, setRecherche] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [modeManuel, setModeManuel] = useState(false);
  const [drawerIA, setDrawerIA] = useState(false);
  const [vueMobile, setVueMobile] = useState<"liste" | "chat">("liste");

  const active =
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0];

  const conversationsFiltrees = conversations.filter((conversation) => {
    if (filtre === "Non lues" && conversation.statut !== "Nouveau") return false;
    if (filtre === "Urgentes" && !conversation.urgence) return false;

    const terme = recherche.trim().toLowerCase();
    if (!terme) return true;

    return (
      conversation.nom.toLowerCase().includes(terme) ||
      conversation.numero.toLowerCase().includes(terme) ||
      conversation.dernierMessage.toLowerCase().includes(terme)
    );
  });

  const selectionner = (id: number) => {
    setSelectedId(id);
    setModeManuel(false);
    setVueMobile("chat");
  };

  const envoyer = () => {
    const texte = messageInput.trim();
    if (!texte) return;

    const heure = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    setConversations((precedentes) =>
      precedentes.map((conversation) =>
        conversation.id === active.id
          ? {
              ...conversation,
              dernierMessage: texte,
              moment: "à l'instant",
              messages: [
                ...conversation.messages,
                { id: Date.now(), auteur: "vous", texte, heure },
              ],
            }
          : conversation,
      ),
    );

    setMessageInput("");
    setModeManuel(true);
  };

  const cloturer = () => {
    setConversations((precedentes) =>
      precedentes.map((conversation) =>
        conversation.id === active.id ? { ...conversation, statut: "Terminé" } : conversation,
      ),
    );
  };

  /* ------------------------------ COLONNE A ------------------------------ */
  const listeConversations = (
    <div className="w-full lg:w-80 lg:flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full min-w-0">
      <div className="p-5 border-b border-slate-200 flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-900">Conversations</h2>
        <div className="relative mt-4">
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

      <div className="flex gap-3 px-5 pb-4 border-b border-slate-200 flex-shrink-0">
        {(["Toutes", "Non lues", "Urgentes"] as Filtre[]).map((option) => (
          <button
            key={option}
            onClick={() => setFiltre(option)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${
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
        {conversationsFiltrees.map((conversation) => {
          const selectionnee = conversation.id === active.id;

          return (
            <button
              key={conversation.id}
              onClick={() => selectionner(conversation.id)}
              className={`w-full text-left p-4 border-b border-slate-100 transition-colors ${
                selectionnee
                  ? "bg-white border-l-4 border-l-emerald-500"
                  : "bg-white border-l-4 border-l-transparent hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    conversation.urgence ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {conversation.initiales}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {conversation.nom}
                    </span>
                    <span className="text-xs text-slate-500 font-mono truncate">
                      {conversation.numero}
                    </span>
                  </span>
                </span>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {conversation.moment}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-500 truncate">{conversation.dernierMessage}</p>

              <div className="mt-3 flex gap-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${stylesStatut[conversation.statut]}`}
                >
                  {conversation.statut}
                </span>
              </div>
            </button>
          );
        })}

        {conversationsFiltrees.length === 0 && (
          <p className="p-6 text-center text-xs text-slate-400">
            Aucune conversation trouvée.
          </p>
        )}
      </div>
    </div>
  );

  /* ------------------------------ COLONNE B ------------------------------ */
  const chatActif = (
    <div className="w-full lg:flex-1 bg-slate-50 flex flex-col h-full min-w-0">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setVueMobile("liste")}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 flex-shrink-0"
            aria-label="Retour à la liste"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
              active.urgence ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
            }`}
          >
            {active.initiales}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{active.nom}</p>
            <p className="text-xs text-slate-500 font-mono truncate">{active.numero}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                modeManuel ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            {modeManuel ? "Mode manuel" : "Assistant IA actif"}
          </span>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Appeler"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Plus d'options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDrawerIA(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
            aria-label="Extrait par l'IA"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center gap-2 flex-shrink-0">
        <PhoneMissed className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-xs text-amber-800 font-medium">
          Appel manqué à 14h02 — l&apos;assistant a pris le relais
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        {active.messages.map((message) => {
          if (message.auteur === "systeme") {
            return (
              <p
                key={message.id}
                className="p-2 text-center text-xs text-slate-400 italic"
              >
                {message.texte}
              </p>
            );
          }

          const libelles = {
            client: "Client",
            assistant: "Assistant Velianos",
            vous: "Vous",
          } as const;

          if (message.auteur === "client") {
            return (
              <div key={message.id} className="max-w-[75%]">
                <p className="text-[10px] text-slate-500 mb-1">{libelles.client}</p>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3">
                  <p className="text-sm text-slate-900">{message.texte}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{message.heure}</p>
                </div>
              </div>
            );
          }

          const estAssistant = message.auteur === "assistant";

          return (
            <div key={message.id} className="max-w-[75%] ml-auto">
              <p className="text-[10px] text-slate-500 mb-1 text-right">
                {libelles[message.auteur]}
              </p>
              <div
                className={`rounded-2xl rounded-tr-sm p-3 ${
                  estAssistant
                    ? "bg-slate-900 text-white"
                    : "bg-emerald-500 text-white"
                }`}
              >
                <p className="text-sm">{message.texte}</p>
                <p className="text-[10px] text-slate-400 mt-1 text-right">{message.heure}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") envoyer();
            }}
            placeholder="Tapez votre message pour reprendre la main..."
            className="flex-1 py-3.5 px-5 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <button
            onClick={envoyer}
            disabled={!messageInput.trim()}
            aria-label="Envoyer"
            className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 italic mt-2 text-center">
          L&apos;IA répond automatiquement. Dès que vous tapez, vous reprenez la main.
        </p>
      </div>
    </div>
  );

  /* ------------------------------ COLONNE C ------------------------------ */
  const extracteurIA = (
    <div className="w-full lg:w-96 lg:flex-shrink-0 bg-white border-l border-slate-200 flex flex-col h-full min-w-0">
      <div className="p-5 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900">Extrait par l&apos;IA</h2>
          <button
            onClick={() => setDrawerIA(false)}
            className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">Infos détectées dans la conversation</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="p-5 rounded-xl border border-red-200 border-l-2 border-l-emerald-500 bg-red-50">
          <p className="text-xs font-semibold text-red-700 tracking-wide uppercase">
            Objet de l&apos;intervention
          </p>
          <p className="text-base font-medium text-red-900 mt-3">
            🌊 Fuite d&apos;eau majeure (tuyau d&apos;évacuation rompu)
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 border-l-2 border-l-emerald-500 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            Adresse du chantier
          </p>
          <p className="text-base text-slate-900 mt-3">12 rue Gambetta, 69003 Lyon</p>
          <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <MapPin className="w-4 h-4" />
            Ouvrir dans Google Maps
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 border-l-2 border-l-emerald-500 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            Nom de l&apos;interlocuteur
          </p>
          <p className="text-base text-slate-900 mt-3">Monsieur Jean Dupont</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 border-l-2 border-l-emerald-500 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            Disponibilité
          </p>
          <p className="text-base text-slate-900 mt-3">Aujourd&apos;hui (urgent)</p>
        </div>
      </div>

      <div className="p-5 border-t border-slate-200 flex-shrink-0">
        <button
          onClick={cloturer}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Check className="w-5 h-5" />
          Dépannage planifié / Clôturer
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px-48px)] overflow-hidden -m-6">
        {/* DESKTOP : 3 colonnes — MOBILE : une seule à la fois */}
        <div className="hidden lg:flex w-full min-w-0">
          {listeConversations}
          {chatActif}
          {extracteurIA}
        </div>

        <div className="lg:hidden w-full min-w-0">
          {vueMobile === "liste" ? listeConversations : chatActif}
        </div>

        {/* DRAWER IA (mobile) */}
        {drawerIA && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-slate-950/50"
              onClick={() => setDrawerIA(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
              {extracteurIA}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}