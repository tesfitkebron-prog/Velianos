"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  TriangleAlert,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { createClient } from "@/lib/supabase/client";
import { formatDateFrench } from "@/lib/date";
import { creerPlanningExemple } from "@/lib/examples";
import {
  chargerDonneesTerrain,
  type DonneesTerrain,
} from "@/lib/field-data";
import {
  EMPTY_WORKSPACE_PROFILE,
  loadWorkspaceProfile,
  type WorkspaceProfile,
} from "@/lib/workspace";
import {
  lienGoogleMaps,
  lienTelephone,
  vibrer,
  type ClientFiche,
} from "@/lib/clients";
import { clientEnAttente } from "@/lib/offline-queue";

function problemeEnTroisMots(probleme: string): string {
  const mots = probleme.trim().split(/\s+/).filter(Boolean);
  if (mots.length <= 3) return probleme.trim();
  return `${mots.slice(0, 3).join(" ")}…`;
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [donnees, setDonnees] = useState<DonneesTerrain | null>(null);
  const [profil, setProfil] = useState<WorkspaceProfile>(EMPTY_WORKSPACE_PROFILE);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [, setVersionFile] = useState(0);
  const exemples = useMemo(() => creerPlanningExemple(), []);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charger = useCallback(async (silencieux = false) => {
    if (!silencieux) setChargement(true);
    setErreur(null);

    const [terrain, espace] = await Promise.all([
      chargerDonneesTerrain(),
      loadWorkspaceProfile(),
    ]);

    setProfil(espace);
    setDonnees(terrain);
    setErreur(terrain.erreur);
    setChargement(false);
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const rafraichir = () => setVersionFile((valeur) => valeur + 1);
    window.addEventListener("velianos:offline-queue", rafraichir);
    window.addEventListener("velianos:preuves", rafraichir);
    return () => {
      window.removeEventListener("velianos:offline-queue", rafraichir);
      window.removeEventListener("velianos:preuves", rafraichir);
    };
  }, []);

  useEffect(() => {
    const companyId = donnees?.companyId;
    if (!companyId) return;

    const supabase = createClient();
    const planifier = () => {
      if (minuteur.current) clearTimeout(minuteur.current);
      minuteur.current = setTimeout(() => {
        void charger(true);
      }, 450);
    };

    const canal = supabase
      .channel(`velianos-terrain-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clients",
          filter: `company_id=eq.${companyId}`,
        },
        planifier,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `company_id=eq.${companyId}`,
        },
        planifier,
      )
      .subscribe();

    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
      void supabase.removeChannel(canal);
    };
  }, [donnees?.companyId, charger]);

  const dateDuJour = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const prenom =
    profil.firstName ||
    (profil.fullName !== "Utilisateur"
      ? profil.fullName.split(" ")[0]
      : "vous");
  const salutation = prenom === "vous" ? "Bonjour" : `Bonjour ${prenom}`;

  if (chargement) {
    return (
      <div className="p-4">
        <PageSkeleton lignes={3} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="p-4">
        <PageError
          message={erreur}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const prospects = donnees?.prospects ?? [];
  const planningReel = [...prospects]
    .sort((a, b) => {
      const dateA = a.dateRdv ? Date.parse(a.dateRdv) : Number.MAX_SAFE_INTEGER;
      const dateB = b.dateRdv ? Date.parse(b.dateRdv) : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    })
    .slice(0, 5);
  const afficherExemples = planningReel.length === 0;
  const planning = afficherExemples ? exemples : planningReel;

  return (
    <div className="space-y-4 p-4">
      <header className="space-y-1.5 pt-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2F6BFF]">
          {dateDuJour}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {salutation}
        </h1>
        <p className="text-base font-medium text-slate-600">
          Voici vos prochains rendez-vous.
        </p>
      </header>

      {afficherExemples && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <Info
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <p className="text-sm leading-snug text-amber-900">
            Voici un exemple de votre planning. Les données sont fictives.
          </p>
        </div>
      )}

      <Link
        href="/messages"
        className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-colors active:bg-[#EDF3FF]"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EDF3FF] text-[#2F6BFF]">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-900">
            Messages
          </span>
          <span className="block truncate text-xs font-medium text-slate-500">
            Les échanges de votre assistant avec vos clients
          </span>
        </span>
        <ChevronRight
          className="h-4 w-4 flex-shrink-0 text-slate-300"
          aria-hidden="true"
        />
      </Link>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Prochains rendez-vous
          </h2>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#EDF3FF] px-2 text-xs font-bold text-[#1D4ED8]">
            {planning.length}
          </span>
        </div>

        <div className="space-y-3">
          {planning.map((client) => (
            <PlanningCard
              key={client.id}
              client={client}
              exemple={afficherExemples}
              onOpen={() =>
                router.push(`/clients/${encodeURIComponent(client.id)}`)
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function PlanningCard({
  client,
  onOpen,
  exemple = false,
}: {
  client: ClientFiche;
  onOpen: () => void;
  exemple?: boolean;
}) {
  const tel = lienTelephone(client.telephone);
  const maps = lienGoogleMaps(client.adresse);
  const enAttente = clientEnAttente(client.id, client.appointmentId);
  const heure = client.heureRdv || client.heure || "--:--";
  const jour = client.dateRdv
    ? formatDateFrench(client.dateRdv, {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";
  const urgence =
    client.urgence === "urgent"
      ? "Urgent"
      : client.urgence === "a_verifier"
        ? "À vérifier"
        : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ouvrir la fiche de ${client.nom}`}
        className="flex w-full items-start gap-3 p-4 pb-3 text-left transition-colors active:bg-[#F7FAFF]"
      >
        <span className="flex w-14 flex-shrink-0 flex-col items-center rounded-xl bg-[#EDF3FF] py-2">
          <span className="text-base font-extrabold leading-none text-[#1D4ED8]">
            {heure}
          </span>
          {jour && (
            <span className="mt-1 text-center text-[11px] font-semibold leading-tight text-[#2F6BFF]">
              {jour}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-base font-bold text-slate-900">
              {client.nom}
            </span>
            {enAttente && (
              <Clock
                className="h-3.5 w-3.5 flex-shrink-0 text-orange-600"
                aria-label="En attente de synchronisation"
              />
            )}
          </span>

          <span className="mt-0.5 block truncate text-sm font-medium text-slate-600">
            {problemeEnTroisMots(client.probleme)}
          </span>

          {client.adresse && (
            <span className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{client.adresse}</span>
            </span>
          )}

          {(exemple || urgence) && (
            <span className="mt-2 flex flex-wrap items-center gap-1.5">
              {exemple && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  Exemple
                </span>
              )}
              {urgence && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    client.urgence === "urgent"
                      ? "bg-red-600 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {client.urgence === "urgent" && (
                    <TriangleAlert className="h-3 w-3" aria-hidden="true" />
                  )}
                  {urgence}
                </span>
              )}
            </span>
          )}
        </span>

        <ChevronRight
          className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300"
          aria-hidden="true"
        />
      </button>

      <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
        {tel ? (
          <a
            href={tel}
            onClick={() => vibrer(50)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] text-sm font-bold text-white shadow-md shadow-[#2F6BFF]/25 transition-transform active:scale-95"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Appeler
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-11 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-medium text-slate-400"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Numéro manquant
          </button>
        )}

        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            onClick={() => vibrer(40)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#EDF3FF] text-sm font-bold text-[#1D4ED8] transition-transform active:scale-95"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Itinéraire
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-11 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-medium text-slate-400"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Adresse absente
          </button>
        )}
      </div>
    </article>
  );
}
