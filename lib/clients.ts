import { formatDateFrench, parseDateUTC } from "@/lib/date";

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
  dateRdv?: string | null;
  heureRdv?: string;
};

export const STYLE_URGENCE: Record<
  ClientUrgence,
  { badge: string; bordure: string; pastille: string }
> = {
  urgent: {
    badge: "bg-red-600 text-white shadow-sm shadow-red-600/25",
    bordure: "border-l-red-500",
    pastille: "bg-red-500",
  },
  a_verifier: {
    badge: "bg-orange-500 text-white shadow-sm shadow-orange-500/25",
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
  return "bg-[#EDF3FF] text-[#1D4ED8]";
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

/** Formate un numéro brut pour l'affichage, ex. 0611223344 → 06 11 22 33 44. */
export function formaterTelephone(valeur?: string | null): string {
  const chiffres = chiffresTelephone(valeur);
  if (!chiffres) return "";

  const national =
    chiffres.startsWith("0033") && chiffres.length === 13
      ? chiffres.slice(4)
      : chiffres.startsWith("33") && chiffres.length === 11
        ? chiffres.slice(2)
        : null;

  if (national && national.length === 9) {
    return `+33 ${national.replace(
      /(\d)(\d{2})(\d{2})(\d{2})(\d{2})/,
      "$1 $2 $3 $4 $5",
    )}`;
  }

  if (chiffres.length === 10) {
    return chiffres.replace(/(\d{2})(?=\d)/g, "$1 ");
  }

  return valeur?.trim() ?? "";
}

export function lienTelephone(valeur?: string | null): string | null {
  const chiffres = chiffresTelephone(valeur);
  return chiffres ? `tel:${chiffres}` : null;
}

/** Vérifie qu'un numéro français contient exactement 10 chiffres et aucun caractère invalide. */
export function estTelephoneValide(valeur?: string | null): boolean {
  const brut = (valeur ?? "").trim();
  return (
    brut.length > 0 &&
    !/[^\d\s.+\-()]/.test(brut) &&
    chiffresTelephone(brut).length === 10
  );
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
  const date = parseDateUTC(valeur);
  if (!date) return "à l'instant";

  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  if (heures < 48) return "hier";

  const jours = Math.floor(heures / 24);
  if (jours < 7) return `il y a ${jours} j`;

  return formatDateFrench(date, { day: "numeric", month: "short" });
}

export function heureCourte(valeur?: string | null): string {
  return formatDateFrench(valeur, { hour: "2-digit", minute: "2-digit" });
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
