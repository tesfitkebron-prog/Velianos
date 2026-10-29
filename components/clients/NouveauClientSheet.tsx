"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, X } from "lucide-react";
import { MicButton } from "@/components/ui/MicButton";
import { useToast } from "@/components/ui/ToastProvider";
import { creerClient } from "@/lib/field-data";
import { estTelephoneValide } from "@/lib/clients";
import { MESSAGE_ERREUR_MUTATION } from "@/lib/errors";

type NouveauClientSheetProps = {
  onFermer: () => void;
  onCree: () => void | Promise<void>;
};

/**
 * Formulaire d'ajout manuel d'un client, partagé entre Clients et Appels.
 * Le parent monte le composant uniquement lorsque le panneau est ouvert :
 * les champs repartent donc toujours vides.
 */
export function NouveauClientSheet({
  onFermer,
  onCree,
}: NouveauClientSheetProps) {
  const { showToast } = useToast();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [probleme, setProbleme] = useState("");
  const [nomTouche, setNomTouche] = useState(false);
  const [telephoneTouche, setTelephoneTouche] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const nomValide = nom.trim().length > 0;
  const telephoneValide = estTelephoneValide(telephone);
  const formulaireValide = nomValide && telephoneValide;

  const fermer = () => {
    if (enregistrement) return;
    onFermer();
  };

  const ajouterClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNomTouche(true);
    setTelephoneTouche(true);

    if (!formulaireValide || enregistrement) return;

    setEnregistrement(true);
    setErreur(null);

    try {
      const resultat = await creerClient({
        nom,
        telephone,
        adresse,
        notes: probleme,
      });

      if (resultat.erreur) {
        setErreur(resultat.erreur);
        showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
        return;
      }

      showToast("✅ Client ajouté.", { variant: "success" });
      await onCree();
    } catch {
      setErreur(MESSAGE_ERREUR_MUTATION);
      showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 backdrop-blur-[3px]"
      onClick={fermer}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-nouveau-client"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-[#F4F6FC] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="titre-nouveau-client"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              Ajouter un client
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Créez une fiche pour un client rencontré sur le terrain.
            </p>
          </div>
          <button
            type="button"
            onClick={fermer}
            disabled={enregistrement}
            aria-label="Fermer le formulaire"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-slate-500 transition-colors active:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={ajouterClient} noValidate className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="client-nom"
              className="mb-1.5 block text-xs font-medium text-slate-500"
            >
              Nom du client *
            </label>
            <input
              id="client-nom"
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              onBlur={() => setNomTouche(true)}
              placeholder="Ex : Mme Martin"
              autoComplete="name"
              aria-invalid={nomTouche && !nomValide}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#2F6BFF]/10 ${
                nomTouche && !nomValide
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            />
            {nomTouche && !nomValide && (
              <p className="mt-1 text-xs text-red-500">
                Le nom est obligatoire
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="client-telephone"
              className="mb-1.5 block text-xs font-medium text-slate-500"
            >
              Téléphone *
            </label>
            <input
              id="client-telephone"
              type="tel"
              inputMode="tel"
              value={telephone}
              onChange={(event) => setTelephone(event.target.value)}
              onBlur={() => setTelephoneTouche(true)}
              placeholder="06 11 22 33 44"
              autoComplete="tel"
              aria-invalid={telephoneTouche && !telephoneValide}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#2F6BFF]/10 ${
                telephoneTouche && !telephoneValide
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            />
            {telephoneTouche && !telephoneValide && (
              <p className="mt-1 text-xs text-red-500">
                Numéro de téléphone invalide
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="client-adresse"
              className="mb-1.5 block text-xs font-medium text-slate-500"
            >
              Adresse
            </label>
            <input
              id="client-adresse"
              value={adresse}
              onChange={(event) => setAdresse(event.target.value)}
              placeholder="Ex : 12 rue des Fleurs, Lyon"
              autoComplete="street-address"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#2F6BFF]/10"
            />
          </div>

          <div>
            <label
              htmlFor="client-probleme"
              className="mb-1.5 block text-xs font-medium text-slate-500"
            >
              Dites ce que vous avez fait
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="client-probleme"
                value={probleme}
                onChange={(event) => setProbleme(event.target.value)}
                rows={3}
                placeholder="Ex : Fuite sous l'évier de la cuisine."
                className="min-h-20 min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#2F6BFF]/10"
              />
              <MicButton
                onTranscript={(texte) =>
                  setProbleme((precedent) =>
                    precedent.trim() ? `${precedent.trim()} ${texte}` : texte,
                  )
                }
                onIndisponible={() =>
                  showToast(
                    "La dictée vocale n'est pas disponible sur ce navigateur.",
                    { variant: "warning" },
                  )
                }
                className="h-11 w-11 [&_svg]:h-5 [&_svg]:w-5"
              />
            </div>
          </div>

          {erreur && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={!formulaireValide || enregistrement}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] text-sm font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50"
          >
            {enregistrement ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            {enregistrement ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NouveauClientSheet;
