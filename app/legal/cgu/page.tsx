import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation - Velianos",
  description:
    "Les règles d'utilisation du service Velianos, l'assistant des artisans.",
};

const SECTIONS = [
  {
    titre: "Objet",
    texte:
      "Les présentes conditions générales d'utilisation encadrent l'accès et l'utilisation de Velianos, un assistant téléphonique destiné aux artisans et aux petites entreprises.",
  },
  {
    titre: "Compte et accès",
    texte:
      "Vous devez créer un compte avec des informations exactes et maintenir la confidentialité de vos identifiants. Vous êtes responsable des actions réalisées depuis votre compte.",
  },
  {
    titre: "Le service",
    texte:
      "Velianos répond aux appels manqués, engage une conversation par SMS, qualifie la demande et vous transmet les informations utiles. L'assistant ne remplace pas votre intervention : le devis, le rendez-vous et la réalisation des travaux restent sous votre responsabilité.",
  },
  {
    titre: "Usage acceptable",
    texte:
      "Le service doit être utilisé dans le cadre de votre activité professionnelle, dans le respect de la réglementation, notamment en matière de prospection téléphonique et de consentement de vos clients. Toute utilisation abusive, frauduleuse ou portant atteinte à des tiers peut entraîner la suspension du compte.",
  },
  {
    titre: "Abonnement et résiliation",
    texte:
      "L'abonnement est sans engagement, sauf mention contraire affichée lors de la souscription. Il peut être résilié à tout moment depuis votre compte. L'accès reste actif jusqu'à la fin de la période payée. Les sommes déjà versées ne sont pas remboursées au prorata, sauf disposition légale contraire.",
  },
  {
    titre: "Disponibilité",
    texte:
      "Nous faisons nos meilleurs efforts pour assurer une disponibilité continue. Des interruptions peuvent survenir pour maintenance, mise à jour ou pour des raisons indépendantes de notre volonté. Nous ne garantissons pas une disponibilité absolue.",
  },
  {
    titre: "Propriété intellectuelle",
    texte:
      "L'application, sa marque, ses textes, ses interfaces et ses éléments graphiques sont protégés. Toute reproduction ou réutilisation non autorisée est interdite. Vous conservez la propriété des données et contenus que vous nous confiez.",
  },
  {
    titre: "Données personnelles",
    texte:
      "Le traitement des données est décrit dans la politique de confidentialité accessible depuis l'application. En utilisant Velianos, vous vous engagez à informer vos clients du traitement de leurs coordonnées lorsque la réglementation l'exige.",
  },
  {
    titre: "Responsabilité",
    texte:
      "Velianos met à disposition un outil d'assistance. Nous ne pouvons être tenus responsables des décisions commerciales prises à partir des informations transmises, ni des dommages indirects. Notre responsabilité est limitée au montant de l'abonnement payé au cours des douze derniers mois.",
  },
  {
    titre: "Modification des conditions",
    texte:
      "Nous pouvons faire évoluer les présentes conditions. La version applicable est celle publiée dans l'application. Les changements importants vous seront signalés avant leur entrée en vigueur.",
  },
  {
    titre: "Droit applicable",
    texte:
      "Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire devant les tribunaux compétents.",
  },
  {
    titre: "Contact",
    texte:
      "Pour toute question concernant ces conditions, écrivez à support@velianos.fr.",
  },
];

export default function CguPage() {
  return (
    <AppLayout>
      <div className="space-y-5 pt-5">
        <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Conditions d&apos;utilisation
              </h1>
              <p className="text-base font-medium text-slate-500">
                Version du 28 octobre 2026.
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
      </div>
    </AppLayout>
  );
}
