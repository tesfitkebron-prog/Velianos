"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BatteryFull,
  Bot,
  Building2,
  Clock,
  Euro,
  FileText,
  Hash,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Pencil,
  Phone,
  Send,
  Signal,
  Sparkles,
  Upload,
  Wifi,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/components/ui/ToastProvider";
import {
  simulerReponseSms,
  type ContexteAssistant,
} from "@/lib/ai-prompt";
import {
  chargerEntreprise,
  enregistrerHoraires,
  enregistrerTarifs,
  enregistrerTon,
  enregistrerVocabulaire,
  enregistrerZones,
  MESSAGE_FICHIER_TROP_LOURD,
  TAILLE_MAX_FICHIER,
  televerserDocument,
  type EntrepriseDonnees,
} from "@/lib/field-data";
import {
  resetWorkspaceProfileCache,
  saveWorkspaceProfile,
} from "@/lib/workspace";
import { MESSAGE_ERREUR_MUTATION } from "@/lib/errors";

type Section = "identite" | "tarifs" | "ton" | "vocabulaire";

type MessageDemo = {
  role: "assistant" | "user";
  texte: string;
};

const TONS = ["Chaleureux", "Direct", "Professionnel"] as const;

export default function EntreprisePage() {
  return (
    <AppLayout>
      <EntrepriseContent />
    </AppLayout>
  );
}

