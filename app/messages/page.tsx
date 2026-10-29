"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronRight,
  Search,
  SearchX,
  UserRound,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { createClient } from "@/lib/supabase/client";
import {
  chargerConversations,
  marquerConversationLue,
  type ChatMessage,
  type Conversation,
} from "@/lib/messages";
import { creerConversationsExemple } from "@/lib/examples";
import { styleAvatar } from "@/lib/clients";
import { ChatWindow } from "./ChatWindow";

export default function MessagesPage() {
  return (
    <AppLayout>
      <MessagesContent />
    </AppLayout>
  );
}

function MessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const exemples = useMemo(() => creerConversationsExemple(), []);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatHistorique = useRef(false);

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    setErreur(null);
    const resultat = await chargerConversations();
    setConversations(resultat.conversations);
    setCompanyId(resultat.companyId);
    setErreur(resultat.erreur);
    setChargement(false);
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    if (!companyId) return;
    const supabase = createClient();
    const planifier = () => {
      if (minuteur.current) clearTimeout(minuteur.current);
      minuteur.current = setTimeout(() => void charger(true), 500);
    };

    const canal = supabase
      .channel(`velianos-messages-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `company_id=eq.${companyId}`,
        },
        planifier,
      )
      .subscribe();

    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
      void supabase.removeChannel(canal);
    };
  }, [companyId, charger]);

  const ouvrir = (conversation: Conversation) => {
    if (activeId) return;

    setActiveId(conversation.id);
    setConversations((precedent) =>
      precedent.map((item) =>
        item.id === conversation.id ? { ...item, nonLus: 0 } : item,
      ),
    );
    if (companyId && !conversation.exemple) {
      void marquerConversationLue(companyId, conversation.id);
    }
    if (typeof window !== "undefined") {
      window.history.pushState(
        { ...window.history.state, velianosChat: conversation.id },
        "",
        window.location.href,
      );
      chatHistorique.current = true;
    }
  };

  const fermerChat = () => {
    if (chatHistorique.current) {
      chatHistorique.current = false;
      window.history.back();
      return;
    }
    setActiveId(null);
  };

  useEffect(() => {
    if (!activeId) return;

    const surRetour = () => {
      chatHistorique.current = false;
      setActiveId(null);
    };

    window.addEventListener("popstate", surRetour);

    return () => {
      window.removeEventListener("popstate", surRetour);
    };
  }, [activeId]);

  const majMessages = useCallback(
    (conversationId: string, messages: ChatMessage[]) => {
      setConversations((precedent) => {
        const cible = precedent.find((item) => item.id === conversationId);
        if (!cible) return precedent;
        const dernier = messages[messages.length - 1];
        const misAJour: Conversation = {
          ...cible,
          messages,
          dernierMessage: dernier?.texte ?? "",
          heure: dernier?.heure ?? cible.heure,
          dernierAuteur: dernier?.auteur ?? cible.dernierAuteur,
          nonLus: 0,
        };
        return [misAJour, ...precedent.filter((item) => item.id !== conversationId)];
      });
    },
    [],
  );

  const afficherExemples = conversations.length === 0;
  const conversationsAffichees = afficherExemples ? exemples : conversations;

  const visibles = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return conversationsAffichees;
    return conversationsAffichees.filter((conversation) =>
      [conversation.nom, conversation.telephone, conversation.dernierMessage]
        .join(" ")
        .toLowerCase()
        .includes(terme),
    );
  }, [conversationsAffichees, recherche]);

  const active = conversationsAffichees.find(
    (conversation) => conversation.id === activeId,
  );

  if (chargement) {
    return (
      <div className="p-4">
        <PageSkeleton lignes={4} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="p-4">
        <PageError
          message={erreur}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <label
        htmlFor="messages-search"
        className="flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-3"
      >
        <Search className="h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
        <span className="sr-only">Rechercher une conversation</span>
        <input
          id="messages-search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Rechercher un client…"
          className="h-11 min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
        />
      </label>

      {afficherExemples && !recherche && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm leading-snug text-amber-900">
            Voici une conversation d&apos;exemple entre votre assistant et M.
            Dupont. Les données sont fictives.
          </p>
        </div>
      )}

      {visibles.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={
            recherche
              ? `Aucun résultat pour "${recherche.trim()}"`
              : "Aucune conversation pour le moment"
          }
          description={
            recherche
              ? "Essayez un autre nom ou un autre numéro."
              : "Les échanges de votre assistant avec vos clients apparaîtront ici."
          }
          actionLabel={recherche ? "Effacer la recherche" : undefined}
          onAction={recherche ? () => setRecherche("") : undefined}
        />
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {visibles.map((conversation) => {
            const Icone =
              conversation.dernierAuteur === "assistant" ? Bot : UserRound;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => ouvrir(conversation)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-slate-50"
              >
                <span className="relative flex-shrink-0">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${styleAvatar(conversation.id)}`}
                  >
                    {conversation.initiale}
                  </span>
                  {conversation.nonLus > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                      {conversation.nonLus}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-base font-semibold text-slate-900">
                        {conversation.nom}
                      </span>
                      {conversation.exemple && (
                        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          Exemple
                        </span>
                      )}
                    </span>
                    <span className="flex-shrink-0 text-xs text-slate-400">
                      {conversation.heure}
                    </span>
                  </span>

                  <span className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                    <Icone
                      className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {conversation.dernierMessage}
                    </span>
                  </span>
                </span>

                <ChevronRight
                  className="h-4 w-4 flex-shrink-0 text-slate-300"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      )}

      {active && (companyId || active.exemple) && (
        <ChatWindow
          conversation={active}
          companyId={companyId ?? ""}
          onBack={fermerChat}
          onMessagesChange={majMessages}
          exemple={active.exemple}
        />
      )}
    </div>
  );
}
