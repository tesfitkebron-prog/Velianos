"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="fr">
      <head>
        <title>Erreur - Velianos</title>
      </head>
      <body className="flex min-h-screen items-center justify-center bg-[#F4F6FC] p-4">
        <div className="w-full max-w-md rounded-[24px] bg-white p-7 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#2F6BFF] text-white">
            <TriangleAlert className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
            Velianos est momentanément indisponible
          </h1>
          <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
            Rechargez la page pour retrouver votre activité.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
