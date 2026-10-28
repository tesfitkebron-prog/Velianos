"use client";

import { Mic, Square } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { useSpeechRecognition } from "@/lib/use-speech";

type MicButtonProps = {
  onTranscript: (texte: string) => void;
  onIndisponible?: () => void;
  className?: string;
};

export function MicButton({
  onTranscript,
  onIndisponible,
  className,
}: MicButtonProps) {
  const { ecoute, supporte, erreur, demarrer } = useSpeechRecognition(onTranscript);

  return (
    <button
      type="button"
      onClick={() => {
        if (!supporte) {
          onIndisponible?.();
          return;
        }
        demarrer();
      }}
      aria-label={
        !supporte
          ? "Dictée vocale non disponible sur ce navigateur"
          : ecoute
            ? "Arrêter la dictée"
            : "Dicter à la voix"
      }
      aria-pressed={ecoute}
      title={erreur ?? undefined}
      className={cn(
        "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-200 active:scale-95",
        ecoute
          ? "bg-red-50 text-red-600 shadow-lg shadow-red-500/20"
          : "bg-slate-100 text-[#0A2540]",
        !supporte && "opacity-40",
        className,
      )}
    >
      {ecoute ? (
        <Square className="h-5 w-5" fill="currentColor" aria-hidden="true" />
      ) : (
        <Mic className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

export default MicButton;
