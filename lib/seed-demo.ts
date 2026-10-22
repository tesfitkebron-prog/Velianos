"use client";

import { createClient } from "@/lib/supabase/client";

export type ResultatSeed = { succes: boolean; message: string };

const clientsDemo = [
  {
    first_name: "Jean",
    last_name: "Dupont",
    phone: "06 12 34 56 78",
    email: "jean.dupont@email.fr",
    address: "12 rue Gambetta",
    city: "Lyon",
    postal_code: "69003",
  },
  {
    first_name: "Marie",
    last_name: "Martin",
    phone: "06 23 45 67 89",
    email: "marie.martin@email.fr",
    address: "45 cours Lafayette",
    city: "Lyon",
    postal_code: "69006",
  },
  {
    first_name: "Paul",
    last_name: "Bernard",
    phone: "06 34 56 78 90",
    email: "paul.bernard@email.fr",
    address: "8 rue Victor Hugo",
    city: "Villeurbanne",
    postal_code: "69100",
  },
];

const appelsDemo = [
  { status: "completed", minutes: 14, resume: "Fuite sous évier", repond: true },
  { status: "completed", minutes: 62, resume: "Devis salle de bain", repond: true },
  { status: "no-answer", minutes: 120, resume: "Chauffe-eau en panne", repond: false },
];

export async function seedDemoData(companyId: string): Promise<ResultatSeed> {
  const supabase = createClient();

  try {
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .insert(
        clientsDemo.map((client) => ({ ...client, company_id: companyId, source: "demo" })),
      )
      .select("id, first_name, last_name, phone");

    if (clientsError || !clients || clients.length === 0) {
      return { succes: false, message: clientsError?.message ?? "Insertion clients impossible." };
    }

    const maintenant = Date.now();

    const { data: appels, error: appelsError } = await supabase
      .from("calls")
      .insert(
        appelsDemo.map((appel, index) => ({
          company_id: companyId,
          client_id: clients[index]?.id ?? null,
          from_number: clients[index]?.phone ?? null,
          direction: "inbound",
          status: appel.status,
          started_at: new Date(maintenant - index * 3600_000).toISOString(),
          ended_at: new Date(maintenant - index * 3600_000 + appel.minutes * 60_000).toISOString(),
          duration_seconds: appel.minutes * 60,
          summary: appel.resume,
          outcome: appel.repond ? "client_capture" : "en_attente",
        })),
      )
      .select("id");

    if (appelsError || !appels || appels.length === 0) {
      return { succes: false, message: appelsError?.message ?? "Insertion appels impossible." };
    }

    const transcriptions = appels
      .map((appel, index) => ({
        call_id: appel.id,
        company_id: companyId,
        role: "user",
        content: [
          "Bonjour, j'ai une fuite sous mon évier.",
          "Bonjour, je voudrais un devis pour une salle de bain.",
          "Mon chauffe-eau ne fonctionne plus, je n'ai plus d'eau chaude.",
        ][index],
      }))
      .filter((transcription) => Boolean(transcription.content));

    if (appelsDemo[2] && transcriptions.length > 0) {
      transcriptions.pop();
    }

    if (transcriptions.length > 0) {
      const { error: transcriptionsError } = await supabase
        .from("transcripts")
        .insert(transcriptions);

      if (transcriptionsError) {
        return { succes: false, message: transcriptionsError.message };
      }
    }

    return { succes: true, message: "Données de démonstration chargées." };
  } catch (erreur) {
    return {
      succes: false,
      message: erreur instanceof Error ? erreur.message : "Erreur inconnue",
    };
  }
}