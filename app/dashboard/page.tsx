"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Euro,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NouveauClientSheet } from "@/components/clients/NouveauClientSheet";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { createClient } from "@/lib/supabase/client";
import { formatDateFrench } from "@/lib/date";
import { creerClientsExemple } from "@/lib/examples";
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

function capitaliserMots(valeur: string): string {
  return valeur.replace(/(^|\s)\S/g, (lettre) => lettre.toUpperCase());
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
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [statsOuvertes, setStatsOuvertes] = useState(false);
  const [, setVersionFile] = useState(0);
  const exemples = useMemo(() => creerClientsExemple(), []);
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

  const clientCree = async () => {
    setAjoutOuvert(false);
    await charger(true);
  };

  const dateDuJour = capitaliserMots(
    formatDateFrench(new Date(), {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );
  const prenom =
    profil.firstName ||
    (profil.fullName !== "Utilisateur"
      ? profil.fullName.split(" ")[0]
      : "vous");

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
    <div className="space-y-6 pt-5">
      <div className="flex animate-fade-up items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold capitalize text-slate-900">
            {dateDuJour}
          </h1>
          <p className="mt-2 text-lg font-medium leading-snug text-slate-600">
            Bonjour {prenom}. Voici vos prochains rendez-vous.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            vibrer(50);
            setAjoutOuvert(true);
          }}
          aria-label="Ajouter un client"
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540] text-white shadow-lg shadow-[#0A2540]/25 transition-transform duration-200 active:scale-95"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <section className="animate-fade-up">
        <div className="mb-2.5 flex items-center justify-between gap-3 px-1">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <CalendarDays className="h-5 w-5 text-[#0A2540]" aria-hidden="true" />
            Prochains rendez-vous
          </h2>
          <span className="rounded-full bg-white px-3 py-1 text-base font-semibold text-slate-500 shadow-sm">
            {afficherExemples ? "Exemples" : `${planning.length} / 5`}
          </span>
        </div>

        {afficherExemples && (
          <p className="mb-3 px-1 text-base font-medium leading-snug text-slate-500">
            Voici un aperçu de votre planning. Vos vrais rendez-vous
            apparaîtront ici dès que Nova en aura qualifié un.
          </p>
        )}

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

      {donnees && donnees.activites.length > 0 && (
        <section className="animate-fade-up">
          <div className="mb-2.5 flex items-center gap-2 px-1">
            <Sparkles className="h-5 w-5 text-[#0A2540]" aria-hidden="true" />
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              L&apos;assistant a travaillé
            </h2>
          </div>
          <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            {donnees.activites.map((activite, index) => (
              <div
                key={activite.id}
                className={`flex items-center gap-3 px-5 py-4 ${
                  index > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    activite.ton === "success"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="min-w-0 flex-1 text-lg font-medium leading-snug text-slate-700">
                  {activite.texte}
                </p>
                <span className="flex-shrink-0 text-base font-semibold text-slate-400">
                  {activite.heure}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Link
        href="/clients"
        scroll={false}
        className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white text-lg font-extrabold text-[#0A2540] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
      >
        <Users className="h-5 w-5" aria-hidden="true" />
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
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-white px-5 text-lg font-extrabold text-[#0A2540] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
            Voir mes statistiques du mois
          </span>
          {statsOuvertes ? (
            <ChevronUp className="h-5 w-5 text-slate-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" aria-hidden="true" />
          )}
        </button>

        {statsOuvertes && (
          <div className="mt-3 grid grid-cols-3 gap-2.5">
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

      {ajoutOuvert && (
        <NouveauClientSheet
          onFermer={() => setAjoutOuvert(false)}
          onCree={clientCree}
        />
      )}
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

  const contenu = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="truncate text-xl font-extrabold tracking-tight text-slate-900">
          {client.nom}
        </h3>
        {exemple && (
          <span className="inline-flex flex-shrink-0 items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Exemple
          </span>
        )}
        {enAttente && (
          <Clock
            className="h-4 w-4 flex-shrink-0 text-orange-500"
            aria-label="En attente de synchronisation"
          />
        )}
        {client.urgence === "urgent" && (
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-sm font-semibold text-red-700">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Urgent
          </span>
        )}
        {client.urgence === "a_verifier" && (
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-sm font-semibold text-orange-700">
            À vérifier
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-slate-700">
        {client.probleme}
      </p>
      {client.adresse && (
        <p className="mt-1 flex items-center gap-1 truncate text-base font-medium text-slate-400">
          <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{client.adresse}</span>
        </p>
      )}
    </>
  );

  return (
    <article className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex items-start gap-3">
        <div className="flex w-16 flex-shrink-0 flex-col items-center rounded-2xl bg-slate-100 px-1 py-2">
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            {heure}
          </span>
          {jour && (
            <span className="mt-0.5 text-center text-sm font-semibold leading-tight text-slate-500">
              {jour}
            </span>
          )}
        </div>

        {exemple ? (
          <div className="min-w-0 flex-1">{contenu}</div>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 text-left"
          >
            {contenu}
          </button>
        )}

        {!exemple && (
          <ChevronRight
            className="mt-1 h-5 w-5 flex-shrink-0 text-slate-300"
            aria-hidden="true"
          />
        )}
      </div>

      {exemple ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500">
          Aperçu — voici à quoi ressemblera votre planning.
        </p>
      ) : (
        <div className="mt-4 flex gap-2.5">
          {tel ? (
            <a
              href={tel}
              onClick={() => vibrer(50)}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-transform duration-200 active:scale-95"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Appeler
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex min-h-14 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 text-base font-semibold text-slate-400"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Numéro manquant
            </button>
          )}

          {maps ? (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              onClick={() => vibrer(40)}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 text-lg font-extrabold text-slate-700 transition-transform duration-200 active:scale-95"
            >
              <MapPin className="h-5 w-5" aria-hidden="true" />
              Maps
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex min-h-14 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 text-base font-semibold text-slate-400"
            >
              <MapPin className="h-5 w-5" aria-hidden="true" />
              Adresse absente
            </button>
          )}
        </div>
      )}
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
    <div className="rounded-[20px] bg-white px-3 py-3.5 text-center shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
      <Icone className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
      <p className="mt-1.5 truncate text-xl font-extrabold tracking-tight text-slate-900">
        {valeur}
      </p>
      <p className="mt-0.5 truncate text-base font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}
