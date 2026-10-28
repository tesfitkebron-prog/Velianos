/**
 * Formatage centralisé des dates Velianos.
 *
 * Les dates stockées dans Supabase sont toujours en UTC (TIMESTAMPTZ ou
 * chaîne ISO produite par `new Date().toISOString()`). Elles sont affichées
 * dans le fuseau de l'utilisateur, Europe/Paris, pour éviter tout décalage
 * entre le serveur et le navigateur.
 */
export const FUSEAU_HORAIRE = "Europe/Paris";

export type DateInput = string | number | Date | null | undefined;

const formateurs = new Map<string, Intl.DateTimeFormat>();

function formateur(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const cle = JSON.stringify(options);
  const existant = formateurs.get(cle);
  if (existant) return existant;

  const cree = new Intl.DateTimeFormat("fr-FR", {
    ...options,
    timeZone: FUSEAU_HORAIRE,
  });
  formateurs.set(cle, cree);
  return cree;
}

const formateurMois = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSEAU_HORAIRE,
  year: "numeric",
  month: "2-digit",
});

/** Convertit une date UTC (ISO ou Date) en objet Date valide. */
export function parseDateUTC(valeur: DateInput): Date | null {
  if (valeur === null || valeur === undefined || valeur === "") return null;
  const date = valeur instanceof Date ? valeur : new Date(valeur);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Affiche une date UTC en français dans le fuseau Europe/Paris.
 *
 * @example formatDateFrench("2026-10-28T13:05:00.000Z")
 *   → "28/10/2026"
 * @example formatDateFrench(valeur, { hour: "2-digit", minute: "2-digit" })
 *   → "14:05"
 */
export function formatDateFrench(
  dateString: DateInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = parseDateUTC(dateString);
  if (!date) return "";

  const optionsFinales: Intl.DateTimeFormatOptions =
    Object.keys(options).length > 0
      ? options
      : { day: "2-digit", month: "2-digit", year: "numeric" };

  return formateur(optionsFinales).format(date);
}

/** Renvoie le mois Parisien d'une date UTC au format `YYYY-MM`. */
export function moisParis(valeur: DateInput = new Date()): string {
  const date = parseDateUTC(valeur);
  if (!date) return "";

  const parties = formateurMois.formatToParts(date);
  const annee = parties.find((partie) => partie.type === "year")?.value ?? "";
  const mois = parties.find((partie) => partie.type === "month")?.value ?? "";

  return annee && mois ? `${annee}-${mois}` : "";
}
