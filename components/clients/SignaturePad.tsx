"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Eraser } from "lucide-react";
import { vibrer } from "@/lib/clients";

type SignaturePadProps = {
  onValider: (dataUrl: string) => void;
  onAnnuler: () => void;
};

export function SignaturePad({ onValider, onAnnuler }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contexteRef = useRef<CanvasRenderingContext2D | null>(null);
  const dessine = useRef(false);
  const [vide, setVide] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 640;
    canvas.height = 260;
    const contexte = canvas.getContext("2d");
    if (!contexte) return;

    contexte.lineWidth = 4;
    contexte.lineCap = "round";
    contexte.lineJoin = "round";
    contexte.strokeStyle = "#0A2540";
    contexteRef.current = contexte;
  }, []);

  const position = useCallback(
    (evenement: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((evenement.clientX - rect.left) / rect.width) * canvas.width,
        y: ((evenement.clientY - rect.top) / rect.height) * canvas.height,
      };
    },
    [],
  );

  const commencer = (evenement: React.PointerEvent<HTMLCanvasElement>) => {
    const contexte = contexteRef.current;
    const canvas = canvasRef.current;
    if (!contexte || !canvas) return;

    evenement.preventDefault();
    canvas.setPointerCapture(evenement.pointerId);
    const point = position(evenement);
    contexte.beginPath();
    contexte.moveTo(point.x, point.y);
    dessine.current = true;
    setVide(false);
  };

  const tracer = (evenement: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dessine.current) return;
    const contexte = contexteRef.current;
    if (!contexte) return;

    evenement.preventDefault();
    const point = position(evenement);
    contexte.lineTo(point.x, point.y);
    contexte.stroke();
  };

  const terminer = (evenement: React.PointerEvent<HTMLCanvasElement>) => {
    const contexte = contexteRef.current;
    if (!contexte) return;
    evenement.preventDefault();
    contexte.closePath();
    dessine.current = false;
  };

  const effacer = () => {
    const canvas = canvasRef.current;
    const contexte = contexteRef.current;
    if (!canvas || !contexte) return;
    contexte.clearRect(0, 0, canvas.width, canvas.height);
    setVide(true);
  };

  const valider = () => {
    const canvas = canvasRef.current;
    if (!canvas || vide) return;
    vibrer(50);
    onValider(canvas.toDataURL("image/png"));
  };

  return (
    <div className="mt-3 rounded-2xl bg-slate-50 p-4">
      <p className="text-base font-semibold text-slate-700">
        Signez avec le doigt
      </p>
      <canvas
        ref={canvasRef}
        onPointerDown={commencer}
        onPointerMove={tracer}
        onPointerUp={terminer}
        onPointerLeave={terminer}
        aria-label="Zone de signature du client"
        className="mt-2 h-[190px] w-full touch-none rounded-2xl border-2 border-dashed border-slate-200 bg-white"
      />
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={effacer}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white text-base font-extrabold text-slate-600 shadow-sm transition-transform duration-200 active:scale-95"
        >
          <Eraser className="h-5 w-5" aria-hidden="true" />
          Effacer
        </button>
        <button
          type="button"
          onClick={valider}
          disabled={vide}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-5 w-5" aria-hidden="true" />
          Valider
        </button>
      </div>
      <button
        type="button"
        onClick={onAnnuler}
        className="mt-2 min-h-12 w-full rounded-2xl text-base font-bold text-slate-500 transition-transform duration-200 active:scale-95"
      >
        Annuler la signature
      </button>
    </div>
  );
}

export default SignaturePad;
