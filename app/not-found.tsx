"use client";

import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F5F5F7] p-4">
      <div className="w-full max-w-md rounded-[24px] bg-white p-7 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <BrandMark size={56} />
        <span className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          Cette page n&apos;existe pas
        </h1>
        <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
          Le lien est peut-être ancien. Revenez à vos appels pour continuer.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          Revenir aux appels
        </Link>
      </div>
    </div>
  );
}
