"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/client";
import { loadWorkspaceProfile } from "@/lib/workspace";

export default function SecuritePage() {
  return (
    <AppLayout>
      <ContenuSecurite />
    </AppLayout>
  );
}

function ContenuSecurite() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    let monte = true;
    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (monte) setEmail(profil.email);
    };
    void charger();
    return () => {
      monte = false;
    };
  }, []);

  const changerMotDePasse = async (event: FormEvent) => {
    event.preventDefault();
    setErreur(null);
    setSucces(false);

    if (motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setEnregistrement(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnregistrement(false);

    if (error) {
      setErreur("Le mot de passe n'a pas pu être modifié. Réessayez.");
      return;
    }

    setSucces(true);
    setMotDePasse("");
    setConfirmation("");
  };

  return (
    <div className="space-y-5 pt-5">
      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#0A2540]">
            <Shield className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
              Mot de passe
            </h1>
            <p className="mt-1 text-base font-medium leading-relaxed text-slate-600">
              Choisissez un mot de passe solide, différent de vos autres comptes.
            </p>
          </div>
        </div>

        <form onSubmit={(event) => void changerMotDePasse(event)} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block px-1 text-sm font-semibold text-slate-600">
              Nouveau mot de passe
            </span>
            <input
              type="password"
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              className="h-14 w-full rounded-2xl bg-slate-100 px-4 text-base font-medium text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block px-1 text-sm font-semibold text-slate-600">
              Confirmer le mot de passe
            </span>
            <input
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              className="h-14 w-full rounded-2xl bg-slate-100 px-4 text-base font-medium text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
            />
          </label>

          {erreur && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
              {erreur}
            </p>
          )}
          {succes && (
            <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-base font-semibold text-emerald-600">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              Mot de passe modifié.
            </p>
          )}

          <button
            type="submit"
            disabled={enregistrement}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95 disabled:opacity-60"
          >
            {enregistrement ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Lock className="h-5 w-5" aria-hidden="true" />
            )}
            {enregistrement ? "Modification…" : "Modifier mon mot de passe"}
          </button>
        </form>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
          Adresse de connexion
        </h2>
        <p className="mt-1 break-all text-base font-medium text-slate-600">
          {email || "Aucune adresse enregistrée"}
        </p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
          C&apos;est l&apos;adresse qui reçoit les liens de réinitialisation.
        </p>
      </section>

      <Link
        href="mailto:support@velianos.fr?subject=Acc%C3%A8s%20%C3%A0%20mon%20compte"
        className="flex min-h-16 items-center gap-3 rounded-[24px] bg-white px-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-[0.99]"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-slate-900">
            Contacter le support
          </span>
          <span className="block text-sm font-medium text-slate-400">
            Réponse sous 24 h ouvrées
          </span>
        </span>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" aria-hidden="true" />
      </Link>
    </div>
  );
}
