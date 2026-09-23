"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MessageSquare, Send } from "lucide-react";

const conversations = [
  { name: "Mme Dupont", initial: "D", lastMessage: "Parfait, à demain 9h. Merci !", time: "14:32", unread: true },
  { name: "M. Martin", initial: "M", lastMessage: "D'accord pour jeudi 14h.", time: "11:15", unread: true },
  { name: "Mme Rousseau", initial: "R", lastMessage: "Merci pour le rappel.", time: "Hier", unread: false },
  { name: "M. Bernard", initial: "B", lastMessage: "Je vous rappelle demain.", time: "Hier", unread: false },
];

const messages = [
  { from: "client", text: "Bonjour, j'ai une fuite sous mon évier.", time: "14:15" },
  { from: "velianos", text: "Bonjour Mme Dupont, Nova a bien noté votre demande. Un créneau est disponible demain à 9h00. Cela vous convient-il ?", time: "14:16" },
  { from: "client", text: "Oui parfait.", time: "14:30" },
  { from: "velianos", text: "C'est noté. Rendez-vous confirmé demain à 9h00. Un rappel vous sera envoyé 24h avant.", time: "14:31" },
  { from: "client", text: "Parfait, à demain 9h. Merci !", time: "14:32" },
];

export default function MessagesPage() {
  const [input, setInput] = useState("");

  return (
    <AppLayout>
      <div className="w-full">
        {/* EN-TÊTE */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Messages</h1>
          <p className="text-sm text-text-secondary mt-1">Vos SMS échangés avec les clients.</p>
        </div>

        {/* BANDEAU NUMÉRO D'ENVOI */}
        <Card className="p-4 mt-6 bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">Vos SMS partent du 04 28 12 34 56</p>
              <p className="text-xs text-text-secondary">Numéro dédié Velianos</p>
            </div>
          </div>
        </Card>

        {/* LAYOUT 2 COLONNES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* COLONNE GAUCHE — LISTE DES CONVERSATIONS */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Conversations</h3>
              <Badge variant="info">4</Badge>
            </div>
            <div className="space-y-0">
              {conversations.map((conv, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${i < conversations.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-text-primary font-semibold">
                    {conv.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{conv.name}</p>
                    <p className="text-xs text-text-secondary truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-xs text-text-secondary">{conv.time}</span>
                    {conv.unread && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* COLONNE DROITE — CONVERSATION ACTIVE */}
          <Card className="md:col-span-2 p-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-text-primary font-semibold">D</div>
                <div>
                  <p className="font-semibold text-text-primary">Mme Dupont</p>
                  <p className="text-xs text-text-secondary">06 12 34 56 78</p>
                </div>
              </div>
            </div>
            <div className="p-4 min-h-[400px] space-y-3 bg-gray-50 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "velianos" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${msg.from === "velianos" ? "bg-primary text-white rounded-lg rounded-tr-none" : "bg-white border border-border rounded-lg rounded-tl-none"} p-3`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.from === "velianos" ? "text-primary-100" : "text-text-secondary"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  className="flex-1 py-2 px-3 border border-border rounded-lg text-sm bg-white text-text-primary placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                />
                <Button variant="primary" size="md" className="min-h-[44px] flex-shrink-0 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Envoyer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}