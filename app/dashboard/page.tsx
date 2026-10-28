"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Euro,
  Map,
  Phone,
  Plus,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { NouveauClientSheet } from "@/components/clients/NouveauClientSheet";
import { SwipeClientCard } from "@/components/clients/SwipeClientCard";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { MESSAGE_ERREUR_MUTATION } from "@/lib/errors";
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
import { ajouterAction, retirerAction } from "@/lib/offline-queue";

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { notifier } = useAssistant();
  const [donnees, setDonnees] = useState<DonneesTerrain | null>(null);
  const [profil, setProfil] = useState<WorkspaceProfile>(EMPTY_WORKSPACE_PROFILE);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
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

  const traiter = useCallback(
    async (client: ClientFiche) => {
      if (enCours === client.id) return;
      setEnCours(client.id);
      vibrer(50);

      const statutPrecedent = client.statutRdv ?? "new";
      setDonnees((precedent) =>
        precedent
          ? {
              ...precedent,
              prospects: precedent.prospects.filter(
                (item) => item.id !== client.id,
              ),
            }
          : precedent,
      );

      if (!navigator.onLine && client.appointmentId) {
        const action = ajouterAction({
          type: "appointment-complete",
          appointmentId: client.appointmentId,
          statutPrecedent,
        });

        notifier(
          "📡 Action en attente. Elle sera synchronisée dès le retour du réseau.",
          () => {
            retirerAction(action.id);
            setDonnees((precedent) =>
              precedent
                ? {
                    ...precedent,
                    prospects: [client, ...precedent.prospects],
                  }
                : precedent,
            );
          },
          { variant: "warning" },
        );
        setEnCours(null);
        return;
      }

      try {
        if (client.appointmentId) {
          const supabase = createClient();
          const { error } = await supabase
            .from("appointments")
            .update({ status: "completed" })
            .eq("id", client.appointmentId);
          if (error) throw error;
        }

        notifier("✅ Client traité avec succès.", () => {
          setDonnees((precedent) =>
            precedent
              ? {
                  ...precedent,
                  prospects: [client, ...precedent.prospects],
                }
              : precedent,
          );
          if (client.appointmentId) {
            const supabase = createClient();
            void supabase
              .from("appointments")
              .update({ status: statutPrecedent })
              .eq("id", client.appointmentId);
          }
        }, { variant: "success" });
      } catch {
        notifier(MESSAGE_ERREUR_MUTATION, undefined, { variant: "error" });
        void charger(true);
      } finally {
        setEnCours(null);
      }
    },
    [charger, enCours, notifier],
  );

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
  const urgent =
    prospects.find((client) => client.urgence === "urgent") ?? prospects[0];
  const autres = prospects.filter((client) => client.id !== urgent?.id);
  const stats = donnees?.stats ?? { recuperes: 0, argent: 0, tempsHeures: 0 };

  return (
    <div className="space-y-6 pt-5">
      <div className="flex animate-fade-up items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold capitalize text-slate-500">
            {dateDuJour}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Bonjour {prenom}
          </h1>
          <p className="mt-2 text-lg font-medium leading-snug text-slate-600">
            {prospects.length > 0
              ? "Voici qui appeler en priorité aujourd'hui."
              : "Tout est à jour. Profitez de votre chantier."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAjoutOuvert(true)}
          aria-label="Ajouter un client"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540] text-white shadow-lg shadow-[#0A2540]/25 transition-transform duration-200 active:scale-95"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Metric
          icone={Phone}
          valeur={String(stats.recuperes)}
          label="Appels"
        />
        <Metric
          icone={Euro}
          valeur={`${stats.argent} €`}
          label="CA"
        />
        <Metric
          icone={Clock}
          valeur={`${stats.tempsHeures} h`}
          label="Temps"
        />
      </div>

      {!urgent ? (
        <EmptyState
          icon={CheckCircle2}
          title="Votre assistant est prêt"
          description="Il n'a pas encore reçu d'appel. Suivez le guide pour l'activer."
          actionLabel="Ouvrir mon assistant"
          onAction={() => router.push("/assistant")}
        />
      ) : (
        <>
          <section className="animate-fade-up">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                À appeler maintenant
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-base font-semibold text-red-600">
                <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                Priorité
              </span>
            </div>

            <article className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <button
                type="button"
                onClick={() =>
                  router.push(`/clients/${encodeURIComponent(urgent.id)}`)
                }
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
                      {urgent.nom}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-slate-700">
                      {urgent.probleme}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <TriangleAlert className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <p className="flex items-center gap-2 text-base font-medium text-slate-500">
                    <Map className="h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">
                      {urgent.adresse || "Adresse non renseignée"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-base font-medium text-slate-500">
                    <Clock className="h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    {urgent.moment}
                  </p>
                </div>
              </button>

              <div className="mt-4 grid gap-2.5">
                {lienTelephone(urgent.telephone) ? (
                  <a
                    href={lienTelephone(urgent.telephone) ?? undefined}
                    onClick={() => vibrer(50)}
                    className="flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95"
                  >
                    <Phone className="h-6 w-6" aria-hidden="true" />
                    Appeler maintenant
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-200 text-lg font-extrabold text-slate-400"
                  >
                    <Phone className="h-6 w-6" aria-hidden="true" />
                    Numéro manquant
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  {lienGoogleMaps(urgent.adresse) ? (
                    <a
                      href={lienGoogleMaps(urgent.adresse) ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-slate-700 transition-transform duration-200 active:scale-95"
                    >
                      <Map className="h-5 w-5" aria-hidden="true" />
                      Google Maps
                    </a>
                  ) : (
                    <span className="flex h-14 items-center justify-center rounded-2xl bg-slate-100 text-base font-semibold text-slate-400">
                      Adresse absente
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => void traiter(urgent)}
                    disabled={enCours === urgent.id}
                    className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0A2540] text-base font-extrabold text-white transition-transform duration-200 active:scale-95 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    Traité
                  </button>
                </div>
              </div>
            </article>
          </section>

          {autres.length > 0 && (
            <section className="animate-fade-up">
              <div className="mb-2.5 flex items-center justify-between px-1">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                  Les autres clients
                </h2>
                <span className="rounded-full bg-white px-3 py-1 text-base font-semibold text-slate-500 shadow-sm">
                  {autres.length}
                </span>
              </div>

              <div className="space-y-3">
                {autres.map((client) => (
                  <SwipeClientCard
                    key={client.id}
                    client={client}
                    onOpen={(item) =>
                      router.push(`/clients/${encodeURIComponent(item.id)}`)
                    }
                    onTreated={(item) => void traiter(item)}
                  />
                ))}
              </div>

              <p className="mt-3 text-center text-sm font-medium text-slate-400">
                Glissez une carte vers la droite pour la traiter.
              </p>
            </section>
          )}
        </>
      )}

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
                <p className="min-w-0 flex-1 text-base font-medium leading-snug text-slate-700">
                  {activite.texte}
                </p>
                <span className="flex-shrink-0 text-sm font-semibold text-slate-400">
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
        className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-base font-extrabold text-[#0A2540] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
      >
        <Users className="h-5 w-5" aria-hidden="true" />
        Voir tous mes clients
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Link>

      {ajoutOuvert && (
        <NouveauClientSheet
          onFermer={() => setAjoutOuvert(false)}
          onCree={clientCree}
        />
      )}
    </div>
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
