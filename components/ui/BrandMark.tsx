"use client";

import { CheckCircle2, Loader2, Wrench } from "lucide-react";

export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-[22px] bg-[#0A2540] text-white shadow-xl shadow-[#0A2540]/25"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Wrench style={{ width: size * 0.44, height: size * 0.44 }} strokeWidth={2.2} />
    </span>
  );
}

export function SplashScreen({ message = "Velianos" }: { message?: string }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-[#F5F5F7]">
      <BrandMark size={76} />
      <div className="text-center">
        <p className="text-2xl font-extrabold tracking-tight text-slate-900">
          {message}
        </p>
        <p className="mt-1 text-base font-medium text-slate-500">
          Votre assistante terrain
        </p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-hidden="true" />
    </main>
  );
}

export function SuccessMark() {
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
      <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
    </span>
  );
}
