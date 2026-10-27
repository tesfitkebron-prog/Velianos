const SOUS_PAGES_AVEC_RETOUR = ["/messages", "/entreprise"];

export function normaliserChemin(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Sous-pages qui affichent un en-tête avec une flèche de retour.
 * Les trois racines (/dashboard, /clients, /parametres) gardent la TopBar.
 */
export function estSousPageAvecRetour(pathname: string): boolean {
  const chemin = normaliserChemin(pathname);
  return (
    SOUS_PAGES_AVEC_RETOUR.includes(chemin) ||
    chemin.startsWith("/compte/")
  );
}
