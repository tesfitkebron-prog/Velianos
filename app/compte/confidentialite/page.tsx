"use client";

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
      "Vous pouvez demander la suppression complète de votre compte et de vos données à tout moment.",
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
      <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-4 max-w-2xl md:mx-auto">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0F172A]">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Confidentialité
              </h2>
              <p className="text-xs font-normal text-slate-500">
                Comment Velianos protège vos données.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <section
              key={section.titre}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-[#0F172A]">
                {section.titre}
              </h3>
              <p className="mt-1 text-sm font-normal leading-relaxed text-slate-600">
                {section.texte}
              </p>
            </section>
          ))}
        </div>

        <p className="flex items-center justify-center gap-1.5 px-1 pt-1 text-[11px] font-normal text-slate-400">
          <Shield className="h-3.5 w-3.5" />
          Données hébergées en Europe.
        </p>
      </div>
    </AppLayout>
  );
}
