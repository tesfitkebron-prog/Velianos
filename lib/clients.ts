export type ClientUrgence = "urgent" | "a_verifier" | "normal";

export type ClientFiche = {
  id: string;
  appointmentId: string | null;
  nom: string;
  initiales: string;
  telephone: string;
  telephoneAffiche: string;
  adresse: string;
  probleme: string;
  resume: string;
  notes?: string;
  moment: string;
  heure: string;
  urgence: ClientUrgence;
  badge: string;
  echanges: string[];
  conversationId: string;
  statutRdv?: string;
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
    badge: "bg-orange-50 text-orange-600",
    bordure: "border-l-orange-400",
    pastille: "bg-orange-500",
  },
  normal: {
    badge: "bg-slate-100 text-slate-600",
    bordure: "border-l-slate-200",
    pastille: "bg-slate-300",
  },
};

/** Avatar neutre et professionnel, identique pour tous les clients. */
export function styleAvatar(_id: string | number): string {
  void _id;
  return "bg-slate-100 text-slate-700";
}

export function vibrer(duree = 50): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duree);
    }
  } catch {
    // La vibration n'est pas disponible sur cet appareil.
  }
}

export function chiffresTelephone(valeur?: string | null): string {
  return (valeur ?? "").replace(/\D/g, "");
}

export function formaterTelephone(valeur?: string | null): string {
  const chiffres = chiffresTelephone(valeur);
  if (!chiffres) return "";
  if (chiffres.length === 10) {
    return chiffres.replace(/(\d{2})(?=\d)/g, "$1 ");
  }
  if (chiffres.length === 11 && chiffres.startsWith("33")) {
    return `+33 ${chiffres.slice(2).replace(/(\d{2})(?=\d)/g, "$1 ")}`.trim();
  }
  return valeur?.trim() ?? "";
}

export function lienTelephone(valeur?: string | null): string | null {
  const chiffres = chiffresTelephone(valeur);
  return chiffres ? `tel:${chiffres}` : null;
}

export function lienGoogleMaps(adresse?: string | null): string | null {
  const propre = adresse?.trim();
  if (!propre) return null;
  return `https://maps.google.com/?q=${encodeURIComponent(propre)}`;
}

export function initialesDe(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .map((partie) => partie.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function tempsRelatif(valeur?: string | null): string {
  if (!valeur) return "à l'instant";
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) return "à l'instant";

  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  if (heures < 48) return "hier";

  const jours = Math.floor(heures / 24);
  if (jours < 7) return `il y a ${jours} j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function heureCourte(valeur?: string | null): string {
  if (!valeur) return "";
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
