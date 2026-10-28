"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Map,
  MapPin,
  Phone,
  Share2,
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
  const [partageConfirme, setPartageConfirme] = useState(false);

  const urgenceBadge =
    client.urgence === "urgent"
      ? "Urgent"
      : client.urgence === "a_verifier"
        ? "À vérifier"
        : null;
  const badgeSpecifique =
    client.urgence === "a_verifier" ? null : client.badge;

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

  const partagerFiche = async () => {
    const texte = [
      `Fiche client — ${client.nom}`,
      client.probleme,
      client.telephoneAffiche,
      client.adresse,
      client.resume,
    ].join("\n");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `Fiche ${client.nom}`,
          text: texte,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(texte);
        setPartageConfirme(true);
        window.setTimeout(() => setPartageConfirme(false), 2000);
      }
    } catch {
      // Partage annulé ou indisponible sur cet appareil.
    }
  };

  const lienItineraire = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(client.adresse)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-[2px] md:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Fiche de ${client.nom}`}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-[sheetUp_.25s_ease-out] md:max-h-[88vh] md:rounded-xl"
      >
        {/* POIGNÉE */}
        <div className="flex flex-shrink-0 justify-center pb-1 pt-2.5 md:hidden">
          <span className="h-1 w-9 rounded-full bg-slate-200" />
        </div>

        {/* EN-TÊTE */}
        <header className="flex flex-shrink-0 items-start justify-between gap-3 px-5 py-3 md:py-5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">
              {client.nom}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {urgenceBadge && (
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
                >
                  {urgenceBadge}
                </span>
              )}
              {badgeSpecifique && (
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  {badgeSpecifique}
                </span>
              )}
              <span className="text-[11px] font-normal text-slate-400">
                {client.telephoneAffiche}
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5">
            {onTreated && (
              <button
                onClick={() => onTreated(client)}
                aria-label="Marquer comme traité"
                className="inline-flex h-11 items-center gap-1 rounded-full bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition-all active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                Traité
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100">
          {/* CE QU'IL A DEMANDÉ */}
          <section className="border-b border-slate-100 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Ce qu&apos;il a demandé
            </p>
            <p className="mt-1 text-lg font-semibold leading-snug text-slate-900">
              {client.probleme}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-normal leading-relaxed text-slate-600">
              {client.resume}
            </p>
          </section>

          {/* INFOS PRATIQUES */}
          <section className="border-b border-slate-100 px-5 py-4">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex min-h-[52px] items-center gap-3 border-b border-slate-100 px-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-medium text-slate-400">
                    Téléphone
                  </span>
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {client.telephoneAffiche}
                  </span>
                </span>
              </div>

              <div className="flex min-h-[52px] items-center gap-3 border-b border-slate-100 px-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-medium text-slate-400">
                    Adresse
                  </span>
                  <span className="block text-sm font-medium leading-snug text-slate-900">
                    {client.adresse}
                  </span>
                </span>
              </div>

              <div className="flex min-h-[52px] items-center gap-3 px-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Clock className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
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

          {/* TRANSPARENCE */}
          <section className="px-5 py-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <Bot className="h-4 w-4 flex-shrink-0 text-slate-700" />
                Ce que l&apos;assistant a déjà dit
              </p>
              <ul className="space-y-2">
                {client.echanges.map((echange) => (
                  <li
                    key={echange}
                    className="flex items-start gap-2 text-sm font-normal leading-relaxed text-slate-700"
                  >
                    <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                    <span className="min-w-0">{echange}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/messages?client=${client.conversationId}`}
              onClick={onClose}
              className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-xs font-medium text-slate-500 transition-opacity active:opacity-60"
            >
              Voir la conversation SMS complète
              <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        </div>

        {/* ACTIONS RAPIDES */}
        <div className="flex flex-shrink-0 flex-col border-t border-slate-200 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:pb-4">
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${client.telephone}`}
              className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95"
            >
              <Phone className="h-5 w-5" />
              <span className="text-[11px] font-semibold">Appeler</span>
            </a>

            <a
              href={lienItineraire}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 shadow-sm transition-all hover:bg-slate-200 active:scale-95"
            >
              <Map className="h-5 w-5" />
              <span className="text-[11px] font-semibold">Itinéraire</span>
            </a>

            <button
              type="button"
              onClick={partagerFiche}
              aria-label="Partager la fiche client"
              className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 shadow-sm transition-all hover:bg-slate-200 active:scale-95"
            >
              <Share2 className="h-5 w-5" />
              <span className="text-[11px] font-semibold">
                {partageConfirme ? "Copié" : "Partager"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientSheet;
