"use client";

import { useEffect, useState } from "react";
import { Share2, X } from "lucide-react";
import {
  instructionsInstallation,
  usePwaInstall,
} from "@/lib/pwa-install";

export function InstallPrompt() {
  const { disponible, installee, installer, estIOS } = usePwaInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (installee) {
      setShowBanner(false);
      return;
    }

    const dismissed = localStorage.getItem("velianos_install_dismissed");
    if (dismissed || window.innerWidth >= 768) return;

    if (disponible || estIOS) {
      setShowBanner(true);
    }
  }, [disponible, estIOS, installee]);

  const handleInstall = async () => {
    const resultat = await installer();
    if (resultat === "unavailable") {
      setShowInstructions(true);
      return;
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("velianos_install_dismissed", "true");
  };

  if (!showBanner && !showInstructions) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed inset-x-4 bottom-[calc(100px+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-[24px] bg-[#0A2540] p-4 shadow-2xl animate-[toastUp_.3s_ease-out]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base font-extrabold text-white">
                Installez Velianos
              </p>
              <p className="text-sm font-medium text-white/70">
                Accès rapide depuis votre écran d&apos;accueil
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="min-h-12 whitespace-nowrap rounded-xl bg-white px-4 text-base font-extrabold text-[#0A2540] transition-transform duration-200 active:scale-95"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="min-h-12 whitespace-nowrap px-3 text-base font-semibold text-white/70"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {showInstructions && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
          onClick={() => setShowInstructions(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#0A2540]">
                <Share2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                aria-label="Fermer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
              Installer Velianos
            </h2>
            <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
              Suivez ces étapes pour ajouter l&apos;application à votre écran
              d&apos;accueil.
            </p>

            <ol className="mt-4 space-y-3">
              {instructionsInstallation().map((etape, index) => (
                <li
                  key={etape}
                  className="flex items-start gap-3 text-base font-medium leading-snug text-slate-700"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-[#0A2540]">
                    {index + 1}
                  </span>
                  <span className="flex-1">{etape}</span>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={() => {
                setShowInstructions(false);
                handleDismiss();
              }}
              className="mt-5 h-14 w-full rounded-2xl bg-[#0A2540] text-base font-extrabold text-white transition-transform duration-200 active:scale-95"
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
