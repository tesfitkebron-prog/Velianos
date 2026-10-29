"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Plus,
  Search,
  SearchX,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WorkTabs } from "@/components/layout/WorkTabs";
import { NouveauClientSheet } from "@/components/clients/NouveauClientSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { chargerDonneesTerrain, type DonneesTerrain } from "@/lib/field-data";
import { clientEnAttente } from "@/lib/offline-queue";
import { creerClientsExemple } from "@/lib/examples";
import { STYLE_URGENCE, styleAvatar } from "@/lib/clients";

export default function ClientsPage() {
  return (
    <AppLayout>
      <ClientsContent />
    </AppLayout>
  );
}

function ClientsContent() {
  const router = useRouter();
  const [donnees, setDonnees] = useState<DonneesTerrain | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [, setVersionFile] = useState(0);
  const exemples = useMemo(() => creerClientsExemple(), []);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    const resultat = await chargerDonneesTerrain();
    setDonnees(resultat);
    setErreur(resultat.erreur);
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

  const clientCree = async () => {
    setAjoutOuvert(false);
    setRecherche("");
    await charger();
  };

  const aDesClientsReels = (donnees?.clients.length ?? 0) > 0;
  const afficherExemples = !aDesClientsReels && recherche.trim().length === 0;

  const clients = useMemo(() => {
    const liste = afficherExemples ? exemples : (donnees?.clients ?? []);
    const terme = recherche.trim().toLowerCase();
    if (!terme) return liste;
    return liste.filter((client) =>
      [client.nom, client.telephone, client.adresse, client.probleme]
        .join(" ")
        .toLowerCase()
        .includes(terme),
    );
  }, [afficherExemples, donnees?.clients, exemples, recherche]);

  if (chargement) {
    return (
      <div className="space-y-4 pt-4">
        <PageSkeleton lignes={4} />
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

  return (
    <div className="space-y-5 pb-4 pt-4">
      <WorkTabs />

      <header className="animate-fade-up px-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Mes clients
        </h1>
        <p className="mt-1 text-lg font-medium leading-snug text-slate-700">
          Tous vos clients et leur dernier rendez-vous.
        </p>
      </header>

      <label
        htmlFor="clients-search"
        className="flex min-h-16 items-center gap-3 rounded-2xl bg-white px-4 shadow-[0_8px_30px_rgb(0,0,0,0.05)] focus-within:ring-4 focus-within:ring-emerald-500/20"
      >
        <Search
          className="h-6 w-6 flex-shrink-0 text-slate-500"
          aria-hidden="true"
        />
        <span className="sr-only">Rechercher un client</span>
        <input
          id="clients-search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Nom, téléphone, adresse…"
          className="h-16 min-w-0 flex-1 bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-500"
        />
      </label>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
          {recherche ? "Résultats" : "Tous les clients"}
        </h2>
        <span className="rounded-full bg-white px-3 py-1.5 text-base font-extrabold text-slate-600 shadow-sm">
          {afficherExemples ? "Exemples" : clients.length}
        </span>
      </div>

      {afficherExemples && (
        <p className="px-1 text-base font-medium leading-snug text-slate-600">
          Voici deux exemples pour vous montrer à quoi ressemblera votre liste.
          Cliquez sur une fiche pour l&apos;essayer.
        </p>
      )}

      {clients.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={
            recherche
              ? `Aucun résultat pour "${recherche.trim()}"`
              : "Aucun client pour le moment"
          }
          description={
            recherche
              ? "Essayez un autre nom, un numéro ou une adresse."
              : "Vos clients apparaîtront ici dès que Nova aura qualifié une demande."
          }
          actionLabel={recherche ? "Effacer la recherche" : undefined}
          onAction={recherche ? () => setRecherche("") : undefined}
        />
      ) : (
        <div className="space-y-3">
          {clients.map((client, index) => {
            const style = STYLE_URGENCE[client.urgence];
            const enAttente = clientEnAttente(
              client.id,
              client.appointmentId,
            );

            return (
              <button
                key={client.id}
                type="button"
                onClick={() =>
                  router.push(`/clients/${encodeURIComponent(client.id)}`)
                }
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                className="flex min-h-24 w-full animate-fade-up items-center gap-3.5 rounded-[24px] bg-white p-4 text-left shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-[0.98]"
              >
                <span
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${styleAvatar(client.id)}`}
                >
                  {client.initiales || "C"}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-xl font-extrabold tracking-tight text-slate-900">
                      {client.nom}
                    </span>
                    {afficherExemples && (
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
                    {client.urgence !== "normal" && (
                      <span
                        className={`flex-shrink-0 rounded-full px-2.5 py-1 text-sm font-extrabold ${style.badge}`}
                      >
                        {client.urgence === "urgent" ? "Urgent" : "À vérifier"}
                      </span>
                    )}
                  </span>

                  <span className="mt-1 block truncate text-lg font-semibold text-slate-700">
                    {client.probleme}
                  </span>

                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-slate-600">
                    <span className="flex min-w-0 items-center gap-1">
                      <Phone
                        className="h-4 w-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {client.telephone || "Numéro manquant"}
                      </span>
                    </span>
                    {client.adresse && (
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin
                          className="h-4 w-4 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{client.adresse}</span>
                      </span>
                    )}
                  </span>
                </span>

                <ChevronRight
                  className="h-6 w-6 flex-shrink-0 text-slate-400"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setAjoutOuvert(true)}
        className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] text-lg font-extrabold text-white shadow-lg shadow-[#0A2540]/25 transition-transform duration-200 active:scale-95"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
        {afficherExemples ? "Créer mon premier vrai client" : "Ajouter un client"}
      </button>

      {ajoutOuvert && (
        <NouveauClientSheet
          onFermer={() => setAjoutOuvert(false)}
          onCree={clientCree}
        />
      )}
    </div>
  );
}
