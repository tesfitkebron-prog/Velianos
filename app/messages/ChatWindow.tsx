"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, Settings, Paperclip, ArrowUp, CheckCheck, Camera, Mic } from "lucide-react";

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
};

export function ChatWindow(props: ChatWindowProps) {
  const { conversation, chatMessages, setChatMessages, chatInput, setChatInput, isAssistantActive, onSendMessage, messagesEndRef, onBack, isMobile = false } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, messagesEndRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    // Auto-resize
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* HEADER CHAT - Sticky sur mobile */}
      <header className="p-4 border-b border-slate-200 bg-white flex-shrink-0 flex items-center gap-3 sticky top-0 z-10">
        {isMobile && props.onBack && (
          <button onClick={props.onBack} className="w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center justify-center -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 flex-shrink-0">
          {props.conversation.initiale}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 truncate">{props.conversation.nom}</p>
          <p className="text-xs text-slate-500">{props.conversation.telephone}</p>
        </div>
        {/* Statut assistant */}
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
          {props.isAssistantActive ? (
            <>
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Assistant actif</span>
            </>
          ) : (
            <>
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
              <span>Vous avez la main</span>
            </>
          )}
        </div>
        <button className="w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center justify-center">
          <Phone className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* ZONE MESSAGES */}
<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" style={{ background: "#F8FAFC" }}>
        {props.chatMessages.map((msg, index) => (
          <div key={index} className={msg.auteur === "client" ? "flex justify-start" : "flex justify-end"}>
            {msg.auteur === "client" && (
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[80%] shadow-sm">
                <p className="text-sm text-slate-800">{msg.texte}</p>
                <p className="text-xs text-slate-400 mt-1 text-right">{msg.heure}</p>
              </div>
            )}
            {msg.auteur === "assistant" && (
              <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                <p className="text-sm">{msg.texte}</p>
                <p className="text-xs text-emerald-100 mt-1 text-right">{msg.heure}</p>
              </div>
            )}
            {msg.auteur === "vous" && (
              <div className="bg-slate-900 text-white rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                <p className="text-sm">{msg.texte}</p>
                <p className="text-xs text-slate-300 mt-1 text-right">{msg.heure}</p>
              </div>
            )}
          </div>
        ))}
        </div>
        <div ref={props.messagesEndRef} />

        {/* INPUT CHAT - Style iMessage, fixed bottom sur mobile */}
        <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors" aria-label="Pièce jointe">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors" aria-label="Photo">
                <Camera className="w-5 h-5" />
              </button>
              <textarea
                ref={textareaRef}
                value={props.chatInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                rows={1}
                className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-base py-2 px-2 placeholder:text-slate-400 text-slate-900 bg-transparent max-h-24 min-h-[44px]"
                style={{ height: "44px" }}
              />
              <button className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors active:scale-95" onClick={props.onSendMessage} disabled={!props.chatInput.trim()}>
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }