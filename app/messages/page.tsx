"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  ChevronRight,
  MessageSquare,
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
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setActiveId(conversation.id);
    setConversations((precedent) =>
      precedent.map((item) =>
        item.id === conversation.id ? { ...item, nonLus: 0 } : item,
      ),
    );
    if (companyId) {
      void marquerConversationLue(companyId, conversation.id);
    }
  };

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

  const visibles = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return conversations;
    return conversations.filter((conversation) =>
      [conversation.nom, conversation.telephone, conversation.dernierMessage]
        .join(" ")
        .toLowerCase()
        .includes(terme),
    );
  }, [conversations, recherche]);

  const active = conversations.find(
    (conversation) => conversation.id === activeId,
  );

  if (chargement) {
    return (
      <div className="pt-5">
        <PageSkeleton lignes={4} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="pt-5">
        <PageError
          message={erreur}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-5">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Messages
        </h1>
        <p className="mt-1 text-lg font-medium text-slate-600">
          Vos SMS, l&apos;assistant et vous.
        </p>
      </div>

      <label
        htmlFor="messages-search"
        className="flex h-14 items-center gap-3 rounded-2xl bg-white px-4 shadow-[0_8px_30px_rgb(0,0,0,0.05)] focus-within:ring-4 focus-within:ring-emerald-500/15"
      >
        <Search className="h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Rechercher une conversation</span>
        <input
          id="messages-search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Rechercher un client…"
          className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </label>

      {visibles.length === 0 ? (
        recherche ? (
          <EmptyState
            icon={SearchX}
            title={`Aucun résultat pour "${recherche.trim()}"`}
            description="Essayez un autre nom ou un autre numéro."
            actionLabel="Effacer la recherche"
            onAction={() => setRecherche("")}
          />
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Votre assistant est prêt"
            description="Il n'a pas encore reçu d'appel. Suivez le guide pour l'activer."
            actionLabel="Ouvrir mon assistant"
            onAction={() => router.push("/assistant")}
          />
        )
      ) : (
        <div className="space-y-2.5">
          {visibles.map((conversation, index) => {
            const badge =
              conversation.dernierAuteur === "vous"
                ? {
                    label: "Vous",
                    className: "bg-blue-50 text-blue-600",
                    Icon: UserRound,
                  }
                : conversation.dernierAuteur === "assistant"
                  ? {
                      label: "Assistant",
                      className: "bg-slate-100 text-slate-600",
                      Icon: Bot,
                    }
                  : {
                      label: "Client",
                      className: "bg-slate-100 text-slate-500",
                      Icon: UserRound,
                    };

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => ouvrir(conversation)}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                className="flex w-full animate-fade-up items-center gap-3.5 rounded-[24px] bg-white p-4 text-left shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-[0.98]"
              >
                <span className="relative flex-shrink-0">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-extrabold ${styleAvatar(conversation.id)}`}
                  >
                    {conversation.initiale}
                  </span>
                  {conversation.nonLus > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-extrabold text-white ring-2 ring-white">
                      {conversation.nonLus}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                      {conversation.nom}
                    </span>
                    <span className="flex-shrink-0 text-sm font-semibold text-slate-400">
                      {conversation.heure}
                    </span>
                  </span>

                  <span className="mt-0.5 block truncate text-base font-medium text-slate-600">
                    {conversation.dernierMessage}
                  </span>

                  <span className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-extrabold ${badge.className}`}
                    >
                      <badge.Icon className="h-3 w-3" aria-hidden="true" />
                      {badge.label}
                    </span>
                    {conversation.nonLus > 0 && (
                      <span className="text-xs font-extrabold text-emerald-600">
                        Nouveau
                      </span>
                    )}
                  </span>
                </span>

                <ChevronRight
                  className="h-5 w-5 flex-shrink-0 text-slate-300"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      )}

      {active && companyId && (
        <ChatWindow
          conversation={active}
          companyId={companyId}
          onBack={() => setActiveId(null)}
          onMessagesChange={majMessages}
        />
      )}
    </div>
  );
}