function EntrepriseContent() {
  const { showToast } = useToast();
  const [donnees, setDonnees] = useState<EntrepriseDonnees | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [siret, setSiret] = useState("");
  const [description, setDescription] = useState("");
  const [horaires, setHoraires] = useState("");
  const [zones, setZones] = useState("");
  const [tarifs, setTarifs] = useState("");
  const [ton, setTon] = useState("");
  const [vocabulaire, setVocabulaire] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurSection, setErreurSection] = useState<string | null>(null);
  const [televersement, setTeleversement] = useState(false);
  const [chatOuvert, setChatOuvert] = useState(false);
  const [messagesDemo, setMessagesDemo] = useState<MessageDemo[]>([]);
  const [saisieDemo, setSaisieDemo] = useState("");
  const [reflexionDemo, setReflexionDemo] = useState(false);
  const fichierRef = useRef<HTMLInputElement | null>(null);
  const finChatRef = useRef<HTMLDivElement | null>(null);
  const minuteurDemo = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    const resultat = await chargerEntreprise();
    setDonnees(resultat);
    setErreur(resultat.erreur);
    setChargement(false);
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    if (!chatOuvert) return;
    finChatRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatOuvert, messagesDemo.length, reflexionDemo]);

  useEffect(
    () => () => {
      if (minuteurDemo.current) clearTimeout(minuteurDemo.current);
    },
    [],
  );

  const ouvrir = (cible: Section) => {
    if (!donnees) return;
    setErreurSection(null);
    setSection(cible);
    setNom(donnees.nom);
    setTelephone(donnees.telephone);
    setAdresse(donnees.adresse);
    setSiret(donnees.siret);
    setDescription(donnees.description);
    setHoraires(donnees.horaires);
    setZones(donnees.zones.join(", "));
    setTarifs(
      donnees.tarifs
        .map(
          (tarif) =>
            `${tarif.label} | ${tarif.min ?? ""} | ${tarif.max ?? ""}`,
        )
        .join("\n"),
    );
    setTon(donnees.ton);
    setVocabulaire(donnees.vocabulaire);
  };

  const enregistrer = async () => {
    if (!donnees?.companyId || !section) return;

    const sectionCourante = section;
    setEnregistrement(true);
    setErreurSection(null);

    let erreurEnregistrement: string | null = null;

    try {
      if (sectionCourante === "identite") {
        await saveWorkspaceProfile({
          companyName: nom.trim(),
          phone: telephone.trim(),
          address: adresse.trim(),
          siret: siret.trim(),
          description: description.trim(),
        });
        resetWorkspaceProfileCache();

        const [zonesResultat, horairesResultat] = await Promise.all([
          enregistrerZones(
            donnees.companyId,
            zones.split(",").map((ville) => ville.trim()),
          ),
          enregistrerHoraires(donnees.companyId, horaires),
        ]);

        erreurEnregistrement =
          zonesResultat.erreur ?? horairesResultat.erreur;
      } else if (sectionCourante === "tarifs") {
        const lignes = tarifs
          .split("\n")
          .map((ligne) => ligne.trim())
          .filter(Boolean)
          .map((ligne) => {
            const [label, min, max] = ligne
              .split("|")
              .map((partie) => partie.trim());
            return {
              label: label ?? "",
              min: min ? Number(min.replace(",", ".")) : null,
              max: max ? Number(max.replace(",", ".")) : null,
            };
          })
          .filter((tarif) => tarif.label.length > 0)
          .map((tarif) => ({
            ...tarif,
            min: Number.isFinite(tarif.min) ? tarif.min : null,
            max: Number.isFinite(tarif.max) ? tarif.max : null,
          }));

        const resultat = await enregistrerTarifs(donnees.companyId, lignes);
        erreurEnregistrement = resultat.erreur;
      } else if (sectionCourante === "ton") {
        const resultat = await enregistrerTon(donnees.companyId, ton);
        erreurEnregistrement = resultat.erreur;
      } else {
        const resultat = await enregistrerVocabulaire(
          donnees.companyId,
          vocabulaire,
        );
        erreurEnregistrement = resultat.erreur;
      }
    } catch {
      erreurEnregistrement = MESSAGE_ERREUR_MUTATION;
    } finally {
      setEnregistrement(false);
    }

    if (erreurEnregistrement) {
      setErreurSection(erreurEnregistrement);
      showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
      return;
    }

    setSection(null);
    await charger();

    const messages: Record<Section, string> = {
      identite: "✅ Informations enregistrées.",
      tarifs: "✅ Tarifs enregistrés.",
      ton: "✅ Ton de l'assistant enregistré.",
      vocabulaire: "✅ Vocabulaire de l'assistant enregistré.",
    };
    showToast(messages[sectionCourante], { variant: "success" });
  };

  const televerser = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fichier = event.target.files?.[0];
    event.target.value = "";
    if (!fichier || !donnees?.companyId) return;

    const estPdf =
      fichier.type === "application/pdf" ||
      fichier.name.toLowerCase().endsWith(".pdf");

    if (!estPdf) {
      showToast("Choisissez un fichier PDF.", { variant: "warning" });
      return;
    }

    if (fichier.size > TAILLE_MAX_FICHIER) {
      showToast(MESSAGE_FICHIER_TROP_LOURD, {
        variant: "warning",
      });
      return;
    }

    setTeleversement(true);

    try {
      const resultat = await televerserDocument(donnees.companyId, fichier);

      if (resultat.erreur) {
        showToast(resultat.erreur, { variant: "error" });
        return;
      }

      showToast("✅ Grille tarifaire ajoutée.", { variant: "success" });
      await charger();
    } catch {
      showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
    } finally {
      setTeleversement(false);
    }
  };

  const ouvrirChat = () => {
    setMessagesDemo([
      {
        role: "assistant",
        texte: `Bonjour, ici l'assistant de ${
          donnees?.nom || "votre entreprise"
        }. Comment puis-je vous aider ?`,
      },
    ]);
    setSaisieDemo("");
    setReflexionDemo(false);
    setChatOuvert(true);
  };

  const quitterTest = () => {
    if (minuteurDemo.current) clearTimeout(minuteurDemo.current);
    setChatOuvert(false);
    setMessagesDemo([]);
    setSaisieDemo("");
    setReflexionDemo(false);
  };

  const envoyerDemo = (texteForce?: string) => {
    const texte = (texteForce ?? saisieDemo).trim();
    if (!texte || reflexionDemo) return;

    setMessagesDemo((precedent) => [...precedent, { role: "user", texte }]);
    setSaisieDemo("");
    setReflexionDemo(true);

    if (minuteurDemo.current) clearTimeout(minuteurDemo.current);
    minuteurDemo.current = setTimeout(() => {
      const contexte = donnees ? contexteSimulation(donnees) : null;
      setMessagesDemo((precedent) => [
        ...precedent,
        {
          role: "assistant",
          texte: contexte
            ? simulerReponseSms(texte, contexte, precedent)
            : "Je n'ai pas cette information. L'artisan vous rappellera pour vous répondre.",
        },
      ]);
      setReflexionDemo(false);
    }, 650);
  };

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
        <PageError message={erreur} onRetry={() => void charger()} />
      </div>
    );
  }

  if (!donnees) {
    return (
      <div className="pt-5">
        <PageError
          message="Votre entreprise n'a pas pu être chargée."
          onRetry={() => void charger()}
        />
      </div>
    );
  }

  const suggestionsDemo = [
    "J'ai une fuite sous l'évier.",
    donnees.tarifs[0]
      ? `Combien coûte ${donnees.tarifs[0].label.toLowerCase()} ?`
      : "Combien coûte une intervention ?",
    donnees.zones[0]
      ? `Intervenez-vous à ${donnees.zones[0]} ?`
      : "Quelle est votre zone d'intervention ?",
    "Quels sont vos horaires ?",
  ];

  return (
    <div className="space-y-5 pt-5">
      <div className="animate-fade-up px-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {donnees.nom || "Mon entreprise"}
        </h1>
        <p className="mt-1 text-lg font-medium text-slate-600">
          Ce que votre assistant sait de vous.
        </p>
      </div>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            Identité
          </h2>
          <BoutonEditer onClick={() => ouvrir("identite")} />
        </div>

        <div className="mt-4 space-y-3">
          <Info
            icone={Phone}
            valeur={donnees.telephone || "Téléphone non renseigné"}
          />
          <Info
            icone={MapPin}
            valeur={donnees.adresse || "Adresse non renseignée"}
          />
          <Info
            icone={Hash}
            valeur={
              donnees.siret ? `SIRET ${donnees.siret}` : "SIRET non renseigné"
            }
          />
          <Info
            icone={Clock}
            valeur={donnees.horaires || "Horaires non renseignés"}
          />
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Zone d&apos;intervention
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {donnees.zones.length > 0 ? (
              donnees.zones.map((zone) => (
                <span
                  key={zone}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-base font-semibold text-slate-600"
                >
                  {zone}
                </span>
              ))
            ) : (
              <p className="text-base font-medium text-slate-500">
                Aucune zone renseignée.
              </p>
            )}
          </div>
        </div>

        {donnees.description && (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-base font-medium leading-relaxed text-slate-600">
            {donnees.description}
          </p>
        )}
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
              <Euro className="h-5 w-5" aria-hidden="true" />
            </span>
            Tarifs et Prestations
          </h2>
          <BoutonEditer onClick={() => ouvrir("tarifs")} />
        </div>

        {donnees.tarifs.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100">
            {donnees.tarifs.map((tarif) => (
              <div
                key={tarif.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0 flex-1 text-base font-medium text-slate-700">
                  {tarif.label}
                </span>
                <span className="flex-shrink-0 text-base font-extrabold text-slate-900">
                  {tarif.min === null && tarif.max === null
                    ? "Sur devis"
                    : `${tarif.min ?? "?"} € – ${tarif.max ?? "?"} €`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-base font-medium text-slate-500">
            Aucun tarif renseigné.
          </p>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Documents
            </h3>
            <span className="text-sm font-semibold text-slate-400">
              {donnees.documents.length}
            </span>
          </div>

          {donnees.documents.length > 0 ? (
            <div className="mt-2 divide-y divide-slate-100">
              {donnees.documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-base font-medium text-slate-700">
                    {document.titre}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-base font-medium text-slate-500">
              Aucun document importé.
            </p>
          )}

          <input
            ref={fichierRef}
            type="file"
            accept="application/pdf"
            aria-label="Ajouter une grille tarifaire PDF"
            className="hidden"
            onChange={(event) => void televerser(event)}
          />
          <button
            type="button"
            onClick={() => fichierRef.current?.click()}
            disabled={televersement}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-base font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-95 disabled:opacity-60"
          >
            {televersement ? (
              <Loader2
                className="h-5 w-5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Upload className="h-5 w-5" aria-hidden="true" />
            )}
            {televersement
              ? "Envoi du document…"
              : "Ajouter une grille tarifaire (PDF)"}
          </button>
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            Le ton de votre assistant
          </h2>
          <BoutonEditer onClick={() => ouvrir("ton")} />
        </div>
        <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-base font-medium leading-relaxed text-slate-600">
          {donnees.ton ||
            "Non défini. Choisissez comment votre assistant parle à vos clients."}
        </p>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </span>
            Vocabulaire de l&apos;assistant
          </h2>
          <BoutonEditer onClick={() => ouvrir("vocabulaire")} />
        </div>

        <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
          Voici comment votre assistant parle à vos clients. Vous pouvez
          modifier le ton et les formulations qu&apos;il utilise.
        </p>

        <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3">
          <p className="w-fit max-w-[92%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-base font-medium leading-snug text-slate-700 shadow-[0_4px_18px_rgb(0,0,0,0.04)]">
            Bonjour, ici l&apos;assistant de{" "}
            {donnees.nom || "votre entreprise"}. Comment puis-je vous aider ?
          </p>
          <p className="ml-auto w-fit max-w-[92%] rounded-2xl rounded-tr-md bg-[#0A2540] px-4 py-2.5 text-base font-medium leading-snug text-white">
            J&apos;ai une fuite sous mon évier.
          </p>
          <p className="w-fit max-w-[92%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-base font-medium leading-snug text-slate-700 shadow-[0_4px_18px_rgb(0,0,0,0.04)]">
            Je note une fuite sous l&apos;évier. Pouvez-vous me donner votre
            adresse et un créneau qui vous arrange ?
          </p>
        </div>

        <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-base font-medium leading-relaxed text-slate-600">
          {donnees.vocabulaire ||
            "Non défini. Ajoutez les mots et expressions que votre assistant doit utiliser."}
        </p>
      </section>

      <button
        type="button"
        onClick={ouvrirChat}
        className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95"
      >
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        Tester mon assistant
      </button>

      {section && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 backdrop-blur-[3px]"
          onClick={() => !enregistrement && setSection(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] bg-[#F5F5F7] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {section === "identite"
                  ? "Identité de l'entreprise"
                  : section === "tarifs"
                    ? "Tarifs et Prestations"
                    : section === "ton"
                      ? "Le ton de votre assistant"
                      : "Vocabulaire de l'assistant"}
              </h2>
              <button
                type="button"
                onClick={() => setSection(null)}
                disabled={enregistrement}
                aria-label="Fermer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_4px_16px_rgb(0,0,0,0.06)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {section === "identite" && (
                <>
                  <Champ
                    label="Nom de l'entreprise"
                    value={nom}
                    onChange={setNom}
                  />
                  <Champ
                    label="Téléphone"
                    value={telephone}
                    onChange={setTelephone}
                    inputMode="tel"
                  />
                  <Champ
                    label="Adresse"
                    value={adresse}
                    onChange={setAdresse}
                  />
                  <Champ
                    label="SIRET"
                    value={siret}
                    onChange={setSiret}
                    inputMode="numeric"
                    placeholder="123 456 789 00012"
                  />
                  <Champ
                    label="Zone d'intervention — villes séparées par des virgules"
                    value={zones}
                    onChange={setZones}
                    textarea
                    placeholder="Lyon, Villeurbanne, Caluire-et-Cuire"
                  />
                  <Champ
                    label="Horaires"
                    value={horaires}
                    onChange={setHoraires}
                    textarea
                    placeholder="Lundi au vendredi, de 8h à 18h"
                  />
                  <Champ
                    label="Description de votre activité"
                    value={description}
                    onChange={setDescription}
                    textarea
                  />
                </>
              )}

              {section === "tarifs" && (
                <Champ
                  label="Une ligne par tarif : prestation | prix mini | prix maxi"
                  value={tarifs}
                  onChange={setTarifs}
                  textarea
                  placeholder={
                    "Débouchage évier | 80 | 150\nRéparation fuite | 120 | 200"
                  }
                />
              )}

              {section === "ton" && (
                <>
                  <div>
                    <p className="mb-2 px-1 text-sm font-semibold text-slate-600">
                      Choisissez un ton
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TONS.map((valeur) => (
                        <button
                          key={valeur}
                          type="button"
                          onClick={() => setTon(valeur)}
                          className={`min-h-11 rounded-xl px-4 text-sm font-extrabold transition-transform duration-200 active:scale-95 ${
                            ton === valeur
                              ? "bg-[#0A2540] text-white"
                              : "bg-white text-slate-600 shadow-[0_4px_18px_rgb(0,0,0,0.04)]"
                          }`}
                        >
                          {valeur}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Champ
                    label="Ou décrivez librement le ton de votre assistant"
                    value={ton}
                    onChange={setTon}
                    textarea
                    placeholder="Ex : Chaleureux, rassurant et toujours très concis."
                  />
                </>
              )}

              {section === "vocabulaire" && (
                <>
                  <div className="rounded-2xl bg-white p-4 shadow-[0_4px_18px_rgb(0,0,0,0.04)]">
                    <p className="text-sm font-semibold text-slate-600">
                      Exemple de conversation
                    </p>
                    <p className="mt-2 text-base font-medium leading-relaxed text-slate-700">
                      « Bonjour, ici l&apos;assistant de{" "}
                      {nom || "votre entreprise"}. Comment puis-je vous aider ?
                      »
                    </p>
                    <p className="mt-1 text-base font-medium leading-relaxed text-slate-500">
                      « Je note une fuite sous l&apos;évier. Pouvez-vous me
                      donner votre adresse et un créneau ? »
                    </p>
                  </div>
                  <Champ
                    label="Mots et expressions utilisés par votre assistant"
                    value={vocabulaire}
                    onChange={setVocabulaire}
                    textarea
                    placeholder={
                      "Ex : Toujours dire « intervention » plutôt que « réparation ».\nAppeler le client par « Monsieur » ou « Madame ».\nToujours proposer un créneau avant de raccrocher."
                    }
                  />
                </>
              )}

              {erreurSection && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
                  {erreurSection}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => void enregistrer()}
              disabled={enregistrement}
              className="mt-5 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:opacity-60"
            >
              {enregistrement ? (
                <Loader2
                  className="h-6 w-6 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Pencil className="h-5 w-5" aria-hidden="true" />
              )}
              {enregistrement ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {chatOuvert && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/55 p-3 backdrop-blur-[3px]"
          onClick={quitterTest}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[380px]"
          >
            <div className="relative mx-auto flex h-[min(82dvh,720px)] w-full flex-col overflow-hidden rounded-[42px] border-[9px] border-slate-900 bg-[#F5F5F7] shadow-[0_24px_70px_rgb(0,0,0,0.45)]">
              <div
                className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900"
                aria-hidden="true"
              />

              <div className="flex flex-shrink-0 items-center justify-between px-6 pb-0.5 pt-3">
                <span className="text-[11px] font-bold text-slate-900">
                  9:41
                </span>
                <span
                  className="flex items-center gap-1 text-slate-900"
                  aria-hidden="true"
                >
                  <Signal className="h-3.5 w-3.5" />
                  <Wifi className="h-3.5 w-3.5" />
                  <BatteryFull className="h-4 w-4" />
                </span>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2 border-b border-orange-100 bg-orange-50 px-3 py-2">
                <p className="min-w-0 flex-1 text-[11px] font-semibold leading-snug text-orange-800">
                  🧪 Mode Test · réponses simulées
                </p>
                <button
                  type="button"
                  onClick={quitterTest}
                  className="min-h-9 flex-shrink-0 rounded-lg bg-orange-100 px-2.5 text-[11px] font-extrabold text-orange-800 transition-transform duration-200 active:scale-95"
                >
                  Quitter le test
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0A2540] text-white">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                      {donnees.nom || "Mon assistant"}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-400">
                      Client · réponses simulées
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={quitterTest}
                  aria-label="Fermer le test"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div
                className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3"
                aria-live="polite"
              >
                {messagesDemo.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <p
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm font-medium leading-snug ${
                        message.role === "user"
                          ? "bg-[#0A2540] text-white"
                          : "bg-white text-slate-700 shadow-[0_4px_18px_rgb(0,0,0,0.04)]"
                      }`}
                    >
                      {message.texte}
                    </p>
                  </div>
                ))}

                {reflexionDemo && (
                  <div className="flex justify-start">
                    <p className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)]">
                      L&apos;assistant écrit…
                    </p>
                  </div>
                )}
                <div ref={finChatRef} />
              </div>

              <div className="border-t border-slate-100 bg-white p-2.5">
                {messagesDemo.length <= 1 && (
                  <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
                    {suggestionsDemo.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => envoyerDemo(suggestion)}
                        disabled={reflexionDemo}
                        className="min-h-8 flex-shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-600 transition-transform duration-200 active:scale-95 disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label htmlFor="demo-message-input" className="sr-only">
                    Écrire comme un client
                  </label>
                  <input
                    id="demo-message-input"
                    value={saisieDemo}
                    onChange={(event) => setSaisieDemo(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        envoyerDemo();
                      }
                    }}
                    placeholder="Écrivez comme un client…"
                    className="h-10 min-w-0 flex-1 rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => envoyerDemo()}
                    disabled={!saisieDemo.trim() || reflexionDemo}
                    aria-label="Envoyer"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function contexteSimulation(donnees: EntrepriseDonnees): ContexteAssistant {
  return {
    nom: donnees.nom,
    telephone: donnees.telephone,
    adresse: donnees.adresse,
    description: donnees.description,
    horaires: donnees.horaires,
    zones: donnees.zones,
    tarifs: donnees.tarifs,
    documents: donnees.documents.map((document) => document.titre),
    ton: donnees.ton,
    vocabulaire: donnees.vocabulaire,
  };
}

function BoutonEditer({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 flex-shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-95"
    >
      <Pencil className="h-4 w-4" aria-hidden="true" />
      Modifier
    </button>
  );
}

function Info({
  icone: Icone,
  valeur,
}: {
  icone: typeof Phone;
  valeur: string;
}) {
  return (
    <p className="flex items-start gap-2.5 text-base font-medium text-slate-600">
      <Icone
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">{valeur}</span>
    </p>
  );
}

function Champ({
  label,
  value,
  onChange,
  textarea = false,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (valeur: string) => void;
  textarea?: boolean;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-2 block px-1 text-sm font-semibold text-slate-600">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none rounded-2xl bg-white px-4 py-3.5 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-14 w-full rounded-2xl bg-white px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15"
        />
      )}
    </label>
  );
}
