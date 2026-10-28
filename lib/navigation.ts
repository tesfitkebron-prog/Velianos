const SOUS_PAGES_AVEC_RETOUR = ["/entreprise", "/notifications"];

export function normaliserChemin(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Sous-pages qui affichent un en-tête avec une flèche de retour.
 * Les racines de la navigation principale gardent la TopBar.
 */
export function estSousPageAvecRetour(pathname: string): boolean {
  const chemin = normaliserChemin(pathname);
  return (
    SOUS_PAGES_AVEC_RETOUR.includes(chemin) || chemin.startsWith("/compte/")
  );
}

/**
 * Liste parente vers laquelle revenir si une sous-page a été ouverte
 * directement (sans historique de navigation).
 */
export function cheminParent(pathname: string): string | null {
  const chemin = normaliserChemin(pathname);

  if (/^\/clients\/[^/]+$/.test(chemin)) return "/clients";
  if (/^\/messages\/[^/]+$/.test(chemin)) return "/messages";
  if (chemin.startsWith("/compte/")) return "/compte";
  if (chemin === "/entreprise") return "/parametres";
  if (chemin === "/notifications") return "/dashboard";

  return null;
}
