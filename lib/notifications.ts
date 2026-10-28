const CLE_NOTIFICATIONS_LUES = "velianos_notifications_lues";

export const EVENEMENT_NOTIFICATIONS_LUES = "velianos:notifications-lues";

/** Indique s'il reste des notifications non consultées. */
export function notificationsNonLues(): boolean {
  try {
    return window.localStorage.getItem(CLE_NOTIFICATIONS_LUES) !== "1";
  } catch {
    return true;
  }
}

/** Marque les notifications comme consultées et prévient la TopBar. */
export function marquerNotificationsLues(): void {
  try {
    window.localStorage.setItem(CLE_NOTIFICATIONS_LUES, "1");
  } catch {
    // Stockage local indisponible : le point rouge reste informatif.
  }

  window.dispatchEvent(new Event(EVENEMENT_NOTIFICATIONS_LUES));
}
