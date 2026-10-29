"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  CheckCheck,
  Loader2,
  Phone,
  Send,
  UserRound,
} from "lucide-react";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { IntentPreview } from "@/components/ui/IntentPreview";
import {
  envoyerMessageTexte,
  supprimerMessage,
  type ChatMessage,
  type Conversation,
} from "@/lib/messages";
import { MESSAGE_ERREUR_MUTATION } from "@/lib/errors";
import { formatDateFrench } from "@/lib/date";
import { enregistrerAudit } from "@/lib/audit";
import { lienTelephone, styleAvatar, vibrer } from "@/lib/clients";

type ChatWindowProps = {
  conversation: Conversation;
  companyId: string;
  onBack: () => void;
  onMessagesChange: (conversationId: string, messages: ChatMessage[]) => void;
  /** Affiche une conversation de démonstration en lecture seule. */
  exemple?: boolean;
};

export function ChatWindow({
  conversation,
  companyId,
  onBack,
  onMessagesChange,
  exemple = false,
}: ChatWindowProps) {
  const { actif, setActif, notifier } = useAssistant();
  const lectureSeule = Boolean(exemple);
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);
  const [texte, setTexte] = useState("");
  const [apercu, setApercu] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [hauteurVue, setHauteurVue] = useState<number | null>(null);
  const finRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMessage[]>(conversation.messages);

  useEffect(() => {
    setMessages(conversation.messages);
    messagesRef.current = conversation.messages;
  }, [conversation.messages]);

  useEffect(() => {
    setTexte("");
    setApercu(null);
    setEnvoi(false);
  }, [conversation.id]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.id, messages]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const maj = () => {
      setHauteurVue(viewport.height);
      window.setTimeout(() => {
        finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 60);
    };

    maj();
    viewport.addEventListener("resize", maj);
    viewport.addEventListener("scroll", maj);
    return () => {
      viewport.removeEventListener("resize", maj);
      viewport.removeEventListener("scroll", maj);
    };
  }, []);

  const appliquer = (suivants: ChatMessage[]) => {
    messagesRef.current = suivants;
    setMessages(suivants);
    onMessagesChange(conversation.id, suivants);
  };

  const preparerEnvoi = () => {
    if (lectureSeule) return;
    const propre = texte.trim();
    if (!propre || envoi) return;
    vibrer(50);
    setApercu(propre);
  };

  const envoyer = async (propre: string) => {
    if (lectureSeule || !propre || envoi) return;

    setApercu(null);
    setEnvoi(true);
    setTexte("");

    const provisoire: ChatMessage = {
      id: `local-${crypto.randomUUID()}`,
      auteur: "vous",
      texte: propre,
      heure: formatDateFrench(new Date(), {
        hour: "2-digit",
        minute: "2-digit",
      }),
      statut: "envoye",
      envoyeLe: new Date().toISOString(),
    };

    appliquer([...messagesRef.current, provisoire]);

    try {
      const { message, erreur } = await envoyerMessageTexte(
        conversation,
        propre,
        companyId,
      );

      if (erreur || !message) {
        appliquer(
          messagesRef.current.filter((item) => item.id !== provisoire.id),
        );
        setTexte(propre);
        notifier(MESSAGE_ERREUR_MUTATION, undefined, {
          variant: "error",
        });
        return;
      }

      const suivants = messagesRef.current.map((item) =>
        item.id === provisoire.id ? message : item,
      );
      appliquer(suivants);

      enregistrerAudit({
        titre: `SMS envoyé à ${conversation.nom}`,
        rationale:
          "Vous avez vérifié le texte et le destinataire avant l'envoi.",
        autorite: "vous",
        reversible: false,
      });

      notifier("SMS envoyé. Annuler", () => {
        void supprimerMessage(message.id);
        appliquer(messagesRef.current.filter((item) => item.id !== message.id));
      }, { variant: "success" });
    } catch {
      appliquer(
        messagesRef.current.filter((item) => item.id !== provisoire.id),
      );
      setTexte(propre);
      notifier(MESSAGE_ERREUR_MUTATION, undefined, { variant: "error" });
    } finally {
      setEnvoi(false);
    }
  };

  const tel = lienTelephone(conversation.telephone);

  return (
    <div
      className="app-surface fixed inset-0 z-[80] mx-auto flex w-full max-w-2xl flex-col overflow-hidden shadow-2xl"
      style={{ height: hauteurVue ? `${hauteurVue}px` : "100dvh" }}
    >
      <header className="flex flex-shrink-0 items-center border-b border-slate-200 bg-white px-2 pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 w-full items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour aux messages"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors active:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${styleAvatar(conversation.id)}`}
          >
            {conversation.initiale}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-base font-semibold text-slate-900">
                {conversation.nom}
              </p>
              {exemple && (
                <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  Exemple
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-500">
              {exemple
                ? "Conversation d'exemple — lecture seule"
                : conversation.telephone || "Numéro manquant"}
            </p>
          </div>

          {tel && !lectureSeule ? (
            <a
              href={tel}
              onClick={() => vibrer(50)}
              aria-label={`Appeler ${conversation.nom}`}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-opacity active:opacity-80"
            >
              <Phone className="h-4 w-4" />
            </a>
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Phone className="h-4 w-4" />
            </span>
          )}
        </div>
      </header>

      {lectureSeule ? (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-white">
            <Bot className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-amber-950">
              Exemple de conversation
            </p>
            <p className="text-xs leading-snug text-amber-900">
              Votre assistant qualifie la demande, puis vous validez le
              rendez-vous.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
              actif
                ? "bg-[#2F6BFF] text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {actif ? (
              <Bot className="h-4 w-4" />
            ) : (
              <UserRound className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {actif ? "L'assistant répond" : "Vous avez la main"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {actif
                ? "Il répond aux clients à votre place."
                : "Vos clients vous parlent directement."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              vibrer(40);
              setActif(!actif);
              notifier(
                actif ? "Vous avez repris la main." : "L'assistant répond de nouveau.",
                undefined,
                { variant: "info" },
              );
            }}
            className="h-9 flex-shrink-0 rounded-lg bg-slate-100 px-3 text-xs font-medium text-[#2F6BFF] transition-colors active:bg-slate-200"
          >
            {actif ? "Reprendre la main" : "Laisser répondre"}
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-3">
        {messages.length === 0 && (
          <div className="mx-auto mt-8 max-w-xs rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <Bot className="mx-auto h-6 w-6 text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              Aucun message pour le moment
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Écrivez le premier message à {conversation.nom}.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const deMoi = message.auteur === "vous";
          return (
            <div
              key={message.id}
              className={`flex ${deMoi ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                  deMoi
                    ? "rounded-br-md bg-[#2F6BFF] text-white shadow-[#2F6BFF]/20"
                    : message.auteur === "assistant"
                      ? "rounded-bl-md border border-slate-200/80 bg-slate-100 text-slate-900"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
                }`}
              >
                {!deMoi && (
                  <p className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {message.auteur === "assistant" ? (
                      <>
                        <Bot className="h-3 w-3" aria-hidden="true" />
                        Assistant
                      </>
                    ) : (
                      <>
                        <UserRound className="h-3 w-3" aria-hidden="true" />
                        Client
                      </>
                    )}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {message.texte}
                </p>
                <p
                  className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] ${
                    deMoi ? "text-white/60" : "text-slate-500"
                  }`}
                >
                  {message.heure}
                  {deMoi &&
                    (message.statut === "lu" ? (
                      <CheckCheck
                        className="h-3 w-3 text-sky-200"
                        aria-label="Lu"
                      />
                    ) : (
                      <Check
                        className="h-3 w-3 text-blue-200"
                        aria-label="Envoyé"
                      />
                    ))}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={finRef} />
      </div>

      {lectureSeule ? (
        <div className="flex flex-shrink-0 items-center border-t border-slate-200 bg-white px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
          <div className="flex h-10 w-full items-center justify-center rounded-xl bg-amber-50 px-3 text-center text-xs font-medium text-amber-900">
            Exemple en lecture seule — créez un vrai client pour discuter
          </div>
        </div>
      ) : (
        <div className="flex flex-shrink-0 items-end gap-2 border-t border-slate-200 bg-white px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
          <label htmlFor="chat-message-input" className="sr-only">
            Écrire un message
          </label>
          <textarea
            id="chat-message-input"
            value={texte}
            onChange={(event) => setTexte(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                preparerEnvoi();
              }
            }}
            rows={1}
            placeholder="Écrire un message…"
            className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#2F6BFF]/45 focus:outline-none focus:ring-4 focus:ring-[#2F6BFF]/10"
          />
          <button
            type="button"
            onClick={preparerEnvoi}
            disabled={envoi || texte.trim().length === 0}
            aria-label="Envoyer le message"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-white transition-opacity active:opacity-80 disabled:opacity-30"
          >
            {envoi ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      {!lectureSeule && (
        <IntentPreview
          open={apercu !== null}
          message={apercu ?? ""}
          telephone={conversation.telephone || "Numéro manquant"}
          onConfirm={() => void envoyer(apercu ?? "")}
          onModify={() => setApercu(null)}
          onCancel={() => setApercu(null)}
          enCours={envoi}
        />
      )}
    </div>
  );
}

export default ChatWindow;
