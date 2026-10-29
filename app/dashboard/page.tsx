"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Euro,
  Info,
  MapPin,
  Phone,
  TriangleAlert,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WorkTabs } from "@/components/layout/WorkTabs";
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
  const [statsOuvertes, setStatsOuvertes] = useState(false);
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

  // Titre demandé : date du jour au format long français.
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

  if (chargement) {
    return (
      <div className="space-y-4 pt-4">
        <PageSkeleton lignes={3} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="pt-5">
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
  const stats = donnees?.stats ?? { recuperes: 0, argent: 0, tempsHeures: 0 };

  return (
    <div className="space-y-5 pb-4 pt-4">
      <WorkTabs />

      <header className="animate-fade-up px-1">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-500">
          Mon planning
        </p>
        <h1 className="mt-1 text-3xl font-extrabold capitalize leading-tight tracking-tight text-slate-900">
          {dateDuJour}
        </h1>
        <p className="mt-2 text-lg font-medium leading-snug text-slate-700">
          Bonjour {prenom}. Voici vos prochains rendez-vous.
        </p>
      </header>

      {afficherExemples && (
        <div
          role="note"
          className="flex items-start gap-3 rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-amber-950"
        >
          <Info className="mt-0.5 h-6 w-6 flex-shrink-0" aria-hidden="true" />
          <p className="text-base font-bold leading-snug">
            Voici un exemple de votre planning. Les données sont fictives.
          </p>
        </div>
      )}

      <section className="animate-fade-up">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900">
            <CalendarDays className="h-6 w-6 text-[#0A2540]" aria-hidden="true" />
            Prochains rendez-vous
          </h2>
          <span className="flex-shrink-0 rounded-full bg-white px-3 py-1.5 text-base font-extrabold text-slate-600 shadow-sm">
            {planning.length} / 5
          </span>
        </div>

        <div className="space-y-4">
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

      <Link
        href="/clients"
        scroll={false}
        className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-white text-lg font-extrabold text-[#0A2540] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
      >
        <Users className="h-6 w-6" aria-hidden="true" />
        Voir tous mes clients
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Link>

      <section className="animate-fade-up">
        <button
          type="button"
          onClick={() => {
            vibrer(40);
            setStatsOuvertes((valeur) => !valeur);
          }}
          aria-expanded={statsOuvertes}
          className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl bg-white px-5 text-lg font-extrabold text-[#0A2540] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
            Voir mes statistiques
          </span>
          {statsOuvertes ? (
            <ChevronUp className="h-6 w-6 text-slate-500" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-6 w-6 text-slate-500" aria-hidden="true" />
          )}
        </button>

        {statsOuvertes && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Metric
              icone={Phone}
              valeur={String(stats.recuperes)}
              label="Appels"
            />
            <Metric icone={Euro} valeur={`${stats.argent} €`} label="CA" />
            <Metric
              icone={Clock}
              valeur={`${stats.tempsHeures} h`}
              label="Temps"
            />
          </div>
        )}
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

  return (
    <article className="overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ouvrir la fiche de ${client.nom}`}
        className="flex w-full items-start gap-3 rounded-2xl text-left transition-transform duration-200 active:scale-[0.99]"
      >
        <span className="flex w-[4.5rem] flex-shrink-0 flex-col items-center rounded-2xl bg-slate-100 px-1 py-2.5">
          <span className="text-xl font-extrabold leading-none tracking-tight text-slate-900">
            {heure}
          </span>
          {jour && (
            <span className="mt-1 text-center text-sm font-bold leading-tight text-slate-600">
              {jour}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-xl font-extrabold tracking-tight text-slate-900">
              {client.nom}
            </span>
            {exemple && (
              <span className="flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-600">
                Exemple
              </span>
            )}
            {enAttente && (
              <Clock
                className="h-5 w-5 flex-shrink-0 text-orange-600"
                aria-label="En attente de synchronisation"
              />
            )}
            {client.urgence === "urgent" && (
              <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-sm font-extrabold text-red-800">
                <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                Urgent
              </span>
            )}
            {client.urgence === "a_verifier" && (
              <span className="flex-shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-sm font-extrabold text-orange-800">
                À vérifier
              </span>
            )}
          </span>

          <span className="mt-1 block text-lg font-bold leading-snug text-slate-800">
            {problemeEnTroisMots(client.probleme)}
          </span>

          {client.adresse && (
            <span className="mt-1 flex items-center gap-1.5 text-base font-medium text-slate-600">
              <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="line-clamp-2">{client.adresse}</span>
            </span>
          )}
        </span>

        <ChevronRight
          className="mt-1 h-6 w-6 flex-shrink-0 text-slate-400"
          aria-hidden="true"
        />
      </button>

      <div className="mt-4 flex flex-col gap-3">
        {tel ? (
          <a
            href={tel}
            onClick={() => vibrer(50)}
            className="flex min-h-20 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-xl font-extrabold text-white shadow-lg shadow-emerald-600/30 transition-transform duration-200 active:scale-95"
          >
            <Phone className="h-6 w-6" aria-hidden="true" />
            Appeler
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex min-h-20 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-200 text-lg font-bold text-slate-500"
          >
            <Phone className="h-6 w-6" aria-hidden="true" />
            Numéro manquant
          </button>
        )}

        {maps ? (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            onClick={() => vibrer(40)}
            className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 text-lg font-extrabold text-slate-800 transition-transform duration-200 active:scale-95"
          >
            <MapPin className="h-6 w-6" aria-hidden="true" />
            Google Maps
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex min-h-16 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-100 text-lg font-bold text-slate-500"
          >
            <MapPin className="h-6 w-6" aria-hidden="true" />
            Adresse absente
          </button>
        )}
      </div>
    </article>
  );
}

function Metric({
  icone: Icone,
  valeur,
  label,
}: {
  icone: typeof Phone;
  valeur: string;
  label: string;
}) {
  return (
    <div className="rounded-[20px] bg-white px-2 py-4 text-center shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
      <Icone className="mx-auto h-6 w-6 text-slate-500" aria-hidden="true" />
      <p className="mt-1.5 truncate text-xl font-extrabold tracking-tight text-slate-900">
        {valeur}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-600">
        {label}
      </p>
    </div>
  );
}
