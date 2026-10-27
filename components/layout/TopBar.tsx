"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Activity,
  HelpCircle,
  X,
  Undo2,
} from "lucide-react";
import { loadWorkspaceProfile } from "@/lib/workspace";
import { useAssistant, type NiveauAutonomie } from "./AssistantProvider";

const titres: Record<string, string> = {
  "/dashboard": "Vue d'ensemble",
  "/assistant": "Mon assistant",
  "/appels": "Appels manqués",
  "/messages": "Messagerie",
  "/clients": "Vos clients",
  "/entreprise": "Mon entreprise",
  "/guide": "Guide de démarrage",
  "/parametres": "Réglages",
  "/compte": "Compte",
};

const aides: Record<string, string> = {
  "/dashboard": "Vue d'ensemble de votre activité.",
  "/appels": "Les clients que votre assistant a récupérés.",
  "/messages": "Vos conversations SMS avec les clients.",
  "/clients": "Tous vos clients et leur historique.",
  "/entreprise": "Les informations que votre assistant connaît sur vous.",
  "/guide": "Les étapes pour activer Velianos.",
  "/parametres": "Vos préférences et votre compte.",
  "/assistant": "Discutez avec votre assistant pour tout régler.",
};

const activites = [
  { texte: "SMS envoyé à M. Dupont", moment: "14h02", annulable: false },
  { texte: "M. Dupont a répondu « Fuite sous évier »", moment: "14h03", annulable: false },
  { texte: "Notification envoyée à Karim", moment: "14h05", annulable: true },
  { texte: "Demande transmise à M. Martin pour M. Dupont", moment: "14h06", annulable: true },
  { texte: "SMS envoyé à Mme Rousseau", moment: "13h48", annulable: false },
  { texte: "Notification envoyée à Karim", moment: "13h45", annulable: true },
  { texte: "Demande transmise à M. Martin pour Mme Rousseau", moment: "13h40", annulable: true },
  { texte: "SMS envoyé à M. Bernard", moment: "12h18", annulable: false },
  { texte: "Notification envoyée à Karim", moment: "12h16", annulable: true },
  { texte: "SMS envoyé à M. Petit", moment: "11h02", annulable: false },
];

const niveaux: { cle: NiveauAutonomie; titre: string; exemple: string }[] = [
  { cle: "observer", titre: "Observer seulement", exemple: "Regarder, ne rien faire." },
  { cle: "suggerer", titre: "Suggérer", exemple: "Vous validez avant l'envoi." },
  { cle: "confirmer", titre: "Agir avec confirmation", exemple: "Vous confirmez en 1 clic." },
  { cle: "autonome", titre: "Agir en autonomie", exemple: "Notification à chaque action." },
];

export function TopBar() {
  const pathname = usePathname();
  const { actif, setActif, niveau, setNiveau } = useAssistant();
  const [initiales, setInitiales] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [panneau, setPanneau] = useState<"activite" | "aide" | "assistant" | null>(null);

  const estAccueil = pathname === "/dashboard";

  useEffect(() => {
    let mounted = true;

    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (mounted) {
        const lettres = profil.fullName
          .split(" ")
          .filter(Boolean)
          .map((partie) => partie.charAt(0))
          .join("")
          .slice(0, 2)
          .toUpperCase();
        setInitiales(lettres || "V");
        setEntreprise(profil.companyName || "");
      }
    };

    void charger();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 md:px-6 sticky top-0 z-30">
      <div className="min-w-0 flex-1 pl-12 md:pl-0">
        <h1 className="text-[15px] sm:text-lg font-bold text-slate-900 truncate leading-tight">
          {estAccueil
            ? entreprise || "Mon entreprise"
            : titres[pathname] ?? "Velianos"}
        </h1>
        {estAccueil && (
          <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
            Voici ce qui s&apos;est passé aujourd&apos;hui.
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
        <button
          onClick={() => setPanneau(panneau === "assistant" ? null : "assistant")}
          className={`inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-2 rounded-full ${
            actif
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          <span className={`w-5 h-5 rounded-full p-0.5 flex items-center ${actif ? "bg-emerald-500" : "bg-amber-500"}`}>
            <span
              className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                actif ? "translate-x-0" : "-translate-x-0"
              }`}
            />
          </span>
          <span className="hidden xs:inline sm:inline">{actif ? "Actif" : "En pause"}</span>
        </button>

        <button
          onClick={() => setPanneau(panneau === "activite" ? null : "activite")}
          className="hidden xl:inline-flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
        >
          <Activity className="w-4 h-4" />
          Voir l&apos;activité
        </button>

        <button
          className="relative hidden sm:flex w-10 h-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <button
          onClick={() => setPanneau(panneau === "aide" ? null : "aide")}
          className="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Aide"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button className="hidden lg:flex items-center gap-2 h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
          Ces 30 derniers jours
          <ChevronDown className="w-4 h-4" />
        </button>

        <Link
          href="/compte"
          aria-label="Mon compte"
          className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold active:scale-95 transition-transform flex-shrink-0"
        >
          {initiales || "V"}
        </Link>
      </div>

      {/* MINI-PANNEAU ASSISTANT */}
      {panneau === "assistant" && (
        <div
          className="fixed top-20 left-4 right-4 sm:left-auto z-40 w-auto sm:w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">Mon assistant</p>
            <button
              onClick={() => setActif(!actif)}
              className={`h-6 w-11 rounded-full p-0.5 flex items-center transition-colors ${
                actif ? "bg-emerald-500" : "bg-amber-500"
              }`}
              role="switch"
              aria-checked={actif}
              aria-label="Activer ou mettre en pause l'assistant"
            >
              <span className="block w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {actif ? "Votre assistant travaille" : "Votre assistant est en pause"}
          </p>

          <p className="text-xs font-semibold text-slate-900 mt-4 mb-2">Niveau d&apos;autonomie</p>

          <div className="space-y-1">
            {niveaux.map((option) => (
              <button
                key={option.cle}
                onClick={() => setNiveau(option.cle)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  niveau === option.cle
                    ? "bg-emerald-50 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm">{option.titre}</span>
                <span className="block text-[11px] text-slate-500">{option.exemple}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PANNEAU ACTIVITÉ */}
      {panneau === "activite" && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setPanneau(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <p className="font-bold text-slate-900">Activité de votre assistant</p>
              <button
                onClick={() => setPanneau(null)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activites.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 py-3 border-b border-slate-100"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-slate-700">{action.texte}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{action.moment}</span>
                  </span>
                  {action.annulable && (
                    <button className="text-xs text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <Undo2 className="w-3 h-3" />
                      Annuler
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AIDE */}
      {panneau === "aide" && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto z-40 w-auto sm:w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <HelpCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <button
              onClick={() => setPanneau(null)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-700 mt-2">
            {aides[pathname] ?? "Cette page sert à gérer votre activité."}
          </p>
        </div>
      )}
    </header>
  );
}

export default TopBar;