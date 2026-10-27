"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  HardHat,
  TrendingUp,
} from "lucide-react";

const CLE = "velianos_bienvenue";

const slides = [
  {
    icone: HardHat,
    titre: "Votre assistant travaille pendant que vous êtes sur le chantier",
    texte:
      "Il décroche, écoute et qualifie chaque appel. Vous restez concentré sur votre intervention.",
  },
  {
    icone: CalendarCheck,
    titre: "Il répond, qualifie et prend les RDV à votre place",
    texte:
      "Adresse, urgence, créneau : tout est noté. Vous recevez une fiche prête à appeler.",
  },
  {
    icone: TrendingUp,
    titre: "Vous ne perdez plus aucun client",
    texte:
      "Chaque appel manqué devient une opportunité. Vos chantiers se remplissent tout seuls.",
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
    <main className="min-h-[100dvh] bg-white flex flex-col px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
      {/* EN-TÊTE */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-lg font-bold tracking-tight text-[#0F172A]">
            Velianos
          </span>
        </div>
        <button
          onClick={terminer}
          className="h-10 px-3 rounded-lg text-sm font-medium text-slate-400 active:bg-slate-100 transition-colors"
        >
          Passer
        </button>
      </div>

      {/* SLIDE */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
        <div className="w-40 h-40 rounded-[2.5rem] bg-[#0F172A] flex items-center justify-center mb-9 shadow-sm">
          <Icone className="w-16 h-16 text-[#10B981]" strokeWidth={1.6} />
        </div>

        <h1 className="text-[27px] leading-[1.2] font-bold tracking-tight text-[#0F172A] max-w-sm">
          {slide.titre}
        </h1>
        <p className="text-[15px] leading-relaxed font-normal text-slate-500 mt-3 max-w-xs">
          {slide.texte}
        </p>
      </div>

      {/* INDICATEURS */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-shrink-0">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Aller au slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-[#0F172A]" : "w-2 bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* ACTIONS */}
      <div className="flex-shrink-0 space-y-1">
        <button
          onClick={() => (dernier ? terminer() : setIndex(index + 1))}
          className="w-full h-14 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-2 transition-all"
        >
          {dernier ? "Commencer" : "Continuer"}
          <ArrowRight className="w-5 h-5" />
        </button>

        {index > 0 ? (
          <button
            onClick={() => setIndex(index - 1)}
            className="w-full h-11 rounded-xl text-sm font-medium text-slate-500 active:bg-slate-100 transition-colors"
          >
            Retour
          </button>
        ) : (
          <p className="text-center text-[11px] font-normal text-slate-400 pt-2">
            Aucune carte bancaire demandée
          </p>
        )}
      </div>
    </main>
  );
}
