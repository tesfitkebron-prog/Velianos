"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Lock,
  LogOut,
  Shield,
  User,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { createClient } from "@/lib/supabase/client";
import { resetWorkspaceProfileCache } from "@/lib/workspace";

type CleContenu =
  | "securite"
  | "abonnement"
  | "confidentialite"
  | "conditions"
  | "aide";

type Feuille = CleContenu | "notifications" | null;

const CONTENUS: Record<CleContenu, { titre: string; texte: string }> = {
  securite: {
    titre: "Sécurité et mot de passe",
    texte:
      "Votre mot de passe se modifie depuis l'écran de connexion, avec l'adresse e-mail de votre compte.\n\nSi vous avez perdu l'accès, écrivez à support@velianos.fr : nous vérifions votre identité et réinitialisons l'accès sous 24 h.",
  },
  abonnement: {
    titre: "Mon abonnement",
    texte:
      "Plan Pro — 49 €/mois, sans engagement.\n\nIl comprend les appels manqués traités par SMS, les fiches clients et le suivi des rendez-vous.\n\nRésiliable à tout moment ; l'accès reste actif jusqu'à la fin du mois payé.",
  },
  confidentialite: {
    titre: "Confidentialité",
    texte:
      "Vos données clients sont stockées de façon sécurisée et ne sont jamais revendues.\n\nLes enregistrements d'appels sont conservés 90 jours, puis supprimés automatiquement.\n\nVous pouvez demander la suppression complète de votre compte à tout moment.",
  },
  conditions: {
    titre: "Conditions d'utilisation",
    texte:
      "Velianos est un assistant téléphonique destiné aux artisans.\n\nL'assistant qualifie les demandes mais ne remplace pas votre intervention.\n\nL'abonnement Pro est sans engagement, résiliable depuis votre compte.",
  },
  aide: {
    titre: "Aide",
    texte:
      "Besoin d'un coup de main ?\n\nÉcrivez à support@velianos.fr, nous répondons sous 24 h ouvrées.\n\nVous pouvez aussi demander directement à votre assistant depuis l'onglet Assistant.",
  },
};

