"use client";

import { useEffect, useState } from "react";
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
  FileText,
  HelpCircle,
  History,
  Loader2,
  Lock,
  LogOut,
  MoreVertical,
  Share,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { ConfirmationSuppression } from "@/components/ui/ConfirmationSuppression";
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

  const initiales = (
    profil.fullName && profil.fullName !== "Utilisateur"
      ? profil.fullName
      : "Velianos"
  )
    .split(" ")
    .filter(Boolean)
    .map((partie) => partie.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 p-4">
      <section className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-sm font-semibold text-white">
          {initiales || "V"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">
            {profil.fullName || "Mon compte"}
          </p>
          <p className="truncate text-sm text-slate-500">{profil.email}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
              actif
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-slate-900">Assistant</p>
            <p className="mt-0.5 text-sm leading-snug text-slate-500">
              {actif
                ? "Actif — il répond à vos clients."
                : "En pause — aucun message automatique."}
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
          className="mt-3 flex h-10 items-center justify-between border-t border-slate-100 pt-3 text-sm font-medium text-[#2F6BFF]"
        >
          <span>Ouvrir l&apos;assistant</span>
          <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </Link>
      </section>

      <Groupe titre="Compte">
        <Ligne
          icone={Building2}
          label="Mon entreprise"
          sousTexte="Identité, tarifs et zones d'intervention"
          href="/entreprise"
        />
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
        <Ligne
          icone={History}
          label="Journal de contrôle"
          sousTexte="Les actions de votre assistant"
          href="/controle"
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
          badge={{
            label: abonnement.label,
            className: STYLE_ABONNEMENT[abonnement.tone],
          }}
        />
        <Ligne
          icone={Lock}
          label="Confidentialité"
          href="/legal/confidentialite"
        />
        <Ligne
          icone={FileText}
          label="Conditions d'utilisation"
          href="/legal/cgu"
        />
        <Ligne icone={HelpCircle} label="Aide" href="/compte/aide" />
      </Groupe>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Download className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-slate-900">
              Installer l&apos;application
            </p>
            <p className="mt-0.5 text-sm leading-snug text-slate-500">
              Ajoutez Velianos à votre écran d&apos;accueil.
            </p>
          </div>
        </div>

        {installee ? (
          <p className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Application installée
          </p>
        ) : (
          <button
            type="button"
            onClick={ouvrirGuideInstallation}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] text-sm font-medium text-white transition-opacity active:opacity-80"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Installer sur ce téléphone
          </button>
        )}
      </section>

      <Groupe titre="Session">
        <button
          type="button"
          onClick={() => void seDeconnecter()}
          disabled={deconnexion}
          className="flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-slate-50 disabled:opacity-60"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex-1 text-base text-slate-900">Se déconnecter</span>
          {deconnexion && (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setErreurSuppression(null);
            setConfirmation(true);
          }}
          className="flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-red-50"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex-1 text-base text-red-600">
            Supprimer mon compte
          </span>
        </button>
      </Groupe>

      <p className="pb-2 text-center text-xs text-slate-400">
        Velianos · vos données vous appartiennent.
      </p>

      <ConfirmationSuppression
        open={confirmation}
        title="Supprimer mon compte ?"
        description="Cette action supprime définitivement votre compte, vos clients et vos données. Elle est irréversible."
        actionLabel="Supprimer définitivement"
        onClose={() => {
          if (!suppression) setConfirmation(false);
        }}
        onConfirm={() => void supprimerCompte()}
        enCours={suppression}
        erreur={erreurSuppression}
      />

      {instructionsOuvertes && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
          onClick={() => setInstructionsOuvertes(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#2F6BFF]">
                <Download className="h-5 w-5" aria-hidden="true" />
              </span>
              <button
                type="button"
                onClick={() => setInstructionsOuvertes(false)}
                aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
              Installer Velianos
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Choisissez votre téléphone, puis suivez les étapes pour ajouter
              l&apos;application à votre écran d&apos;accueil.
            </p>

            <div
              role="tablist"
              aria-label="Choisir votre téléphone"
              className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
            >
              <button
                id="pwa-tab-iphone"
                type="button"
                role="tab"
                aria-selected={ongletPwa === "iphone"}
                aria-controls="pwa-panel"
                onClick={() => setOngletPwa("iphone")}
                className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                  ongletPwa === "iphone"
                    ? "bg-white text-[#2F6BFF] shadow-sm"
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
                className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                  ongletPwa === "android"
                    ? "bg-white text-[#2F6BFF] shadow-sm"
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
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[#2F6BFF] shadow-sm">
                  {ongletPwa === "iphone" ? (
                    <Share className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {ongletPwa === "iphone"
                      ? "Bouton Partager"
                      : "Menu 3 petits points"}
                  </p>
                  <p className="text-xs text-slate-500">
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
                      className="flex items-start gap-2.5 text-sm leading-snug text-slate-700"
                    >
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-[#2F6BFF]">
                        {Icone ? (
                          <Icone className="h-3.5 w-3.5" aria-hidden="true" />
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
              className="mt-5 h-11 w-full rounded-xl bg-[#2F6BFF] text-sm font-medium text-white transition-opacity active:opacity-80"
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
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {titre}
      </h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
  badge?: { label: string; className: string };
};

function Ligne({ icone: Icone, label, sousTexte, href, badge }: LigneProps) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center gap-3 px-4 py-2.5 transition-colors active:bg-slate-50"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icone className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base text-slate-900">{label}</span>
        {sousTexte && (
          <span className="mt-0.5 block truncate text-xs text-slate-500">
            {sousTexte}
          </span>
        )}
      </span>
      {badge && (
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      )}
      <ChevronRight
        className="h-4 w-4 flex-shrink-0 text-slate-300"
        aria-hidden="true"
      />
    </Link>
  );
}
