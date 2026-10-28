import type { ClientFiche } from "@/lib/clients";
import type { Conversation } from "@/lib/messages";

/**
 * Données de démonstration utilisées uniquement lorsque Supabase ne renvoie
 * aucun client / aucune conversation. Elles permettent de valider le design
 * des écrans remplis sans polluer un compte réel.
 */
export const MOCK_CLIENTS: ClientFiche[] = [
  {
    id: "mock-dupont",
    appointmentId: null,
    nom: "M. Dupont",
    initiales: "MD",
    telephone: "06 11 22 33 44",
    telephoneAffiche: "06 11 22 33 44",
    adresse: "5 rue Garibaldi, 69003 Lyon",
    probleme: "Fuite sous évier",
    resume:
      "Le client signale une fuite sous l'évier de la cuisine. L'eau commence à s'accumuler dans le placard.",
    moment: "il y a 12 min",
    heure: "09:42",
    urgence: "urgent",
    badge: "Urgent",
    echanges: [
      "Bonjour M. Dupont, je note une fuite sous l'évier au 5 rue Garibaldi.",
      "Je transmets votre demande à votre artisan, il vous rappelle rapidement.",
    ],
    conversationId: "mock-dupont",
    statutRdv: "new",
  },
  {
    id: "mock-martin",
    appointmentId: null,
    nom: "Mme Martin",
    initiales: "MM",
    telephone: "06 22 33 44 55",
    telephoneAffiche: "06 22 33 44 55",
    adresse: "18 avenue Jean Jaurès, 69100 Villeurbanne",
    probleme: "Chauffe-eau en panne",
    resume:
      "Le chauffe-eau ne produit plus d'eau chaude depuis hier soir. La cliente est disponible toute la matinée.",
    moment: "il y a 35 min",
    heure: "09:18",
    urgence: "a_verifier",
    badge: "À vérifier",
    echanges: [
      "Bonjour Mme Martin, je note votre chauffe-eau en panne depuis hier soir.",
      "Je vérifie le créneau avec votre artisan et je reviens vers vous.",
    ],
    conversationId: "mock-martin",
    statutRdv: "pending",
  },
  {
    id: "mock-bernard",
    appointmentId: null,
    nom: "M. Bernard",
    initiales: "MB",
    telephone: "06 33 44 55 66",
    telephoneAffiche: "06 33 44 55 66",
    adresse: "42 cours Vitton, 69006 Lyon",
    probleme: "Devis salle de bain",
    resume:
      "Le client souhaite un devis pour la rénovation complète de sa salle de bain. Il préfère être rappelé en fin de journée.",
    moment: "il y a 2 h",
    heure: "08:05",
    urgence: "normal",
    badge: "Nouveau",
    echanges: [
      "Bonjour M. Bernard, je note votre projet de rénovation de salle de bain.",
      "Votre artisan vous rappelle en fin de journée pour établir le devis.",
    ],
    conversationId: "mock-bernard",
    statutRdv: "new",
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "mock-dupont",
    nom: "M. Dupont",
    initiale: "MD",
    telephone: "06 11 22 33 44",
    dernierMessage: "Je peux passer entre 14h et 16h.",
    heure: "09:48",
    nonLus: 0,
    dernierAuteur: "vous",
    messages: [
      {
        id: "mock-dupont-1",
        auteur: "assistant",
        texte:
          "Bonjour M. Dupont, ici l'assistant de votre artisan. Comment puis-je vous aider ?",
        heure: "09:42",
        statut: "lu",
        envoyeLe: "2026-10-28T09:42:00+01:00",
      },
      {
        id: "mock-dupont-2",
        auteur: "client",
        texte:
          "Bonjour, j'ai une fuite sous mon évier. Pouvez-vous intervenir aujourd'hui ?",
        heure: "09:44",
        statut: "lu",
        envoyeLe: "2026-10-28T09:44:00+01:00",
      },
      {
        id: "mock-dupont-3",
        auteur: "vous",
        texte: "Bonjour M. Dupont, je peux passer entre 14h et 16h.",
        heure: "09:48",
        statut: "lu",
        envoyeLe: "2026-10-28T09:48:00+01:00",
      },
    ],
  },
  {
    id: "mock-martin",
    nom: "Mme Martin",
    initiale: "MM",
    telephone: "06 22 33 44 55",
    dernierMessage: "Je transmets votre demande, vous serez rappelée avant 18h.",
    heure: "09:31",
    nonLus: 2,
    dernierAuteur: "assistant",
    messages: [
      {
        id: "mock-martin-1",
        auteur: "assistant",
        texte:
          "Bonjour Mme Martin, ici l'assistant de votre artisan. Comment puis-je vous aider ?",
        heure: "09:18",
        statut: "lu",
        envoyeLe: "2026-10-28T09:18:00+01:00",
      },
      {
        id: "mock-martin-2",
        auteur: "client",
        texte: "Mon chauffe-eau est en panne depuis hier soir.",
        heure: "09:22",
        statut: "envoye",
        envoyeLe: "2026-10-28T09:22:00+01:00",
      },
      {
        id: "mock-martin-3",
        auteur: "client",
        texte: "Je suis disponible toute la matinée si vous pouvez passer.",
        heure: "09:24",
        statut: "envoye",
        envoyeLe: "2026-10-28T09:24:00+01:00",
      },
      {
        id: "mock-martin-4",
        auteur: "assistant",
        texte:
          "Je transmets votre demande, vous serez rappelée avant 18h.",
        heure: "09:31",
        statut: "lu",
        envoyeLe: "2026-10-28T09:31:00+01:00",
      },
    ],
  },
];

export function estConversationDemo(id: string): boolean {
  return id.startsWith("mock-");
}
