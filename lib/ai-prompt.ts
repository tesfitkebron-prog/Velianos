export type TarifAssistant = {
  label: string;
  min: number | null;
  max: number | null;
};

export type ContexteAssistant = {
  nom: string;
  telephone?: string;
  adresse?: string;
  description?: string;
  horaires?: string;
  zones?: string[];
  tarifs?: TarifAssistant[];
  documents?: string[];
  ton?: string;
  vocabulaire?: string;
};

export type MessageSimulation = {
  role: "assistant" | "user";
  texte: string;
};

/**
 * Prompt système envoyé à l'API OpenAI (via Twilio pour les SMS).
 * Le nom de l'entreprise et ses informations sont injectés par
 * `construireSystemPrompt` avant chaque conversation.
 */
export const SYSTEM_PROMPT = `Tu es l'assistant virtuel de [Nom de l'entreprise]. Ton but est de qualifier les demandes clients par SMS.

RÈGLES ABSOLUES :
- RÈGLE 1 : Ne donne JAMAIS un prix ferme, donne une fourchette basée sur les tarifs fournis.
- RÈGLE 2 : Vérifie toujours si l'adresse du client est dans la zone d'intervention.
- RÈGLE 3 : Si tu ne connais pas la réponse, dis au client que tu vas transmettre l'info à l'artisan.
- RÈGLE 4 : Utilise un ton chaleureux, direct et professionnel.

ANTI-HALLUCINATION :
- Utilise uniquement les informations de l'entreprise fournies ci-dessous.
- N'invente jamais un prix, une disponibilité, une adresse ou une prestation.
- Si l'information n'est pas dans le contexte, réponds exactement : « Je n'ai pas cette information. M. [Nom] vous rappellera pour vous répondre. »

FORMAT SMS :
- 1 à 3 phrases maximum.
- Pas de markdown, pas de listes à puces.
- Pose une question utile quand c'est pertinent.`;

export function reponseAntiHallucination(nom: string): string {
  const artisan = nom.trim();
  if (!artisan) {
    return "Je n'ai pas cette information. L'artisan vous rappellera pour vous répondre.";
  }
  return `Je n'ai pas cette information. M. ${artisan} vous rappellera pour vous répondre.`;
}

export function construireSystemPrompt(contexte: ContexteAssistant): string {
  const nom = contexte.nom.trim() || "votre entreprise";
  const lignes: string[] = [`Nom de l'entreprise : ${nom}`];

  if (contexte.telephone?.trim()) {
    lignes.push(`Téléphone : ${contexte.telephone.trim()}`);
  }
  if (contexte.adresse?.trim()) {
    lignes.push(`Adresse : ${contexte.adresse.trim()}`);
  }
  if (contexte.horaires?.trim()) {
    lignes.push(`Horaires : ${contexte.horaires.trim()}`);
  }
  if (contexte.description?.trim()) {
    lignes.push(`Activité : ${contexte.description.trim()}`);
  }

  const zones = (contexte.zones ?? []).map((zone) => zone.trim()).filter(Boolean);
  lignes.push(
    zones.length > 0
      ? `Zone d'intervention : ${zones.join(", ")}`
      : "Zone d'intervention : non renseignée",
  );

  const tarifs = contexte.tarifs ?? [];
  if (tarifs.length > 0) {
    lignes.push(
      `Tarifs (fourchettes indicatives) : ${tarifs
        .map((tarif) => `${tarif.label} : ${decrireFourchette(tarif)}`)
        .join(" · ")}`,
    );
  } else {
    lignes.push("Tarifs : non renseignés");
  }

  const documents = (contexte.documents ?? [])
    .map((document) => document.trim())
    .filter(Boolean);
  if (documents.length > 0) {
    lignes.push(`Documents disponibles : ${documents.join(", ")}`);
  }

  if (contexte.ton?.trim()) {
    lignes.push(`Ton souhaité : ${contexte.ton.trim()}`);
  }
  if (contexte.vocabulaire?.trim()) {
    lignes.push(`Vocabulaire à utiliser : ${contexte.vocabulaire.trim()}`);
  }

  return `${SYSTEM_PROMPT.replaceAll("[Nom de l'entreprise]", nom).replaceAll(
    "[Nom]",
    nom,
  )}

INFORMATIONS DE L'ENTREPRISE (source de vérité unique) :
${lignes.map((ligne) => `- ${ligne}`).join("\n")}

Si une information n'est pas listée ci-dessus, tu ne la connais pas et tu appliques la règle anti-hallucination.`;
}

