"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/ui/BrandMark";

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

  return <SplashScreen />;
}
