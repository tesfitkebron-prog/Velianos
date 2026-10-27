"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Bot,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Lock,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { createClient } from "@/lib/supabase/client";
import { resetWorkspaceProfileCache } from "@/lib/workspace";

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
  const [deconnexion, setDeconnexion] = useState(false);

  const basculerAssistant = () => {
    const suivant = !actif;
    setActif(suivant);
    notifier(
      suivant ? "Assistant activé." : "Assistant mis en pause.",
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

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-6 max-w-2xl md:mx-auto">
      {/* 1. MON ASSISTANT */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#0F172A]">Mon assistant</h2>
            <p className="mt-1 flex items-start gap-1.5 text-sm font-normal leading-snug text-slate-600">
              <span
                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                  actif ? "bg-[#00D26A]" : "bg-amber-500"
                }`}
              />
              {actif
                ? "Actif · il répond aux appels manqués par SMS."
                : "En pause · aucun SMS ne part."}
            </p>
          </div>

          <button
            onClick={basculerAssistant}
            role="switch"
            aria-checked={actif}
            aria-label="Activer ou mettre en pause l'assistant"
            className="flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-end transition-transform active:scale-95"
          >
            <span
              className={`flex h-8 w-14 items-center rounded-full p-0.5 transition-colors ${
                actif ? "bg-[#00D26A]" : "bg-slate-300"
              }`}
            >
              <span
                className={`h-7 w-7 rounded-full bg-white shadow transition-transform ${
                  actif ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-normal leading-snug text-slate-600">
              Votre assistant connaît votre entreprise à{" "}
              <span className="font-semibold text-[#0F172A]">80%</span>
            </p>
            <Link
              href="/entreprise"
              className="inline-flex min-h-[44px] flex-shrink-0 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-transform active:scale-95"
            >
              Compléter
            </Link>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#00D26A]"
              style={{ width: "80%" }}
            />
          </div>
        </div>

        <Link
          href="/assistant"
          className="mt-4 flex min-h-[44px] items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 transition-colors active:text-slate-700"
        >
          <span className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            Ouvrir mon assistant
          </span>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
        </Link>
      </section>

      {/* 2. MON COMPTE */}
      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Mon compte
        </h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Ligne
            icone={User}
            label="Informations personnelles"
            href="/compte/profil"
          />
          <Ligne
            icone={Shield}
            label="Sécurité et mot de passe"
            href="/compte/securite"
          />
        </div>
      </section>

      {/* 3. APPLICATION */}
      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Application
        </h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Ligne
            icone={Bell}
            label="Notifications"
            href="/compte/notifications"
          />
          <Ligne
            icone={CreditCard}
            label="Abonnement"
            sousTexte="Plan Pro — 49€/mois"
            sousTexteVert
            href="/compte/abonnement"
          />
          <Ligne
            icone={Lock}
            label="Confidentialité"
            href="/compte/confidentialite"
          />
          <Ligne
            icone={FileText}
            label="Conditions d'utilisation"
            href="/compte/conditions"
          />
          <Ligne icone={HelpCircle} label="Aide" href="/compte/aide" />
        </div>
      </section>

      {/* 4. DÉCONNEXION */}
      <section>
        <button
          onClick={() => void seDeconnecter()}
          disabled={deconnexion}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-red-500 transition-transform active:scale-95 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {deconnexion ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </section>

      <p className="mb-4 mt-8 text-center text-xs text-slate-400">
        Velianos v1.0.0
      </p>
    </div>
  );
}

type LigneProps = {
  icone: typeof User;
  label: string;
  sousTexte?: string;
  sousTexteVert?: boolean;
  href: string;
};

function Ligne({
  icone: Icone,
  label,
  sousTexte,
  sousTexteVert = false,
  href,
}: LigneProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[56px] items-center gap-3 border-b border-slate-100 px-4 transition-colors last:border-0 active:bg-slate-50 active:scale-[0.99]"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#0F172A]">
        <Icone className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#0F172A]">
          {label}
        </span>
        {sousTexte && (
          <span
            className={`mt-0.5 block text-[11px] ${
              sousTexteVert
                ? "font-medium text-emerald-700"
                : "font-normal text-slate-400"
            }`}
          >
            {sousTexte}
          </span>
        )}
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
    </Link>
  );
}
