"use client";

import { createClient } from "@/lib/supabase/client";
import {
  formaterTelephone,
  heureCourte,
  initialesDe,
  tempsRelatif,
  trierParUrgence,
  type ClientFiche,
  type ClientUrgence,
} from "@/lib/clients";

export type StatMois = {
  recuperes: number;
  argent: number;
  tempsHeures: number;
};

export type ActiviteAssistant = {
  id: string;
  heure: string;
  texte: string;
  ton: "success" | "alerte";
  annulable: boolean;
};

export type DonneesTerrain = {
  prospects: ClientFiche[];
  clients: ClientFiche[];
  stats: StatMois;
  activites: ActiviteAssistant[];
  companyId: string | null;
  erreur: string | null;
};

export type TarifEntreprise = {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
};

export type DocumentEntreprise = {
  id: string;
  titre: string;
  creeLe: string | null;
};

export type EntrepriseDonnees = {
  companyId: string | null;
  nom: string;
  telephone: string;
  adresse: string;
  siret: string;
  description: string;
  horaires: string;
  zones: string[];
  tarifs: TarifEntreprise[];
  documents: DocumentEntreprise[];
  ton: string;
  vocabulaire: string;
  erreur: string | null;
};

export type AssistantDonnees = {
  companyId: string | null;
  companyName: string;
  horaires: string;
  zones: string[];
  tarifs: TarifEntreprise[];
  documents: string[];
  progression: number;
  erreur: string | null;
};

type ClientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  notes: string | null;
  created_at: string | null;
};

