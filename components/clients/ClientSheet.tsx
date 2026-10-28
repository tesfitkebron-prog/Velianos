"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Check,
  Eye,
  Map,
  MapPin,
  Phone,
  Share2,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  STYLE_URGENCE,
  lienGoogleMaps,
  lienTelephone,
  vibrer,
  type ClientFiche,
} from "@/lib/clients";

type ClientSheetProps = {
  client: ClientFiche;
  onClose: () => void;
  onTreated?: (client: ClientFiche) => void;
};

export function ClientSheet({ client, onClose, onTreated }: ClientSheetProps) {
  const style = STYLE_URGENCE[client.urgence];
  const [partageConfirme, setPartageConfirme] = useState(false);
  const tel = lienTelephone(client.telephone);
  const maps = lienGoogleMaps(client.adresse);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const partager = async () => {
    vibrer(30);
    const texte = [
      client.nom,
      client.probleme,
      client.adresse,
      client.telephone,
    ]
      .filter(Boolean)
      .join("\n");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Client ${client.nom}`, text: texte });
        return;
      } catch {
        // Partage annulé par l'utilisateur.
      }
    }

    try {
      await navigator.clipboard.writeText(texte);
      setPartageConfirme(true);
      window.setTimeout(() => setPartageConfirme(false), 2200);
    } catch {
      setPartageConfirme(false);
    }
  };

  const badge =
    client.urgence === "urgent"
      ? { label: "Urgent", className: "bg-red-50 text-red-600", Icon: TriangleAlert }
      : client.urgence === "a_verifier"
        ? {
            label: "À vérifier",
            className: "bg-orange-50 text-orange-600",
            Icon: Eye,
          }
        : client.badge
          ? { label: client.badge, className: "bg-slate-100 text-slate-600", Icon: Check }
          : null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Fiche de ${client.nom}`}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[32px] bg-[#F5F5F7] shadow-2xl"
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1.5 w-12 rounded-full bg-slate-300" aria-hidden="true" />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Fiche client
            </p>
            <h2 className="mt-1 truncate text-2xl font-extrabold tracking-tight text-slate-900">
              {client.nom}
            </h2>
            {badge && (
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${badge.className}`}
              >
                <badge.Icon className="h-4 w-4" aria-hidden="true" />
                {badge.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_4px_16px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-5">
          <a
            href={tel ?? undefined}
            onClick={(event) => {
              if (!tel) event.preventDefault();
              else vibrer(50);
            }}
            aria-disabled={!tel}
            className={`flex min-h-14 items-center gap-3 rounded-[24px] bg-white px-5 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.05)] ${
              tel ? "text-[#0A2540]" : "text-slate-400"
            }`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <Phone className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-400">
                Téléphone
              </span>
              <span className="block truncate text-lg font-extrabold">
                {client.telephone || "Numéro manquant"}
              </span>
            </span>
          </a>

          <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Ce qu&apos;il a demandé
            </h3>
            <p className="mt-2 text-lg font-extrabold leading-snug tracking-tight text-slate-900">
              {client.probleme}
            </p>
            <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
              {client.resume}
            </p>
            <p className="mt-3 flex items-start gap-2 text-base font-medium text-slate-500">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
              {client.adresse || "Adresse non renseignée"}
            </p>
          </section>

          <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              <Bot className="h-4 w-4" aria-hidden="true" />
              Ce que l&apos;assistant a dit
            </h3>
            {client.echanges.length > 0 ? (
              <div className="mt-3 space-y-2.5">
                {client.echanges.map((echange, index) => (
                  <p
                    key={`${client.id}-echange-${index}`}
                    className="w-fit max-w-[92%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-base font-medium leading-snug text-slate-700"
                  >
                    {echange}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-base font-medium leading-relaxed text-slate-500">
                L&apos;assistant n&apos;a pas encore échangé avec ce client.
              </p>
            )}
          </section>

          <p className="px-2 text-center text-sm font-medium text-slate-400">
            Glissez la carte vers la droite pour traiter ce client.
          </p>
        </div>

        <div className="border-t border-slate-200/60 bg-[#F5F5F7]/95 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          {tel ? (
            <a
              href={tel}
              onClick={() => vibrer(50)}
              className="flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 active:scale-95"
            >
              <Phone className="h-6 w-6" aria-hidden="true" />
              Appeler
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-200 text-lg font-extrabold text-slate-400"
            >
              <Phone className="h-6 w-6" aria-hidden="true" />
              Numéro manquant
            </button>
          )}

          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {maps ? (
              <a
                href={maps}
                target="_blank"
                rel="noreferrer"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-slate-700 transition-transform duration-200 active:scale-95"
              >
                <Map className="h-5 w-5" aria-hidden="true" />
                Google Maps
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-semibold text-slate-400"
              >
                <Map className="h-5 w-5" aria-hidden="true" />
                Adresse absente
              </button>
            )}

            <button
              type="button"
              onClick={() => void partager()}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-extrabold text-slate-700 transition-transform duration-200 active:scale-95"
            >
              {partageConfirme ? (
                <>
                  <Check className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  Copié
                </>
              ) : (
                <>
                  <Share2 className="h-5 w-5" aria-hidden="true" />
                  Partager
                </>
              )}
            </button>
          </div>

          {onTreated && (
            <button
              type="button"
              onClick={() => {
                vibrer(50);
                onTreated(client);
              }}
              className="mt-2.5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] text-base font-extrabold text-white transition-transform duration-200 active:scale-95"
            >
              <Check className="h-5 w-5" aria-hidden="true" />
              Marquer comme traité
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ClientSheet;
