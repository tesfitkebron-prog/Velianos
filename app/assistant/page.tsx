"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  CheckCircle2,
  Mic,
  Paperclip,
  Pencil,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppToast } from "@/components/ui/AppToast";

type Message = { id: number; auteur: "assistant" | "user"; texte: string };

const messagesInitiaux: Message[] = [
  {
    id: 1,
    auteur: "assistant",
    texte:
      "Bonjour Karim ! Je suis prêt à répondre à vos clients. Voulez-vous modifier vos horaires ou ajouter des tarifs ?",
  },
  { id: 2, auteur: "user", texte: "Quels sont mes horaires actuels ?" },
  {
    id: 3,
    auteur: "assistant",
    texte:
      "Vous travaillez du lundi au vendredi, de 8h à 18h. Le samedi et le dimanche, vous êtes fermé.",
  },
];

const suggestions = ["Mes horaires", "Mes tarifs", "Mes zones"];

const infosConnues = [
  { label: "Nom de l'entreprise", valeur: "Plomberie Martin" },
  { label: "Horaires", valeur: "Lun-Ven 8h-18h · Sam 8h-12h" },
  { label: "Zones d'intervention", valeur: "Lyon, Villeurbanne, Caluire" },
  { label: "Tarifs / Prestations", valeur: "4 prestations configurées" },
];

export default function AssistantPage() {
  return (
    <AppLayout>
      <AssistantContent />
    </AppLayout>
  );
}

