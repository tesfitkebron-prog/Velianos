"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
  MoreVertical,
  Share,
  Shield,
  Trash2,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { Toggle } from "@/components/ui/Toggle";
import { createClient } from "@/lib/supabase/client";
import { marquerDeconnexionVolontaire } from "@/lib/auth";
import { usePwaInstall, instructionsInstallation } from "@/lib/pwa-install";
import {
  STYLE_ABONNEMENT,
  statutAbonnement,
} from "@/lib/subscription";
import {
  EMPTY_WORKSPACE_PROFILE,
  loadWorkspaceProfile,
  resetWorkspaceProfileCache,
  type WorkspaceProfile,
} from "@/lib/workspace";

export default function ParametresPage() {
  return (
    <AppLayout>
      <ParametresContent />
    </AppLayout>
  );
}

function ParametresContent() {
  const router = useRouter();
  const { actif, setActif, notifier } = useAssistant();
  const { installee, estIOS } = usePwaInstall();
  const [profil, setProfil] = useState<WorkspaceProfile>(EMPTY_WORKSPACE_PROFILE);
  const [deconnexion, setDeconnexion] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [suppression, setSuppression] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(null);
  const [instructionsOuvertes, setInstructionsOuvertes] = useState(false);
  const [ongletPwa, setOngletPwa] = useState<"iphone" | "android">("iphone");

  useEffect(() => {
    let monte = true;
    const charger = async () => {
      const donnees = await loadWorkspaceProfile();
      if (monte) setProfil(donnees);
    };
    void charger();
    return () => {
      monte = false;
    };
  }, []);

  const basculerAssistant = () => {
    const suivant = !actif;
    setActif(suivant);
    notifier(
      suivant ? "Assistant activé." : "Assistant en pause.",
      () => setActif(!suivant),
      { variant: "info" },
    );
  };

  const ouvrirGuideInstallation = () => {
    setOngletPwa(estIOS ? "iphone" : "android");
    setInstructionsOuvertes(true);
  };

  const seDeconnecter = async () => {
    setDeconnexion(true);
    marquerDeconnexionVolontaire();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // On redirige quand même vers l'écran de connexion.
    }
    resetWorkspaceProfileCache();
    router.push("/login");
    router.refresh();
  };

  const supprimerCompte = async () => {
    setSuppression(true);
    setErreurSuppression(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;
      marquerDeconnexionVolontaire();
      await supabase.auth.signOut();
      resetWorkspaceProfileCache();
      router.push("/bienvenue");
      router.refresh();
    } catch {
      setSuppression(false);
      setErreurSuppression(
        "La suppression n'a pas pu aboutir. Réessayez ou contactez le support.",
      );
    }
  };

  const abonnement = statutAbonnement(
    profil.subscriptionStatus,
    profil.subscriptionPlan,
    profil.trialEndsAt,
  );

  const sousTitreAbonnement =
    profil.subscriptionPlan === "pro"
      ? `Plan Pro — 49 €/mois · ${abonnement.label}`
      : `${profil.subscriptionPlan.toUpperCase()} · ${abonnement.label}`;

  return (
    <div className="space-y-6 pt-5">
      <div className="animate-fade-up px-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Mon compte
        </h1>
        <p className="mt-1 text-lg font-medium text-slate-600">
          Votre assistant, votre abonnement, vos données.
        </p>
      </div>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
              actif
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            <Bot className="h-6 w-6" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Mon assistant est actif
            </h2>
            <p className="mt-1 text-base font-medium leading-snug text-slate-600">
              {actif
                ? "Il répond aux appels manqués et aux SMS à votre place."
                : "En pause : aucun message ne part automatiquement."}
            </p>
          </div>

          <Toggle
            actif={actif}
            onClick={basculerAssistant}
            label="Activer ou mettre en pause l'assistant"
          />
        </div>

        <Link
          href="/assistant"
          className="mt-4 flex min-h-14 items-center justify-between gap-3 border-t border-slate-100 pt-3 text-base font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-[0.99]"
        >
          <span>Ouvrir mon assistant</span>
          <ChevronRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </Link>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540]/5 text-[#0A2540]">
            <Download className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Installer l&apos;application
            </h2>
            <p className="mt-1 text-base font-medium leading-snug text-slate-600">
              Retrouvez Velianos directement sur l&apos;écran d&apos;accueil de
              votre téléphone.
            </p>
          </div>
        </div>

        {installee ? (
          <div className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-50 text-base font-extrabold text-emerald-600">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Application installée
          </div>
        ) : (
          <button
            type="button"
            onClick={ouvrirGuideInstallation}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] text-base font-extrabold text-white transition-transform duration-200 active:scale-95"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
            Installer l&apos;application sur ce téléphone
          </button>
        )}
      </section>

      <Groupe titre="Mon entreprise">
        <Ligne
          icone={Building2}
          label="Mon entreprise"
          sousTexte="Identité, tarifs et vocabulaire de l'assistant"
          href="/entreprise"
        />
      </Groupe>

      <Groupe titre="Mon compte">
        <Ligne
          icone={User}
          label="Informations personnelles"
          sousTexte={profil.fullName}
          href="/compte/profil"
        />
        <Ligne
          icone={Shield}
          label="Sécurité"
          sousTexte={profil.email}
          href="/compte/securite"
        />
      </Groupe>

      <Groupe titre="Application">
        <Ligne
          icone={Bell}
          label="Notifications"
          href="/compte/notifications"
        />
        <Ligne
          icone={CreditCard}
          label="Abonnement"
          sousTexte={sousTitreAbonnement}
          href="/compte/abonnement"
        />
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-extrabold ${STYLE_ABONNEMENT[abonnement.tone]}`}
            >
              {abonnement.label}
            </span>
            <button
              type="button"
              onClick={() => router.push("/compte/abonnement")}
              className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-xl bg-slate-100 px-3 text-sm font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-95"
            >
              Gérer mon abonnement
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <Ligne
          icone={Lock}
          label="Confidentialité"
          href="/compte/confidentialite"
        />
        <Ligne icone={HelpCircle} label="Aide" href="/compte/aide" />
      </Groupe>

      <section className="space-y-2.5">
        <button
          type="button"
          onClick={() => void seDeconnecter()}
          disabled={deconnexion}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-extrabold text-red-600 shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-transform duration-200 active:scale-95 disabled:opacity-60"
        >
          {deconnexion ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="h-5 w-5" aria-hidden="true" />
          )}
          {deconnexion ? "Déconnexion…" : "Se déconnecter"}
        </button>

        <button
          type="button"
          onClick={() => setConfirmation(true)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold text-slate-400 transition-transform duration-200 active:scale-95"
        >
          <Trash2 className="h-5 w-5" aria-hidden="true" />
          Supprimer mon compte
        </button>
      </section>

      <p className="pb-4 text-center text-sm font-medium text-slate-400">
        Velianos · vos données vous appartiennent.
      </p>

      {confirmation && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
          onClick={() => !suppression && setConfirmation(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <TriangleAlert className="h-6 w-6" aria-hidden="true" />
              </span>
              <button
                type="button"
                onClick={() => setConfirmation(false)}
                disabled={suppression}
                aria-label="Fermer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
              Supprimer mon compte ?
            </h2>
            <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
              Cette action supprime définitivement votre compte, vos clients et
              vos données. Elle est irréversible.
            </p>

            {erreurSuppression && (
              <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
                {erreurSuppression}
              </p>
            )}

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => void supprimerCompte()}
                disabled={suppression}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 text-base font-extrabold text-white transition-transform duration-200 active:scale-95 disabled:opacity-60"
              >
                {suppression ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                )}
                {suppression ? "Suppression…" : "Supprimer définitivement"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmation(false)}
                disabled={suppression}
                className="h-14 w-full rounded-2xl bg-slate-100 text-base font-extrabold text-slate-700 transition-transform duration-200 active:scale-95 disabled:opacity-60"
              >
                Garder mon compte
              </button>
            </div>
          </div>
        </div>
      )}

      {instructionsOuvertes && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
          onClick={() => setInstructionsOuvertes(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#0A2540]">
                <Download className="h-6 w-6" aria-hidden="true" />
              </span>
              <button
                type="button"
                onClick={() => setInstructionsOuvertes(false)}
                aria-label="Fermer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
              Installer Velianos
            </h2>
            <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
              Choisissez votre téléphone, puis suivez les étapes pour ajouter
              l&apos;application à votre écran d&apos;accueil.
            </p>

            <div
              role="tablist"
              aria-label="Choisir votre téléphone"
              className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1"
            >
              <button
                id="pwa-tab-iphone"
                type="button"
                role="tab"
                aria-selected={ongletPwa === "iphone"}
                aria-controls="pwa-panel"
                onClick={() => setOngletPwa("iphone")}
                className={`min-h-11 rounded-xl text-sm font-extrabold transition-transform duration-200 active:scale-95 ${
                  ongletPwa === "iphone"
                    ? "bg-white text-[#0A2540] shadow-[0_4px_18px_rgb(0,0,0,0.06)]"
                    : "text-slate-500"
                }`}
              >
                iPhone
              </button>
              <button
                id="pwa-tab-android"
                type="button"
                role="tab"
                aria-selected={ongletPwa === "android"}
                aria-controls="pwa-panel"
                onClick={() => setOngletPwa("android")}
                className={`min-h-11 rounded-xl text-sm font-extrabold transition-transform duration-200 active:scale-95 ${
                  ongletPwa === "android"
                    ? "bg-white text-[#0A2540] shadow-[0_4px_18px_rgb(0,0,0,0.06)]"
                    : "text-slate-500"
                }`}
              >
                Android
              </button>
            </div>

            <div
              id="pwa-panel"
              role="tabpanel"
              aria-labelledby={`pwa-tab-${ongletPwa}`}
              className="mt-4"
            >
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-[#0A2540] shadow-[0_4px_18px_rgb(0,0,0,0.04)]">
                  {ongletPwa === "iphone" ? (
                    <Share className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <MoreVertical className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900">
                    {ongletPwa === "iphone"
                      ? "Bouton Partager"
                      : "Menu 3 petits points"}
                  </p>
                  <p className="text-sm font-medium text-slate-500">
                    {ongletPwa === "iphone"
                      ? "En bas de l'écran dans Safari"
                      : "En haut à droite du navigateur"}
                  </p>
                </div>
              </div>

              <ol className="mt-4 space-y-3">
                {instructionsInstallation(ongletPwa).map((etape, index) => {
                  const texteEtape = etape.toLowerCase();
                  const Icone = texteEtape.includes("partager")
                    ? Share
                    : texteEtape.includes("3 petits points")
                      ? MoreVertical
                      : null;

                  return (
                    <li
                      key={etape}
                      className="flex items-start gap-3 text-base font-medium leading-snug text-slate-700"
                    >
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-[#0A2540]">
                        {Icone ? (
                          <Icone className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="flex-1">{etape}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setInstructionsOuvertes(false)}
              className="mt-5 h-14 w-full rounded-2xl bg-[#0A2540] text-base font-extrabold text-white transition-transform duration-200 active:scale-95"
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Groupe({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-2 text-sm font-extrabold uppercase tracking-wide text-slate-400">
        {titre}
      </h2>
      <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        {children}
      </div>
    </section>
  );
}

type LigneProps = {
  icone: typeof User;
  label: string;
  sousTexte?: string;
  href: string;
};

function Ligne({ icone: Icone, label, sousTexte, href }: LigneProps) {
  return (
    <Link
      href={href}
      className="flex min-h-16 items-center gap-3.5 border-b border-slate-100 px-4 py-3 transition-colors last:border-0 active:bg-slate-50"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
        <Icone className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-slate-900">
          {label}
        </span>
        {sousTexte && (
          <span className="mt-0.5 block truncate text-sm font-medium text-slate-500">
            {sousTexte}
          </span>
        )}
      </span>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" aria-hidden="true" />
    </Link>
  );
}
