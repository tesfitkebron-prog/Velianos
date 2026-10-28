"use client";

import { createClient } from "@/lib/supabase/client";

export const EVENEMENT_NOTIFICATIONS_LUES = "velianos:notifications-lues";

export type NotificationApp = {
  id: string;
  type: string;
  titre: string;
  texte: string;
  lien: string | null;
  lue: boolean;
  creeLe: string;
};

type NotificationRow = {
  id: string;
  type: string | null;
  title: string | null;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string | null;
};

function messageErreur(erreur: unknown): string {
  if (erreur instanceof Error) return erreur.message;
  if (typeof erreur === "string") return erreur;
  return "Impossible de charger vos notifications pour le moment.";
}

export async function compterNotificationsNonLues(): Promise<number> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function chargerNotifications(): Promise<{
  notifications: NotificationApp[];
  erreur: string | null;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { notifications: [], erreur: null };

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) throw error;

    return {
      notifications: ((data ?? []) as NotificationRow[]).map((ligne) => ({
        id: ligne.id,
        type: ligne.type ?? "info",
        titre: ligne.title ?? "Notification",
        texte: ligne.body ?? "",
        lien: ligne.link,
        lue: Boolean(ligne.read_at),
        creeLe: ligne.created_at ?? new Date().toISOString(),
      })),
      erreur: null,
    };
  } catch (erreur) {
    return { notifications: [], erreur: messageErreur(erreur) };
  }
}

export async function marquerNotificationsLues(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  } catch {
    // Le statut de lecture reste informatif.
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENEMENT_NOTIFICATIONS_LUES));
  }
}

export async function marquerNotificationLue(id: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .is("read_at", null);
  } catch {
    // Le statut de lecture reste informatif.
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENEMENT_NOTIFICATIONS_LUES));
  }
}
