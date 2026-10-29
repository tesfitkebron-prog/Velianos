import type { ClientFiche } from "@/lib/clients";
import type { ChatMessage, Conversation } from "@/lib/messages";

/**
 * Données d'exemple affichées uniquement quand le compte est vide.
 * Elles permettent à l'artisan de comprendre immédiatement à quoi
 * ressembleront ses clients, ses messages et son planning.
 */

function dansQuelquesJours(jours: number, heure: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() + jours);
  date.setHours(heure, minute, 0, 0);
  return date.toISOString();
}

function aujourdHui(heure: number, minute: number): string {
  return dansQuelquesJours(0, heure, minute);
}

function messageExemple(
  id: string,
  auteur: ChatMessage["auteur"],
  texte: string,
  heure: number,
  minute: number,
): ChatMessage {
  const envoyeLe = aujourdHui(heure, minute);
  return {
    id,
    auteur,
    texte,
    heure: `${String(heure).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    statut: "lu",
    envoyeLe,
  };
}

export function creerClientsExemple(): ClientFiche[] {
  return [
    {
      id: "exemple-dupont",
      appointmentId: "exemple-rdv-dupont",
      nom: "M. Dupont",
      initiales: "MD",
      telephone: "06 12 34 56 78",
      telephoneAffiche: "06 12 34 56 78",
      adresse: "12 rue des Lilas, 69003 Lyon",
      probleme: "Fuite sous évier",
      resume:
        "Fuite sous l'évier de la cuisine. Le client a placé une bassine et souhaite une intervention rapide.",
      notes: "Code portail : 1234A. Chien dans le jardin.",
      moment: "il y a 12 min",
      heure: "08:42",
      urgence: "urgent",
      badge: "Urgent",
      echanges: [
        "Le client décrit une fuite sous l'évier, avec une bassine en dessous.",
        "Nova a qualifié l'urgence et proposé un rendez-vous demain à 14 h 30.",
        "Vous avez confirmé le passage. Le client a répondu « Parfait, merci ».",
      ],
      conversationId: "exemple-dupont",
      statutRdv: "confirmed",
      dateRdv: dansQuelquesJours(1, 14, 30),
      heureRdv: "14:30",
    },
    {
      id: "exemple-martin",
      appointmentId: "exemple-rdv-martin",
      nom: "Mme Martin",
      initiales: "MM",
      telephone: "06 98 76 54 32",
      telephoneAffiche: "06 98 76 54 32",
      adresse: "8 avenue Victor Hugo, 69006 Lyon",
      probleme: "Chauffe-eau en panne",
      resume:
        "Le chauffe-eau ne produit plus d'eau chaude depuis hier soir. La cliente souhaite un diagnostic.",
      notes: "Préfère être appelée après 18 h. Immeuble avec ascenseur.",
      moment: "il y a 1 h",
      heure: "07:55",
      urgence: "a_verifier",
      badge: "À vérifier",
      echanges: [
        "La cliente indique ne plus avoir d'eau chaude depuis la veille.",
        "Nova a demandé si le chauffe-eau affiche un voyant rouge.",
        "La cliente confirme un voyant rouge clignotant. Diagnostic à prévoir.",
      ],
      conversationId: "exemple-martin",
      statutRdv: "pending",
      dateRdv: dansQuelquesJours(2, 9, 0),
      heureRdv: "09:00",
    },
  ];
}

/**
 * Planning de démonstration : trois rendez-vous pour montrer un écran
 * immédiatement rempli, sans attendre la configuration du compte.
 */
export function creerPlanningExemple(): ClientFiche[] {
  return [
    ...creerClientsExemple(),
    {
      id: "exemple-leroy",
      appointmentId: "exemple-rdv-leroy",
      nom: "M. Leroy",
      initiales: "ML",
      telephone: "06 45 12 78 90",
      telephoneAffiche: "06 45 12 78 90",
      adresse: "24 rue de la Paix, 69002 Lyon",
      probleme: "Radiateur qui fuit",
      resume:
        "Le radiateur du salon fuit légèrement sur le parquet. Le client a fermé le robinet et demande un passage.",
      notes: "Interphone « Leroy ». Prévoir une serviette.",
      moment: "il y a 2 h",
      heure: "10:15",
      urgence: "normal",
      badge: "À planifier",
      echanges: [
        "Le client signale une petite fuite sous le radiateur du salon.",
        "Nova a demandé s'il pouvait fermer le robinet. C'est fait.",
        "Un créneau reste à confirmer avec l'artisan.",
      ],
      conversationId: "exemple-leroy",
      statutRdv: "pending",
      dateRdv: dansQuelquesJours(3, 11, 0),
      heureRdv: "11:00",
    },
  ];
}

export function trouverClientExemple(id: string): ClientFiche | null {
  return creerPlanningExemple().find((client) => client.id === id) ?? null;
}

const CLE_NOTES_EXEMPLE = "velianos_example_notes";

function lireNotesExemple(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const brut = window.localStorage.getItem(CLE_NOTES_EXEMPLE);
    if (!brut) return {};
    const valeur: unknown = JSON.parse(brut);
    if (!valeur || typeof valeur !== "object") return {};
    return valeur as Record<string, string>;
  } catch {
    return {};
  }
}

export function lireNoteExemple(clientId: string): string | null {
  const notes = lireNotesExemple();
  return typeof notes[clientId] === "string" ? notes[clientId] : null;
}

export function enregistrerNoteExemple(clientId: string, note: string): void {
  if (typeof window === "undefined") return;
  try {
    const notes = { ...lireNotesExemple(), [clientId]: note };
    window.localStorage.setItem(CLE_NOTES_EXEMPLE, JSON.stringify(notes));
    window.dispatchEvent(new Event("velianos:example-notes"));
  } catch {
    // L'exemple reste utilisable sans stockage local.
  }
}

export function creerConversationsExemple(): Conversation[] {
  const messages: ChatMessage[] = [
    messageExemple(
      "exemple-msg-1",
      "client",
      "Bonjour, j'ai une fuite sous mon évier. Pouvez-vous passer ?",
      8,
      42,
    ),
    messageExemple(
      "exemple-msg-2",
      "assistant",
      "Bonjour M. Dupont, je suis Nova, l'assistante de Velianos Plomberie. La fuite coule-t-elle activement en ce moment ?",
      8,
      42,
    ),
    messageExemple(
      "exemple-msg-3",
      "client",
      "Oui, ça coule doucement. J'ai mis une bassine en dessous.",
      8,
      43,
    ),
    messageExemple(
      "exemple-msg-4",
      "assistant",
      "Merci. Pouvez-vous me confirmer votre adresse ?",
      8,
      43,
    ),
    messageExemple(
      "exemple-msg-5",
      "client",
      "12 rue des Lilas, Lyon 3e.",
      8,
      44,
    ),
    messageExemple(
      "exemple-msg-6",
      "assistant",
      "C'est noté. Je vous propose un rendez-vous demain à 14 h 30. Je transmets à l'artisan pour validation.",
      8,
      44,
    ),
    messageExemple(
      "exemple-msg-7",
      "vous",
      "Bonjour M. Dupont, je confirme mon passage demain à 14 h 30. À bientôt.",
      8,
      50,
    ),
  ];

  return [
    {
      id: "exemple-dupont",
      nom: "M. Dupont",
      initiale: "MD",
      telephone: "06 12 34 56 78",
      dernierMessage:
        "Bonjour M. Dupont, je confirme mon passage demain à 14 h 30. À bientôt.",
      heure: "08:50",
      nonLus: 0,
      dernierAuteur: "vous",
      messages,
      exemple: true,
    },
  ];
}
