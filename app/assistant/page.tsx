"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Paperclip,
  PhoneCall,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MicButton } from "@/components/ui/MicButton";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ajouterZone,
  chargerAssistant,
  MESSAGE_FICHIER_NON_PDF,
  MESSAGE_FICHIER_TROP_LOURD,
  TAILLE_MAX_FICHIER,
  televerserDocument,
  type AssistantDonnees,
} from "@/lib/field-data";
import { enregistrerAudit } from "@/lib/audit";
import { heureCourte, vibrer } from "@/lib/clients";

type Message = {
  id: string;
  auteur: "assistant" | "user";
  texte: string;
  heure: string;
};

type AutonomyLevel = "level1" | "level2" | "level3";

const AUTONOMY_OPTIONS = [
  {
    id: "level1" as const,
    titre: "Je valide tout",
    court: "Je valide",
    texte:
      "Nova prépare les SMS, les rendez-vous et les devis. Vous validez chaque action avant l'envoi.",
    icone: ShieldCheck,
  },
  {
    id: "level2" as const,
    titre: "L'IA agit, je peux annuler",
    court: "L'IA agit",
    texte:
      "Nova répond et agit à votre place. Vous avez 6 secondes pour annuler chaque action.",
    icone: RotateCcw,
  },
  {
    id: "level3" as const,
    titre: "100% Autonome",
    court: "Autonome",
    texte:
      "Nova gère les échanges courants de bout en bout. Vous gardez la main sur les cas sensibles.",
    icone: Zap,
  },
];

const ETAPES = [
  {
    titre: "Un appel manqué",
    texte: "Un client vous appelle pendant que vous êtes sur un chantier.",
  },
  {
    titre: "SMS en 3 secondes",
    texte: "Nova lui envoie automatiquement un SMS d'accroche.",
  },
  {
    titre: "Qualification",
    texte:
      "Elle engage la conversation et qualifie la demande : urgence, adresse, besoin.",
  },
  {
    titre: "Validation en un clic",
    texte:
      "Vous validez le rendez-vous et le devis. L'assistant n'envoie rien sans votre accord.",
  },
];

const CLE_AUTONOMIE = "velianos_autonomy_level";

const MESSAGE_ONBOARDING =
  "Bonjour ! Je suis Nova, votre assistante. Pour que je puisse répondre à vos clients, j'ai besoin de connaître votre entreprise. Cliquez sur le trombone 📎 ci-dessous pour m'envoyer votre grille tarifaire en PDF, ou dites-moi simplement ce que vous faites.";

const SUGGESTIONS_DEMARRAGE = [
  "Je suis plombier",
  "Ajouter ma ville",
  "Envoyer mon PDF",
];

const VILLES_RAPIDES = ["Lyon", "Paris", "Autre"];

export default function AssistantPage() {
  return (
    <AppLayout>
      <AssistantContent />
    </AppLayout>
  );
}

