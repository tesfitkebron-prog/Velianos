"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Bell,
  User,
  MessageSquare,
  Sparkles,
  Save,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { loadWorkspaceProfile } from "@/lib/workspace";

const MESSAGE_JOUR =
  "Bonjour, c'est l'assistant de {nom_entreprise}. Désolé, nous sommes en intervention. Dites-moi ce qu'il vous faut, je vous rappelle rapidement.";
const MESSAGE_NUIT =
  "Bonjour, nous sommes actuellement fermés. Notre assistant prend le relais pour les urgences. Si votre situation nécessite une intervention immédiate, répondez à ce message en indiquant votre ADRESSE et la NATURE du problème.";
const LIMITE = 480;

const variables = [
  { code: "{nom_entreprise}", description: "Nom de votre entreprise" },
  { code: "{prenom_plombier}", description: "Votre prénom" },
  { code: "{ville}", description: "Votre ville" },
  { code: "{horaires}", description: "Vos horaires d'ouverture" },
  { code: "{site_web}", description: "Lien vers votre site" },
  { code: "{numero_urgence}", description: "Numéro d'urgence" },
];

type Onglet = "messages" | "assistant" | "notifications" | "compte";

type TogglesAssistant = {
  analyseIA: boolean;
  notificationsUrgence: boolean;
  resumeQuotidien: boolean;
  modeManuel: boolean;
};

type TogglesNotifications = {
  sms: boolean;
  email: boolean;
  push: boolean;
};

