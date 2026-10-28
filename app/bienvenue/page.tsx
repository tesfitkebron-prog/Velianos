"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MessageSquareText,
  Rocket,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";

const CLE = "velianos_bienvenue";

const slides = [
  {
    icone: Sparkles,
    titre: "Bienvenue sur Velianos. Ne perdez plus aucun client.",
    texte:
      "Votre assistant prend le relais quand vous êtes sur le chantier et transforme chaque appel manqué en opportunité.",
  },
  {
    icone: MessageSquareText,
    titre: "Votre assistant répond à vos appels manqués par SMS.",
    texte:
      "Il qualifie la demande, note l'adresse et l'urgence, puis vous transmet une fiche prête à appeler.",
  },
  {
    icone: Rocket,
    titre: "Prêt à travailler ?",
    texte:
      "Connectez-vous pour activer votre assistant et commencer à récupérer vos clients dès aujourd'hui.",
  },
] as const;

export default function BienvenuePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const terminer = () => {
    try {
      window.localStorage.setItem(CLE, "1");
    } catch {
      // Stockage indisponible : on continue quand même.
    }
    router.replace("/login");
  };

  const slide = slides[index];
  const Icone = slide.icone;
  const dernier = index === slides.length - 1;

  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#F5F5F7] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
      <div className="flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandMark size={36} />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Velianos
          </span>
        </div>
        <button
          type="button"
          onClick={terminer}
          className="h-12 rounded-xl px-3 text-base font-semibold text-slate-400 transition-colors active:bg-white"
        >
          Passer
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="mb-9 flex h-40 w-40 items-center justify-center rounded-[2.5rem] bg-[#0A2540] shadow-xl shadow-[#0A2540]/20">
          <Icone className="h-16 w-16 text-white" strokeWidth={1.6} />
        </div>

        <h1 className="max-w-sm text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
          {slide.titre}
        </h1>
        <p className="mt-3 max-w-xs text-lg font-medium leading-relaxed text-slate-600">
          {slide.texte}
        </p>
      </div>

      <div className="mb-6 flex flex-shrink-0 items-center justify-center">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Aller au slide ${i + 1}`}
            className="flex h-11 w-11 items-center justify-center"
          >
            <span
              className={`h-2 rounded-full transition-all duration-200 ${
                i === index ? "w-6 bg-[#0A2540]" : "w-2 bg-slate-300"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="flex-shrink-0 space-y-1">
        <button
          type="button"
          onClick={() => (dernier ? terminer() : setIndex(index + 1))}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95"
        >
          {dernier ? "Commencer" : "Suivant"}
          <ArrowRight className="h-5 w-5" />
        </button>

        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            className="h-12 w-full rounded-xl text-base font-semibold text-slate-500 transition-colors active:bg-white"
          >
            Retour
          </button>
        ) : (
          <p className="pt-2 text-center text-sm font-medium text-slate-400">
            Aucune carte bancaire demandée
          </p>
        )}
      </div>
    </main>
  );
}
