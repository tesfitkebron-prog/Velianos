"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { chargerDonneesTerrain, type DonneesTerrain } from "@/lib/field-data";
import {
  STYLE_URGENCE,
  styleAvatar,
} from "@/lib/clients";

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

  const clients = useMemo(() => {
    const liste = donnees?.clients ?? [];
    const terme = recherche.trim().toLowerCase();
    if (!terme) return liste;
    return liste.filter((client) =>
      [client.nom, client.telephone, client.adresse, client.probleme]
        .join(" ")
        .toLowerCase()
        .includes(terme),
    );
  }, [donnees?.clients, recherche]);

  if (chargement) {
    return (
      <div className="pt-5">
        <PageSkeleton lignes={4} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="pt-5">
        <PageError message={erreur} onRetry={() => void charger()} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-5">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Mes clients
        </h1>
        <p className="mt-1 text-lg font-medium text-slate-600">
          Tous vos clients et leur dernier rendez-vous.
        </p>
      </div>

      <label className="flex h-14 items-center gap-3 rounded-2xl bg-white px-4 shadow-[0_8px_30px_rgb(0,0,0,0.05)] focus-within:ring-4 focus-within:ring-emerald-500/15">
        <Search className="h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Rechercher un client</span>
        <input
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Nom, téléphone, adresse…"
          className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
          {recherche ? "Résultats" : "Tous les clients"}
        </h2>
        <span className="rounded-full bg-white px-3 py-1 text-base font-semibold text-slate-500 shadow-sm">
          {clients.length}
        </span>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            recherche ? "Aucun client trouvé" : "Votre assistant est prêt"
          }
          description={
            recherche
              ? "Essayez un autre nom, un numéro ou une adresse."
              : "Il n'a pas encore reçu d'appel. Suivez le guide pour l'activer."
          }
          actionLabel={recherche ? "Effacer la recherche" : "Ouvrir mon assistant"}
          onAction={
            recherche
              ? () => setRecherche("")
              : () => router.push("/assistant")
          }
        />
      ) : (
        <div className="space-y-3">
          {clients.map((client, index) => {
            const style = STYLE_URGENCE[client.urgence];
            return (
              <button
                key={client.id}
                type="button"
                onClick={() =>
                  router.push(`/clients/${encodeURIComponent(client.id)}`)
                }
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                className="flex w-full animate-fade-up items-center gap-3.5 rounded-[24px] bg-white p-4 text-left shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-[0.98]"
              >
                <span
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-base font-extrabold ${styleAvatar(client.id)}`}
                >
                  {client.initiales || "C"}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                      {client.nom}
                    </span>
                    {client.urgence !== "normal" && (
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-sm font-semibold ${style.badge}`}
                      >
                        {client.urgence === "urgent" ? "Urgent" : "À vérifier"}
                      </span>
                    )}
                  </span>

                  <span className="mt-0.5 block truncate text-base font-medium text-slate-600">
                    {client.probleme}
                  </span>

                  <span className="mt-1 flex items-center gap-3 text-sm font-medium text-slate-400">
                    <span className="flex min-w-0 items-center gap-1">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {client.telephone || "Numéro manquant"}
                      </span>
                    </span>
                    {client.adresse && (
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{client.adresse}</span>
                      </span>
                    )}
                  </span>
                </span>

                <ChevronRight
                  className="h-5 w-5 flex-shrink-0 text-slate-300"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
