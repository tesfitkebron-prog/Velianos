"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import { STYLE_URGENCE, type ClientFiche } from "@/lib/clients";

type ClientSheetProps = {
  client: ClientFiche;
  onClose: () => void;
  onTreated?: (client: ClientFiche) => void;
};

export function ClientSheet({ client, onClose, onTreated }: ClientSheetProps) {
  const style = STYLE_URGENCE[client.urgence];

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Fiche de ${client.nom}`}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[88vh] overflow-hidden animate-[sheetUp_.25s_ease-out]"
      >
        {/* POIGNÉE */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
          <span className="w-9 h-1 rounded-full bg-slate-200" />
        </div>

        {/* 1. EN-TÊTE */}
        <header className="px-5 py-3 md:py-5 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 truncate">
              {client.nom}
            </h2>
            <span
              className={`inline-flex items-center mt-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${style.badge}`}
            >
              {client.badge}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 active:scale-95 flex items-center justify-center flex-shrink-0 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto min-h-0 border-t border-slate-100">
          {/* 2. LE PROBLÈME */}
          <section className="px-5 py-4 border-b border-slate-100">
            <p className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Ce qu&apos;il a demandé
            </p>
            <p className="text-sm font-normal text-slate-700 leading-relaxed">
              {client.resume}
            </p>
          </section>

          {/* 3. INFOS PRATIQUES */}
          <section className="px-5 py-4 border-b border-slate-100">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <a
                href={`tel:${client.telephone}`}
                className="flex items-center gap-3 px-4 min-h-[52px] border-b border-slate-100 active:bg-slate-50 transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[10px] font-medium text-slate-400">
                    Téléphone
                  </span>
                  <span className="block text-sm font-medium text-slate-900 truncate">
                    {client.telephoneAffiche}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-slate-900 flex-shrink-0">
                  Appeler
                </span>
              </a>

              <div className="flex items-center gap-3 px-4 min-h-[52px] border-b border-slate-100">
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[10px] font-medium text-slate-400">
                    Adresse
                  </span>
                  <span className="block text-sm font-medium text-slate-900 leading-snug">
                    {client.adresse}
                  </span>
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(client.adresse)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 min-h-[44px] inline-flex items-center px-2 -mr-2 text-[11px] font-semibold text-slate-900 underline underline-offset-4 decoration-slate-300"
                >
                  Itinéraire
                </a>
              </div>

              <div className="flex items-center gap-3 px-4 min-h-[52px]">
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[10px] font-medium text-slate-400">
                    Heure de l&apos;appel
                  </span>
                  <span className="block text-sm font-medium text-slate-900">
                    {client.moment} · {client.heure}
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* 4. TRANSPARENCE */}
          <section className="px-5 py-4">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <Bot className="h-4 w-4 flex-shrink-0 text-slate-700" />
                Ce que l&apos;assistant a déjà dit
              </p>
              <ul className="space-y-2">
                {client.echanges.map((echange) => (
                  <li
                    key={echange}
                    className="flex items-start gap-2 text-sm font-normal text-slate-700 leading-relaxed"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0 mt-2" />
                    <span className="min-w-0">{echange}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. LIEN CONVERSATION */}
            <Link
              href={`/messages?client=${client.conversationId}`}
              onClick={onClose}
              className="mt-2 inline-flex items-center gap-1 min-h-[44px] text-xs font-medium text-slate-500 active:opacity-60 transition-opacity"
            >
              Voir la conversation SMS complète
              <ChevronRight className="w-4 h-4" />
            </Link>
          </section>
        </div>

        {/* 6. ACTIONS FIXES */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-4 flex flex-col gap-2 flex-shrink-0">
          <a
            href={`tel:${client.telephone}`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-[15px] font-bold text-white shadow-lg shadow-slate-900/20 active:scale-[0.99] transition-all hover:bg-slate-800"
          >
            <Phone className="w-5 h-5" /> Appeler
          </a>
          <button
            onClick={() => onTreated?.(client)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-900 active:scale-[0.99] transition-transform"
          >
            <CheckCircle2 className="w-5 h-5" /> Marquer comme traité
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientSheet;
