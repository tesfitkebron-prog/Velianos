"use client";

import { Calendar, ChevronRight, MessageSquare, Phone } from "lucide-react";

export type TypeNotification = "appel" | "sms" | "rdv";
export type UrgenceNotification = "urgent" | "attention" | null;

type NotificationCardProps = {
  type: TypeNotification;
  nom: string;
  probleme: string;
  heure: string;
  telephone: string;
  urgence?: UrgenceNotification;
  onVoir: () => void;
};

const ICONES = {
  appel: Phone,
  sms: MessageSquare,
  rdv: Calendar,
};

const LIBELLES = {
  appel: "Appel manqué",
  sms: "SMS reçu",
  rdv: "Rendez-vous",
};

export function NotificationCard({
  type,
  nom,
  probleme,
  heure,
  telephone,
  urgence = null,
  onVoir,
}: NotificationCardProps) {
  const Icone = ICONES[type];
  const bordure =
    urgence === "urgent"
      ? "border-l-red-500"
      : urgence === "attention"
        ? "border-l-amber-400"
        : "border-l-slate-200";

  return (
    <article
      className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${bordure} shadow-sm p-4`}
    >
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center flex-shrink-0">
          <Icone className="w-5 h-5" strokeWidth={2} />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0F172A] truncate">
              {nom}
            </p>
            {urgence && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md flex-shrink-0 ${
                  urgence === "urgent"
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {urgence === "urgent" ? "🔥 Urgent" : "À vérifier"}
              </span>
            )}
          </div>
          <p className="text-[13px] font-medium text-slate-600 truncate mt-0.5">
            {probleme}
          </p>
          <p className="text-[11px] font-normal text-slate-400 mt-1">
            {LIBELLES[type]} · {heure}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3 md:max-w-md">
        <a
          href={`tel:${telephone}`}
          aria-label={`Appeler ${nom}`}
          className="flex-1 h-11 rounded-lg bg-[#10B981] text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-transform"
        >
          <Phone className="w-4 h-4" /> Appeler
        </a>
        <button
          onClick={onVoir}
          className="flex-1 h-11 rounded-lg bg-slate-100 text-[#0F172A] text-sm font-semibold flex items-center justify-center gap-1 active:scale-[0.99] transition-transform"
        >
          Voir
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </article>
  );
}

export default NotificationCard;
