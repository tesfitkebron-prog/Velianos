export const MESSAGE_SESSION_EXPIREE =
  "Votre session a expiré. Veuillez vous reconnecter.";

const CLE_DECONNEXION_VOLONTAIRE = "velianos_deconnexion_volontaire";
const DUREE_DECONNEXION_VOLONTAIRE = 30_000;

/**
 * Marque la prochaine déconnexion comme volontaire pour éviter le toast
 * d'expiration de session sur l'écran de connexion.
 */
export function marquerDeconnexionVolontaire(): void {
  try {
    window.sessionStorage.setItem(
      CLE_DECONNEXION_VOLONTAIRE,
      String(Date.now()),
    );
  } catch {
    // Stockage indisponible : la déconnexion reste possible.
  }
}

/**
 * Consomme le drapeau de déconnexion volontaire (une seule fois).
 * Le drapeau expire rapidement pour ne jamais masquer une vraie expiration.
 */
export function consommerDeconnexionVolontaire(): boolean {
  try {
    const valeur = window.sessionStorage.getItem(CLE_DECONNEXION_VOLONTAIRE);
    if (!valeur) return false;

    window.sessionStorage.removeItem(CLE_DECONNEXION_VOLONTAIRE);

    const date = Number(valeur);
    return (
      Number.isFinite(date) &&
      Date.now() - date <= DUREE_DECONNEXION_VOLONTAIRE
    );
  } catch {
    return false;
  }
}
