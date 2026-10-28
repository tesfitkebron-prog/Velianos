/**
 * Normalisation des numéros de téléphone.
 *
 * Twilio renvoie des numéros au format E.164 (`+33612345678`) alors que
 * l'application stocke historiquement les numéros français au format national
 * (`0612345678`). Ces helpers permettent de comparer les deux formats sans
 * dépendre de la base de données.
 */

/** Supprime tout caractère non numérique et ramène un numéro FR en 0XXXXXXXXX. */
export function normaliserNumero(valeur?: string | null): string {
  let chiffres = (valeur ?? "").replace(/\D/g, "");

  if (chiffres.startsWith("00")) chiffres = chiffres.slice(2);

  if (chiffres.startsWith("33") && chiffres.length === 11) {
    chiffres = `0${chiffres.slice(2)}`;
  }

  return chiffres;
}

/** Variantes stockables en base pour retrouver un numéro Twilio. */
export function variantesNumero(valeur?: string | null): string[] {
  const normalise = normaliserNumero(valeur);
  const brut = (valeur ?? "").replace(/\s/g, "");
  const chiffres = (valeur ?? "").replace(/\D/g, "");

  return Array.from(
    new Set([normalise, brut, chiffres].filter((item) => item.length > 0)),
  );
}

/** Deux numéros désignent-ils le même destinataire ? */
export function numerosCorrespondent(
  premier?: string | null,
  second?: string | null,
): boolean {
  const a = normaliserNumero(premier);
  const b = normaliserNumero(second);
  return a.length > 0 && a === b;
}
