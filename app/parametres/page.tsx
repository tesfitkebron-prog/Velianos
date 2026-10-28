"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Bot,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
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
  const [profil, setProfil] = useState<WorkspaceProfile>(EMPTY_WORKSPACE_PROFILE);
  const [deconnexion, setDeconnexion] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [suppression, setSuppression] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(null);

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
    );
  };

  const seDeconnecter = async () => {
    setDeconnexion(true);
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

  const essai =
    profil.subscriptionStatus === "trialing"
      ? profil.trialEndsAt
        ? `Essai jusqu'au ${new Date(profil.trialEndsAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
          })}`
        : "Essai en cours"
      : profil.subscriptionStatus === "active"
        ? "Actif"
        : "À vérifier";

  const sousTitreAbonnement =
    profil.subscriptionPlan === "pro"
      ? `Plan Pro — 49 €/mois · ${essai}`
      : `${profil.subscriptionPlan.toUpperCase()} · ${essai}`;

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