function AssistantContent() {
  const [chatMessages, setChatMessages] = useState<Message[]>(messagesInitiaux);
  const [chatInput, setChatInput] = useState("");
  const [progression, setProgression] = useState(80);
  const [reflexion, setReflexion] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { show, toast } = useAppToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, reflexion]);

  const envoyerMessage = (texteForce?: string) => {
    const texte = (texteForce ?? chatInput).trim();
    if (!texte) return;

    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), auteur: "user", texte },
    ]);
    setChatInput("");
    setReflexion(true);

    setTimeout(() => {
      let reponse =
        "Je n'ai pas bien compris. Posez-moi une question sur vos horaires, tarifs ou zones.";
      const lower = texte.toLowerCase();
      if (lower.includes("horaire"))
        reponse =
          "Vous travaillez du lundi au vendredi, de 8h à 18h. Le samedi, de 8h à 12h. Fermé le dimanche.";
      if (lower.includes("tarif") || lower.includes("prix"))
        reponse =
          "Vos 4 prestations : Débouchage 80–150 €, Fuite 120–200 €, Chauffe-eau 400–800 €, Entretien 150 €.";
      if (lower.includes("zone") || lower.includes("ville"))
        reponse =
          "Vous intervenez à Lyon, Villeurbanne, Caluire, Bron et Vaulx-en-Velin.";
      if (lower.includes("modif"))
        reponse = "D'accord, dites-moi précisément ce que vous voulez changer.";

      setReflexion(false);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, auteur: "assistant", texte: reponse },
      ]);
    }, 700);
  };

  const dicter = () => {
    type Reconnaissance = {
      lang: string;
      onresult: (e: {
        results: { 0: { 0: { transcript: string } } };
      }) => void;
      start: () => void;
    };
    const w = window as typeof window & {
      SpeechRecognition?: new () => Reconnaissance;
      webkitSpeechRecognition?: new () => Reconnaissance;
    };
    const Moteur = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Moteur) {
      show("Dictée vocale non disponible ici");
      return;
    }
    const reconnaissance = new Moteur();
    reconnaissance.lang = "fr-FR";
    reconnaissance.onresult = (e) => {
      setChatInput((prev) => `${prev} ${e.results[0][0].transcript}`.trim());
    };
    reconnaissance.start();
    show("Parlez maintenant");
  };

  const ajouterFichiers = (nombre: number) => {
    const nouvelle = Math.min(100, progression + 10);
    setProgression(nouvelle);
    show(
      nombre > 1
        ? `${nombre} documents ajoutés · ${nouvelle}%`
        : `Document ajouté · ${nouvelle}%`,
    );
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-white">
      {/* PROGRESSION */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 md:px-0 md:pt-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#0F172A] leading-snug">
                Votre assistant connaît votre entreprise à {progression}%
              </p>
              <p className="text-[11px] font-normal text-slate-500 mt-0.5">
                {progression >= 100
                  ? "Tout est prêt, il peut travailler seul."
                  : "Complétez les infos pour qu'il soit parfait."}
              </p>
            </div>
            <button
              onClick={() => setConfigOpen(true)}
              className="min-h-[44px] text-[11px] font-medium text-[#0F172A] bg-slate-100 active:scale-95 px-3 py-2 rounded-lg flex-shrink-0 transition-transform"
            >
              Compléter
            </button>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>
      </div>

      {/* CONVERSATION */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
        {chatMessages.map((msg) =>
          msg.auteur === "assistant" ? (
            <div key={msg.id} className="flex items-start gap-2.5 max-w-[94%]">
              <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              </span>
              <p className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 text-[15px] font-normal leading-relaxed text-slate-800">
                {msg.texte}
              </p>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-end">
              <p className="max-w-[85%] bg-[#0F172A] rounded-2xl rounded-tr-md px-4 py-2.5 text-[15px] font-normal leading-relaxed text-white">
                {msg.texte}
              </p>
            </div>
          ),
        )}

        {reflexion && (
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            </span>
            <span className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* SUGGESTIONS */}
      {chatMessages.length <= 3 && (
        <div className="flex-shrink-0 px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => envoyerMessage(suggestion)}
              className="min-h-[44px] px-3 rounded-full border border-slate-200 bg-white text-[11px] font-medium text-slate-600 active:scale-95 hover:bg-slate-50 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* SAISIE */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100 px-3 py-2.5 md:px-0 md:py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-1 rounded-2xl bg-slate-100 p-1.5">
          <button
            onClick={dicter}
            aria-label="Dicter un message"
            className="w-11 h-11 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95 flex items-center justify-center flex-shrink-0 transition-all"
          >
            <Mic className="w-5 h-5" />
          </button>

          <label
            htmlFor="assistant-fichier"
            className="w-11 h-11 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer"
            aria-label="Joindre un PDF"
          >
            <Paperclip className="w-5 h-5" />
          </label>
          <input
            id="assistant-fichier"
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={(e) => {
              const nombre = e.target.files?.length ?? 0;
              if (nombre > 0) ajouterFichiers(nombre);
              e.target.value = "";
            }}
          />

          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={(e) => {
              setChatInput(e.target.value);
              const el = textareaRef.current;
              if (el) {
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                envoyerMessage();
              }
            }}
            placeholder="Posez une question…"
            rows={1}
            style={{ height: "44px" }}
            className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-[15px] font-normal py-2.5 px-1 placeholder:text-slate-400 text-[#0F172A] max-h-28 min-h-[44px]"
          />

          <button
            onClick={() => envoyerMessage()}
            disabled={!chatInput.trim()}
            aria-label="Envoyer"
            className="w-11 h-11 rounded-full bg-[#0F172A] hover:bg-[#1E293B] disabled:bg-slate-300 text-white disabled:text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* DRAWER CONFIGURATION */}
      {configOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="flex-1 bg-[#0F172A]/40 backdrop-blur-[2px]"
            onClick={() => setConfigOpen(false)}
          />
          <div className="w-full max-w-sm h-full bg-[#F8FAFC] flex flex-col overflow-hidden animate-[slideIn_.2s_ease-out]">
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-bold text-[#0F172A]">Configuration</h2>
              <button
                onClick={() => setConfigOpen(false)}
                aria-label="Fermer"
                className="w-11 h-11 rounded-full text-slate-500 active:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConfigPanel
                progression={progression}
                onAjouterFichiers={ajouterFichiers}
              />
            </div>
          </div>
        </div>
      )}

      {toast}
    </div>
  );
}

function ConfigPanel({
  progression,
  onAjouterFichiers,
}: {
  progression: number;
  onAjouterFichiers: (nombre: number) => void;
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-sm text-[#0F172A]">
            Connaissance à {progression}%
          </p>
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
        </div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-500"
            style={{ width: `${progression}%` }}
          />
        </div>
        <p className="text-[11px] font-normal text-slate-500 mt-2">
          Complétez les infos pour atteindre 100%.
        </p>
      </div>

      <label
        htmlFor="pdf-upload"
        className="block bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 active:scale-[0.99] transition-all"
      >
        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="font-semibold text-sm text-[#0F172A]">
          Apprenez-lui vos tarifs
        </p>
        <p className="text-xs font-normal text-slate-500 mt-1">
          PDF, photos de devis, plaquettes…
        </p>
        <span className="inline-flex items-center gap-2 mt-3 px-3.5 py-2 bg-slate-100 rounded-lg text-xs font-medium text-[#0F172A]">
          <Upload className="w-3.5 h-3.5" /> Choisir des fichiers
        </span>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          multiple
          className="hidden"
          onChange={(e) => {
            const nombre = e.target.files?.length ?? 0;
            if (nombre > 0) onAjouterFichiers(nombre);
            e.target.value = "";
          }}
        />
      </label>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
          Ce que votre assistant sait
        </p>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {infosConnues.map((info) => (
            <div
              key={info.label}
              className="flex items-center gap-3 px-4 py-3 min-h-[56px] border-b border-slate-100 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0F172A]">
                  {info.label}
                </p>
                <p className="text-xs font-normal text-slate-500 mt-0.5 truncate">
                  {info.valeur}
                </p>
              </div>
              <button
                type="button"
                disabled
                aria-label={`Modifier ${info.label}`}
                title="Modification bientôt disponible"
                className="w-11 h-11 rounded-full text-slate-400 opacity-50 flex items-center justify-center flex-shrink-0 cursor-not-allowed"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
