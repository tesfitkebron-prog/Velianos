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
      notes: "",
      moment: "il y a 12 min",
      heure: "08:42",
      urgence: "urgent",
      badge: "Urgent",
      echanges: [
        "Le client décrit une fuite sous l'évier, avec une bassine en dessous.",
        "Nova a qualifié l'urgence et proposé un rendez-vous demain à 14 h 30.",
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
      notes: "",
      moment: "il y a 1 h",
      heure: "07:55",
      urgence: "a_verifier",
      badge: "À vérifier",
      echanges: [
        "La cliente indique ne plus avoir d'eau chaude depuis la veille.",
        "Nova a demandé si le chauffe-eau affiche un voyant rouge.",
      ],
      conversationId: "exemple-martin",
      statutRdv: "pending",
      dateRdv: dansQuelquesJours(2, 9, 0),
      heureRdv: "09:00",
    },
  ];
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
