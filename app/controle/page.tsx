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
  SlidersHorizontal,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { PageSkeleton } from "@/components/ui/PageState";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/ToastProvider";
import {
  changerStatutRendezVous,
  chargerDonneesTerrain,
} from "@/lib/field-data";
import { formatDateFrench } from "@/lib/date";
import {
  enregistrerAudit,
  lireAudit,
  supprimerAudit,
  type AuditEntry,
  type AuditRollback,
} from "@/lib/audit";
import { ajouterAction } from "@/lib/offline-queue";
import {
  PERMISSIONS,
  enregistrerPermission,
  lirePermissions,
  type PermissionId,
} from "@/lib/permissions";
import {
  enregistrerEtatTravail,
  type WorkOrderStatus,
} from "@/lib/work-orders";
import { MESSAGE_ERREUR_MUTATION } from "@/lib/errors";
import { vibrer } from "@/lib/clients";

type LigneAudit = {
  id: string;
  titre: string;
  rationale: string;
  autorite: "vous" | "autonome";
  reversible: boolean;
  date: string;
  rollback?: AuditRollback;
  /** Action locale : elle peut être annulée depuis cet écran. */
  locale: boolean;
};

const PERMISSIONS_DEFAUT: Record<PermissionId, boolean> = {
  sms: true,
  rdv: true,
  devis: true,
  notes: true,
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
  const [permissions, setPermissions] =
    useState<Record<PermissionId, boolean>>(PERMISSIONS_DEFAUT);
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
      locale: false,
    }));
    const locales: LigneAudit[] = lireAudit().map((entree: AuditEntry) => ({
      id: entree.id,
      titre: entree.titre,
      rationale: entree.rationale,
      autorite: entree.autorite,
      reversible: entree.reversible,
      date: entree.date,
      rollback: entree.rollback,
      locale: true,
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
    setPermissions(lirePermissions());
  }, []);

  useEffect(() => {
    const rafraichir = () => void charger();
    window.addEventListener("velianos:audit", rafraichir);
    window.addEventListener("velianos:permissions", rafraichir);
    return () => {
      window.removeEventListener("velianos:audit", rafraichir);
      window.removeEventListener("velianos:permissions", rafraichir);
    };
  }, [charger]);

  const reprendreLaMain = () => {
    vibrer(80);
    setActif(false);
    showToast("✅ Vous avez repris la main. L'assistant est en pause.", {
      variant: "success",
      duration: 6000,
      actionLabel: "Annuler",
      onAction: () => {
        setActif(true);
        enregistrerAudit({
          titre: "Assistant réactivé",
          rationale: "Vous avez annulé la prise de contrôle.",
          autorite: "vous",
          reversible: true,
        });
        void charger();
      },
    });
    enregistrerAudit({
      titre: "Vous avez repris la main",
      rationale:
        "L'assistant est en pause. Aucune action ne partira sans votre accord.",
      autorite: "vous",
      reversible: true,
    });
    void charger();
  };

  const reactiver = () => {
    vibrer(50);
    setActif(true);
    showToast("Assistant réactivé. Il répond de nouveau à vos clients.", {
      variant: "success",
    });
    enregistrerAudit({
      titre: "Assistant réactivé",
      rationale: "Vous avez remis l'assistant en marche.",
      autorite: "vous",
      reversible: true,
    });
    void charger();
  };

  const basculerPermission = (id: PermissionId) => {
    vibrer(40);
    const avant = permissions[id];
    const apres = enregistrerPermission(id, !avant);
    setPermissions(apres);

    const permission = PERMISSIONS.find((item) => item.id === id);
    showToast(
      `${permission?.label ?? "Permission"} ${
        avant ? "désactivée" : "activée"
      }.`,
      {
        variant: "info",
        duration: 6000,
        actionLabel: "Annuler",
        onAction: () => {
          setPermissions(enregistrerPermission(id, avant));
        },
      },
    );
    enregistrerAudit({
      titre: `Permission modifiée : ${permission?.label ?? id}`,
      rationale: `Vous avez ${
        avant ? "désactivé" : "activé"
      } cette permission.`,
      autorite: "vous",
      reversible: true,
    });
    void charger();
  };

  const revenirEtatPrecedent = async (ligne: LigneAudit) => {
    if (!ligne.rollback) {
      showToast("Cet état ne peut pas être restauré automatiquement.", {
        variant: "warning",
      });
      return;
    }

    vibrer(60);
    const {
      appointmentId,
      statutPrecedent,
      workOrderClientId,
      workOrderStatus,
      workOrderHoldReason,
      workOrderNextOwner,
    } = ligne.rollback;

    if (appointmentId && statutPrecedent) {
      if (!navigator.onLine) {
        ajouterAction({
          type: "appointment-status",
          appointmentId,
          statut: statutPrecedent,
        });
      } else {
        const resultat = await changerStatutRendezVous(
          appointmentId,
          statutPrecedent,
        );
        if (resultat.erreur) {
          showToast(MESSAGE_ERREUR_MUTATION, { variant: "error" });
          return;
        }
      }
    }

    if (workOrderClientId && workOrderStatus) {
      enregistrerEtatTravail(workOrderClientId, {
        status: workOrderStatus as WorkOrderStatus,
        holdReason: workOrderHoldReason,
        nextOwner: workOrderNextOwner,
      });
    }

    supprimerAudit(ligne.id);
    enregistrerAudit({
      titre: "Retour à l'état précédent",
      rationale: `« ${ligne.titre} » a été annulé.`,
      autorite: "vous",
      reversible: false,
    });
    showToast("↩️ État précédent restauré.", { variant: "success" });
    void charger();
  };

  return (
    <div className="space-y-5 pt-5">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Centre de contrôle
        </h1>
        <p className="mt-1 text-lg font-medium leading-snug text-slate-700">
          Chaque action de votre assistant, avec sa raison et sa réversibilité.
        </p>
      </div>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${
              actif
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            <Bot className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              {actif ? "L'assistant est en marche" : "L'assistant est en pause"}
            </p>
            <p className="text-base font-medium leading-snug text-slate-600">
              {actif
                ? "Il agit selon votre niveau d'autonomie."
                : "Aucun message ne part automatiquement."}
            </p>
          </div>
          <Link
            href="/assistant"
            className="flex min-h-16 flex-shrink-0 items-center rounded-2xl bg-slate-100 px-4 text-base font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-95"
          >
            Régler
          </Link>
        </div>
      </section>

      {actif ? (
        <button
          type="button"
          onClick={reprendreLaMain}
          className="flex min-h-20 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 text-lg font-extrabold text-white shadow-lg shadow-orange-600/30 transition-transform duration-200 active:scale-95"
        >
          <PauseCircle className="h-7 w-7" aria-hidden="true" />
          Reprendre la main
        </button>
      ) : (
        <button
          type="button"
          onClick={reactiver}
          className="flex min-h-20 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-lg font-extrabold text-white shadow-lg shadow-emerald-600/30 transition-transform duration-200 active:scale-95"
        >
          <RotateCcw className="h-7 w-7" aria-hidden="true" />
          Réactiver l&apos;assistant
        </button>
      )}
      <p className="text-center text-lg font-extrabold text-[#0A2540]">
        C&apos;est VOUS qui donnez le pouvoir.
      </p>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="h-6 w-6 flex-shrink-0 text-[#0A2540]"
            aria-hidden="true"
          />
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Permissions actuelles
          </h2>
        </div>
        <p className="mt-1 text-base font-medium leading-snug text-slate-600">
          Ce que Nova peut faire sans vous demander.
        </p>

        <div className="mt-3 space-y-2">
          {PERMISSIONS.map((permission) => (
            <div
              key={permission.id}
              className="flex min-h-20 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold leading-snug text-slate-900">
                  {permission.label}
                </p>
                <p className="mt-0.5 text-sm font-medium leading-snug text-slate-600">
                  {permission.description}
                </p>
              </div>
              <Toggle
                actif={permissions[permission.id]}
                onClick={() => basculerPermission(permission.id)}
                label={`${permission.label} : ${
                  permissions[permission.id] ? "activé" : "désactivé"
                }`}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2 px-1">
        <Activity
          className="h-6 w-6 flex-shrink-0 text-slate-500"
          aria-hidden="true"
        />
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
          Actions récentes
        </h2>
      </div>

      {chargement ? (
        <PageSkeleton lignes={3} />
      ) : lignes.length === 0 ? (
        <section className="rounded-[24px] bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Activity className="h-7 w-7" aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
            Aucune action récente
          </h3>
          <p className="mt-1 text-base font-medium text-slate-600">
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
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#0A2540]">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-extrabold leading-snug tracking-tight text-slate-900">
                    {ligne.titre}
                  </p>
                  <p className="mt-1 text-base font-medium leading-snug text-slate-600">
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
                        <ShieldCheck
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bot className="h-4 w-4" aria-hidden="true" />
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
                    <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-slate-500">
                      <Clock className="h-4 w-4" aria-hidden="true" />
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

              {ligne.locale && ligne.reversible && ligne.rollback && (
                <button
                  type="button"
                  onClick={() => void revenirEtatPrecedent(ligne)}
                  className="mt-3 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-95"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  Revenir à l&apos;état précédent
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
