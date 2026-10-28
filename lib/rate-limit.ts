/**
 * Rate limiting basique, en mémoire, pour les routes API.
 *
 * Chaque adresse IP dispose de 20 requêtes par minute et par route. En cas de
 * déploiement multi-instances (Vercel), ce compteur est propre à chaque
 * instance : pour une limite globale, remplacer le stockage par Upstash Redis
 * ou une autre solution partagée.
 */
export const LIMITE_REQUETES = 20;
export const FENETRE_RATE_LIMIT_MS = 60_000;
export const MESSAGE_TROP_DE_REQUETES =
  "Trop de requêtes. Veuillez patienter.";

export type ResultatRateLimit = {
  autorise: boolean;
  limite: number;
  restant: number;
  /** Timestamp epoch (ms) de réinitialisation de la fenêtre. */
  reinitialisation: number;
  /** Délai en secondes avant de réessayer. */
  retryAfter: number;
};

type Seau = {
  compteur: number;
  reinitialisation: number;
};

const seaux = new Map<string, Seau>();
const TAILLE_MAX_SEAUX = 10_000;

/** Extrait l'adresse IP réelle derrière un proxy (Vercel, Cloudflare…). */
export function adresseIpClient(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const premiere = forwarded.split(",")[0]?.trim();
    if (premiere) return premiere;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  return "ip-inconnue";
}

function purgerSeaux(maintenant: number): void {
  if (seaux.size < TAILLE_MAX_SEAUX) return;

  seaux.forEach((seau, cle) => {
    if (seau.reinitialisation <= maintenant) seaux.delete(cle);
  });

  if (seaux.size >= TAILLE_MAX_SEAUX) {
    const aSupprimer = seaux.size - Math.floor(TAILLE_MAX_SEAUX * 0.9);
    let supprimes = 0;
    for (const cle of seaux.keys()) {
      if (supprimes >= aSupprimer) break;
      seaux.delete(cle);
      supprimes += 1;
    }
  }
}

/**
 * Vérifie et incrémente le compteur de la requête courante.
 *
 * @param options.cle Permet d'isoler le compteur par route (par défaut, le
 *   pathname de la requête est utilisé).
 */
export function verifierLimiteRequetes(
  request: Request,
  options: { limite?: number; fenetreMs?: number; cle?: string } = {},
): ResultatRateLimit {
  const limite = options.limite ?? LIMITE_REQUETES;
  const fenetreMs = options.fenetreMs ?? FENETRE_RATE_LIMIT_MS;
  const maintenant = Date.now();
  const route = options.cle ?? new URL(request.url).pathname;
  const cle = `${adresseIpClient(request)}:${route}`;

  purgerSeaux(maintenant);

  const existant = seaux.get(cle);
  if (!existant || existant.reinitialisation <= maintenant) {
    const reinitialisation = maintenant + fenetreMs;
    seaux.set(cle, { compteur: 1, reinitialisation });

    return {
      autorise: true,
      limite,
      restant: Math.max(0, limite - 1),
      reinitialisation,
      retryAfter: Math.ceil(fenetreMs / 1000),
    };
  }

  if (existant.compteur >= limite) {
    return {
      autorise: false,
      limite,
      restant: 0,
      reinitialisation: existant.reinitialisation,
      retryAfter: Math.max(
        1,
        Math.ceil((existant.reinitialisation - maintenant) / 1000),
      ),
    };
  }

  existant.compteur += 1;

  return {
    autorise: true,
    limite,
    restant: Math.max(0, limite - existant.compteur),
    reinitialisation: existant.reinitialisation,
    retryAfter: Math.max(
      1,
      Math.ceil((existant.reinitialisation - maintenant) / 1000),
    ),
  };
}

export function entetesRateLimit(
  resultat: ResultatRateLimit,
): Record<string, string> {
  return {
    "Retry-After": String(resultat.retryAfter),
    "X-RateLimit-Limit": String(resultat.limite),
    "X-RateLimit-Remaining": String(resultat.restant),
    "X-RateLimit-Reset": String(Math.ceil(resultat.reinitialisation / 1000)),
  };
}
