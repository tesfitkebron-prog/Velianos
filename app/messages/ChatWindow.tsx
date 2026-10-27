"use client";

import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCheck,
  Paperclip,
  Phone,
  Send,
  User,
} from "lucide-react";

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

type ChatWindowProps = {
  conversation: Conversation;
  chatMessages: Message[];
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  isAssistantActive: boolean;
  onToggleAssistant: () => void;
  onSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onBack?: () => void;
};

export function ChatWindow(props: ChatWindowProps) {
  const {
    conversation,
    chatMessages,
    chatInput,
    setChatInput,
    isAssistantActive,
    onToggleAssistant,
    onSendMessage,
    messagesEndRef,
    onBack,
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, messagesEndRef]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(event.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* EN-TÊTE */}
      <header className="h-16 px-3 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Retour aux conversations"
            className="w-11 h-11 rounded-full text-slate-500 active:scale-95 active:bg-slate-100 flex items-center justify-center flex-shrink-0 transition-all lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {conversation.initiale}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#0F172A] truncate">
            {conversation.nom}
          </p>
          <p className="text-[11px] font-normal text-slate-500 truncate">
            {conversation.telephone}
          </p>
        </div>
        <a
          href={`tel:${conversation.telephone.replace(/\s/g, "")}`}
          aria-label={`Appeler ${conversation.nom}`}
          className="w-11 h-11 rounded-full text-slate-500 active:scale-95 active:bg-slate-100 flex items-center justify-center flex-shrink-0 transition-all"
        >
          <Phone className="w-5 h-5" />
        </a>
      </header>

      {/* BANDEAU QUI A LA MAIN */}
      <div
        className={`px-3 py-1 flex items-center justify-between gap-2 flex-shrink-0 border-b ${
          isAssistantActive
            ? "bg-emerald-50 border-emerald-100"
            : "bg-amber-50 border-amber-100"
        }`}
      >
        <p
          className={`flex min-w-0 items-center gap-1.5 text-[11px] font-medium ${
            isAssistantActive ? "text-emerald-700" : "text-amber-800"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
              isAssistantActive ? "bg-[#00D26A]" : "bg-amber-500"
            }`}
          />
          <span className="truncate">
            {isAssistantActive
              ? "L'assistant répond"
              : "Vous avez pris la main"}
          </span>
        </p>
        <button
          onClick={onToggleAssistant}
          className={`flex-shrink-0 min-h-[44px] px-2 text-[11px] font-semibold active:opacity-60 transition-opacity ${
            isAssistantActive ? "text-emerald-700" : "text-amber-800"
          }`}
        >
          {isAssistantActive
            ? "Reprendre la main"
            : "Laisser faire l'assistant"}
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-3 bg-white">
        <div className="flex justify-center pb-1">
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-md">
            Aujourd&apos;hui
          </span>
        </div>

        {chatMessages.map((msg) => {
          const sortant = msg.auteur !== "client";

          return (
            <div
              key={msg.id}
              className={`flex ${sortant ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 border ${
                  msg.auteur === "client"
                    ? "bg-white border-slate-200 rounded-2xl rounded-tl-md"
                    : msg.auteur === "assistant"
                      ? "bg-slate-50 border-slate-200 rounded-2xl rounded-tr-md"
                      : "bg-[#0F172A] border-[#0F172A] rounded-2xl rounded-tr-md"
                }`}
              >
                {msg.auteur === "assistant" && (
                  <p className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-400">
                    <Bot className="h-3 w-3 text-[#00D26A]" />
                    Assistant
                  </p>
                )}
                {msg.auteur === "vous" && (
                  <p className="mb-1 flex items-center justify-end gap-1 text-xs font-medium text-white/60">
                    <User className="h-3 w-3" />
                    Vous
                  </p>
                )}

                <p
                  className={`text-sm leading-relaxed ${
                    msg.auteur === "vous"
                      ? "text-white font-normal"
                      : "text-slate-800 font-normal"
                  }`}
                >
                  {msg.texte}
                </p>

                <div className="flex items-center justify-end gap-1 mt-1">
                  <span
                    className={`text-[10px] font-normal ${
                      msg.auteur === "vous" ? "text-white/50" : "text-slate-400"
                    }`}
                  >
                    {msg.heure}
                  </span>
                  {sortant && (
                    <CheckCheck
                      className={`w-3.5 h-3.5 ${
                        msg.auteur === "assistant"
                          ? "text-[#00D26A]"
                          : "text-white/60"
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* SAISIE */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-3 py-2">
        <div className="max-w-3xl mx-auto flex items-end gap-1 bg-slate-100 rounded-[22px] p-1.5">
          <button
            aria-label="Joindre un fichier (bientôt disponible)"
            disabled
            className="w-11 h-11 rounded-full text-slate-500 flex items-center justify-center flex-shrink-0 opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            rows={1}
            style={{ height: "44px" }}
            className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-[15px] font-normal py-2.5 px-1 placeholder:text-slate-400 text-[#0F172A] max-h-28 min-h-[44px]"
          />
          <button
            onClick={onSendMessage}
            disabled={!chatInput.trim()}
            aria-label="Envoyer le message"
            className="w-11 h-11 rounded-full bg-[#0F172A] hover:bg-[#1E293B] disabled:bg-slate-300 text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
          >
            <Send className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