const MOTS_VIDES = new Set([
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "du",
  "de",
  "d",
  "au",
  "aux",
  "a",
  "et",
  "ou",
  "en",
  "dans",
  "sur",
  "pour",
  "par",
  "avec",
  "chez",
  "mon",
  "ma",
  "mes",
  "ton",
  "ta",
  "tes",
  "son",
  "sa",
  "ses",
  "notre",
  "nos",
  "votre",
  "vos",
  "leur",
  "leurs",
  "je",
  "tu",
  "il",
  "elle",
  "on",
  "nous",
  "vous",
  "ils",
  "elles",
  "ce",
  "cet",
  "cette",
  "ces",
  "est",
  "sont",
  "suis",
  "sommes",
  "etre",
  "avoir",
  "ai",
  "as",
  "avons",
  "avez",
  "ont",
  "habite",
  "habitons",
  "vis",
  "vivons",
  "reside",
  "residons",
  "adresse",
  "ville",
  "code",
  "postal",
  "rue",
  "avenue",
  "boulevard",
  "route",
  "impasse",
  "place",
  "quartier",
  "domicile",
  "maison",
  "ici",
  "travail",
  "bureau",
  "depuis",
  "tres",
  "bien",
  "merci",
  "cause",
  "propos",
  "partir",
  "travers",
  "cote",
  "niveau",
  "bonjour",
  "bonsoir",
  "salut",
  "hello",
  "coucou",
  "intervenez",
  "intervenons",
  "courez",
  "couvrez",
  "deplacez",
  "situe",
  "situes",
  "situee",
  "situees",
]);

const MOTS_PRIX = [
  "prix",
  "tarif",
  "tarifs",
  "combien",
  "coute",
  "cout",
  "devis",
  "budget",
];

const MOTS_ZONE = [
  "zone",
  "intervenez",
  "intervention",
  "deplacez",
  "deplacement",
  "secteur",
  "couvrez",
  "adresse",
  "ville",
  "code postal",
  "habite",
];

const MOTS_PROBLEME = [
  "fuite",
  "evier",
  "lavabo",
  "wc",
  "toilette",
  "toilettes",
  "chasse",
  "canalisation",
  "canalisations",
  "bouche",
  "bouchee",
  "debouchage",
  "deboucher",
  "chauffe eau",
  "ballon",
  "radiateur",
  "chauffage",
  "panne",
  "serrure",
  "porte",
  "fenetre",
  "electricite",
  "electrique",
  "prise",
  "lumiere",
  "disjoncte",
  "plomberie",
  "sanitaire",
  "travaux",
  "reparation",
  "reparer",
  "installer",
  "installation",
];

const MOTS_URGENCE = [
  "urgent",
  "urgence",
  "inondation",
  "inonde",
  "ca coule",
  "plus d eau",
  "panne totale",
  "degat des eaux",
];

const MOTS_HORAIRES = [
  "horaire",
  "horaires",
  "ouvert",
  "ouverte",
  "ouverts",
  "ouvertes",
  "ferme",
  "fermee",
  "quelle heure",
  "quand etes",
  "a quelle heure",
];

const MOTS_SERVICES = [
  "faites",
  "service",
  "services",
  "prestation",
  "prestations",
  "specialite",
  "specialites",
  "activite",
  "activites",
  "quoi comme",
  "qui etes",
  "presentez",
];

