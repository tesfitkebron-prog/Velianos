import { Lock, Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const SECTIONS = [
  {
    titre: "Vos données restent les vôtres",
    texte:
      "Les informations de vos clients sont stockées de façon sécurisée et ne sont jamais revendues.",
  },
  {
    titre: "Enregistrements d'appels",
    texte:
      "Les enregistrements sont conservés 90 jours, puis supprimés automatiquement.",
  },
  {
    titre: "Suppression du compte",
    texte:
      "Vous pouvez demander la suppression complète de votre compte et de vos données à tout moment depuis Mon compte.",
  },
  {
    titre: "Accès et rectification",
    texte:
      "Vous pouvez consulter et corriger les informations de votre entreprise depuis l'écran Mon entreprise.",
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
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Vos données
              </h1>
              <p className="text-base font-medium text-slate-500">
                Comment Velianos protège vos données.
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
          <Shield className="h-4 w-4" aria-hidden="true" />
          Données hébergées en Europe.
        </p>
      </div>
    </AppLayout>
  );
}
