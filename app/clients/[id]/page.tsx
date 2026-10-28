"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Check,
  Clock,
  Eye,
  FileDown,
  Loader2,
  Map,
  MapPin,
  Phone,
  Sparkles,
  StickyNote,
  TriangleAlert,
  Users,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/components/ui/ToastProvider";
import {
  chargerDonneesTerrain,
  enregistrerNoteClient,
} from "@/lib/field-data";
import {
  STYLE_URGENCE,
  lienGoogleMaps,
  lienTelephone,
  vibrer,
  type ClientFiche,
} from "@/lib/clients";
import { ajouterAction, retirerAction } from "@/lib/offline-queue";

export default function ClientDetailPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const clientId =
    typeof params.id === "string" ? params.id : params.id?.[0] ?? "";

  const [client, setClient] = useState<ClientFiche | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState<string | null>(null);
  const [reflexion, setReflexion] = useState(false);
  const [note, setNote] = useState("");
  const [enregistrementNote, setEnregistrementNote] = useState(false);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    const terrain = await chargerDonneesTerrain();
    const trouve =
      [...terrain.prospects, ...terrain.clients].find(
        (item) => item.id === clientId,
      ) ?? null;

    setClient(trouve);
    setNote(trouve?.notes ?? "");
    setErreur(terrain.erreur && !trouve ? terrain.erreur : null);
    setChargement(false);
  }, [clientId]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(
    () => () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    },
    [],
  );

  const retour = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/clients");
  };

  const demanderAssistant = (valeur: string) => {
    const propre = valeur.trim();
    if (!propre || !client || reflexion) return;

    vibrer(30);
    setQuestion("");
    setReflexion(true);

    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => {
      setReponse(reponseAssistant(client, propre));
      setReflexion(false);
    }, 500);
  };

  const envoyer = (event: FormEvent) => {
    event.preventDefault();
    demanderAssistant(question);
  };

  const exporter = () => {
    vibrer(30);
    showToast("📄 Génération du PDF en cours...", { variant: "info" });
    window.setTimeout(() => window.print(), 250);
  };

  const sauvegarderNote = async () => {
    if (!client) return;

    const propre = note.trim();
    if (!propre) {
      showToast("Ajoutez une note avant d'enregistrer.", {
        variant: "warning",
      });
      return;
    }

    vibrer(30);

    if (!navigator.onLine) {
      const ancienneNote = client.notes ?? "";
      const action = ajouterAction({
        type: "client-note",
        clientId: client.id,
        note: propre,
      });

      setClient((precedent) =>
        precedent ? { ...precedent, notes: propre } : precedent,
      );
      showToast(
        "📡 Action en attente. Elle sera synchronisée dès le retour du réseau.",
        {
          variant: "warning",
          actionLabel: "Annuler",
          onAction: () => {
            retirerAction(action.id);
            setClient((precedent) =>
              precedent ? { ...precedent, notes: ancienneNote } : precedent,
            );
            setNote(ancienneNote);
          },
        },
      );
      return;
    }

    setEnregistrementNote(true);
    const resultat = await enregistrerNoteClient(client.id, propre);
    setEnregistrementNote(false);

    if (resultat.erreur) {
      showToast(resultat.erreur, { variant: "error" });
      return;
    }

    setClient((precedent) =>
      precedent ? { ...precedent, notes: propre } : precedent,
    );
    showToast("✅ Note enregistrée.", { variant: "success" });
  };

  const badge = client
    ? client.urgence === "urgent"
      ? {
          label: "Urgent",
          className: STYLE_URGENCE.urgent.badge,
          Icon: TriangleAlert,
        }
      : client.urgence === "a_verifier"
        ? {
            label: "À vérifier",
            className: STYLE_URGENCE.a_verifier.badge,
            Icon: Eye,
          }
        : client.badge
          ? {
              label: client.badge,
              className: STYLE_URGENCE.normal.badge,
              Icon: Check,
            }
          : null
    : null;

  const tel = client ? lienTelephone(client.telephone) : null;
  const maps = client ? lienGoogleMaps(client.adresse) : null;
  const tags = client ? tagsClient(client) : [];

  return (
    <div className="fiche-client-shell flex h-[100dvh] flex-col bg-[#F5F5F7]">
      <header className="print-hidden sticky top-0 z-50 w-full bg-[#F5F5F7]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-2">
          <button
            type="button"
            onClick={retour}
            aria-label="Retour"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-slate-700 transition-transform duration-200 active:scale-95 active:bg-slate-100"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2.25} />
          </button>
          <h1 className="min-w-0 flex-1 truncate px-2 text-center text-lg font-extrabold tracking-tight text-slate-900">
            {client?.nom ?? "Fiche client"}
          </h1>
          <span className="h-12 w-12 flex-shrink-0" aria-hidden="true" />
        </div>
      </header>

      <main className="fiche-client-main w-full flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-4 md:px-6">
          {chargement ? (
            <PageSkeleton lignes={4} />
          ) : erreur ? (
            <PageError message={erreur} onRetry={() => void charger()} />
          ) : !client ? (
            <EmptyState
              icon={Users}
              title="Client introuvable"
              description="Cette fiche n'existe plus ou n'est pas disponible dans votre espace."
              actionLabel="Retour aux clients"
              onAction={() => router.push("/clients")}
            />
          ) : (
            <div className="fiche-client-content space-y-4">
              <div className="print-only">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Fiche client
                </p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                  {client.nom}
                </p>
              </div>

              <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-extrabold text-slate-700">
                    {client.initiales || "C"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
                        {client.nom}
                      </h2>
                      {badge && (
                        <span
                          className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${badge.className}`}
                        >
                          <badge.Icon
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-400">
                      <Clock
                        className="h-3.5 w-3.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      Dernier contact {client.moment}
                      {client.heure ? ` · ${client.heure}` : ""}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <TriangleAlert
                      className="h-4.5 w-4.5"
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Ce qu&apos;il a demandé
                  </h3>
                </div>
                <p className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-slate-900">
                  {client.probleme}
                </p>
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {client.resume && (
                  <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                    {client.resume}
                  </p>
                )}
              </section>

              <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Contact
                </h3>

                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Phone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-400">
                        Téléphone
                      </span>
                      <span className="block truncate text-lg font-extrabold text-[#0A2540]">
                        {client.telephone || client.telephoneAffiche}
                      </span>
                    </span>
                    {tel ? (
                      <a
                        href={tel}
                        onClick={() => vibrer(50)}
                        className="flex-shrink-0 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-transform duration-200 active:scale-95"
                      >
                        Appeler
                      </a>
                    ) : (
                      <span className="flex-shrink-0 rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-400">
                        Indisponible
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-400">
                        Adresse
                      </span>
                      <span className="block text-base font-semibold leading-snug text-slate-900">
                        {client.adresse || "Adresse non renseignée"}
                      </span>
                    </span>
                    {maps ? (
                      <a
                        href={maps}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-slate-200 px-3 py-2 text-sm font-extrabold text-slate-700 transition-transform duration-200 active:scale-95"
                      >
                        <Map className="h-4 w-4" aria-hidden="true" />
                        Maps
                      </a>
                    ) : (
                      <span className="flex-shrink-0 rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-400">
                        Indisponible
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  Ce que l&apos;assistant a déjà dit au client
                </h3>

                <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                  {client.resume ||
                    "L'assistant n'a pas encore laissé de résumé pour ce client."}
                </p>

                {client.echanges.length > 0 ? (
                  <div className="mt-3 space-y-2.5">
                    {client.echanges.map((echange, index) => (
                      <p
                        key={`${client.id}-echange-${index}`}
                        className="w-fit max-w-[92%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-base font-medium leading-snug text-slate-700"
                      >
                        {echange}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-base font-medium leading-relaxed text-slate-500">
                    L&apos;assistant n&apos;a pas encore échangé avec ce client.
                  </p>
                )}

                <div className="mt-4 border-t border-slate-100 pt-4 print-hidden">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="h-4 w-4 text-[#0A2540]"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Demander à l&apos;assistant
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      demanderAssistant(
                        "Résume-moi la conversation avec ce client",
                      )
                    }
                    disabled={reflexion}
                    className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                    Générer un résumé
                  </button>

                  {reflexion && (
                    <div className="mt-3 flex items-center gap-2 rounded-[20px] rounded-tl-md bg-slate-50 px-4 py-3">
                      <Loader2
                        className="h-4 w-4 animate-spin text-slate-400"
                        aria-hidden="true"
                      />
                      <span className="text-base font-medium text-slate-500">
                        L&apos;assistant réfléchit…
                      </span>
                    </div>
                  )}

                  {reponse && !reflexion && (
                    <div className="mt-3 rounded-[20px] rounded-tl-md bg-slate-50 px-4 py-3">
                      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                        Assistant
                      </p>
                      <p className="mt-1 text-base font-medium leading-relaxed text-slate-700">
                        {reponse}
                      </p>
                    </div>
                  )}

                  <form onSubmit={envoyer} className="mt-3 flex items-end gap-2">
                    <label htmlFor="client-question" className="sr-only">
                      Posez votre question à l&apos;assistant
                    </label>
                    <input
                      id="client-question"
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder="Posez votre question…"
                      className="h-14 min-w-0 flex-1 rounded-2xl bg-slate-100 px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:bg-slate-50 focus:ring-4 focus:ring-emerald-500/15"
                    />
                    <button
                      type="submit"
                      disabled={reflexion || question.trim().length === 0}
                      aria-label="Envoyer la question"
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:opacity-40"
                    >
                      <ArrowUp className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </section>

              <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  <StickyNote className="h-4 w-4" aria-hidden="true" />
                  Vos notes
                </h3>
                <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                  Ajoutez vos propres informations sur ce client. Elles restent
                  visibles dans sa fiche.
                </p>

                <label htmlFor="client-note" className="sr-only">
                  Vos notes sur ce client
                </label>
                <textarea
                  id="client-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  placeholder="Ex : Le client préfère être rappelé après 18h."
                  className="mt-3 w-full resize-none rounded-2xl bg-slate-100 px-4 py-3 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:bg-slate-50 focus:ring-4 focus:ring-emerald-500/15"
                />
                <button
                  type="button"
                  onClick={() => void sauvegarderNote()}
                  disabled={enregistrementNote || note.trim().length === 0}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] text-base font-extrabold text-white transition-transform duration-200 active:scale-95 disabled:opacity-40"
                >
                  {enregistrementNote ? (
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  )}
                  {enregistrementNote ? "Enregistrement…" : "Enregistrer la note"}
                </button>
              </section>
            </div>
          )}
        </div>
      </main>

      {client && (
        <div className="print-hidden w-full flex-shrink-0 border-t border-slate-200/50 bg-[#F5F5F7]/95 px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <div className="mx-auto w-full max-w-2xl">
            <div className="grid grid-cols-2 gap-2.5">
              {tel ? (
                <a
                  href={tel}
                  onClick={() => vibrer(50)}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Appeler
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 text-base font-extrabold text-slate-400"
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
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 text-base font-extrabold text-slate-700 transition-transform duration-200 active:scale-95"
                >
                  <Map className="h-5 w-5" aria-hidden="true" />
                  Google Maps
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 text-base font-extrabold text-slate-400"
                >
                  <Map className="h-5 w-5" aria-hidden="true" />
                  Adresse absente
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={exporter}
              className="mx-auto mt-1.5 flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-400 transition-colors active:text-slate-600"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Exporter en PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function tagsClient(client: ClientFiche): string[] {
  const texte = `${client.probleme} ${client.resume}`.toLowerCase();
  const tags: string[] = [];

  if (client.urgence === "urgent") tags.push("Urgent");
  if (client.urgence === "a_verifier") tags.push("À vérifier");
  if (/fuite|tuyau|évier|evier|plomb/.test(texte)) tags.push("Plomberie");
  if (/fuite/.test(texte)) tags.push("Fuite");
  if (/chauffage|chauffe|radiateur|chaudière|chaudiere/.test(texte)) {
    tags.push("Chauffage");
  }
  if (/électri|electri|prise|tableau/.test(texte)) tags.push("Électricité");
  if (/serrure|porte|clé|cle/.test(texte)) tags.push("Serrurerie");
  if (/devis|prix|tarif/.test(texte)) tags.push("Devis");

  return Array.from(new Set(tags)).slice(0, 4);
}

function reponseAssistant(client: ClientFiche, question: string): string {
  const texte = question.toLowerCase();

  if (
    texte.includes("résum") ||
    texte.includes("resum") ||
    texte.includes("conversation")
  ) {
    const notes =
      client.echanges.length > 0
        ? `L'assistant a laissé ${client.echanges.length} note${client.echanges.length > 1 ? "s" : ""} sur cet échange.`
        : "Aucune note de l'assistant n'est encore enregistrée.";
    return `${client.nom} a contacté votre entreprise pour « ${client.probleme} ». ${client.resume} ${notes}`;
  }

  if (texte.includes("adresse") || texte.includes("où")) {
    return `L'adresse de ${client.nom} est : ${client.adresse || "non renseignée"}.`;
  }

  if (
    texte.includes("téléphone") ||
    texte.includes("telephone") ||
    texte.includes("numéro") ||
    texte.includes("numero")
  ) {
    return `Vous pouvez joindre ${client.nom} au ${client.telephone || "numéro non renseigné"}.`;
  }

  if (texte.includes("urgent") || texte.includes("priorit")) {
    return client.urgence === "urgent"
      ? `${client.nom} est marqué comme urgent. Il vaut mieux le rappeler en priorité.`
      : `${client.nom} n'est pas marqué comme urgent. Son dossier peut être traité normalement.`;
  }

  return `Voici l'essentiel du dossier de ${client.nom} : ${client.probleme}. ${client.resume} Vous pouvez le joindre au ${client.telephone || "numéro non renseigné"}.`;
}