function AssistantContent() {
  const { showToast } = useToast();
  const [donnees, setDonnees] = useState<AssistantDonnees | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [autonomyLevel, setAutonomyLevel] =
    useState<AutonomyLevel>("level1");
  const [etapesOuvertes, setEtapesOuvertes] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [texte, setTexte] = useState("");
  const [attenteVille, setAttenteVille] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [televersement, setTeleversement] = useState(false);
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const [decalageClavier, setDecalageClavier] = useState(0);
  const fichierRef = useRef<HTMLInputElement | null>(null);
  const finRef = useRef<HTMLDivElement | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    const resultat = await chargerAssistant();
    setDonnees(resultat);
    setErreur(resultat.erreur);
    setChargement(false);

    if (!resultat.erreur) {
      setMessages((precedent) => {
        if (precedent.length > 0) return precedent;
        if (!resultat.companyId || resultat.progression < 100) {
          return [
            {
              id: "accueil",
              auteur: "assistant",
              texte: MESSAGE_ONBOARDING,
              heure: heureCourte(new Date().toISOString()),
            },
          ];
        }

        const connaissance =
          resultat.zones.length > 0
            ? `J'ai bien mémorisé votre entreprise et vos zones : ${resultat.zones.join(", ")}.`
            : "J'ai bien mémorisé votre entreprise.";
        return [
          {
            id: "accueil",
            auteur: "assistant",
            texte: `Bonjour ! Je suis Nova, votre assistante. ${connaissance} Je peux répondre à vos clients, qualifier les demandes et préparer vos rendez-vous. Que puis-je faire pour vous ?`,
            heure: heureCourte(new Date().toISOString()),
          },
        ];
      });
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    try {
      const enregistre = window.localStorage.getItem(CLE_AUTONOMIE);
      if (
        enregistre === "level1" ||
        enregistre === "level2" ||
        enregistre === "level3"
      ) {
        setAutonomyLevel(enregistre);
      }
    } catch {
      // Le choix reste sur le niveau par défaut.
    }
  }, []);

  const choisirAutonomie = (niveau: AutonomyLevel) => {
    const option = AUTONOMY_OPTIONS.find((item) => item.id === niveau);
    if (!option || niveau === autonomyLevel) return;

    vibrer(50);
    const precedent = autonomyLevel;
    setAutonomyLevel(niveau);
    try {
      window.localStorage.setItem(CLE_AUTONOMIE, niveau);
    } catch {
      // Le choix reste actif pour la session.
    }

    const numero = niveau === "level1" ? 1 : niveau === "level2" ? 2 : 3;
    showToast(`Niveau ${numero} activé : ${option.titre}.`, {
      variant: "success",
      duration: 6000,
      actionLabel: "Annuler",
      onAction: () => {
        setAutonomyLevel(precedent);
        try {
          window.localStorage.setItem(CLE_AUTONOMIE, precedent);
        } catch {
          // Le retour reste actif pour la session.
        }
        showToast("Niveau précédent restauré.", { variant: "info" });
      },
    });
    enregistrerAudit({
      titre: `Niveau d'autonomie ${numero} activé`,
      rationale: `Vous avez choisi « ${option.titre} ».`,
      autorite: "vous",
      reversible: true,
    });
  };

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const maj = () => {
      const ecart = Math.max(0, window.innerHeight - viewport.height);
      setDecalageClavier(ecart);
      window.setTimeout(() => {
        finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 80);
    };
    maj();
    viewport.addEventListener("resize", maj);
    return () => viewport.removeEventListener("resize", maj);
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, envoi, televersement]);

  const ajouterMessage = (message: Omit<Message, "id" | "heure">) => {
    setMessages((precedent) => [
      ...precedent,
      {
        ...message,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        heure: heureCourte(new Date().toISOString()),
      },
    ]);
  };

  const repondre = async (valeur: string) => {
    const propre = valeur.trim();
    if (!propre || envoi || televersement) return;

    vibrer(50);
    setTexte("");
    setEnvoi(true);
    ajouterMessage({ auteur: "user", texte: propre });

    let reponse = "";
    const minuscule = propre.toLowerCase();

    if (attenteVille && donnees?.companyId) {
      if (propre === "Autre") {
        reponse =
          "Écrivez le nom de votre ville ou de votre secteur d'intervention : je l'ajoute tout de suite.";
      } else {
        const resultat = await ajouterZone(donnees.companyId, propre);
        if (resultat.erreur) {
          reponse = `Je n'ai pas pu enregistrer cette ville : ${resultat.erreur}`;
        } else {
          setAttenteVille(false);
          reponse = `C'est noté : ${propre} fait maintenant partie de votre zone d'intervention. Votre assistant répondra aux clients de ce secteur.`;
          const rafraichi = await chargerAssistant();
          setDonnees(rafraichi);
        }
      }
    } else if (donnees?.companyId && VILLES_RAPIDES.includes(propre)) {
      const resultat = await ajouterZone(donnees.companyId, propre);
      if (resultat.erreur) {
        reponse = `Je n'ai pas pu enregistrer cette ville : ${resultat.erreur}`;
      } else {
        reponse = `C'est noté : ${propre} fait maintenant partie de votre zone d'intervention.`;
        const rafraichi = await chargerAssistant();
        setDonnees(rafraichi);
      }
    } else if (
      /ajouter ma ville|ma ville|ville|zone|secteur|intervien/i.test(minuscule)
    ) {
      setAttenteVille(true);
      reponse =
        "Bien sûr. Dans quelle ville ou quel secteur d'intervention travaillez-vous ?";
    } else if (
      /plombier|plomberie|chauffagiste|électricien|electricien|menuisier|serrurier|peintre|maçon|macon/i.test(
        minuscule,
      )
    ) {
      reponse = `C'est noté : ${propre}. Envoyez-moi votre grille tarifaire en PDF avec le trombone 📎 pour que je mémorise vos tarifs, ou ajoutez votre ville d'intervention.`;
    } else {
      reponse =
        "Merci, c'est noté. Envoyez-moi votre grille tarifaire en PDF avec le trombone 📎, ou ajoutez votre ville d'intervention pour que je puisse qualifier vos clients.";
    }

    setEnvoi(false);
    ajouterMessage({ auteur: "assistant", texte: reponse });
  };

  const envoyer = async (event: FormEvent) => {
    event.preventDefault();
    await repondre(texte);
  };

  const choisirFichier = async (fichier: File | null) => {
    setErreurFichier(null);
    if (!fichier) return;

    if (fichier.type !== "application/pdf") {
      showToast(MESSAGE_FICHIER_NON_PDF, { variant: "error" });
      return;
    }
    if (fichier.size > TAILLE_MAX_FICHIER) {
      setErreurFichier(MESSAGE_FICHIER_TROP_LOURD);
      return;
    }
    if (!donnees?.companyId) {
      setErreurFichier(
        "Complétez d'abord votre entreprise pour que je puisse mémoriser vos tarifs.",
      );
      return;
    }

    vibrer(30);
    ajouterMessage({ auteur: "user", texte: `📎 ${fichier.name}` });
    setTeleversement(true);
    const resultat = await televerserDocument(donnees.companyId, fichier);
    setTeleversement(false);

    if (resultat.erreur) {
      setErreurFichier(resultat.erreur);
      return;
    }

    ajouterMessage({
      auteur: "assistant",
      texte: "J'ai bien lu votre document. J'ai mémorisé vos tarifs.",
    });
    const rafraichi = await chargerAssistant();
    setDonnees(rafraichi);
  };

  if (chargement) {
    return (
      <div className="pt-5">
        <PageSkeleton lignes={3} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="pt-5">
        <PageError message={erreur} onRetry={() => void charger()} />
      </div>
    );
  }

  const entrepriseConfiguree = Boolean(donnees?.companyId);
  const progression = entrepriseConfiguree
    ? Math.max(0, donnees?.progression ?? 0)
    : 0;
  const optionActive =
    AUTONOMY_OPTIONS.find((option) => option.id === autonomyLevel) ??
    AUTONOMY_OPTIONS[0];
  const IconeActive = optionActive.icone;
  const niveauActif =
    autonomyLevel === "level1" ? 1 : autonomyLevel === "level2" ? 2 : 3;
  const premiereConversation = messages.every(
    (message) => message.auteur === "assistant",
  );
  const afficherSuggestionsDemarrage =
    premiereConversation &&
    !envoi &&
    !televersement &&
    (!entrepriseConfiguree || progression < 100);

  return (
    <div className="space-y-4 pb-56 pt-4">
      <div className="flex animate-fade-up items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Mon assistant
          </h1>
          <p className="mt-1 text-lg font-medium text-slate-700">
            Nova, votre assistante.
          </p>
        </div>
        <Link
          href="/controle"
          className="flex min-h-16 flex-shrink-0 items-center rounded-2xl bg-white px-4 text-base font-extrabold text-[#0A2540] shadow-[0_4px_18px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
        >
          Journal
        </Link>
      </div>

      <div className="animate-fade-up flex items-start gap-3 rounded-[24px] border border-blue-200 bg-blue-50 p-4">
        <Sparkles
          className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-700"
          aria-hidden="true"
        />
        <p className="text-base font-extrabold leading-relaxed text-blue-950">
          Vous gardez le contrôle. L&apos;assistant répond aux clients, mais
          vous validez les rendez-vous et les devis.
        </p>
      </div>

      <section
        id="autonomie"
        className="animate-fade-up rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Autonomie
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-extrabold text-slate-700">
            Niveau {niveauActif}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
          {AUTONOMY_OPTIONS.map((option, index) => {
            const selectionne = autonomyLevel === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choisirAutonomie(option.id)}
                aria-pressed={selectionne}
                className={`flex min-h-16 flex-col items-center justify-center rounded-xl px-1 text-center transition-transform duration-200 active:scale-95 ${
                  selectionne
                    ? "bg-[#0A2540] text-white shadow-lg shadow-[#0A2540]/20"
                    : "text-slate-700"
                }`}
              >
                <span className="text-sm font-extrabold leading-tight">
                  {option.court}
                </span>
                <span
                  className={`mt-0.5 text-xs font-bold ${
                    selectionne ? "text-white/70" : "text-slate-500"
                  }`}
                >
                  Niveau {index + 1}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-2xl bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-base font-extrabold leading-snug text-slate-900">
            <IconeActive
              className="h-5 w-5 flex-shrink-0 text-[#0A2540]"
              aria-hidden="true"
            />
            {optionActive.titre}
          </p>
          <p className="mt-1 text-base font-medium leading-relaxed text-slate-700">
            {optionActive.texte}
          </p>
          {autonomyLevel === "level2" && (
            <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-800">
              Annulation possible pendant 6 secondes.
            </p>
          )}
        </div>

        <p className="mt-3 text-center text-lg font-extrabold text-[#0A2540]">
          C&apos;est VOUS qui donnez le pouvoir.
        </p>
      </section>

      <section className="animate-fade-up overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <button
          type="button"
          onClick={() => {
            vibrer(30);
            setEtapesOuvertes((valeur) => !valeur);
          }}
          aria-expanded={etapesOuvertes}
          className="flex min-h-16 w-full items-center justify-between gap-3 px-4 text-left transition-transform duration-200 active:scale-[0.99]"
        >
          <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <PhoneCall
              className="h-6 w-6 flex-shrink-0 text-[#0A2540]"
              aria-hidden="true"
            />
            Comment ça marche ?
          </span>
          {etapesOuvertes ? (
            <ChevronUp
              className="h-6 w-6 flex-shrink-0 text-slate-500"
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className="h-6 w-6 flex-shrink-0 text-slate-500"
              aria-hidden="true"
            />
          )}
        </button>

        {etapesOuvertes && (
          <ol className="space-y-2 px-4 pb-4">
            {ETAPES.map((etape, index) => (
              <li
                key={etape.titre}
                className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0A2540] text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-extrabold leading-snug text-slate-900">
                    {etape.titre}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium leading-snug text-slate-600">
                    {etape.texte}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="flex h-[55dvh] min-h-[22rem] max-h-[42rem] animate-fade-up flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
          <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#0A2540] text-white">
            <Bot className="h-6 w-6" aria-hidden="true" />
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">
              Nova
            </p>
            <p className="truncate text-sm font-semibold text-emerald-600">
              En ligne · elle répond à vos clients
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              vibrer(30);
              document
                .getElementById("autonomie")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            aria-label="Voir le niveau d'autonomie"
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 active:scale-95"
          >
            <Settings2 className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#F5F5F7] px-3 py-4 sm:px-4">
          {messages.map((message) => {
            const deMoi = message.auteur === "user";
            return (
              <div
                key={message.id}
                className={`flex animate-fade-up items-end gap-2 ${
                  deMoi ? "justify-end" : "justify-start"
                }`}
              >
                {!deMoi && (
                  <span className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <Bot className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
                <div
                  className={`max-w-[82%] rounded-[22px] px-4 py-3 ${
                    deMoi
                      ? "rounded-br-md bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "rounded-bl-md bg-slate-200 text-slate-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed">
                    {message.texte}
                  </p>
                  <p
                    className={`mt-1 text-right text-xs font-medium ${
                      deMoi ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {message.heure}
                  </p>
                </div>
              </div>
            );
          })}

          {erreurFichier && (
            <div className="flex justify-start">
              <div className="max-w-[82%] rounded-[20px] rounded-bl-md bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
                <p>{erreurFichier}</p>
                <button
                  type="button"
                  onClick={() => setErreurFichier(null)}
                  className="mt-1 text-sm font-extrabold underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {(envoi || televersement) && (
            <div className="flex items-end gap-2">
              <span className="mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="rounded-[20px] rounded-bl-md bg-slate-100 px-4 py-3 shadow-sm">
                <span className="sr-only">
                  {televersement ? "Nova lit votre document…" : "Nova écrit…"}
                </span>
                <span className="flex items-center gap-1" aria-hidden="true">
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: "240ms" }}
                  />
                </span>
              </div>
            </div>
          )}

          {afficherSuggestionsDemarrage && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS_DEMARRAGE.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (suggestion === "Envoyer mon PDF") {
                      fichierRef.current?.click();
                      return;
                    }
                    void repondre(suggestion);
                  }}
                  className="min-h-16 rounded-full bg-white px-4 text-base font-extrabold text-[#0A2540] shadow-[0_4px_18px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
                >
                  {suggestion === "Envoyer mon PDF"
                    ? "📎 Envoyer mon PDF"
                    : suggestion}
                </button>
              ))}
            </div>
          )}

          {attenteVille && !envoi && !televersement && (
            <div className="flex flex-wrap gap-2 pt-1">
              {VILLES_RAPIDES.map((ville) => (
                <button
                  key={ville}
                  type="button"
                  onClick={() => void repondre(ville)}
                  className="min-h-16 rounded-full bg-white px-4 text-base font-extrabold text-[#0A2540] shadow-[0_4px_18px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
                >
                  {ville}
                </button>
              ))}
            </div>
          )}

          <div ref={finRef} />
        </div>
      </section>

      <div
        className="fixed inset-x-0 z-30 mx-auto w-full max-w-2xl px-3 transition-[bottom] duration-200"
        style={{
          bottom: `calc(96px + env(safe-area-inset-bottom) + ${decalageClavier}px)`,
        }}
      >
        <div className="mb-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-[0_4px_18px_rgb(0,0,0,0.06)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-base font-extrabold text-slate-700">
              {entrepriseConfiguree
                ? `Entreprise complétée à ${progression}%`
                : "Entreprise à configurer"}
            </p>
            {progression < 100 ? (
              <Link
                href="/entreprise"
                className="flex min-h-11 flex-shrink-0 items-center text-base font-extrabold text-[#0A2540] underline-offset-2 hover:underline"
              >
                Compléter
              </Link>
            ) : (
              <span className="flex-shrink-0 text-base font-extrabold text-emerald-700">
                Complet
              </span>
            )}
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>

        <form
          onSubmit={(event) => void envoyer(event)}
          className="pointer-events-auto flex items-end gap-2 rounded-[24px] bg-white p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <input
            ref={fichierRef}
            type="file"
            accept="application/pdf"
            aria-label="Ajouter un PDF"
            className="hidden"
            onChange={(event) => {
              void choisirFichier(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fichierRef.current?.click()}
            disabled={televersement}
            aria-label="Envoyer ma grille tarifaire en PDF"
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            {televersement ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            ) : (
              <Paperclip className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          <label htmlFor="assistant-message" className="sr-only">
            Écrire à Nova
          </label>
          <input
            id="assistant-message"
            value={texte}
            onChange={(event) => setTexte(event.target.value)}
            placeholder={
              attenteVille ? "Indiquez votre ville…" : "Écrivez à Nova…"
            }
            className="h-16 min-w-0 flex-1 bg-transparent px-2 text-lg font-medium text-slate-900 outline-none placeholder:text-slate-500"
          />

          <MicButton
            onTranscript={setTexte}
            onIndisponible={() =>
              showToast(
                "La dictée vocale n'est pas disponible sur ce navigateur.",
                { variant: "warning" },
              )
            }
          />

          <button
            type="submit"
            disabled={
              envoi || televersement || texte.trim().length === 0
            }
            aria-label="Envoyer"
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 transition-transform duration-200 active:scale-95 disabled:opacity-40"
          >
            <ArrowUp className="h-7 w-7" aria-hidden="true" />
          </button>
        </form>
        <p className="mt-1.5 text-center text-base font-medium text-slate-500">
          📎 PDF jusqu&apos;à 5 Mo · Nova mémorise vos tarifs.
        </p>
      </div>
    </div>
  );
}