const NOTIFICATIONS = [
  { id: "client", label: "Nouveau client récupéré" },
  { id: "resume", label: "Résumé du soir (19h)" },
  { id: "urgence", label: "Alertes urgences" },
] as const;

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
  const [feuille, setFeuille] = useState<Feuille>(null);
  const [deconnexion, setDeconnexion] = useState(false);
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    client: true,
    resume: true,
    urgence: true,
  });

  const basculerAssistant = () => {
    const suivant = !actif;
    setActif(suivant);
    notifier(
      suivant ? "Assistant activé." : "Assistant mis en pause.",
      () => setActif(!suivant),
    );
  };

  const basculerNotif = (id: string) => {
    setNotifs((etat) => ({ ...etat, [id]: !etat[id] }));
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

  const titre =
    feuille === "notifications"
      ? "Notifications"
      : feuille
        ? CONTENUS[feuille].titre
        : "";

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-6 max-w-2xl md:mx-auto">
      {/* 1. VOTRE ASSISTANT */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-[#0F172A]">
              Votre assistant
            </h2>
            <p
              className={`text-sm font-medium mt-1 leading-snug ${
                actif ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {actif
                ? "Actif. Il répond aux appels manqués par SMS."
                : "En pause. Aucun SMS ne part."}
            </p>
          </div>

          <button
            onClick={basculerAssistant}
            role="switch"
            aria-checked={actif}
            aria-label="Activer ou mettre en pause l'assistant"
            className="flex-shrink-0 p-1.5 -m-1.5 active:scale-95 transition-transform"
          >
            <span
              className={`flex h-8 w-14 items-center rounded-full p-0.5 transition-colors ${
                actif ? "bg-[#10B981]" : "bg-slate-300"
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

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-normal text-slate-600 leading-snug">
              Votre assistant connaît votre entreprise à{" "}
              <span className="font-semibold text-[#0F172A]">80%</span>
            </p>
            <Link
              href="/entreprise"
              className="flex-shrink-0 min-h-[44px] inline-flex items-center rounded-lg bg-slate-100 px-3 text-xs font-semibold text-[#0F172A] active:scale-95 transition-transform"
            >
              Compléter
            </Link>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#10B981]"
              style={{ width: "80%" }}
            />
          </div>
        </div>
      </section>

      {/* 2. MON COMPTE */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
          Mon compte
        </h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <Ligne
            icone={User}
            label="Informations personnelles"
            href="/compte"
          />
          <Ligne
            icone={Lock}
            label="Sécurité et mot de passe"
            onClick={() => setFeuille("securite")}
          />
        </div>
      </section>

      {/* 3. APPLICATION */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
          Application
        </h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <Ligne
            icone={Bell}
            label="Notifications"
            onClick={() => setFeuille("notifications")}
          />
          <Ligne
            icone={CreditCard}
            label="Abonnement"
            sousTexte="Plan Pro — 49€/mois"
            sousTexteVert
            onClick={() => setFeuille("abonnement")}
          />
          <Ligne
            icone={Shield}
            label="Confidentialité"
            onClick={() => setFeuille("confidentialite")}
          />
          <Ligne
            icone={FileText}
            label="Conditions d'utilisation"
            onClick={() => setFeuille("conditions")}
          />
          <Ligne
            icone={HelpCircle}
            label="Aide"
            onClick={() => setFeuille("aide")}
          />
        </div>
      </section>

      {/* 4. DÉCONNEXION */}
      <section>
        <button
          onClick={() => void seDeconnecter()}
          disabled={deconnexion}
          className="w-full h-12 rounded-xl bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-60"
        >
          <LogOut className="w-5 h-5" />
          {deconnexion ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </section>

      <p className="text-xs font-normal text-slate-400 text-center">
        Velianos v1.0.0
      </p>

      {/* FEUILLE D'INFORMATION */}
      {feuille && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px]"
          onClick={() => setFeuille(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[85dvh] flex flex-col animate-[sheetUp_.25s_ease-out]"
          >
            <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
              <span className="w-9 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2 flex-shrink-0">
              <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                {titre}
              </h2>
              <button
                onClick={() => setFeuille(null)}
                aria-label="Fermer"
                className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto min-h-0">
              {feuille === "notifications" ? (
                <div className="px-5 pb-6">
                  {NOTIFICATIONS.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 min-h-[52px] border-b border-slate-100 last:border-0"
                    >
                      <span className="flex-1 text-sm font-normal text-slate-700">
                        {item.label}
                      </span>
                      <button
                        onClick={() => basculerNotif(item.id)}
                        role="switch"
                        aria-checked={notifs[item.id]}
                        aria-label={item.label}
                        className="flex h-11 w-11 items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                      >
                        <span
                          className="relative flex h-6 w-11 items-center rounded-full p-0.5 transition-colors"
                          style={{
                            backgroundColor: notifs[item.id]
                              ? "#0F172A"
                              : "#CBD5E1",
                          }}
                        >
                          <span
                            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              notifs[item.id]
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 pb-6 text-sm font-normal leading-relaxed text-slate-600 whitespace-pre-line">
                  {CONTENUS[feuille].texte}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type LigneProps = {
  icone: typeof User;
  label: string;
  sousTexte?: string;
  sousTexteVert?: boolean;
  href?: string;
  onClick?: () => void;
};

function Ligne({
  icone: Icone,
  label,
  sousTexte,
  sousTexteVert = false,
  href,
  onClick,
}: LigneProps) {
  const contenu = (
    <>
      <span className="w-8 h-8 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center flex-shrink-0">
        <Icone className="w-4 h-4" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-[#0F172A]">
          {label}
        </span>
        {sousTexte && (
          <span
            className={`block text-[11px] mt-0.5 ${
              sousTexteVert
                ? "text-[#10B981] font-medium"
                : "text-slate-400 font-normal"
            }`}
          >
            {sousTexte}
          </span>
        )}
      </span>
      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-4 min-h-[52px] border-b border-slate-100 last:border-0 active:bg-slate-50 transition-colors"
      >
        {contenu}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 min-h-[52px] border-b border-slate-100 last:border-0 active:bg-slate-50 transition-colors text-left"
    >
      {contenu}
    </button>
  );
}
