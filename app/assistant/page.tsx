"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowUp, Loader2, Paperclip } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MicButton } from "@/components/ui/MicButton";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ajouterZone,
  chargerAssistant,
  MESSAGE_FICHIER_NON_PDF,
  MESSAGE_FICHIER_TROP_LOURD,
  TAILLE_MAX_FICHIER,
  televerserDocument,
  type AssistantDonnees,
} from "@/lib/field-data";
import { heureCourte, vibrer } from "@/lib/clients";

type Message = {
  id: string;
  auteur: "assistant" | "user";
  texte: string;
  heure: string;
};

const MESSAGE_ONBOARDING =
  "Bonjour ! Je suis votre assistant. Pour que je puisse répondre à vos clients, j'ai besoin de connaître votre entreprise. Cliquez sur le trombone 📎 ci-dessous pour m'envoyer votre grille tarifaire en PDF, ou dites-moi simplement ce que vous faites.";

const SUGGESTIONS_DEMARRAGE = [
  "Je suis plombier",
  "Ajouter ma ville",
  "Envoyer mon PDF",
];

const VILLES_RAPIDES = ["Lyon", "Paris", "Autre"];

export default function AssistantPage() {
  return (
    <AppLayout>
      <AssistantContent />
    </AppLayout>
  );
}

