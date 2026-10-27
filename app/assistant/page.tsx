"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Bot,
  CheckCircle2,
  ChevronRight,
  Mic,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppToast } from "@/components/ui/AppToast";

type Message = { id: number; auteur: "assistant" | "user"; texte: string };

type InfoConnue = { label: string; valeur: string };

const messagesInitiaux: Message[] = [
  {
    id: 1,
    auteur: "assistant",
    texte:
      "Bonjour ! Pour mieux répondre à vos clients, j'ai besoin de quelques précisions. Quelle est votre zone d'intervention ?",
  },
  {
    id: 2,
    auteur: "user",
    texte: "Lyon, Villeurbanne et Caluire.",
  },
  {
    id: 3,
    auteur: "assistant",
    texte:
      "C'est noté. Avez-vous une grille tarifaire à me partager ? Ajoutez un PDF ci-dessous : je l'apprendrai et l'utiliserai pour vos devis.",
  },
];

const suggestions = ["Ma zone", "Mes tarifs", "Mes horaires"];

const infosInitiales: InfoConnue[] = [
  { label: "Nom de l'entreprise", valeur: "Plomberie Martin" },
  { label: "Horaires", valeur: "Lun-Ven 8h-18h · Sam 8h-12h" },
  { label: "Zones d'intervention", valeur: "Lyon, Villeurbanne, Caluire" },
  { label: "Tarifs / Prestations", valeur: "Grille tarifaire à ajouter" },
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
  const [infos, setInfos] = useState<InfoConnue[]>(infosInitiales);
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

    window.setTimeout(() => {
      let reponse =
        "C'est noté, j'ajoute cette information à votre profil. Vous pouvez continuer ou ajouter un document pour aller plus vite.";
      const lower = texte.toLowerCase();

      if (lower.includes("horaire")) {
        reponse =
          "Vous travaillez du lundi au vendredi, de 8h à 18h, et le samedi de 8h à 12h. Je suis fermé le dimanche.";
      } else if (lower.includes("tarif") || lower.includes("prix")) {
        reponse =
          "Vos 4 prestations : débouchage 80–150 €, fuite 120–200 €, chauffe-eau 400–800 € et entretien 150 €. Ajoutez votre grille pour que je sois encore plus précis.";
      } else if (
        lower.includes("zone") ||
        lower.includes("ville") ||
        ["lyon", "villeurbanne", "caluire", "bron", "vaulx"].some((ville) =>
          lower.includes(ville),
        )
      ) {
        reponse =
          "J'ai bien noté votre zone d'intervention : Lyon, Villeurbanne, Caluire, Bron et Vaulx-en-Velin. Je ne proposerai plus d'interventions en dehors.";
      } else if (lower.includes("modif")) {
        reponse =
          "D'accord. Ouvrez « Compléter mon profil » : vous pourrez modifier vos horaires, vos zones et vos tarifs.";
      }

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
    const nouvelle = Math.min(100, progression + (nombre > 1 ? 20 : 10));
    setProgression(nouvelle);
    setInfos((prev) =>
      prev.map((info) =>
        info.label === "Tarifs / Prestations"
          ? {
              ...info,
              valeur:
                nombre > 1
                  ? `${nombre} documents importés`
                  : "Grille tarifaire importée",
            }
          : info,
      ),
    );
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        auteur: "assistant",
        texte:
          nombre > 1
            ? `J'ai bien enregistré vos ${nombre} documents. J'utiliserai vos tarifs et vos prestations pour répondre à vos clients.`
            : "J'ai bien enregistré votre grille tarifaire. Je l'utiliserai dès maintenant pour vos devis et vos réponses aux clients.",
      },
    ]);
    show(
      nombre > 1
        ? `${nombre} documents enregistrés`
        : "Grille tarifaire enregistrée",
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F8FAFC]">
      {/* PROGRESSION */}
      <div className="flex-shrink-0 px-4 pb-3 pt-4 md:px-0 md:pt-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <Bot className="h-4 w-4 text-[#00D26A]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-[#0F172A]">
                Votre assistant connaît votre entreprise à{" "}
                <span className="text-[#00D26A]">{progression}%</span>
              </p>
              <p className="mt-1 text-xs font-normal leading-snug text-slate-500">
                Plus vous complétez, plus il répond comme vous.
              </p>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#00D26A] transition-all duration-500"
              style={{ width: `${progression}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] font-normal text-slate-500">
            <span>4 informations suivies</span>
            <span>
              {progression >= 100 ? "Profil complet" : "Encore quelques réponses"}
            </span>
          </div>
        </div>
      </div>

      {/* CONVERSATION */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {chatMessages.map((msg) =>
          msg.auteur === "assistant" ? (
            <div key={msg.id} className="flex max-w-[94%] items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                <Bot className="h-4 w-4 text-[#00D26A]" />
              </span>
              <p className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-relaxed text-slate-700">
                {msg.texte}
              </p>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#0F172A] px-4 py-3 text-sm font-normal leading-relaxed text-white">
                {msg.texte}
              </p>
            </div>
          ),
        )}

        {reflexion && (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
              <Bot className="h-4 w-4 text-[#00D26A]" />
            </span>
            <span className="flex gap-1 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* SUGGESTIONS */}
      {chatMessages.length <= 3 && (
        <div className="flex flex-shrink-0 flex-wrap gap-2 px-4 pb-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => envoyerMessage(suggestion)}
              className="min-h-[44px] rounded-full border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-600 transition-all active:scale-95 active:bg-slate-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* ACTIONS PRINCIPALES */}
      <div className="flex-shrink-0 px-4 pb-2">
        <div className="flex gap-2">
          <label
            htmlFor="assistant-fichier"
            className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00D26A] px-3 text-xs font-semibold text-white transition-transform active:scale-[0.99]"
          >
            <Upload className="h-4 w-4" />
            Ajouter un PDF
          </label>
          <button
            onClick={() => setConfigOpen(true)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#0F172A] transition-transform active:scale-[0.99]"
          >
            <Pencil className="h-4 w-4" />
            Compléter
          </button>
        </div>
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
      </div>

      {/* SAISIE */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-3 py-2.5 md:px-0 md:py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-1 rounded-2xl border border-slate-200 bg-white p-1.5">
          <button
            onClick={dicter}
            aria-label="Dicter un message"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 active:scale-95"
          >
            <Mic className="h-5 w-5" />
          </button>

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
            className="max-h-28 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1 py-2.5 text-[15px] font-normal text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />

          <button
            onClick={() => envoyerMessage()}
            disabled={!chatInput.trim()}
            aria-label="Envoyer"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-white transition-all hover:bg-[#1E293B] active:scale-95 disabled:bg-slate-300 disabled:text-white"
          >
            <ArrowUp className="h-5 w-5" />
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
          <div className="flex h-full w-full max-w-sm flex-col overflow-hidden bg-[#F8FAFC] animate-[slideIn_.2s_ease-out]">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white p-4">
              <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                Compléter mon profil
              </h2>
              <button
                onClick={() => setConfigOpen(false)}
                aria-label="Fermer"
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Connaissance à {progression}%
                  </p>
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#00D26A]" />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#00D26A] transition-all duration-500"
                    style={{ width: `${progression}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-normal leading-snug text-slate-500">
                  Complétez les informations pour atteindre 100%.
                </p>
              </div>

              <label
                htmlFor="pdf-upload"
                className="block cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all active:scale-[0.99]"
              >
                <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                  <Upload className="h-5 w-5 text-[#00D26A]" />
                </span>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Ajouter un document (PDF)
                </p>
                <p className="mt-1 text-xs font-normal leading-snug text-slate-500">
                  Tarifs, devis, plaquette… Votre assistant l&apos;apprend.
                </p>
                <span className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#00D26A] px-4 text-xs font-semibold text-white">
                  <Upload className="h-4 w-4" />
                  Choisir un fichier
                </span>
                <input
                  id="pdf-upload"
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
              </label>

              <div>
                <p className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Ce que votre assistant sait
                </p>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {infos.map((info) => {
                    const aCompleter = info.valeur.includes("à ajouter");

                    return (
                      <Link
                        key={info.label}
                        href="/entreprise"
                        onClick={() => setConfigOpen(false)}
                        className="flex min-h-[60px] items-center gap-3 border-b border-slate-100 px-4 transition-colors last:border-0 active:bg-slate-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] font-normal text-slate-400">
                            {info.label}
                          </span>
                          <span
                            className={`mt-0.5 block truncate text-sm font-medium ${
                              aCompleter
                                ? "text-amber-600"
                                : "text-[#0F172A]"
                            }`}
                          >
                            {info.valeur}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      </Link>
                    );
                  })}
                </div>
                <p className="mt-2 px-1 text-xs font-normal leading-snug text-slate-500">
                  Modifiez une information pour que votre assistant
                  l&apos;utilise tout de suite.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast}
    </div>
  );
}
