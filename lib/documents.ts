/**
 * Constantes et utilitaires partagés pour l'upload des documents.
 *
 * Ce module ne dépend ni du navigateur ni de `next/headers` : il peut être
 * importé aussi bien par les composants clients que par les routes API.
 */

/** Taille maximale d'un PDF uploadé (5 Mo, aligné sur le bucket Supabase). */
export const TAILLE_MAX_FICHIER = 5 * 1024 * 1024;

export const MESSAGE_FICHIER_TROP_LOURD =
  "L'image est trop volumineuse (max 5Mo). Veuillez choisir un fichier plus léger.";

export const MESSAGE_FICHIER_NON_PDF =
  "Seuls les fichiers PDF sont autorisés.";

export const MESSAGE_EXTRACTION_PDF_IMPOSSIBLE =
  "Impossible d'extraire le texte de ce PDF. Il est peut-être scanné, protégé ou corrompu.";

export function estFichierPdf(fichier: {
  type?: string | null;
  name?: string | null;
}): boolean {
  const type = (fichier.type ?? "").toLowerCase();
  if (type === "application/pdf") return true;
  return /\.pdf$/i.test(fichier.name ?? "");
}

/**
 * Nettoie le texte extrait d'un PDF avant stockage :
 * - supprime les caractères nuls ;
 * - normalise les fins de ligne ;
 * - réduit les suites de lignes vides ;
 * - limite le nombre de caractères conservés.
 */
export function normaliserTexteExtrait(
  texte: string,
  limite = 200_000,
): string {
  return texte
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, limite);
}

/** Échappe une valeur pour l'insérer dans un document TwiML. */
export function echapperXml(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
