import type { Metadata } from "next";
import { Lock, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Velianos",
  description:
    "Comment Velianos collecte, utilise et protège vos données personnelles.",
};

const SECTIONS = [
  {
    titre: "Qui est responsable ?",
    texte:
      "Velianos édite l'application Velianos, un assistant téléphonique destiné aux artisans. Pour toute question relative à vos données personnelles, écrivez à support@velianos.fr.",
  },
  {
    titre: "Données que nous collectons",
    texte:
      "Nous traitons les données de votre compte (nom, e-mail, téléphone), les informations de votre entreprise (activité, horaires, zone d'intervention, tarifs), les coordonnées de vos clients, le contenu des appels manqués et des SMS échangés, ainsi que des données techniques (adresse IP, type d'appareil, journaux de connexion).",
  },
  {
    titre: "Pourquoi nous les utilisons",
    texte:
      "Ces données servent à fournir l'assistant téléphonique et l'envoi de SMS, gérer votre abonnement, assurer le support, sécuriser le service et respecter nos obligations légales. Vos données ne sont jamais revendues.",
  },
  {
    titre: "Base légale",
    texte:
      "Selon les cas, le traitement repose sur l'exécution du contrat, notre intérêt légitime (sécurité et amélioration du service), votre consentement (notifications) ou une obligation légale (comptabilité).",
  },
  {
    titre: "Durée de conservation",
    texte:
      "Les données de compte sont conservées pendant la durée de l'abonnement, puis 12 mois. Les enregistrements d'appels sont supprimés après 90 jours. Les documents de facturation sont conservés 10 ans conformément à la loi. Les journaux techniques sont conservés 12 mois maximum.",
  },
  {
    titre: "Destinataires et sous-traitants",
    texte:
      "Vos données sont accessibles à nos équipes habilitées et à nos sous-traitants techniques : Supabase (base de données hébergée dans l'Union européenne), Twilio (téléphonie et SMS) et Vercel (hébergement de l'application). Ces prestataires agissent sur nos instructions et présentent des garanties conformes au RGPD.",
  },
  {
    titre: "Vos droits",
    texte:
      "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Vous pouvez exercer ces droits depuis votre compte ou en écrivant à support@velianos.fr. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).",
  },
  {
    titre: "Cookies",
    texte:
      "Velianos utilise uniquement des cookies et un stockage local nécessaires au fonctionnement du service (session, préférences, notifications). Aucun cookie publicitaire n'est déposé.",
  },
  {
    titre: "Sécurité",
    texte:
      "Les échanges sont chiffrés en transit. L'accès aux données est limité par des règles de sécurité au niveau des lignes (RLS) et par authentification. En cas d'incident affectant vos données, nous vous informerons dans les délais prévus par le RGPD.",
  },
];

export default function ConfidentialitePage() {
  return (
    <AppLayout>
      <div className="space-y-5 pt-5">
        <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Politique de confidentialité
              </h1>
              <p className="text-base font-medium text-slate-500">
                Dernière mise à jour : 28 octobre 2026.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <section
              key={section.titre}
              className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            >
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                {section.titre}
              </h2>
              <p className="mt-1.5 text-base font-medium leading-relaxed text-slate-600">
                {section.texte}
              </p>
            </section>
          ))}
        </div>

        <p className="flex items-center justify-center gap-1.5 px-1 pt-1 text-sm font-medium text-slate-400">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Conforme au RGPD · Données hébergées en Europe.
        </p>
      </div>
    </AppLayout>
  );
}
