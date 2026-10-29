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
    <div className={cn("space-y-3", className)} aria-busy="true">
      <div className="h-6 w-1/2 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-4 w-1/3 animate-pulse rounded-lg bg-slate-200/70" />
      <div className="skeleton mt-4 h-28 rounded-2xl" />
      {Array.from({ length: lignes }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="skeleton h-10 w-10 flex-shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-3.5 w-2/5 rounded-full" />
            <div className="skeleton h-3 w-4/5 rounded-full" />
          </div>
          <div className="skeleton h-8 w-8 rounded-full" />
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
        <TriangleAlert className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-lg font-semibold text-slate-900">Oups…</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        Impossible de charger les données. Vérifiez votre connexion.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-4 text-sm font-semibold text-white transition-opacity active:opacity-80"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Réessayer
      </button>
    </div>
  );
}

export function PageLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#F4F6FC]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white px-6 py-5 shadow-xl">
        <Loader2 className="h-6 w-6 animate-spin text-[#2F6BFF]" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600">Un instant…</p>
      </div>
    </div>
  );
}
