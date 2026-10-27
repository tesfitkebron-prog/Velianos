"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ChevronRight, MessageSquare, Search, User } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { UndoToast, type ToastAction } from "@/components/ui/UndoToast";
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
  dernierAuteur: "assistant" | "vous";
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
    dernierAuteur: "assistant",
    messages: [
      {
        id: 1,
        auteur: "client",
        texte: "Bonjour, j'ai une fuite sous mon évier.",
        heure: "14:28",
      },
      {
        id: 2,
        auteur: "assistant",
        texte:
          "Bonjour ! Je transmets votre demande à M. Martin, il vous rappelle dans les 30 min.",
        heure: "14:29",
      },
      {
        id: 3,
        auteur: "client",
        texte: "C'est urgent, l'eau coule partout.",
        heure: "14:30",
      },
      {
        id: 4,
        auteur: "assistant",
        texte:
          "Noté, je le préviens de l'urgence. Il vous rappelle immédiatement.",
        heure: "14:31",
      },
      {
        id: 5,
        auteur: "client",
        texte: "Merci, j'attends votre appel",
        heure: "14:32",
      },
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
    dernierAuteur: "assistant",
    messages: [
      {
        id: 1,
        auteur: "client",
        texte: "Mon chauffe-eau ne chauffe plus du tout.",
        heure: "11:10",
      },
      {
        id: 2,
        auteur: "assistant",
        texte:
          "Je transmets à M. Martin pour une intervention rapide. Disponible quand ?",
        heure: "11:12",
      },
      {
        id: 3,
        auteur: "client",
        texte: "Demain matin si possible",
        heure: "11:15",
      },
    ],
  },
  {
    id: 3,
    nom: "M. Bernard",
    initiale: "MB",
    telephone: "06 34 56 78 90",
    dernierMessage: "Je passe demain à 9h.",
    heure: "09:50",
    nonLus: 0,
    dernierAuteur: "vous",
    messages: [
      {
        id: 1,
        auteur: "client",
        texte: "Mon évier est bouché depuis hier soir.",
        heure: "09:40",
      },
      {
        id: 2,
        auteur: "assistant",
        texte: "D'accord, je note. M. Martin vous rappelle pour fixer un RDV.",
        heure: "09:43",
      },
      {
        id: 3,
        auteur: "client",
        texte: "Ok merci",
        heure: "09:45",
      },
      {
        id: 4,
        auteur: "vous",
        texte: "Je passe demain à 9h.",
        heure: "09:50",
      },
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
  const [conversations, setConversations] =
    useState<Conversation[]>(conversationsMock);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isAssistantActive, setIsAssistantActive] = useState(true);
  const [undoToast, setUndoToast] = useState<ToastAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedConversation =
    selectedId === null
      ? null
      : conversations.find((conversation) => conversation.id === selectedId) ??
        null;

  useEffect(() => {
    const client = new URLSearchParams(window.location.search).get("client");
    if (!client) return;

    const conversation = conversationsMock.find(
      (item) => String(item.id) === client,
    );
    if (conversation) {
      setSelectedId(conversation.id);
      setChatMessages(conversation.messages);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );

  const conversationsFiltrees = conversations.filter((conversation) =>
    conversation.nom.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const showUndo = (message: string, onUndo?: () => void) => {
    setUndoToast({ message, onUndo });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoToast(null), 10000);
  };

  const ouvrirConversation = (conversation: Conversation) => {
    setSelectedId(conversation.id);
    setChatMessages(conversation.messages);
    setIsAssistantActive(true);
  };

  const fermerConversation = () => {
    setSelectedId(null);
    setChatMessages([]);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", "/messages");
    }
  };

  const envoyerMessage = () => {
    const texte = chatInput.trim();
    if (!texte || !selectedConversation) return;

    const conversation = selectedConversation;
    const heure = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const message: Message = {
      id: Date.now(),
      auteur: "vous",
      texte,
      heure,
    };

    setChatMessages((precedent) => [...precedent, message]);
    setChatInput("");
    setIsAssistantActive(false);
    setConversations((precedent) =>
      precedent.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              dernierMessage: texte,
              heure,
              dernierAuteur: "vous",
            }
          : item,
      ),
    );

    showUndo(`SMS envoyé à ${conversation.nom}.`, () => {
      setChatMessages((precedent) =>
        precedent.filter((item) => item.id !== message.id),
      );
      setChatInput(texte);
      setConversations((precedent) =>
        precedent.map((item) =>
          item.id === conversation.id
            ? {
                ...item,
                dernierMessage: conversation.dernierMessage,
                heure: conversation.heure,
                dernierAuteur: conversation.dernierAuteur,
              }
            : item,
        ),
      );
    });
  };

  return (
    <div className="h-full min-h-0 flex lg:gap-4">
      {/* LISTE DES CONVERSATIONS */}
      <aside
        className={`${
          selectedConversation ? "hidden lg:flex" : "flex"
        } w-full lg:w-80 flex-shrink-0 flex-col bg-white lg:rounded-2xl lg:border lg:border-slate-200 overflow-hidden min-h-0`}
      >
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher un client"
              className="w-full h-11 pl-9 pr-3 rounded-lg bg-slate-100 border border-transparent text-sm font-normal text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {conversationsFiltrees.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => ouvrirConversation(conversation)}
              className={`w-full px-4 py-4 flex items-center gap-3 text-left transition-colors border-b border-slate-100 active:bg-slate-50 ${
                selectedConversation?.id === conversation.id
                  ? "bg-slate-50"
                  : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {conversation.initiale}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={`text-sm truncate ${
                      conversation.nonLus > 0
                        ? "font-semibold text-[#0F172A]"
                        : "font-medium text-slate-700"
                    }`}
                  >
                    {conversation.nom}
                  </p>
                  <span
                    className={`text-[11px] flex-shrink-0 ${
                      conversation.nonLus > 0
                        ? "font-medium text-[#0F172A]"
                        : "font-normal text-slate-400"
                    }`}
                  >
                    {conversation.heure}
                  </span>
                </div>

                <p className="text-xs font-normal text-slate-500 truncate mt-0.5">
                  {conversation.dernierMessage}
                </p>

                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <span
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      conversation.dernierAuteur === "assistant"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {conversation.dernierAuteur === "assistant" ? (
                      <Bot className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    {conversation.dernierAuteur === "assistant"
                      ? "Assistant"
                      : "Vous"}
                  </span>
                  {conversation.nonLus > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-md bg-[#0F172A] text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                      {conversation.nonLus}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ))}

          {conversationsFiltrees.length === 0 && (
            <p className="px-4 py-10 text-center text-sm font-normal text-slate-500">
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
            chatInput={chatInput}
            setChatInput={setChatInput}
            isAssistantActive={isAssistantActive}
            onToggleAssistant={() => setIsAssistantActive((actif) => !actif)}
            onSendMessage={envoyerMessage}
            messagesEndRef={messagesEndRef}
            onBack={fermerConversation}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Sélectionnez une conversation
            </p>
            <p className="text-xs font-normal mt-1 text-center max-w-xs">
              Vous voyez qui a répondu : l&apos;assistant ou vous.
            </p>
          </div>
        )}
      </section>

      <UndoToast
        toast={undoToast}
        onClose={() => setUndoToast(null)}
        positionClass="bottom-[calc(9rem+env(safe-area-inset-bottom))] md:bottom-28"
      />
    </div>
  );
}