const MOTS_DOCUMENTS = [
  "document",
  "documents",
  "garantie",
  "attestation",
  "certificat",
];

const MOTS_CRENEAU = [
  "rendez vous",
  "creneau",
  "creneaux",
  "disponible",
  "disponibilite",
  "demain",
  "aujourd hui",
  "cette semaine",
  "matin",
  "apres midi",
  "rdv",
];

const MOTS_ADRESSE_ENTREPRISE = [
  "ou etes vous",
  "ou etes vous situes",
  "votre adresse",
  "adresse de l entreprise",
  "vous situez",
];

const formateurEuros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contientUn(texte: string, expressions: string[]): boolean {
  const jetons = texte.split(" ").filter(Boolean);
  return expressions.some((expression) => {
    const mots = expression.split(" ").filter(Boolean);
    if (mots.length === 1) {
      return jetons.some((jeton) => jeton.startsWith(mots[0]));
    }
    return ` ${texte} `.includes(` ${expression} `);
  });
}

function montant(valeur: number): string {
  return formateurEuros.format(valeur);
}

function decrireFourchette(tarif: TarifAssistant): string {
  const { min, max } = tarif;
  if (min !== null && max !== null) {
    if (min === max) return `environ ${montant(min)}`;
    return `entre ${montant(min)} et ${montant(max)}`;
  }
  if (min !== null) return `à partir de ${montant(min)}`;
  if (max !== null) return `jusqu'à ${montant(max)}`;
  return "sur devis";
}

function phraseTarif(tarif: TarifAssistant): string {
  const label = tarif.label.trim().toLowerCase();
  const fourchette = decrireFourchette(tarif);
  if (fourchette === "sur devis") {
    return `Pour ${label}, le tarif est établi sur devis`;
  }
  return `Pour ${label}, comptez ${fourchette} (fourchette indicative)`;
}

function racine(mot: string): string {
  return mot.length > 6 ? mot.slice(0, 6) : mot;
}

function motsDuTexte(texte: string): string[] {
  return normaliser(texte)
    .split(" ")
    .filter((mot) => mot.length >= 3 && !MOTS_VIDES.has(mot));
}

function tarifCorrespondant(
  message: string,
  tarifs: TarifAssistant[],
): TarifAssistant | null {
  const motsMessage = new Set(motsDuTexte(message).map(racine));
  let meilleur: TarifAssistant | null = null;
  let meilleurScore = 0;

  for (const tarif of tarifs) {
    const score = motsDuTexte(tarif.label)
      .map(racine)
      .filter((mot) => motsMessage.has(mot)).length;
    if (score > meilleurScore) {
      meilleur = tarif;
      meilleurScore = score;
    }
  }

  return meilleur;
}

function trouverZone(message: string, zones: string[]): string | null {
  const texte = ` ${normaliser(message)} `;
  for (const zone of zones) {
    const propre = normaliser(zone);
    if (!propre) continue;
    const premierMot = propre.split(" ")[0];
    if (
      texte.includes(` ${propre} `) ||
      (premierMot.length >= 4 && texte.includes(` ${premierMot} `))
    ) {
      return zone;
    }
  }
  return null;
}

function capitaliser(texte: string): string {
  return texte.replace(
    /(^|[\s-])([a-z])/g,
    (_trouve, separateur: string, lettre: string) =>
      `${separateur}${lettre.toUpperCase()}`,
  );
}