function Toggle({
  actif,
  onClick,
  label,
}: {
  actif: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={actif}
      aria-label={label}
      className={`w-11 h-6 rounded-full p-0.5 flex-shrink-0 transition-colors ${
        actif ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          actif ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function TitreCarte({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-1 h-5 bg-emerald-500 rounded-full flex-shrink-0 mt-0.5" />
      <div>
        <h2 className="text-lg font-bold text-slate-900">{titre}</h2>
        {sousTitre && <p className="text-sm text-slate-500 mt-1">{sousTitre}</p>}
      </div>
    </div>
  );
}

export default function ParametresPage() {
  const [onglet, setOnglet] = useState<Onglet>("messages");
  const [messageJour, setMessageJour] = useState(MESSAGE_JOUR);
  const [messageNuit, setMessageNuit] = useState(MESSAGE_NUIT);
  const [delai, setDelai] = useState(8);
  const [toggles, setToggles] = useState<TogglesAssistant>({
    analyseIA: true,
    notificationsUrgence: true,
    resumeQuotidien: true,
    modeManuel: false,
  });
  const [canaux, setCanaux] = useState<TogglesNotifications>({
    sms: true,
    email: true,
    push: false,
  });
  const [telephoneAlertes, setTelephoneAlertes] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (!actif) return;
      setNom([profil.firstName, profil.lastName].filter(Boolean).join(" "));
      setEmail(profil.email);
      setTelephoneAlertes(profil.email);
    };

    void charger();

    return () => {
      actif = false;
    };
  }, []);

  const apercu = messageJour.replaceAll("{nom_entreprise}", "Plomberie Martin");

  const onglets: { cle: Onglet; label: string; icone: typeof MessageSquare }[] = [
    { cle: "messages", label: "Messages SMS", icone: MessageSquare },
    { cle: "assistant", label: "Assistant", icone: Sparkles },
    { cle: "notifications", label: "Notifications", icone: Bell },
    { cle: "compte", label: "Mon compte", icone: User },
  ];

  const optionsAssistant: { cle: keyof TogglesAssistant; titre: string; description: string }[] = [
    {
      cle: "analyseIA",
      titre: "Analyse intelligente par IA",
      description:
        "L'IA extrait automatiquement l'adresse, l'urgence et le nom du client depuis la conversation.",
    },
    {
      cle: "notificationsUrgence",
      titre: "Notifications d'urgence",
      description:
        "Recevez une notification immédiate quand l'IA détecte une urgence (fuite, inondation).",
    },
    {
      cle: "resumeQuotidien",
      titre: "Résumé quotidien",
      description:
        "Recevez chaque soir à 19h un résumé de l'activité de votre assistant.",
    },
    {
      cle: "modeManuel",
      titre: "Mode manuel automatique",
      description:
        "L'assistant se met en pause dès que vous répondez manuellement à un client.",
    },
  ];

  const optionsNotifications: { cle: keyof TogglesNotifications; titre: string; description: string }[] = [
    {
      cle: "sms",
      titre: "Notifications par SMS",
      description: "Recevez les alertes urgentes par SMS sur votre mobile",
    },
    {
      cle: "email",
      titre: "Notifications par email",
      description: "Recevez un résumé quotidien par email",
    },
    {
      cle: "push",
      titre: "Notifications push",
      description: "Recevez une notification sur votre navigateur",
    },
  ];

  return (
    <AppLayout>
      <div className="w-full pb-8">
        {/* EN-TÊTE */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Personnalisez votre assistant et vos messages automatiques.
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
          {onglets.map((item) => {
            const Icone = item.icone;
            const actif = onglet === item.cle;

            return (
              <button
                key={item.cle}
                onClick={() => setOnglet(item.cle)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  actif
                    ? "border-emerald-500 text-emerald-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icone className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* ONGLET 1 — MESSAGES SMS */}
        {onglet === "messages" && (
          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
              <TitreCarte
                titre="Message automatique en journée"
                sousTitre="Ce message est envoyé quand un client vous appelle entre 8h et 18h du lundi au vendredi."
              />
              <textarea
                value={messageJour}
                onChange={(event) => setMessageJour(event.target.value)}
                maxLength={LIMITE}
                rows={5}
                className="mt-4 w-full p-4 border border-slate-200 rounded-lg text-sm font-mono leading-relaxed resize-none text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-xs text-slate-400 mt-2 text-right">
                {messageJour.length} / {LIMITE}
              </p>
              <div className="mt-4 flex gap-2">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
                <button
                  onClick={() => setMessageJour(MESSAGE_JOUR)}
                  className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
              <TitreCarte
                titre="Message automatique la nuit"
                sousTitre="Ce message est envoyé quand un client vous appelle en dehors des heures d'ouverture (soir, week-end, jours fériés)."
              />
              <textarea
                value={messageNuit}
                onChange={(event) => setMessageNuit(event.target.value)}
                maxLength={LIMITE}
                rows={5}
                className="mt-4 w-full p-4 border border-slate-200 rounded-lg text-sm font-mono leading-relaxed resize-none text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-xs text-slate-400 mt-2 text-right">
                {messageNuit.length} / {LIMITE}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
              <p className="text-sm font-semibold text-slate-900">Variables disponibles</p>
              <p className="text-xs text-slate-500 mt-1">
                Utilisez ces variables dans vos messages. Elles seront remplacées
                automatiquement.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {variables.map((variable) => (
                  <div
                    key={variable.code}
                    className="bg-white border border-slate-200 rounded-lg p-3"
                  >
                    <p className="text-xs font-mono font-bold text-emerald-600">
                      {variable.code}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{variable.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 mb-4">
              <p className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                Aperçu
              </p>
              <div className="mt-3 max-w-md bg-slate-800 rounded-2xl rounded-tl-sm p-4">
                <p className="text-sm text-white">{apercu}</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Il y a quelques secondes</p>
            </div>
          </div>
        )}

        {/* ONGLET 2 — ASSISTANT */}
        {onglet === "assistant" && (
          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
              <TitreCarte
                titre="Délai avant l'envoi du SMS"
                sousTitre="Combien de secondes après l'appel manqué le SMS doit-il être envoyé ?"
              />
              <div className="mt-4 flex items-center gap-4">
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={delai}
                  onChange={(event) => setDelai(Number(event.target.value))}
                  aria-label="Délai avant l'envoi du SMS"
                  className="w-full accent-emerald-500"
                />
                <span className="text-sm font-semibold text-emerald-600 w-24 text-right flex-shrink-0">
                  {delai} secondes
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">
                Un délai court (5-10 secondes) donne l&apos;impression d&apos;une réponse
                humaine naturelle.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              {optionsAssistant.map((option, index) => (
                <div
                  key={option.cle}
                  className={`flex items-center justify-between gap-4 py-4 ${
                    index < optionsAssistant.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{option.titre}</p>
                    <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                  </div>
                  <Toggle
                    label={option.titre}
                    actif={toggles[option.cle]}
                    onClick={() =>
                      setToggles((precedentes) => ({
                        ...precedentes,
                        [option.cle]: !precedentes[option.cle],
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ONGLET 3 — NOTIFICATIONS */}
        {onglet === "notifications" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex gap-3">
              <span className="w-1 h-5 bg-emerald-500 rounded-full flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold text-slate-900">Canaux de notification</h2>
            </div>

            <div className="mt-4">
              {optionsNotifications.map((option, index) => (
                <div
                  key={option.cle}
                  className={`flex items-center justify-between gap-4 py-4 ${
                    index < optionsNotifications.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{option.titre}</p>
                    <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                  </div>
                  <Toggle
                    label={option.titre}
                    actif={canaux[option.cle]}
                    onClick={() =>
                      setCanaux((precedentes) => ({
                        ...precedentes,
                        [option.cle]: !precedentes[option.cle],
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Numéro de mobile pour les alertes
              </label>
              <input
                type="tel"
                value={telephoneAlertes}
                onChange={(event) => setTelephoneAlertes(event.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        )}

        {/* ONGLET 4 — MON COMPTE */}
        {onglet === "compte" && (
          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
              <div className="flex gap-3">
                <span className="w-1 h-5 bg-emerald-500 rounded-full flex-shrink-0 mt-0.5" />
                <h2 className="text-lg font-bold text-slate-900">Informations du compte</h2>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(event) => setNom(event.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(event) => setTelephone(event.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Ville</label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(event) => setVille(event.target.value)}
                    placeholder="Lyon"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button className="mt-5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
              <div className="flex gap-3">
                <span className="w-1 h-5 bg-emerald-500 rounded-full flex-shrink-0 mt-0.5" />
                <h2 className="text-lg font-bold text-slate-900">Abonnement</h2>
              </div>
              <p className="text-sm text-slate-600 mt-4">
                Plan actuel : <span className="font-semibold text-slate-900">Essai gratuit</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">Il vous reste 4 jours d&apos;essai.</p>
              <button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold px-4 py-2 rounded-lg transition-colors">
                Passer au plan Pro à 29€/mois
              </button>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <h2 className="text-lg font-bold text-red-600">Zone de danger</h2>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Cette action est définitive et supprimera toutes vos données.
              </p>
              <button className="mt-4 border border-red-200 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}