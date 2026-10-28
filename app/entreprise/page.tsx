"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Clock,
  Euro,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import {
  chargerEntreprise,
  enregistrerHoraires,
  enregistrerTarifs,
  enregistrerZones,
  type EntrepriseDonnees,
} from "@/lib/field-data";
import {
  resetWorkspaceProfileCache,
  saveWorkspaceProfile,
} from "@/lib/workspace";

type Section = "identite" | "horaires" | "zones" | "tarifs";

export default function EntreprisePage() {
  return (
    <AppLayout>
      <EntrepriseContent />
    </AppLayout>
  );
}

function EntrepriseContent() {
  const [donnees, setDonnees] = useState<EntrepriseDonnees | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [description, setDescription] = useState("");
  const [horaires, setHoraires] = useState("");
  const [zones, setZones] = useState("");
  const [tarifs, setTarifs] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurSection, setErreurSection] = useState<string | null>(null);

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

  const ouvrir = (cible: Section) => {
    if (!donnees) return;
    setErreurSection(null);
    setSection(cible);
    setNom(donnees.nom);
    setTelephone(donnees.telephone);
    setAdresse(donnees.adresse);
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
  };

  const enregistrer = async () => {
    if (!donnees?.companyId || !section) return;
    setEnregistrement(true);
    setErreurSection(null);

    let resultat: { erreur: string | null } = { erreur: null };

    if (section === "identite") {
      try {
        await saveWorkspaceProfile({
          companyName: nom.trim(),
          phone: telephone.trim(),
          address: adresse.trim(),
          description: description.trim(),
        });
        resetWorkspaceProfileCache();
      } catch {
        resultat = {
          erreur: "Impossible d'enregistrer ces informations pour le moment.",
        };
      }
    } else if (section === "horaires") {
      resultat = await enregistrerHoraires(donnees.companyId, horaires);
    } else if (section === "zones") {
      resultat = await enregistrerZones(
        donnees.companyId,
        zones.split(",").map((ville) => ville.trim()),
      );
    } else {
      const lignes = tarifs
        .split("\n")
        .map((ligne) => ligne.trim())
        .filter(Boolean)
        .map((ligne) => {
          const [label, min, max] = ligne.split("|").map((partie) => partie.trim());
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
      resultat = await enregistrerTarifs(donnees.companyId, lignes);
    }

    setEnregistrement(false);

    if (resultat.erreur) {
      setErreurSection(resultat.erreur);
      return;
    }

    setSection(null);
    await charger();
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
            Mon entreprise
          </h2>
          <BoutonEditer onClick={() => ouvrir("identite")} />
        </div>

        <div className="mt-4 space-y-3">
          <Info icone={Phone} valeur={donnees.telephone || "Non renseigné"} />
          <Info icone={MapPin} valeur={donnees.adresse || "Non renseignée"} />
          {donnees.description && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-base font-medium leading-relaxed text-slate-600">
              {donnees.description}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </span>
            Horaires
          </h2>
          <BoutonEditer onClick={() => ouvrir("horaires")} />
        </div>
        <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
          {donnees.horaires || "Aucun horaire renseigné."}
        </p>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            Zones d&apos;intervention
          </h2>
          <BoutonEditer onClick={() => ouvrir("zones")} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
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
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
              <Euro className="h-5 w-5" aria-hidden="true" />
            </span>
            Tarifs
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
      </section>

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
                  ? "Mon entreprise"
                  : section === "horaires"
                    ? "Mes horaires"
                    : section === "zones"
                      ? "Mes zones"
                      : "Mes tarifs"}
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
                  <Champ label="Nom de l'entreprise" value={nom} onChange={setNom} />
                  <Champ
                    label="Téléphone"
                    value={telephone}
                    onChange={setTelephone}
                    inputMode="tel"
                  />
                  <Champ label="Adresse" value={adresse} onChange={setAdresse} />
                  <Champ
                    label="Description de votre activité"
                    value={description}
                    onChange={setDescription}
                    textarea
                  />
                </>
              )}

              {section === "horaires" && (
                <Champ
                  label="Horaires"
                  value={horaires}
                  onChange={setHoraires}
                  textarea
                  placeholder="Lundi au vendredi, de 8h à 18h"
                />
              )}

              {section === "zones" && (
                <Champ
                  label="Villes séparées par des virgules"
                  value={zones}
                  onChange={setZones}
                  textarea
                  placeholder="Lyon, Villeurbanne, Caluire-et-Cuire"
                />
              )}

              {section === "tarifs" && (
                <Champ
                  label="Une ligne par tarif : prestation | prix mini | prix maxi"
                  value={tarifs}
                  onChange={setTarifs}
                  textarea
                  placeholder={"Débouchage évier | 80 | 150\nRéparation fuite | 120 | 200"}
                />
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
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              ) : (
                <Pencil className="h-5 w-5" aria-hidden="true" />
              )}
              {enregistrement ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
      <Icone className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
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
