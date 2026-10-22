"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowLeft,
  Phone,
  Settings,
  Paperclip,
  ArrowUp,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
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
    initiale: "D",
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
    initiale: "M",
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
    initiale: "B",
    telephone: "06 34 56 78 90",
    dernierMessage: "Évier bouché depuis hier",
    heure: "09:45",
    nonLus: 1,
    messages: [
      { id: 1, auteur: "client", texte: "Mon évier est bouché depuis hier soir.", heure: "09:40" },
      { id: 3, auteur: "assistant", texte: "D'accord, je note. M. Martin vous rappelle pour fixer un RDV.", heure: "09:43" },
      { id: 4, auteur: "client", texte: "Ok merci", heure: "09:45" },
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
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isAssistantActive, setIsAssistantActive] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation, chatInput]);

  const conversationsFiltrees = conversationsMock.filter((c) =>
    c.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [chatMessages, setChatMessages] = useState<Message[]>(selectedConversation?.messages || []);

  useEffect(() => {
    setChatMessages(selectedConversation?.messages || []);
  }, [selectedConversation]);

  const envoyerMessage = () => {
    const texte = chatInput.trim();
    if (!texte || !selectedConversation) return;

    setIsAssistantActive(false);
    const newUserMsg = { id: Date.now(), auteur: "vous" as const, texte, heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatInput("");

    setTimeout(() => {
      setIsAssistantActive(true);
      const newAssistantMsg = { id: Date.now() + 1, auteur: "assistant" as const, texte: "C'est noté. Je transmets l'information.", heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
      setChatMessages((prev) => [...prev, newAssistantMsg]);
    }, 1000);
  };

  if (isMobile && !selectedConversation) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
        <header className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversationsFiltrees.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 flex-shrink-0">
                {conv.initiale}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 truncate pr-2">{conv.nom}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0">{conv.heure}</span>
                </div>
                <p className="text-sm text-slate-500 truncate mt-0.5">{conv.dernierMessage}</p>
              </div>
              {conv.nonLus > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {conv.nonLus > 9 ? "9+" : conv.nonLus}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)] flex bg-slate-50">
        <aside className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <header className="p-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversationsFiltrees.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${selectedConversation?.id === conv.id ? "bg-emerald-50" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 flex-shrink-0">
                  {conv.initiale}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 truncate pr-2">{conv.nom}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">{conv.heure}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">{conv.dernierMessage}</p>
                </div>
                {conv.nonLus > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {conv.nonLus > 9 ? "9+" : conv.nonLus}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

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
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
            <MessageSquare className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Sélectionnez une conversation</p>
            <p className="text-sm mt-1">Ou commencez une nouvelle discussion</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <ChatWindow
      conversation={selectedConversation!}
      chatMessages={chatMessages}
      setChatMessages={setChatMessages}
      chatInput={chatInput}
      setChatInput={setChatInput}
      isAssistantActive={isAssistantActive}
      onSendMessage={envoyerMessage}
      messagesEndRef={messagesEndRef}
      onBack={() => setSelectedConversation(null)}
      isMobile={true}
    />
  );
}