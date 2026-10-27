"use client";

import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  CheckCheck,
  Paperclip,
  Phone,
  Send,
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
  messages: Message[];
};

type ChatWindowProps = {
  conversation: Conversation;
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  isAssistantActive: boolean;
  onSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onBack?: () => void;
  isMobile?: boolean;
  enTrainDEcrire?: boolean;
};

export function ChatWindow(props: ChatWindowProps) {
  const {
    conversation,
    chatMessages,
    chatInput,
    setChatInput,
    isAssistantActive,
    onSendMessage,
    messagesEndRef,
    onBack,
    enTrainDEcrire = false,
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, enTrainDEcrire, messagesEndRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
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
            className="w-10 h-10 rounded-full text-slate-500 active:scale-95 active:bg-slate-100 flex items-center justify-center flex-shrink-0 transition-all lg:hidden"
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
          <p className="text-[11px] font-normal text-slate-500 truncate flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            {conversation.telephone}
          </p>
        </div>
        <a
          href={`tel:${conversation.telephone.replace(/\s/g, "")}`}
          aria-label={`Appeler ${conversation.nom}`}
          className="w-10 h-10 rounded-full text-slate-500 active:scale-95 active:bg-slate-100 flex items-center justify-center flex-shrink-0 transition-all"
        >
          <Phone className="w-5 h-5" />
        </a>
      </header>

      {/* BANDEAU QUI A LA MAIN */}
      <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0 border-b border-slate-100 bg-slate-50">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isAssistantActive ? "bg-[#10B981]" : "bg-slate-400"
          }`}
        />
        <span className="text-[11px] font-medium text-slate-600">
          {isAssistantActive ? "L'assistant a la main" : "Vous avez la main"}
        </span>
        <span className="ml-auto text-[10px] font-normal text-slate-400">
          {isAssistantActive ? "Réponses automatiques" : "Mode manuel"}
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-5 space-y-3 bg-white">
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
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Assistant Velianos
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
                      msg.auteur === "vous" ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {msg.heure}
                  </span>
                  {sortant && (
                    <CheckCheck
                      className={`w-3.5 h-3.5 ${
                        msg.auteur === "assistant"
                          ? "text-[#10B981]"
                          : "text-slate-400"
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {enTrainDEcrire && (
          <div className="flex justify-end">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tr-md px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* SAISIE */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-3 py-2.5">
        <div className="max-w-3xl mx-auto flex items-end gap-1 bg-slate-100 rounded-2xl p-1.5">
          <button
            aria-label="Joindre un fichier"
            className="w-10 h-10 rounded-full text-slate-500 active:scale-95 active:bg-slate-200 flex items-center justify-center flex-shrink-0 transition-all"
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
            style={{ height: "40px" }}
            className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-[15px] font-normal py-2.5 px-1 placeholder:text-slate-400 text-[#0F172A] max-h-28 min-h-[40px]"
          />
          <button
            onClick={onSendMessage}
            disabled={!chatInput.trim()}
            aria-label="Envoyer le message"
            className="w-10 h-10 rounded-full bg-[#0F172A] hover:bg-[#1E293B] disabled:bg-slate-300 text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
          >
            <Send className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
