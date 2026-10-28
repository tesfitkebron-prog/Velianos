"use client";

import { Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { cn } from "@/components/ui/utils";

export function PageSkeleton({
  lignes = 3,
  className,
}: {
  lignes?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true">
      <div className="h-8 w-2/3 animate-pulse rounded-2xl bg-slate-200/80" />
      <div className="h-4 w-1/2 animate-pulse rounded-xl bg-slate-200/60" />
      <div className="skeleton mt-6 h-44 rounded-[24px]" />
      {Array.from({ length: lignes }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="skeleton h-12 w-12 flex-shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5 rounded-full" />
            <div className="skeleton h-3 w-4/5 rounded-full" />
          </div>
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
      ))}
      <span className="sr-only">Chargement de vos informations…</span>
    </div>
  );
}

export function PageError({
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <TriangleAlert className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">
        Oups…
      </h2>
      <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
        Oups, impossible de charger les données. Vérifiez votre connexion.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-5 text-base font-extrabold text-white transition-transform duration-200 active:scale-95"
      >
        <RotateCcw className="h-5 w-5" aria-hidden="true" />
        Réessayer
      </button>
    </div>
  );
}

export function PageLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#F5F5F7]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-[24px] bg-white px-8 py-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-500" aria-hidden="true" />
        <p className="text-base font-semibold text-slate-600">Un instant…</p>
      </div>
    </div>
  );
}
