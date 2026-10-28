"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/components/ui/ToastProvider";
import {
  chargerDonneesTerrain,
  creerClient,
  type DonneesTerrain,
} from "@/lib/field-data";
import {
  estTelephoneValide,
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
  const { showToast } = useToast();
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [notes, setNotes] = useState("");
  const [nomTouche, setNomTouche] = useState(false);
  const [telephoneTouche, setTelephoneTouche] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurAjout, setErreurAjout] = useState<string | null>(null);

  const nomValide = nom.trim().length > 0;
  const telephoneValide = estTelephoneValide(telephone);
  const formulaireValide = nomValide && telephoneValide;

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

  const reinitialiserAjout = () => {
    setNom("");
    setTelephone("");
    setAdresse("");
    setNotes("");
    setNomTouche(false);
    setTelephoneTouche(false);
    setErreurAjout(null);
  };

  const ouvrirAjout = () => {
    reinitialiserAjout();
    setAjoutOuvert(true);
  };

  const fermerAjout = () => {
    if (enregistrement) return;
    setAjoutOuvert(false);
    reinitialiserAjout();
  };

  const ajouterClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNomTouche(true);
    setTelephoneTouche(true);

    if (!formulaireValide || enregistrement) return;

    setEnregistrement(true);
    setErreurAjout(null);

    const resultat = await creerClient({
      nom,
      telephone,
      adresse,
      notes,
    });

    setEnregistrement(false);

    if (resultat.erreur) {
      setErreurAjout(resultat.erreur);
      return;
    }

    setAjoutOuvert(false);
    reinitialiserAjout();
    setRecherche("");
    showToast("✅ Client ajouté.", { variant: "success" });
    await charger();
  };

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
        <PageError
          message={erreur}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-5">
      <div className="flex animate-fade-up items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Mes clients
          </h1>
          <p className="mt-1 text-lg font-medium text-slate-600">
            Tous vos clients et leur dernier rendez-vous.
          </p>
        </div>
        <button
          type="button"
          onClick={ouvrirAjout}
          aria-label="Ajouter un client"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540] text-white shadow-lg shadow-[#0A2540]/25 transition-transform duration-200 active:scale-95"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
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

      {ajoutOuvert && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 backdrop-blur-[3px]"
          onClick={fermerAjout}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] bg-[#F5F5F7] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Ajouter un client
                </h2>
                <p className="mt-1 text-base font-medium text-slate-600">
                  Créez une fiche pour un client rencontré sur le terrain.
                </p>
              </div>
              <button
                type="button"
                onClick={fermerAjout}
                disabled={enregistrement}
                aria-label="Fermer"
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_4px_16px_rgb(0,0,0,0.06)] disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={ajouterClient} noValidate className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block px-1 text-sm font-semibold text-slate-600">
                  Nom du client *
                </span>
                <input
                  value={nom}
                  onChange={(event) => setNom(event.target.value)}
                  onBlur={() => setNomTouche(true)}
                  placeholder="Ex : Mme Martin"
                  autoComplete="name"
                  aria-invalid={nomTouche && !nomValide}
                  className={`h-14 w-full rounded-2xl bg-white px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15 ${
                    nomTouche && !nomValide ? "ring-2 ring-red-300" : ""
                  }`}
                />
                {nomTouche && !nomValide && (
                  <p className="mt-1 px-1 text-red-500 text-sm">
                    Le nom est obligatoire
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block px-1 text-sm font-semibold text-slate-600">
                  Téléphone *
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={telephone}
                  onChange={(event) => setTelephone(event.target.value)}
                  onBlur={() => setTelephoneTouche(true)}
                  placeholder="06 11 22 33 44"
                  autoComplete="tel"
                  aria-invalid={telephoneTouche && !telephoneValide}
                  className={`h-14 w-full rounded-2xl bg-white px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15 ${
                    telephoneTouche && !telephoneValide
                      ? "ring-2 ring-red-300"
                      : ""
                  }`}
                />
                {telephoneTouche && !telephoneValide && (
                  <p className="mt-1 px-1 text-red-500 text-sm">
                    Numéro de téléphone invalide
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block px-1 text-sm font-semibold text-slate-600">
                  Adresse
                </span>
                <input
                  value={adresse}
                  onChange={(event) => setAdresse(event.target.value)}
                  placeholder="Ex : 12 rue des Fleurs, Lyon"
                  autoComplete="street-address"
                  className="h-14 w-full rounded-2xl bg-white px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block px-1 text-sm font-semibold text-slate-600">
                  Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Ex : Appeler après 18h."
                  className="w-full resize-none rounded-2xl bg-white px-4 py-3.5 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15"
                />
              </label>

              {erreurAjout && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
                  {erreurAjout}
                </p>
              )}

              <button
                type="submit"
                disabled={!formulaireValide || enregistrement}
                className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:opacity-50"
              >
                {enregistrement ? (
                  <Loader2
                    className="h-6 w-6 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Check className="h-5 w-5" aria-hidden="true" />
                )}
                {enregistrement ? "Enregistrement…" : "Enregistrer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