type AppointmentRow = {
  id: string;
  client_id: string | null;
  title: string | null;
  description: string | null;
  address: string | null;
  start_at: string | null;
  created_at: string | null;
  status: string | null;
  urgency: string | null;
  estimated_price_min_cents: number | null;
  estimated_price_max_cents: number | null;
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

type CallRow = {
  id: string;
  client_id: string | null;
  summary: string | null;
  status: string | null;
  started_at: string | null;
  duration_seconds: number | null;
};

type UsageRow = {
  month: string | null;
  minutes_used: number | null;
  appointments_booked: number | null;
};

type CompanyRow = {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  siret: string | null;
  description: string | null;
  working_hours: unknown;
};

const DONNEES_VIDES: DonneesTerrain = {
  prospects: [],
  clients: [],
  stats: { recuperes: 0, argent: 0, tempsHeures: 0 },
  activites: [],
  companyId: null,
  erreur: null,
};

function messageErreur(erreur: unknown): string {
  if (erreur instanceof Error) return erreur.message;
  if (typeof erreur === "string") return erreur;
  return "Impossible de charger vos données pour le moment.";
}

function nomComplet(client: ClientRow): string {
  const nom = [client.first_name, client.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return nom || "Client";
}

function adresseComplete(client: ClientRow, rendezVous?: AppointmentRow): string {
  const adresseRdv = rendezVous?.address?.trim();
  if (adresseRdv) return adresseRdv;

  return [client.address, client.postal_code, client.city]
    .filter(Boolean)
    .join(", ");
}

function urgenceDe(valeur?: string | null): ClientUrgence {
  const urgence = (valeur ?? "").toLowerCase();
  if (urgence === "urgent" || urgence === "haute" || urgence === "high") {
    return "urgent";
  }
  if (
    urgence === "a_verifier" ||
    urgence === "à vérifier" ||
    urgence === "attention" ||
    urgence === "medium"
  ) {
    return "a_verifier";
  }
  return "normal";
}

function libelleStatut(status?: string | null): string {
  switch (status) {
    case "pending":
      return "En attente";
    case "confirmed":
      return "Confirmé";
    case "new":
      return "Nouveau";
    case "completed":
      return "Traité";
    case "canceled":
      return "Annulé";
    default:
      return "";
  }
}

function creerFiche(
  client: ClientRow,
  rendezVous: AppointmentRow | null,
  messages: MessageRow[],
  appels: CallRow[],
): ClientFiche {
  const urgence = urgenceDe(rendezVous?.urgency);
  const nom = nomComplet(client);
  const adresse = adresseComplete(client, rendezVous ?? undefined);
  const telephone = formaterTelephone(client.phone);
  const dateReference =
    rendezVous?.created_at ?? rendezVous?.start_at ?? client.created_at;
  const probleme =
    rendezVous?.title?.trim() ||
    client.notes?.trim() ||
    "Demande à qualifier";
  const resume =
    rendezVous?.description?.trim() ||
    client.notes?.trim() ||
    "Les informations de cette demande seront complétées par votre assistant.";

  const echanges = [
    ...appels
      .map((appel) => appel.summary?.trim())
      .filter((resumeAppel): resumeAppel is string => Boolean(resumeAppel))
      .slice(0, 1),
    ...messages
      .filter((message) => message.direction === "outbound")
      .slice(-2)
      .map((message) => message.body),
  ];

  const badge =
    urgence === "urgent"
      ? "Urgent"
      : urgence === "a_verifier"
        ? "À vérifier"
        : libelleStatut(rendezVous?.status);

  return {
    id: client.id,
    appointmentId: rendezVous?.id ?? null,
    nom,
    initiales: initialesDe(nom),
    telephone,
    telephoneAffiche: telephone || "Numéro manquant",
    adresse,
    probleme,
    resume,
    notes: client.notes ?? "",
    moment: tempsRelatif(dateReference),
    heure: heureCourte(dateReference),
    urgence,
    badge,
    echanges,
    conversationId: client.id,
    statutRdv: rendezVous?.status ?? undefined,
  };
}

export async function chargerDonneesTerrain(): Promise<DonneesTerrain> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return DONNEES_VIDES;

    const { data: profil, error: profilError } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profilError) throw profilError;
    const companyId = (profil?.company_id as string | undefined) ?? null;
    if (!companyId) return DONNEES_VIDES;

    const [clientsRes, rendezVousRes, messagesRes, appelsRes, usageRes] =
      await Promise.all([
        supabase
          .from("clients")
          .select(
            "id, first_name, last_name, phone, address, city, postal_code, notes, created_at",
          )
          .eq("company_id", companyId)
          .order("created_at", { ascending: false }),
        supabase
          .from("appointments")
          .select(
            "id, client_id, title, description, address, start_at, created_at, status, urgency, estimated_price_min_cents, estimated_price_max_cents",
          )
          .eq("company_id", companyId)
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select("id, client_id, body, direction, status, sent_at, external_id")
          .eq("company_id", companyId)
          .order("sent_at", { ascending: true })
          .limit(1000),
        supabase
          .from("calls")
          .select("id, client_id, summary, status, started_at, duration_seconds")
          .eq("company_id", companyId)
          .order("started_at", { ascending: false })
          .limit(80),
        supabase
          .from("usage_monthly")
          .select("month, minutes_used, appointments_booked")
          .eq("company_id", companyId)
          .order("month", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    const erreur =
      clientsRes.error ??
      rendezVousRes.error ??
      messagesRes.error ??
      appelsRes.error ??
      usageRes.error;
    if (erreur) throw erreur;

    const clients = (clientsRes.data ?? []) as ClientRow[];
    const rendezVous = (rendezVousRes.data ?? []) as AppointmentRow[];
    const messages = (messagesRes.data ?? []) as MessageRow[];
    const appels = (appelsRes.data ?? []) as CallRow[];
    const usage = (usageRes.data ?? null) as UsageRow | null;

    const messagesParClient = new Map<string, MessageRow[]>();
    messages.forEach((message) => {
      if (!message.client_id) return;
      const liste = messagesParClient.get(message.client_id) ?? [];
      liste.push(message);
      messagesParClient.set(message.client_id, liste);
    });

    const appelsParClient = new Map<string, CallRow[]>();
    appels.forEach((appel) => {
      if (!appel.client_id) return;
      const liste = appelsParClient.get(appel.client_id) ?? [];
      liste.push(appel);
      appelsParClient.set(appel.client_id, liste);
    });

    const rendezVousParClient = new Map<string, AppointmentRow>();
    rendezVous.forEach((rdv) => {
      if (!rdv.client_id || rendezVousParClient.has(rdv.client_id)) return;
      rendezVousParClient.set(rdv.client_id, rdv);
    });

    const tousClients = trierParUrgence(
      clients.map((client) =>
        creerFiche(
          client,
          rendezVousParClient.get(client.id) ?? null,
          messagesParClient.get(client.id) ?? [],
          appelsParClient.get(client.id) ?? [],
        ),
      ),
    );

    const dejaVus = new Set<string>();
    const prospects = trierParUrgence(
      rendezVous
        .filter((rdv) => {
          if (!rdv.client_id) return false;
          if (rdv.status === "completed" || rdv.status === "canceled") {
            return false;
          }
          if (dejaVus.has(rdv.client_id)) return false;
          dejaVus.add(rdv.client_id);
          return true;
        })
        .map((rdv) => {
          const client = clients.find((item) => item.id === rdv.client_id);
          if (!client) return null;
          return creerFiche(
            client,
            rdv,
            messagesParClient.get(client.id) ?? [],
            appelsParClient.get(client.id) ?? [],
          );
        })
        .filter((fiche): fiche is ClientFiche => Boolean(fiche)),
    );

    const maintenant = new Date();
    const prefixeMois = `${maintenant.getFullYear()}-${String(
      maintenant.getMonth() + 1,
    ).padStart(2, "0")}`;
    const usageDuMois =
      usage?.month && usage.month.startsWith(prefixeMois) ? usage : null;

    const rdvDuMois = rendezVous.filter((rdv) =>
      (rdv.created_at ?? rdv.start_at ?? "").startsWith(prefixeMois),
    );
    const rdvTermines = rdvDuMois.filter((rdv) => rdv.status === "completed");
    const argent = Math.round(
      rdvTermines.reduce(
        (total, rdv) =>
          total +
          (rdv.estimated_price_max_cents ??
            rdv.estimated_price_min_cents ??
            0),
        0,
      ) / 100,
    );
    const tempsMinutes =
      usageDuMois?.minutes_used ??
      appels
        .filter((appel) => (appel.started_at ?? "").startsWith(prefixeMois))
        .reduce((total, appel) => total + (appel.duration_seconds ?? 0) / 60, 0);

    const nomClient = (id: string | null): string => {
      const client = clients.find((item) => item.id === id);
      return client ? nomComplet(client) : "un client";
    };

    const activites: ActiviteAssistant[] = [
      ...appels.slice(0, 5).map((appel) => ({
        id: `appel-${appel.id}`,
        date: appel.started_at ?? "",
        heure: heureCourte(appel.started_at),
        texte:
          appel.summary?.trim() ||
          (appel.status === "completed" ? "Appel traité" : "Appel en cours"),
        ton: (appel.status === "completed" ? "success" : "alerte") as
          | "success"
          | "alerte",
        annulable: false,
      })),
      ...messages
        .filter((message) => message.direction === "outbound")
        .slice(-4)
        .map((message) => ({
          id: `sms-${message.id}`,
          date: message.sent_at ?? "",
          heure: heureCourte(message.sent_at),
          texte: `SMS envoyé à ${nomClient(message.client_id)}`,
          ton: "success" as const,
          annulable: false,
        })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4)
      .map(({ date: _date, ...activite }) => activite);

    return {
      prospects,
      clients: tousClients,
      stats: {
        recuperes:
          usageDuMois?.appointments_booked ?? rdvTermines.length ?? 0,
        argent,
        tempsHeures: Math.round((tempsMinutes / 60) * 10) / 10,
      },
      activites,
      companyId,
      erreur: null,
    };
  } catch (erreur) {
    return { ...DONNEES_VIDES, erreur: messageErreur(erreur) };
  }
}

function formaterHoraires(valeur: unknown): string {
  if (!valeur || typeof valeur !== "object") return "";
  const objet = valeur as Record<string, unknown>;
  if (typeof objet.label === "string" && objet.label.trim()) {
    return objet.label.trim();
  }

  const jours = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];
  const morceaux = jours.flatMap((jour) => {
    const plage = objet[jour];
    if (!plage || typeof plage !== "object") return [];
    const { start, end } = plage as { start?: string; end?: string };
    if (!start || !end) return [];
    return [`${jour.charAt(0).toUpperCase()}${jour.slice(1)} ${start}-${end}`];
  });

  return morceaux.join(" · ");
}

export async function chargerEntreprise(): Promise<EntrepriseDonnees> {
  const vide: EntrepriseDonnees = {
    companyId: null,
    nom: "",
    telephone: "",
    adresse: "",
    siret: "",
    description: "",
    horaires: "",
    zones: [],
    tarifs: [],
    documents: [],
    ton: "",
    vocabulaire: "",
    erreur: null,
  };

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return vide;

    const { data: profil, error: profilError } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profilError) throw profilError;

    const companyId = (profil?.company_id as string | undefined) ?? null;
    if (!companyId) return vide;

    const [
      entrepriseRes,
      zonesRes,
      tarifsRes,
      documentsRes,
      tonRes,
      vocabulaireRes,
    ] = await Promise.all([
        supabase
          .from("companies")
          .select("id, name, phone, address, siret, description, working_hours")
          .eq("id", companyId)
          .maybeSingle(),
        supabase
          .from("zones")
          .select("city")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .order("city", { ascending: true }),
        supabase
          .from("pricing_rules")
          .select("id, label, min_price_cents, max_price_cents")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .order("label", { ascending: true }),
        supabase
          .from("company_knowledge")
          .select("id, title, created_at")
          .eq("company_id", companyId)
          .eq("type", "pdf")
          .order("created_at", { ascending: false }),
        supabase
          .from("company_knowledge")
          .select("content")
          .eq("company_id", companyId)
          .eq("type", "assistant_tone")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("company_knowledge")
          .select("content")
          .eq("company_id", companyId)
          .eq("type", "assistant_vocabulary")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    const erreur =
      entrepriseRes.error ??
      zonesRes.error ??
      tarifsRes.error ??
      documentsRes.error ??
      tonRes.error ??
      vocabulaireRes.error;
    if (erreur) throw erreur;

    const entreprise = entrepriseRes.data as CompanyRow | null;
    if (!entreprise) return vide;

    return {
      companyId,
      nom: entreprise.name ?? "",
      telephone: formaterTelephone(entreprise.phone),
      adresse: entreprise.address ?? "",
      siret: entreprise.siret ?? "",
      description: entreprise.description ?? "",
      horaires: formaterHoraires(entreprise.working_hours),
      zones: (zonesRes.data ?? [])
        .map((zone) => zone.city as string)
        .filter(Boolean),
      tarifs: (tarifsRes.data ?? []).map((tarif) => ({
        id: tarif.id as string,
        label: tarif.label as string,
        min:
          typeof tarif.min_price_cents === "number"
            ? tarif.min_price_cents / 100
            : null,
        max:
          typeof tarif.max_price_cents === "number"
            ? tarif.max_price_cents / 100
            : null,
      })),
      documents: (documentsRes.data ?? []).map((document) => ({
        id: document.id as string,
        titre: (document.title as string | null) ?? "Document",
        creeLe: (document.created_at as string | null) ?? null,
      })),
      ton: ((tonRes.data?.content as string | null) ?? "").trim(),
      vocabulaire: (
        (vocabulaireRes.data?.content as string | null) ?? ""
      ).trim(),
      erreur: null,
    };
  } catch (erreur) {
    return { ...vide, erreur: messageErreur(erreur) };
  }
}

export async function chargerAssistant(): Promise<AssistantDonnees> {
  const vide: AssistantDonnees = {
    companyId: null,
    companyName: "",
    horaires: "",
    zones: [],
    tarifs: [],
    documents: [],
    progression: 20,
    erreur: null,
  };

  try {
    const entreprise = await chargerEntreprise();
    if (entreprise.erreur) return { ...vide, erreur: entreprise.erreur };
    if (!entreprise.companyId) return vide;

    const supabase = createClient();
    const { data: documents, error: documentsError } = await supabase
      .from("company_knowledge")
      .select("title")
      .eq("company_id", entreprise.companyId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (documentsError) throw documentsError;

    const titres = (documents ?? [])
      .map((document) => document.title as string | null)
      .filter((titre): titre is string => Boolean(titre));

    let progression = 20;
    if (entreprise.nom) progression += 10;
    if (entreprise.telephone) progression += 10;
    if (entreprise.adresse) progression += 10;
    if (entreprise.description) progression += 10;
    if (entreprise.horaires) progression += 15;
    if (entreprise.zones.length > 0) progression += 15;
    if (entreprise.tarifs.length > 0) progression += 10;
    if (titres.length > 0) progression += 10;
    progression = Math.min(100, progression);

    return {
      companyId: entreprise.companyId,
      companyName: entreprise.nom,
      horaires: entreprise.horaires,
      zones: entreprise.zones,
      tarifs: entreprise.tarifs,
      documents: titres,
      progression,
      erreur: null,
    };
  } catch (erreur) {
    return { ...vide, erreur: messageErreur(erreur) };
  }
}

export async function ajouterZone(
  companyId: string,
  ville: string,
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const propre = ville.trim();
    if (!propre) return { erreur: "Indiquez une ville." };

    const { data: existante, error: lectureError } = await supabase
      .from("zones")
      .select("id")
      .eq("company_id", companyId)
      .ilike("city", propre)
      .maybeSingle();
    if (lectureError) throw lectureError;
    if (existante) return { erreur: null };

    const { error } = await supabase.from("zones").insert({
      company_id: companyId,
      city: propre,
      is_active: true,
    });
    if (error) throw error;
    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}

export async function enregistrerHoraires(
  companyId: string,
  label: string,
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const { data: entreprise, error: lectureError } = await supabase
      .from("companies")
      .select("working_hours")
      .eq("id", companyId)
      .maybeSingle();
    if (lectureError) throw lectureError;

    const existant =
      entreprise?.working_hours &&
      typeof entreprise.working_hours === "object"
        ? (entreprise.working_hours as Record<string, unknown>)
        : {};

    const { error } = await supabase
      .from("companies")
      .update({
        working_hours: { ...existant, label: label.trim() },
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyId);
    if (error) throw error;
    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}

export async function enregistrerZones(
  companyId: string,
  villes: string[],
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const propres = Array.from(
      new Set(
        villes
          .map((ville) => ville.trim())
          .filter((ville) => ville.length > 0),
      ),
    );

    const { error: suppressionError } = await supabase
      .from("zones")
      .delete()
      .eq("company_id", companyId);
    if (suppressionError) throw suppressionError;

    if (propres.length > 0) {
      const { error } = await supabase.from("zones").insert(
        propres.map((city) => ({
          company_id: companyId,
          city,
          is_active: true,
        })),
      );
      if (error) throw error;
    }
    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}

export async function enregistrerTarifs(
  companyId: string,
  tarifs: { label: string; min: number | null; max: number | null }[],
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const valides = tarifs
      .map((tarif) => ({
        label: tarif.label.trim(),
        min: tarif.min,
        max: tarif.max,
      }))
      .filter((tarif) => tarif.label.length > 0);

    const { error: suppressionError } = await supabase
      .from("pricing_rules")
      .delete()
      .eq("company_id", companyId);
    if (suppressionError) throw suppressionError;

    if (valides.length > 0) {
      const { error } = await supabase.from("pricing_rules").insert(
        valides.map((tarif) => ({
          company_id: companyId,
          label: tarif.label,
          min_price_cents:
            tarif.min === null ? null : Math.round(tarif.min * 100),
          max_price_cents:
            tarif.max === null ? null : Math.round(tarif.max * 100),
          is_active: true,
        })),
      );
      if (error) throw error;
    }
    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}

export async function enregistrerTon(
  companyId: string,
  ton: string,
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const propre = ton.trim();

    const { error: suppressionError } = await supabase
      .from("company_knowledge")
      .delete()
      .eq("company_id", companyId)
      .eq("type", "assistant_tone");
    if (suppressionError) throw suppressionError;

    if (propre.length > 0) {
      const { error } = await supabase.from("company_knowledge").insert({
        company_id: companyId,
        type: "assistant_tone",
        title: "Ton de l'assistant",
        content: propre,
        processed: true,
      });
      if (error) throw error;
    }

    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}

export async function enregistrerVocabulaire(
  companyId: string,
  vocabulaire: string,
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const propre = vocabulaire.trim();

    const { error: suppressionError } = await supabase
      .from("company_knowledge")
      .delete()
      .eq("company_id", companyId)
      .eq("type", "assistant_vocabulary");
    if (suppressionError) throw suppressionError;

    if (propre.length > 0) {
      const { error } = await supabase.from("company_knowledge").insert({
        company_id: companyId,
        type: "assistant_vocabulary",
        title: "Vocabulaire de l'assistant",
        content: propre,
        processed: true,
      });
      if (error) throw error;
    }

    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}

export async function televerserDocument(
  companyId: string,
  fichier: File,
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const nomPropre = fichier.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const chemin = `${companyId}/${Date.now()}-${nomPropre}`;

    const { error: uploadError } = await supabase.storage
      .from("company-documents")
      .upload(chemin, fichier, {
        contentType: fichier.type || "application/pdf",
        upsert: false,
      });
    if (uploadError) {
      if (/bucket|not found/i.test(uploadError.message)) {
        return {
          erreur:
            "Le stockage des documents n'est pas encore activé. Contactez le support.",
        };
      }
      throw uploadError;
    }

    const { error: baseError } = await supabase
      .from("company_knowledge")
      .insert({
        company_id: companyId,
        type: "pdf",
        title: fichier.name,
        file_url: chemin,
        processed: false,
      });

    if (baseError) {
      await supabase.storage.from("company-documents").remove([chemin]);
      throw baseError;
    }

    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}

export async function enregistrerNoteClient(
  clientId: string,
  note: string,
): Promise<{ erreur: string | null }> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("clients")
      .update({ notes: note })
      .eq("id", clientId);
    if (error) throw error;
    return { erreur: null };
  } catch (erreur) {
    return { erreur: messageErreur(erreur) };
  }
}