function AssistantContent() {
  const { showToast } = useToast();
  const [donnees, setDonnees] = useState<AssistantDonnees | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [attenteVille, setAttenteVille] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [televersement, setTeleversement] = useState(false);
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const fichierRef = useRef<HTMLInputElement | null>(null);
  const finRef = useRef<HTMLDivElement | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    const resultat = await chargerAssistant();
    setDonnees(resultat);
    setErreur(resultat.erreur);
    setChargement(false);

    if (!resultat.erreur) {
      setMessages((precedent) => {
        if (precedent.length > 0) return precedent;
        if (!resultat.companyId || resultat.progression < 100) {
          return [
            {
              id: "accueil",
              auteur: "assistant",
              texte: MESSAGE_ONBOARDING,
              heure: heureCourte(new Date().toISOString()),
            },
          ];
        }

        const connaissance =
          resultat.zones.length > 0
            ? `J'ai bien mémorisé votre entreprise et vos zones : ${resultat.zones.join(", ")}.`
            : "J'ai bien mémorisé votre entreprise.";
        return [
          {
            id: "accueil",
            auteur: "assistant",
            texte: `Bonjour ! Je suis votre assistant. ${connaissance} Je peux répondre à vos clients, qualifier les demandes et préparer vos rendez-vous. Que puis-je faire pour vous ?`,
            heure: heureCourte(new Date().toISOString()),
          },
        ];
      });
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, envoi, televersement]);

  const ajouterMessage = (message: Omit<Message, "id" | "heure">) => {
    setMessages((precedent) => [
      ...precedent,
      {
        ...message,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        heure: heureCourte(new Date().toISOString()),
      },
    ]);
  };

  const repondre = async (valeur: string) => {
    const propre = valeur.trim();
    if (!propre || envoi || televersement) return;

    vibrer(50);
    setTexte("");
    setEnvoi(true);
    ajouterMessage({ auteur: "user", texte: propre });

    let reponse = "";
    const minuscule = propre.toLowerCase();

    if (attenteVille && donnees?.companyId) {
      if (propre === "Autre") {
        reponse =
          "Écrivez le nom de votre ville ou de votre secteur d'intervention : je l'ajoute tout de suite.";
      } else {
        const resultat = await ajouterZone(donnees.companyId, propre);
        if (resultat.erreur) {
          reponse = `Je n'ai pas pu enregistrer cette ville : ${resultat.erreur}`;
        } else {
          setAttenteVille(false);
          reponse = `C'est noté : ${propre} fait maintenant partie de votre zone d'intervention. Votre assistant répondra aux clients de ce secteur.`;
          const rafraichi = await chargerAssistant();
          setDonnees(rafraichi);
        }
      }
    } else if (donnees?.companyId && VILLES_RAPIDES.includes(propre)) {
      const resultat = await ajouterZone(donnees.companyId, propre);
      if (resultat.erreur) {
        reponse = `Je n'ai pas pu enregistrer cette ville : ${resultat.erreur}`;
      } else {
        reponse = `C'est noté : ${propre} fait maintenant partie de votre zone d'intervention.`;
        const rafraichi = await chargerAssistant();
        setDonnees(rafraichi);
      }
    } else if (
      /ajouter ma ville|ma ville|ville|zone|secteur|intervien/i.test(minuscule)
    ) {
      setAttenteVille(true);
      reponse =
        "Bien sûr. Dans quelle ville ou quel secteur d'intervention travaillez-vous ?";
    } else if (
      /plombier|plomberie|chauffagiste|électricien|electricien|menuisier|serrurier|peintre|maçon|macon/i.test(
        minuscule,
      )
    ) {
      reponse = `C'est noté : ${propre}. Envoyez-moi votre grille tarifaire en PDF avec le trombone 📎 pour que je mémorise vos tarifs, ou ajoutez votre ville d'intervention.`;
    } else {
      reponse =
        "Merci, c'est noté. Envoyez-moi votre grille tarifaire en PDF avec le trombone 📎, ou ajoutez votre ville d'intervention pour que je puisse qualifier vos clients.";
    }

    setEnvoi(false);
    ajouterMessage({ auteur: "assistant", texte: reponse });
  };

  const envoyer = async (event: FormEvent) => {
    event.preventDefault();
    await repondre(texte);
  };

  const choisirFichier = async (fichier: File | null) => {
    setErreurFichier(null);
    if (!fichier) return;

    if (fichier.type !== "application/pdf") {
      showToast(MESSAGE_FICHIER_NON_PDF, { variant: "error" });
      return;
    }
    if (fichier.size > TAILLE_MAX_FICHIER) {
      setErreurFichier(MESSAGE_FICHIER_TROP_LOURD);
      return;
    }
    if (!donnees?.companyId) {
      setErreurFichier(
        "Complétez d'abord votre entreprise pour que je puisse mémoriser vos tarifs.",
      );
      return;
    }

    vibrer(30);
    ajouterMessage({ auteur: "user", texte: `📎 ${fichier.name}` });
    setTeleversement(true);
    const resultat = await televerserDocument(donnees.companyId, fichier);
    setTeleversement(false);

    if (resultat.erreur) {
      setErreurFichier(resultat.erreur);
      return;
    }

    ajouterMessage({
      auteur: "assistant",
      texte: "J'ai bien lu votre document. J'ai mémorisé vos tarifs.",
    });
    const rafraichi = await chargerAssistant();
    setDonnees(rafraichi);
  };

  if (chargement) {
    return (
      <div className="flex h-full flex-col bg-transparent">
        <div className="flex-1 overflow-y-auto p-4">
          <PageSkeleton lignes={3} />
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="flex h-full flex-col bg-transparent">
        <div className="flex-1 overflow-y-auto p-4">
          <PageError message={erreur} onRetry={() => void charger()} />
        </div>
      </div>
    );
  }

  const entrepriseConfiguree = Boolean(donnees?.companyId);
  const progression = entrepriseConfiguree
    ? Math.max(0, donnees?.progression ?? 0)
    : 0;
  const premiereConversation = messages.every(
    (message) => message.auteur === "assistant",
  );
  const afficherSuggestionsDemarrage =
    premiereConversation &&
    !envoi &&
    !televersement &&
    (!entrepriseConfiguree || progression < 100);

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3"
        role="log"
        aria-live="polite"
        aria-label="Conversation avec votre assistant"
      >
        <p className="pb-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Aujourd&apos;hui
        </p>

        <div className="space-y-2.5">
          {messages.map((message) => {
            const deMoi = message.auteur === "user";
            return (
              <div
                key={message.id}
                className={`flex ${deMoi ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    deMoi
                      ? "rounded-br-md bg-[#2F6BFF] text-white shadow-[#2F6BFF]/20"
                      : "rounded-bl-md border border-slate-200/80 bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {message.texte}
                  </p>
                  <p
                    className={`mt-1 text-right text-[10px] leading-none ${
                      deMoi ? "text-white/65" : "text-slate-500"
                    }`}
                  >
                    {message.heure}
                  </p>
                </div>
              </div>
            );
          })}

          {erreurFichier && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-red-100 bg-red-50 px-3.5 py-2 text-sm leading-snug text-red-700">
                <p>{erreurFichier}</p>
                <button
                  type="button"
                  onClick={() => setErreurFichier(null)}
                  className="mt-1 text-xs font-semibold underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {(envoi || televersement) && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-slate-200/80 bg-slate-100 px-3.5 py-2.5">
                <span className="sr-only">
                  {televersement
                    ? "Votre assistant lit votre document…"
                    : "Votre assistant écrit…"}
                </span>
                <span className="flex items-center gap-1" aria-hidden="true">
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                    style={{ animationDelay: "240ms" }}
                  />
                </span>
              </div>
            </div>
          )}

          {afficherSuggestionsDemarrage && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTIONS_DEMARRAGE.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (suggestion === "Envoyer mon PDF") {
                      fichierRef.current?.click();
                      return;
                    }
                    void repondre(suggestion);
                  }}
                  className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors active:border-[#2F6BFF]/30 active:bg-[#EDF3FF] active:text-[#1D4ED8]"
                >
                  {suggestion === "Envoyer mon PDF"
                    ? "📎 Envoyer mon PDF"
                    : suggestion}
                </button>
              ))}
            </div>
          )}

          {attenteVille && !envoi && !televersement && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {VILLES_RAPIDES.map((ville) => (
                <button
                  key={ville}
                  type="button"
                  onClick={() => void repondre(ville)}
                  className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors active:border-[#2F6BFF]/30 active:bg-[#EDF3FF] active:text-[#1D4ED8]"
                >
                  {ville}
                </button>
              ))}
            </div>
          )}

          <div ref={finRef} />
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-slate-200/70 bg-white/90 px-3 pb-2.5 pt-2.5 backdrop-blur-xl">
        <form onSubmit={(event) => void envoyer(event)}>
          <input
            ref={fichierRef}
            type="file"
            accept="application/pdf"
            aria-label="Ajouter un PDF"
            className="hidden"
            onChange={(event) => {
              void choisirFichier(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />

          <div className="flex items-end gap-1 rounded-[22px] border border-slate-200 bg-white p-1.5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-colors focus-within:border-[#2F6BFF]/45 focus-within:ring-4 focus-within:ring-[#2F6BFF]/10">
            <button
              type="button"
              onClick={() => fichierRef.current?.click()}
              disabled={televersement}
              aria-label="Envoyer ma grille tarifaire en PDF"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100 disabled:opacity-40"
            >
              {televersement ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Paperclip className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <MicButton
              onTranscript={setTexte}
              onIndisponible={() =>
                showToast(
                  "La dictée vocale n'est pas disponible sur ce navigateur.",
                  { variant: "warning" },
                )
              }
              className="h-10 w-10 [&_svg]:h-5 [&_svg]:w-5"
            />

            <label htmlFor="assistant-message" className="sr-only">
              Écrire à votre assistant
            </label>
            <input
              id="assistant-message"
              value={texte}
              onChange={(event) => setTexte(event.target.value)}
              placeholder={
                attenteVille
                  ? "Indiquez votre ville…"
                  : "Écrivez à votre assistant…"
              }
              className="h-10 min-w-0 flex-1 bg-transparent px-1.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:outline-none"
            />

            <button
              type="submit"
              disabled={envoi || televersement || texte.trim().length === 0}
              aria-label="Envoyer"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-white shadow-md shadow-[#2F6BFF]/25 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none"
            >
              <ArrowUp className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
