"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, X } from "lucide-react";
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
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] bg-[#F5F5F7] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="titre-nouveau-client"
              className="text-2xl font-extrabold tracking-tight text-slate-900"
            >
              Ajouter un client
            </h2>
            <p className="mt-1 text-base font-medium text-slate-600">
              Créez une fiche pour un client rencontré sur le terrain.
            </p>
          </div>
          <button
            type="button"
            onClick={fermer}
            disabled={enregistrement}
            aria-label="Fermer le formulaire"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_4px_16px_rgb(0,0,0,0.06)] disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={ajouterClient} noValidate className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="client-nom"
              className="mb-2 block px-1 text-sm font-semibold text-slate-600"
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
              className={`h-14 w-full rounded-2xl bg-white px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15 ${
                nomTouche && !nomValide ? "ring-2 ring-red-300" : ""
              }`}
            />
            {nomTouche && !nomValide && (
              <p className="mt-1 px-1 text-red-500 text-sm">
                Le nom est obligatoire
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="client-telephone"
              className="mb-2 block px-1 text-sm font-semibold text-slate-600"
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
              className={`h-14 w-full rounded-2xl bg-white px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15 ${
                telephoneTouche && !telephoneValide ? "ring-2 ring-red-300" : ""
              }`}
            />
            {telephoneTouche && !telephoneValide && (
              <p className="mt-1 px-1 text-red-500 text-sm">
                Numéro de téléphone invalide
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="client-adresse"
              className="mb-2 block px-1 text-sm font-semibold text-slate-600"
            >
              Adresse
            </label>
            <input
              id="client-adresse"
              value={adresse}
              onChange={(event) => setAdresse(event.target.value)}
              placeholder="Ex : 12 rue des Fleurs, Lyon"
              autoComplete="street-address"
              className="h-14 w-full rounded-2xl bg-white px-4 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15"
            />
          </div>

          <div>
            <label
              htmlFor="client-probleme"
              className="mb-2 block px-1 text-sm font-semibold text-slate-600"
            >
              Problème
            </label>
            <textarea
              id="client-probleme"
              value={probleme}
              onChange={(event) => setProbleme(event.target.value)}
              rows={3}
              placeholder="Ex : Fuite sous l'évier de la cuisine."
              className="w-full resize-none rounded-2xl bg-white px-4 py-3.5 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 shadow-[0_4px_18px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-emerald-500/15"
            />
          </div>

          {erreur && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={!formulaireValide || enregistrement}
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            {enregistrement ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-5 w-5" aria-hidden="true" />
            )}
            {enregistrement ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NouveauClientSheet;
