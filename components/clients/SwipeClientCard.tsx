"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Eye,
  Map,
  Phone,
  TriangleAlert,
} from "lucide-react";
import {
  STYLE_URGENCE,
  lienGoogleMaps,
  lienTelephone,
  vibrer,
  type ClientFiche,
} from "@/lib/clients";

type SwipeClientCardProps = {
  client: ClientFiche;
  onOpen: (client: ClientFiche) => void;
  onTreated: (client: ClientFiche) => void;
};

export function SwipeClientCard({
  client,
  onOpen,
  onTreated,
}: SwipeClientCardProps) {
  const [sorti, setSorti] = useState(false);
  const style = STYLE_URGENCE[client.urgence];
  const tel = lienTelephone(client.telephone);
  const maps = lienGoogleMaps(client.adresse);

  const traiter = () => {
    if (sorti) return;
    setSorti(true);
    vibrer(50);
    window.setTimeout(() => onTreated(client), 260);
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-emerald-500">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 pl-6 text-white">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
          <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        </span>
        <span className="text-base font-extrabold">Traité</span>
      </div>

      <motion.article
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        dragSnapToOrigin
        animate={
          sorti
            ? { x: 540, opacity: 0, transition: { duration: 0.25 } }
            : { x: 0, opacity: 1, transition: { duration: 0.2 } }
        }
        onDragEnd={(_, info) => {
          if (info.offset.x > 96) traiter();
        }}
        className="relative rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-1 h-11 w-1 flex-shrink-0 rounded-full ${style.pastille}`}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => onOpen(client)}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex items-center gap-2">
              <h3 className="truncate text-xl font-extrabold tracking-tight text-slate-900">
                {client.nom}
              </h3>
              {client.urgence !== "normal" && (
                <span
                  className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${style.badge}`}
                >
                  {client.urgence === "urgent" ? (
                    <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {client.urgence === "urgent" ? "Urgent" : "À vérifier"}
                </span>
              )}
            </div>
            <p className="mt-1.5 line-clamp-2 text-base font-medium leading-snug text-slate-600">
              {client.probleme}
            </p>
            <p className="mt-1 truncate text-sm font-medium text-slate-400">
              {client.adresse || "Adresse non renseignée"} · {client.moment}
            </p>
          </button>
          <ChevronRight
            className="mt-1 h-5 w-5 flex-shrink-0 text-slate-300"
            aria-hidden="true"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {tel ? (
            <a
              href={tel}
              onClick={(event) => {
                event.stopPropagation();
                vibrer(50);
              }}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-transform duration-200 active:scale-95"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Appeler
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-base font-semibold text-slate-400"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Numéro manquant
            </button>
          )}

          {maps ? (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
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
        </div>
      </motion.article>
    </div>
  );
}

export default SwipeClientCard;
