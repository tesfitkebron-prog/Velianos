"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Paperclip,
  Mic,
  ArrowUp,
  Settings,
  X,
  Upload,
  Pencil,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const infosConnues = [
  { label: "Nom de l'entreprise", valeur: "Plomberie Martin", complete: true },
  { label: "Horaires", valeur: "Lun-Ven 8h-18h · Sam 8h-12h", complete: true },
  { label: "Zones d'intervention", valeur: "Lyon, Villeurbanne, Caluire", complete: true },
  { label: "Tarifs / Prestations", valeur: "4 prestations configurées", complete: true },
];

const messagesInitiaux = [
  { auteur: "assistant", texte: "Bonjour ! Je suis prêt à répondre à vos clients. Voulez-vous modifier vos horaires ou ajouter des tarifs ?" },
  { auteur: "user", texte: "Quels sont mes horaires actuels ?" },
  { auteur: "assistant", texte: "Vous travaillez du lundi au vendredi, de 8h à 18h. Le samedi et le dimanche, vous êtes fermé." },
];

export default function AssistantPage() {
  return (
    <AppLayout>
      <AssistantContent />
    </AppLayout>
  );
}

function AssistantContent() {
  const [chatMessages, setChatMessages] = useState(messagesInitiaux);
  const [chatInput, setChatInput] = useState("");
  const [configOpen, setConfigOpen] = useState(false);
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
  }, [chatMessages]);

  const envoyerMessage = () => {
    const texte = chatInput.trim();
    if (!texte) return;

    setChatMessages((prev) => [...prev, { auteur: "user", texte }]);
    setChatInput("");

    // Réponse simulée de l'assistant
    setTimeout(() => {
      let reponse = "Je n'ai pas bien compris. Posez-moi une question sur vos horaires, tarifs ou zones.";
      const lower = texte.toLowerCase();
      if (lower.includes("horaire")) reponse = "Vous travaillez du lundi au vendredi, de 8h à 18h. Le samedi et le dimanche, vous êtes fermé.";
      if (lower.includes("tarif") || lower.includes("prix")) reponse = "Vos 4 prestations : Débouchage 80-150€, Fuite 120-200€, Chauffe-eau 400-800€, Entretien 150€.";
      if (lower.includes("zone") || lower.includes("ville")) reponse = "Vous intervenez à Lyon, Villeurbanne, Caluire, Bron, Vaulx-en-Velin.";
      if (lower.includes("modif")) reponse = "D'accord, dites-moi ce que vous voulez changer.";

      setChatMessages((prev) => [...prev, { auteur: "assistant", texte: reponse }]);
    }, 600);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden relative">
      {/* CONFIG DRAWER MOBILE */}
      {configOpen && isMobile && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setConfigOpen(false)}>
          <div className="bg-slate-950/50 flex-1" />
          <div className="w-full max-w-sm bg-white flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Configuration</h2>
              <button onClick={() => setConfigOpen(false)} className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-100 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ConfigPanel />
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT PRINCIPAL */}
      <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
        {/* COLONNE GAUCHE - CONFIGURATION (Desktop only) */}
        <aside className="hidden lg:block w-[400px] flex-shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col overflow-y-auto">
          <ConfigPanel />
        </aside>

        {/* COLONNE DROITE - CHAT */}
        <div className="w-full lg:flex-1 flex flex-col bg-white h-full">
          {/* HEADER CHAT */}
          <header className="h-16 px-6 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900">Mon assistant</p>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                En ligne
              </p>
            </div>
            {isMobile && (
              <button
                onClick={() => setConfigOpen(true)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </header>

          {/* ZONE MESSAGES */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.auteur === "user" ? "justify-end" : "justify-start"}`}>
                {msg.auteur === "assistant" && (
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-slate-800 text-base leading-relaxed">
                      <p>{msg.texte}</p>
                    </div>
                  </div>
                )}
                {msg.auteur === "user" && (
                  <div className="max-w-[80%] ml-auto">
                    <div className="bg-slate-100 rounded-2xl rounded-tr-sm px-5 py-3 text-slate-800 text-base">
                      <p>{msg.texte}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT CHAT - Style ChatGPT */}
          <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 p-2 bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:border-slate-400 transition-all">
                <button
                  className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                  aria-label="Pièce jointe"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                  aria-label="Message vocal"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      envoyerMessage();
                    }
                  }}
                  placeholder="Posez une question à votre assistant..."
                  rows={1}
                  style={{ height: "44px", minHeight: "44px" }}
                  className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-base py-2 px-2 placeholder:text-slate-400 text-slate-900 bg-transparent max-h-32 min-h-[44px]"
                />
                <button
                  onClick={envoyerMessage}
                  disabled={!chatInput.trim()}
                  aria-label="Envoyer"
                  className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center transition min-w-[44px]"
                >
                  <ArrowUp className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigPanel() {
  return (
    <div className="flex flex-col h-full p-4 lg:p-6 space-y-4">
      {/* EN-TÊTE MOBILE (visible seulement si ouvert en drawer) */}
      <div className="lg:hidden flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Configuration</h2>
      </div>

      {/* BARRE DE PROGRESSION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm text-slate-900">Votre assistant connaît votre entreprise à 80%</p>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: "80%" }} />
        </div>
        <p className="text-xs text-slate-500 mt-2">Complétez les infos pour atteindre 100%.</p>
      </div>

      {/* ZONE UPLOAD PDF */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="font-medium text-slate-700 mb-1">Apprenez-lui vos tarifs</p>
        <p className="text-sm text-slate-500 mb-4">Glissez vos PDF ici (tarifs, plaquettes, contrats)</p>
        <input
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          id="pdf-upload"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) alert(`${files.length} fichier(s) ajouté(s) à la connaissance de l'assistant`);
          }}
        />
        <label htmlFor="pdf-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <Upload className="w-4 h-4" /> Choisir des fichiers
        </label>
      </div>

      {/* INFOS CONNUES */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Ce que votre assistant sait</p>
        <div className="space-y-2">
          {infosConnues.map((info, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{info.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{info.valeur}</p>
              </div>
              <button className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                <Pencil className="w-3 h-3" /> Modifier
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BOUTON SECRET - DÉSACTIVER */}
      <div className="pt-4 border-t border-slate-200">
        <button className="w-full text-center text-red-600 hover:text-red-700 font-medium text-sm py-2 transition-colors">
          <AlertCircle className="w-4 h-4 inline mr-1" /> Désactiver l'assistant
        </button>
      </div>
    </div>
  );
}