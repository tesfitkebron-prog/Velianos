"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatWindow } from "./ChatWindow";

type Auteur = "client" | "assistant" | "vous";

type Message = {
  id: number;
  auteur: Auteur;
  texte: string;
  heure: string;
};

type Conversation = {
  id: number;
  nom: string;
  initiale: string;
  telephone: string;
  dernierMessage: string;
  heure: string;
  nonLus: number;
  messages: Message[];
};

const conversationsMock: Conversation[] = [
  {
    id: 1,
    nom: "M. Dupont",
    initiale: "MD",
    telephone: "06 12 34 56 78",
    dernierMessage: "Merci, j'attends votre appel",
    heure: "14:32",
    nonLus: 2,
    messages: [
      { id: 1, auteur: "client", texte: "Bonjour, j'ai une fuite sous mon évier.", heure: "14:28" },
      { id: 2, auteur: "assistant", texte: "Bonjour ! Je transmets votre demande à M. Martin, il vous rappelle dans les 30 min.", heure: "14:29" },
      { id: 3, auteur: "client", texte: "C'est urgent, l'eau coule partout.", heure: "14:30" },
      { id: 4, auteur: "assistant", texte: "Noté, je le préviens de l'urgence. Il vous rappelle immédiatement.", heure: "14:31" },
      { id: 5, auteur: "client", texte: "Merci, j'attends votre appel", heure: "14:32" },
    ],
  },
  {
    id: 2,
    nom: "Mme Martin",
    initiale: "MM",
    telephone: "06 23 45 67 89",
    dernierMessage: "Le chauffe-eau ne chauffe plus",
    heure: "11:15",
    nonLus: 0,
    messages: [
      { id: 1, auteur: "client", texte: "Mon chauffe-eau ne chauffe plus du tout.", heure: "11:10" },
      { id: 2, auteur: "assistant", texte: "Je transmets à M. Martin pour une intervention rapide. Disponible quand ?", heure: "11:12" },
      { id: 3, auteur: "client", texte: "Demain matin si possible", heure: "11:15" },
    ],
  },
  {
    id: 3,
    nom: "M. Bernard",
    initiale: "MB",
    telephone: "06 34 56 78 90",
    dernierMessage: "Évier bouché depuis hier",
    heure: "09:45",
    nonLus: 1,
    messages: [
      { id: 1, auteur: "client", texte: "Mon évier est bouché depuis hier soir.", heure: "09:40" },
      { id: 2, auteur: "assistant", texte: "D'accord, je note. M. Martin vous rappelle pour fixer un RDV.", heure: "09:43" },
      { id: 3, auteur: "client", texte: "Ok merci", heure: "09:45" },
    ],
  },
];

export default function MessagesPage() {
  return (
    <AppLayout>
      <MessagesContent />
    </AppLayout>
  );
}

function MessagesContent() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isAssistantActive, setIsAssistantActive] = useState(true);
  const [enTrainDEcrire, setEnTrainDEcrire] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatMessages(selectedConversation?.messages ?? []);
    setIsAssistantActive(true);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, enTrainDEcrire]);

  const conversationsFiltrees = conversationsMock.filter((conv) =>
    conv.nom.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const envoyerMessage = () => {
    const texte = chatInput.trim();
    if (!texte || !selectedConversation) return;

    setIsAssistantActive(false);
    const nouveau: Message = {
      id: Date.now(),
      auteur: "vous",
      texte,
      heure: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, nouveau]);
    setChatInput("");
    setEnTrainDEcrire(true);

    setTimeout(() => {
      setEnTrainDEcrire(false);
      setIsAssistantActive(true);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          auteur: "assistant",
          texte: "C'est noté. Je transmets l'information à Karim.",
          heure: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1100);
  };

  return (
    <div className="h-full min-h-0 flex lg:gap-4">
      {/* LISTE DES CONVERSATIONS */}
      <aside
        className={`${ selectedConversation ? "hidden lg:flex" : "flex" } w-full lg:w-80 flex-shrink-0 flex-col bg-white lg:rounded-2xl lg:border lg:border-slate-200 overflow-hidden min-h-0`}
      >
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between px-0.5 mb-3">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Discussions
            </h1>
            <span className="text-[11px] font-semibold text-slate-400">
              3 conversations
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client"
              className="w-full h-11 pl-9 pr-3 rounded-full bg-slate-100 border border-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100">
          {conversationsFiltrees.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors active:bg-slate-50 ${
                selectedConversation?.id === conv.id ? "md:bg-emerald-50/60" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                  {conv.initiale}
                </div>
                {conv.nonLus > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00D26A] border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={`text-sm truncate ${
                      conv.nonLus > 0
                        ? "font-bold text-slate-900"
                        : "font-semibold text-slate-800"
                    }`}
                  >
                    {conv.nom}
                  </p>
                  <span
                    className={`text-[11px] flex-shrink-0 ${
                      conv.nonLus > 0
                        ? "font-semibold text-[#00A857]"
                        : "text-slate-400"
                    }`}
                  >
                    {conv.heure}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-slate-500 truncate">
                    {conv.dernierMessage}
                  </p>
                  {conv.nonLus > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#00D26A] text-slate-900 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {conv.nonLus}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {conversationsFiltrees.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              Aucune conversation trouvée.
            </p>
          )}
        </div>
      </aside>

      {/* CHAT */}
      <section
        className={`${
          selectedConversation ? "flex" : "hidden lg:flex"
        } flex-1 flex-col min-w-0 min-h-0 bg-white lg:rounded-2xl lg:border lg:border-slate-200 overflow-hidden`}
      >
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isAssistantActive={isAssistantActive}
            onSendMessage={envoyerMessage}
            messagesEndRef={messagesEndRef}
            onBack={() => setSelectedConversation(null)}
            isMobile={true}
            enTrainDEcrire={enTrainDEcrire}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Sélectionnez une conversation
            </p>
            <p className="text-xs mt-1 text-center">
              Vos échanges SMS avec les clients apparaissent ici.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
