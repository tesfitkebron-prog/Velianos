import { FileText } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const SECTIONS = [
  {
    titre: "Le service",
    texte:
      "Velianos est un assistant téléphonique destiné aux artisans. Il répond aux appels manqués, qualifie la demande et vous transmet les informations utiles.",
  },
  {
    titre: "Votre responsabilité",
    texte:
      "L'assistant qualifie les demandes mais ne remplace pas votre intervention. Vous restez responsable du devis, du rendez-vous et de la réalisation des travaux.",
  },
  {
    titre: "Abonnement et résiliation",
    texte:
      "L'abonnement Pro est sans engagement. Il peut être résilié à tout moment depuis votre compte. L'accès reste actif jusqu'à la fin du mois payé.",
  },
  {
    titre: "Utilisation raisonnable",
    texte:
      "Le service doit être utilisé pour votre activité professionnelle. Toute utilisation abusive ou frauduleuse peut entraîner la suspension du compte.",
  },
];

export default function ConditionsPage() {
  return (
    <AppLayout>
      <div className="space-y-5 pt-5">
        <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Les règles du service
              </h1>
              <p className="text-base font-medium text-slate-500">
                Version du 1er janvier 2026.
              </p>
            </div>
          </div>
        </section>

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
    </AppLayout>
  );
}
