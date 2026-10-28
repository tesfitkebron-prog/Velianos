"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F5F5F7] p-4">
      <div className="w-full max-w-md rounded-[24px] bg-white p-7 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <BrandMark size={56} />
        <span className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          Une erreur inattendue est survenue
        </h1>
        <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
          Vos données sont en sécurité. Réessayez dans un instant.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] text-base font-extrabold text-white transition-transform duration-200 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
