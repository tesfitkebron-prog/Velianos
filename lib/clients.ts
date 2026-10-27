export type ClientUrgence = "urgent" | "a_verifier" | "normal";

export type ClientFiche = {
  id: string;
  nom: string;
  initiales: string;
  telephone: string;
  telephoneAffiche: string;
  adresse: string;
  probleme: string;
  resume: string;
  moment: string;
  heure: string;
  urgence: ClientUrgence;
  badge: string;
  echanges: string[];
  conversationId: number;
};

export const STYLE_URGENCE: Record<
  ClientUrgence,
  { badge: string; bordure: string; pastille: string }
> = {
  urgent: {
    badge: "bg-red-50 text-red-600",
    bordure: "border-l-red-500",
    pastille: "bg-red-500",
  },
  a_verifier: {
    badge: "bg-orange-100 text-orange-700",
    bordure: "border-l-orange-400",
    pastille: "bg-orange-500",
  },
  normal: {
    badge: "bg-slate-100 text-slate-600",
    bordure: "border-l-slate-200",
    pastille: "bg-slate-300",
  },
};

/** Avatar neutre, identique pour tous les clients. */
export function styleAvatar(_id: string | number): string {
  void _id;
  return "bg-slate-100 text-slate-700";
}

export const CLIENTS: ClientFiche[] = [
  {
    id: "1",
    nom: "M. Dupont",
    initiales: "MD",
    telephone: "0612345678",
    telephoneAffiche: "06 12 34 56 78",
    adresse: "12 rue de la Paix, 75002 Paris",
    probleme: "Fuite sous évier",
    resume:
      "Fuite sous l'évier de la cuisine, l'eau coule en continu depuis ce matin. Le client craint d'inonder le voisin du dessous.",
    moment: "il y a 5 min",
    heure: "14:28",
    urgence: "urgent",
    badge: "Fuite active",
    echanges: [
      "L'assistant a demandé si l'eau est coupée. Client : oui.",
      "L'assistant a demandé depuis quand. Client : depuis 7h ce matin.",
      "Le client est disponible toute la matinée, joignable avant 10h.",
    ],
    conversationId: 1,
  },
  {
    id: "2",
    nom: "Mme Martin",
    initiales: "MM",
    telephone: "0698765432",
    telephoneAffiche: "06 98 76 54 32",
    adresse: "45 avenue Victor Hugo, 75016 Paris",
    probleme: "Chauffe-eau en panne",
    resume:
      "Plus d'eau chaude depuis hier soir, le voyant du chauffe-eau clignote rouge. Le client a déjà vérifié le disjoncteur, sans résultat.",
    moment: "il y a 2 h",
    heure: "11:15",
    urgence: "a_verifier",
    badge: "À vérifier",
    echanges: [
      "L'assistant a demandé si le chauffe-eau est électrique. Client : oui.",
      "L'assistant a demandé si le disjoncteur a été vérifié. Client : oui, sans effet.",
      "Le client souhaite un rendez-vous demain matin.",
    ],
    conversationId: 2,
  },
  {
    id: "3",
    nom: "M. Bernard",
    initiales: "MB",
    telephone: "0711223344",
    telephoneAffiche: "07 11 22 33 44",
    adresse: "8 rue des Lilas, 92100 Boulogne-Billancourt",
    probleme: "Devis salle de bain",
    resume:
      "Souhaite un devis pour une salle de bain complète : douche italienne, carrelage et remplacement du lavabo. Budget annoncé autour de 6 000 €.",
    moment: "hier",
    heure: "09:45",
    urgence: "normal",
    badge: "Devis",
    echanges: [
      "L'assistant a noté la surface : environ 6 m².",
      "L'assistant a demandé le budget. Client : autour de 6 000 €.",
      "Le client préfère être rappelé après 18h.",
    ],
    conversationId: 3,
  },
];

const ORDRE_URGENCE: Record<ClientUrgence, number> = {
  urgent: 0,
  a_verifier: 1,
  normal: 2,
};

export function trierParUrgence(clients: ClientFiche[]): ClientFiche[] {
  return [...clients].sort((a, b) => {
    const urgence = ORDRE_URGENCE[a.urgence] - ORDRE_URGENCE[b.urgence];
    if (urgence !== 0) return urgence;
    return b.heure.localeCompare(a.heure);
  });
}

export function trouverClient(id: string | number | null): ClientFiche | null {
  if (id === null) return null;
  return CLIENTS.find((client) => client.id === String(id)) ?? null;
}
