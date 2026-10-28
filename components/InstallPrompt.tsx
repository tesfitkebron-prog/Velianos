"use client";

import { useState, useEffect } from "react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const dismissed = localStorage.getItem("velianos_install_dismissed");

    if (isInstalled || dismissed || window.innerWidth >= 768) {
      return;
    }

    // Écouter l'événement beforeinstallprompt (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Détection iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isInstalled) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // iOS : instructions manuelles
      setShowBanner(false);
      localStorage.setItem("velianos_install_dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("velianos_install_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(100px+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-[24px] bg-[#0A2540] p-4 shadow-2xl animate-[toastUp_.3s_ease-out]">
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-base font-extrabold text-white">Installez Velianos</p>
          <p className="text-sm font-medium text-white/70">Accès rapide depuis votre écran d&apos;accueil</p>
        </div>
        <button
          onClick={handleInstall}
          className="min-h-12 rounded-xl bg-white px-4 text-base font-extrabold text-[#0A2540] whitespace-nowrap transition-transform duration-200 active:scale-95"
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
  );
}