function extraireVille(texte: string, attendVille: boolean): string | null {
  const motifs = [
    /(?:j habite|je vis|je reside|nous habitons|nous vivons)\s+(?:a|au|aux|en|dans|sur)?\s*([a-z][a-z-]*(?:\s+[a-z][a-z-]*)?)/,
    /(?:je suis|nous sommes)\s+(?:a|au|aux|en|dans|sur)\s+([a-z][a-z-]*(?:\s+[a-z][a-z-]*)?)/,
    /(?:intervenez vous|vous intervenez|vous couvrez|vous deplacez)\s+(?:a|au|aux|en|dans|sur)?\s*([a-z][a-z-]*(?:\s+[a-z][a-z-]*)?)/,
    /(?:fuite|panne|casse|probleme|intervention|travaux|adresse)\s+(?:a|au|aux|en|dans|sur|chez)\s+([a-z][a-z-]*(?:\s+[a-z][a-z-]*)?)/,
  ];

  for (const motif of motifs) {
    const resultat = texte.match(motif);
    if (!resultat?.[1]) continue;
    const mots = resultat[1]
      .split(" ")
      .filter((mot) => mot.length >= 2 && !MOTS_VIDES.has(mot))
      .slice(0, 2);
    if (mots.length > 0) return capitaliser(mots.join(" "));
  }

  if (
    attendVille &&
    !contientUn(texte, MOTS_PROBLEME) &&
    !contientUn(texte, MOTS_PRIX)
  ) {
    const mots = texte
      .split(" ")
      .filter((mot) => mot.length >= 2 && !MOTS_VIDES.has(mot))
      .slice(0, 3);
    if (mots.length > 0 && mots.length <= 3) {
      return capitaliser(mots.join(" "));
    }
  }

  return null;
}

function apercuZones(zones: string[]): string {
  if (zones.length <= 4) return zones.join(", ");
  return `${zones.slice(0, 4).join(", ")}…`;
}

/**
 * Simulateur SMS déterministe : il applique les règles du SYSTEM_PROMPT
 * sans appeler l'API, à partir des seules informations de l'entreprise.
 */
