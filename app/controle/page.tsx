"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock,
  PauseCircle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { PageSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/components/ui/ToastProvider";
import { chargerDonneesTerrain } from "@/lib/field-data";
import { formatDateFrench } from "@/lib/date";
import { enregistrerAudit, lireAudit, type AuditEntry } from "@/lib/audit";
import { vibrer } from "@/lib/clients";

type LigneAudit = {
  id: string;
  titre: string;
  rationale: string;
  autorite: "vous" | "autonome";
  reversible: boolean;
  date: string;
};

export default function ControlePage() {
  return (
    <AppLayout>
      <ControleContent />
    </AppLayout>
  );
}

function ControleContent() {
  const { actif, setActif } = useAssistant();
  const { showToast } = useToast();
  const [lignes, setLignes] = useState<LigneAudit[]>([]);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(async () => {
    setChargement(true);
    const donnees = await chargerDonneesTerrain();
    const activites: LigneAudit[] = donnees.activites.map((activite) => ({
      id: activite.id,
      titre: activite.texte,
      rationale: activite.rationale,
      autorite: activite.autorite,
      reversible: activite.reversible,
      date: activite.date,
    }));
    const locales: LigneAudit[] = lireAudit().map((entree: AuditEntry) => ({
      id: entree.id,
      titre: entree.titre,
      rationale: entree.rationale,
      autorite: entree.autorite,
      reversible: entree.reversible,
      date: entree.date,
    }));

    setLignes(
      [...locales, ...activites]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 20),
    );
    setChargement(false);
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const rafraichir = () => void charger();
    window.addEventListener("velianos:audit", rafraichir);
    return () => window.removeEventListener("velianos:audit", rafraichir);
  }, [charger]);

  const arreter = () => {
    vibrer(80);
    setActif(false);
    showToast("🛑 Assistant mis en pause. Aucune action ne partira.", {
      variant: "warning",
    });
    enregistrerAudit({
      titre: "Assistant mis en pause",
      rationale: "Vous avez utilisé le bouton Tout arrêter du centre de contrôle.",
      autorite: "vous",
      reversible: true,
    });
    void charger();
  };

  return (
    <div className="space-y-5 pt-5">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Centre de contrôle
        </h1>
        <p className="mt-1 text-lg font-medium text-slate-600">
          Chaque action de votre assistant, avec sa raison et sa réversibilité.
        </p>
      </div>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
              actif
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            <Bot className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              {actif ? "L'assistant est en marche" : "L'assistant est en pause"}
            </p>
            <p className="text-base font-medium text-slate-500">
              {actif
                ? "Il agit selon votre niveau d'autonomie."
                : "Aucun message ne part automatiquement."}
            </p>
          </div>
          <Link
            href="/assistant"
            className="min-h-14 rounded-xl bg-slate-100 px-3 text-base font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-95"
          >
            Régler
          </Link>
        </div>
      </section>

      {chargement ? (
        <PageSkeleton lignes={3} />
      ) : lignes.length === 0 ? (
        <section className="rounded-[24px] bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Activity className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
            Aucune action récente
          </h2>
          <p className="mt-1 text-base font-medium text-slate-500">
            Les prochaines actions de votre assistant apparaîtront ici.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {lignes.map((ligne) => (
            <article
              key={ligne.id}
              className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#0A2540]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-extrabold leading-snug tracking-tight text-slate-900">
                    {ligne.titre}
                  </p>
                  <p className="mt-1 text-base font-medium leading-snug text-slate-500">
                    {ligne.rationale}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${
                        ligne.autorite === "vous"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {ligne.autorite === "vous" ? (
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {ligne.autorite === "vous"
                        ? "Autorisé par vous"
                        : "Autonome"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${
                        ligne.reversible
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {ligne.reversible ? "↩️ Réversible" : "⛔ Irréversible"}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDateFrench(ligne.date, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={arreter}
        disabled={!actif}
        className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 text-lg font-extrabold text-white shadow-lg shadow-red-600/30 transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {actif ? (
          <PauseCircle className="h-6 w-6" aria-hidden="true" />
        ) : (
          <RotateCcw className="h-6 w-6" aria-hidden="true" />
        )}
        {actif ? "Tout arrêter" : "Assistant déjà en pause"}
      </button>
      <p className="pb-4 text-center text-base font-medium text-slate-400">
        Tout arrêter met l&apos;assistant en pause immédiatement.
      </p>
    </div>
  );
}
