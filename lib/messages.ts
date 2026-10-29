"use client";

import { createClient } from "@/lib/supabase/client";
import {
  chiffresTelephone,
  formaterTelephone,
  heureCourte,
  initialesDe,
  tempsRelatif,
} from "@/lib/clients";

export type AuteurMessage = "client" | "assistant" | "vous";

export type ChatMessage = {
  id: string;
  auteur: AuteurMessage;
  texte: string;
  heure: string;
  statut: "envoye" | "lu";
  envoyeLe: string;
};

export type Conversation = {
  id: string;
  nom: string;
  initiale: string;
  telephone: string;
  dernierMessage: string;
  heure: string;
  nonLus: number;
  dernierAuteur: AuteurMessage;
  messages: ChatMessage[];
  /** Conversation de démonstration affichée quand la boîte est vide. */
  exemple?: boolean;
};

type ClientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

type MessageRow = {
  id: string;
  client_id: string | null;
  body: string;
  direction: string;
  status: string | null;
  sent_at: string | null;
  external_id: string | null;
};

function messageErreur(erreur: unknown): string {
  if (erreur instanceof Error) return erreur.message;
  if (typeof erreur === "string") return erreur;
  return "Impossible de charger vos messages pour le moment.";
}

export function auteurDuMessage(message: MessageRow): AuteurMessage {
  if (message.direction === "inbound") return "client";
  if (message.external_id?.startsWith("manual:")) return "vous";
  return "assistant";
}

export function versChatMessage(message: MessageRow): ChatMessage {
  return {
    id: message.id,
    auteur: auteurDuMessage(message),
    texte: message.body,
    heure: heureCourte(message.sent_at),
    statut: message.status === "read" ? "lu" : "envoye",
    envoyeLe: message.sent_at ?? new Date().toISOString(),
  };
}

export async function chargerConversations(): Promise<{
  conversations: Conversation[];
  companyId: string | null;
  erreur: string | null;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { conversations: [], companyId: null, erreur: null };

    const { data: profil, error: profilError } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profilError) throw profilError;

    const companyId = (profil?.company_id as string | undefined) ?? null;
    if (!companyId) {
      return { conversations: [], companyId: null, erreur: null };
    }

    const [clientsRes, messagesRes] = await Promise.all([
      supabase
        .from("clients")
        .select("id, first_name, last_name, phone")
        .eq("company_id", companyId),
      supabase
        .from("messages")
        .select("id, client_id, body, direction, status, sent_at, external_id")
        .eq("company_id", companyId)
        .order("sent_at", { ascending: true })
        .limit(1000),
    ]);

    const erreur = clientsRes.error ?? messagesRes.error;
    if (erreur) throw erreur;

    const clients = (clientsRes.data ?? []) as ClientRow[];
    const messages = (messagesRes.data ?? []) as MessageRow[];
    const parClient = new Map<string, MessageRow[]>();

    messages.forEach((message) => {
      if (!message.client_id) return;
      const liste = parClient.get(message.client_id) ?? [];
      liste.push(message);
      parClient.set(message.client_id, liste);
    });

    const conversations: Conversation[] = [];

    parClient.forEach((liste, clientId) => {
      const client = clients.find((item) => item.id === clientId);
      if (!client || liste.length === 0) return;

      const nom =
        [client.first_name, client.last_name].filter(Boolean).join(" ").trim() ||
        "Client";
      const dernier = liste[liste.length - 1];
      const messagesChat = liste.map(versChatMessage);
      const nonLus = liste.filter(
        (message) =>
          message.direction === "inbound" && message.status !== "read",
      ).length;

      conversations.push({
        id: client.id,
        nom,
        initiale: initialesDe(nom),
        telephone: formaterTelephone(client.phone),
        dernierMessage: dernier.body,
        heure: heureCourte(dernier.sent_at),
        nonLus,
        dernierAuteur: auteurDuMessage(dernier),
        messages: messagesChat,
      });
    });

    conversations.sort((a, b) => {
      const dateA = a.messages[a.messages.length - 1]?.envoyeLe ?? "";
      const dateB = b.messages[b.messages.length - 1]?.envoyeLe ?? "";
      return dateB.localeCompare(dateA);
    });

    return { conversations, companyId, erreur: null };
  } catch (erreur) {
    return {
      conversations: [],
      companyId: null,
      erreur: messageErreur(erreur),
    };
  }
}

export async function envoyerMessageTexte(
  conversation: Conversation,
  texte: string,
  companyId: string,
): Promise<{ message: ChatMessage | null; erreur: string | null }> {
  try {
    const supabase = createClient();
    const identifiant = crypto.randomUUID();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        company_id: companyId,
        client_id: conversation.id,
        to_number: chiffresTelephone(conversation.telephone),
        body: texte,
        direction: "outbound",
        status: "sent",
        external_id: `manual:${identifiant}`,
        sent_at: new Date().toISOString(),
      })
      .select("id, client_id, body, direction, status, sent_at, external_id")
      .single();

    if (error) throw error;

    return {
      message: versChatMessage(data as MessageRow),
      erreur: null,
    };
  } catch (erreur) {
    return { message: null, erreur: messageErreur(erreur) };
  }
}

export async function supprimerMessage(
  messageId: string,
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);
    if (error) throw error;
    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}

export async function marquerConversationLue(
  companyId: string,
  clientId: string,
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ status: "read" })
      .eq("company_id", companyId)
      .eq("client_id", clientId)
      .eq("direction", "inbound")
      .neq("status", "read");
  } catch {
    // Le statut de lecture reste informatif.
  }
}

export function heureRelativeMessage(message: ChatMessage): string {
  return tempsRelatif(message.envoyeLe);
}