export function simulerReponseSms(
  message: string,
  contexte: ContexteAssistant,
  historique: MessageSimulation[] = [],
): string {
  const texte = normaliser(message);
  const nom = contexte.nom.trim();
  const zones = (contexte.zones ?? []).map((zone) => zone.trim()).filter(Boolean);
  const tarifs = contexte.tarifs ?? [];
  const documents = (contexte.documents ?? [])
    .map((document) => document.trim())
    .filter(Boolean);

  if (!texte) return "Pouvez-vous me préciser votre demande ?";

  const derniereReponse = [...historique]
    .reverse()
    .find((item) => item.role === "assistant");
  const derniereQuestion = derniereReponse
    ? normaliser(derniereReponse.texte)
    : "";
  const attendVille = contientUn(derniereQuestion, [
    "ville",
    "adresse",
    "code postal",
    "zone",
  ]);
  const attendPrestation = contientUn(derniereQuestion, [
    "prestation",
    "tarif",
    "prix",
    "devis",
  ]);

  const sansSalutation = texte
    .replace(/\b(bonjour|bonsoir|salut|hello|coucou)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!sansSalutation) {
    return `Bonjour, ici l'assistant de ${
      nom || "votre entreprise"
    }. Comment puis-je vous aider ?`;
  }

  if (
    contientUn(texte, ["merci", "au revoir", "bonne journee", "a bientot"]) &&
    texte.split(" ").length <= 8
  ) {
    return "Avec plaisir. L'artisan vous rappellera dès que possible. Bonne journée !";
  }

  const tarif = tarifCorrespondant(texte, tarifs);
  const demandePrix =
    contientUn(texte, MOTS_PRIX) || (attendPrestation && tarif !== null);

  if (demandePrix) {
    if (!tarif && tarifs.length === 0) {
      return reponseAntiHallucination(nom);
    }

    const zone = trouverZone(texte, zones);
    const ville = extraireVille(texte, attendVille);
    let reponse: string;

    if (tarif) {
      reponse = `${phraseTarif(tarif)}.`;
    } else {
      const apercu = tarifs
        .slice(0, 3)
        .map((item) => `${item.label} : ${decrireFourchette(item)}`)
        .join(" · ");
      reponse = `Voici nos fourchettes indicatives : ${apercu}.`;
    }

    reponse += " Le tarif final est confirmé après diagnostic.";
    if (zone) {
      reponse += ` ${zone} fait partie de notre zone d'intervention.`;
    } else if (ville) {
      reponse +=
        " Je transmets votre adresse à l'artisan pour confirmer la zone d'intervention.";
    } else {
      reponse += " Pouvez-vous me préciser votre ville ?";
    }
    return reponse;
  }

  if (contientUn(texte, MOTS_HORAIRES)) {
    if (contexte.horaires?.trim()) {
      return `Nos horaires : ${
        contexte.horaires.trim()
      }. L'artisan vous rappellera pour convenir d'un créneau.`;
    }
    return reponseAntiHallucination(nom);
  }

  if (contientUn(texte, MOTS_DOCUMENTS)) {
    if (documents.length > 0) {
      return `Je transmets votre demande à l'artisan. Les documents disponibles sont : ${documents
        .slice(0, 3)
        .join(", ")}.`;
    }
    return reponseAntiHallucination(nom);
  }

  if (contientUn(texte, MOTS_SERVICES)) {
    if (contexte.description?.trim()) {
      const description = contexte.description.trim();
      const ponctuation = /[.!?]$/.test(description) ? "" : ".";
      return `${description}${ponctuation} Pouvez-vous me préciser votre besoin ?`;
    }
    return reponseAntiHallucination(nom);
  }

  if (
    contientUn(texte, MOTS_ADRESSE_ENTREPRISE) &&
    contexte.adresse?.trim()
  ) {
    return `Notre adresse : ${contexte.adresse.trim()}.`;
  }

  const zone = trouverZone(texte, zones);
  const ville = extraireVille(texte, attendVille);
  const probleme = contientUn(texte, MOTS_PROBLEME);
  const demandeZone = contientUn(texte, MOTS_ZONE);

  if (contientUn(texte, MOTS_URGENCE)) {
    const suffixeZone = zone
      ? ` ${zone} fait partie de notre zone d'intervention.`
      : "";
    return `C'est noté comme urgent.${suffixeZone} Pouvez-vous me confirmer votre adresse ? Je transmets immédiatement votre demande à l'artisan.`;
  }

  if (contientUn(texte, MOTS_CRENEAU) && !probleme) {
    const suffixeZone = zone
      ? ` ${zone} fait partie de notre zone d'intervention.`
      : "";
    return `Je note votre demande de créneau.${suffixeZone} Pouvez-vous me préciser votre adresse ? L'artisan vous rappellera pour confirmer l'horaire.`;
  }

  if (probleme || demandeZone || zone || ville) {
    if (zone) {
      if (probleme) {
        return `C'est noté. ${zone} fait partie de notre zone d'intervention. Pouvez-vous me donner votre adresse exacte et un créneau qui vous arrange ?`;
      }
      return `Oui, ${zone} fait partie de notre zone d'intervention. Pouvez-vous me préciser votre adresse et le type d'intervention ?`;
    }

    if (ville) {
      if (zones.length === 0) {
        return `C'est noté. ${reponseAntiHallucination(nom)}`;
      }
      return `C'est noté pour ${ville}. Je ne vois pas cette ville dans notre zone d'intervention habituelle : je transmets votre adresse à l'artisan, qui vous confirmera s'il peut intervenir.`;
    }

    if (demandeZone) {
      if (zones.length === 0) return reponseAntiHallucination(nom);
      return `Nous intervenons à ${apercuZones(
        zones,
      )}. Pouvez-vous me confirmer votre ville et votre code postal ?`;
    }

    return "C'est noté. Pouvez-vous me préciser votre ville et votre adresse pour vérifier la zone d'intervention ?";
  }

  return reponseAntiHallucination(nom);
}
