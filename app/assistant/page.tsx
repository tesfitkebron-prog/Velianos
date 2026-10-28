"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowUp,
  Bot,
  FileText,
  Loader2,
  Paperclip,
  Sparkles,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/ui/EmptyState";
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
import { vibrer } from "@/lib/clients";

type Message = {
  id: string;
  auteur: "assistant" | "user";
  texte: string;
};

const suggestions = ["Lyon", "Paris", "Autre"];

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
  const [decalageClavier, setDecalageClavier] = useState(0);
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
        if (!resultat.companyId) {
          return [
            {
              id: "accueil",
              auteur: "assistant",
              texte:
                "Bonjour ! Je suis votre assistant. Commencez par compléter votre profil ci-dessus, puis nous pourrons discuter.",
            },
          ];
        }
        const connaissance =
          resultat.zones.length > 0
            ? `J'ai bien noté vos zones : ${resultat.zones.join(", ")}.`
            : "Je ne connais pas encore votre zone d'intervention.";
        return [
          {
            id: "accueil",
            auteur: "assistant",
            texte: `Bonjour ! Je suis votre assistant. ${connaissance} Quelle est votre zone d'intervention principale ?`,
          },
        ];
      });
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const maj = () => {
      const ecart = Math.max(0, window.innerHeight - viewport.height);
      setDecalageClavier(ecart);
      window.setTimeout(() => {
        finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 80);
    };
    maj();
    viewport.addEventListener("resize", maj);
    return () => viewport.removeEventListener("resize", maj);
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const ajouterMessage = (message: Omit<Message, "id">) => {
    setMessages((precedent) => [
      ...precedent,
      { ...message, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` },
    ]);
  };

  const repondre = async (valeur: string) => {
    const propre = valeur.trim();
    if (!propre || envoi) return;

    vibrer(30);
    setTexte("");
    setEnvoi(true);
    ajouterMessage({ auteur: "user", texte: propre });

    let reponse = "";
    if (donnees?.companyId && (attenteVille || suggestions.includes(propre))) {
      if (propre === "Autre") {
        setAttenteVille(true);
        reponse =
          "Dites-moi votre ville : je l'ajoute tout de suite à votre zone d'intervention.";
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
    } else {
      reponse =
        "Merci, c'est noté. Votre assistant utilisera cette information pour répondre encore mieux à vos clients.";
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
      setErreurFichier("Complétez d'abord votre entreprise.");
      return;
    }

    setTeleversement(true);
    vibrer(30);
    const resultat = await televerserDocument(donnees.companyId, fichier);
    setTeleversement(false);

    if (resultat.erreur) {
      setErreurFichier(resultat.erreur);
      return;
    }

    ajouterMessage({
      auteur: "assistant",
      texte: `J'ai bien reçu « ${fichier.name} ». Je vais l'étudier et l'utiliser pour vos devis.`,
    });
    const rafraichi = await chargerAssistant();
    setDonnees(rafraichi);
  };

  if (chargement) {
    return (
      <div className="pt-5">
        <PageSkeleton lignes={3} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="pt-5">
        <PageError message={erreur} onRetry={() => void charger()} />
      </div>
    );
  }

  const progression = Math.max(20, donnees?.progression ?? 20);
  const entrepriseConfiguree = Boolean(donnees?.companyId);
  const zones = donnees?.zones ?? [];
  const documents = donnees?.documents ?? [];

  return (
    <div className="space-y-5 pb-48 pt-5">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Mon assistant
        </h1>
        <p className="mt-1 text-lg font-medium text-slate-600">
          Il travaille pour vous. Vous gardez le contrôle.
        </p>
      </div>

      {entrepriseConfiguree ? (
        <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-slate-500">
                Connaissance de votre entreprise
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                {progression} %
              </p>
            </div>
            {progression < 100 ? (
              <Link
                href="/entreprise"
                className="flex h-14 items-center justify-center rounded-2xl bg-[#0A2540] px-5 text-base font-extrabold text-white shadow-lg shadow-[#0A2540]/25 transition-transform duration-200 active:scale-95"
              >
                Compléter
              </Link>
            ) : (
              <span className="flex h-14 items-center justify-center rounded-2xl bg-emerald-50 px-5 text-base font-extrabold text-emerald-600">
                Complet
              </span>
            )}
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${progression}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {zones.length > 0 ? (
              zones.map((zone) => (
                <span
                  key={zone}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {zone}
                </span>
              ))
            ) : (
              <span className="text-base font-medium text-slate-500">
                Aucune zone enregistrée pour le moment.
              </span>
            )}
          </div>

          {documents.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Documents appris
              </p>
              <div className="mt-2 space-y-1.5">
                {documents.slice(0, 3).map((document) => (
                  <p
                    key={document}
                    className="flex items-center gap-2 text-base font-medium text-slate-600"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">{document}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <EmptyState
          icon={Bot}
          title="Votre assistant attend votre entreprise"
          description="Renseignez le nom, l'adresse et le métier de votre entreprise pour que l'assistant puisse répondre à vos clients."
          actionLabel="Compléter mon entreprise"
          onAction={() => {
            window.location.href = "/entreprise";
          }}
        />
      )}

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-extrabold tracking-tight text-slate-900">
          Parlez à votre assistant
        </h2>

        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-fade-up ${
                message.auteur === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[86%] rounded-[20px] px-4 py-3 ${
                  message.auteur === "user"
                    ? "rounded-br-md bg-[#0A2540] text-white shadow-lg shadow-[#0A2540]/15"
                    : "rounded-bl-md bg-white text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                }`}
              >
                {message.auteur === "assistant" && (
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                    <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                    Assistant
                  </p>
                )}
                <p className="text-base font-medium leading-relaxed">
                  {message.texte}
                </p>
              </div>
            </div>
          ))}
          {envoi && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-[20px] rounded-bl-md bg-white px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
                <span className="text-base font-medium text-slate-500">
                  L&apos;assistant écrit…
                </span>
              </div>
            </div>
          )}
          <div ref={finRef} />
        </div>

        {entrepriseConfiguree && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void repondre(suggestion)}
                disabled={envoi}
                className="min-h-12 rounded-full bg-white px-5 text-base font-extrabold text-[#0A2540] shadow-[0_4px_18px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </section>

      {erreurFichier && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
          <X className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">{erreurFichier}</span>
          <button
            type="button"
            onClick={() => setErreurFichier(null)}
            className="text-sm font-extrabold underline"
          >
            Fermer
          </button>
        </div>
      )}

      <div
        className="fixed inset-x-0 z-30 mx-auto w-full max-w-2xl px-3 transition-[bottom] duration-200"
        style={{
          bottom: `calc(76px + env(safe-area-inset-bottom) + ${decalageClavier}px)`,
        }}
      >
        <form
          onSubmit={(event) => void envoyer(event)}
          className="pointer-events-auto flex items-end gap-2 rounded-[24px] bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
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
          <button
            type="button"
            onClick={() => fichierRef.current?.click()}
            disabled={televersement}
            aria-label="Ajouter un PDF"
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            {televersement ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Paperclip className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <label htmlFor="assistant-message" className="sr-only">
            Écrire à votre assistant
          </label>
          <input
            id="assistant-message"
            value={texte}
            onChange={(event) => setTexte(event.target.value)}
            placeholder={
              attenteVille ? "Indiquez votre ville…" : "Écrivez à votre assistant…"
            }
            className="h-14 min-w-0 flex-1 bg-transparent px-2 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={envoi || texte.trim().length === 0}
            aria-label="Envoyer"
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:opacity-40"
          >
            <ArrowUp className="h-6 w-6" aria-hidden="true" />
          </button>
        </form>
        <p className="mt-1.5 text-center text-sm font-medium text-slate-400">
          PDF accepté jusqu&apos;à 5 Mo.
        </p>
      </div>
    </div>
  );
}
