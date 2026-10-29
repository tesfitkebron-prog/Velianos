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
      <div className="p-4">
        <PageSkeleton lignes={4} />
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

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {afficherExemples
            ? "Exemples de démonstration"
            : `${clients.length} client${clients.length > 1 ? "s" : ""}`}
        </p>
        <button
          type="button"
          onClick={() => setAjoutOuvert(true)}
          className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full bg-[#0A2540] px-3 text-sm font-medium text-white transition-opacity active:opacity-80"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter
        </button>
      </div>

      <label
        htmlFor="clients-search"
        className="flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-3"
      >
        <Search className="h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
        <span className="sr-only">Rechercher un client</span>
        <input
          id="clients-search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Nom, téléphone, adresse…"
          className="h-11 min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
        />
      </label>

      {afficherExemples && (
        <p className="px-1 text-sm leading-snug text-slate-500">
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
              : "Vos clients apparaîtront ici dès que votre assistant aura qualifié une demande."
          }
          actionLabel={recherche ? "Effacer la recherche" : undefined}
          onAction={recherche ? () => setRecherche("") : undefined}
        />
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {clients.map((client) => {
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
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-slate-50"
              >
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${styleAvatar(client.id)}`}
                >
                  {client.initiales || "C"}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-base font-semibold text-slate-900">
                      {client.nom}
                    </span>
                    {enAttente && (
                      <Clock
                        className="h-3.5 w-3.5 flex-shrink-0 text-orange-600"
                        aria-label="En attente de synchronisation"
                      />
                    )}
                    {client.urgence !== "normal" && (
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}
                      >
                        {client.urgence === "urgent" ? "Urgent" : "À vérifier"}
                      </span>
                    )}
                    {afficherExemples && (
                      <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        Exemple
                      </span>
                    )}
                  </span>

                  <span className="mt-0.5 block truncate text-sm text-slate-500">
                    {client.probleme}
                  </span>

                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                    <span className="flex min-w-0 items-center gap-1">
                      <Phone className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {client.telephone || "Numéro manquant"}
                      </span>
                    </span>
                    {client.adresse && (
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin
                          className="h-3 w-3 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{client.adresse}</span>
                      </span>
                    )}
                  </span>
                </span>

                <ChevronRight
                  className="h-4 w-4 flex-shrink-0 text-slate-300"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      )}

      {ajoutOuvert && (
        <NouveauClientSheet
          onFermer={() => setAjoutOuvert(false)}
          onCree={clientCree}
        />
      )}
    </div>
  );
}
