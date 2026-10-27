"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let dejaVu = false;
    try {
      dejaVu = window.localStorage.getItem("velianos_bienvenue") === "1";
    } catch {
      dejaVu = false;
    }
    router.replace(dejaVu ? "/dashboard" : "/bienvenue");
  }, [router]);

  return (
    <main className="min-h-[100dvh] bg-white flex flex-col items-center justify-center gap-3">
      <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
      <p className="text-sm font-semibold text-slate-400">Velianos</p>
    </main>
  );
}
