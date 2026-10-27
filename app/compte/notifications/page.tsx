"use client";

import { useEffect, useState } from "react";
import { Bell, MessageSquare, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSaveToast } from "@/components/ui/SaveToast";

const NOTIFICATIONS = [
  {
    id: "client",
    label: "Nouveau client récupéré",
    description: "Quand votre assistant récupère un appel manqué.",
    icone: Bell,
  },
  {
    id: "resume",
    label: "Résumé du soir (19h)",
    description: "Un récapitulatif de votre journée.",
    icone: MessageSquare,
  },
  {
    id: "urgence",
    label: "Alertes urgences",
    description: "Fuite, gaz ou chauffage : soyez prévenu tout de suite.",
    icone: Sparkles,
  },
] as const;

type CleNotification = (typeof NOTIFICATIONS)[number]["id"];

const CLE = "velianos-notifications";

const etatParDefaut: Record<CleNotification, boolean> = {
  client: true,
  resume: true,
  urgence: true,
};

export default function NotificationsPage() {
  return (
    <AppLayout>
      <ContenuNotifications />
    </AppLayout>
  );
}

function ContenuNotifications() {
  const { show, toast } = useSaveToast();
  const [notifs, setNotifs] = useState(etatParDefaut);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE);
      if (brut) {
        const enregistre = JSON.parse(brut) as Partial<
          Record<CleNotification, boolean>
        >;
        setNotifs((etat) => ({ ...etat, ...enregistre }));
      }
    } catch {}
  }, []);

  const basculer = (id: CleNotification) => {
    setNotifs((etat) => {
      const suivant = { ...etat, [id]: !etat[id] };
      try {
        window.localStorage.setItem(CLE, JSON.stringify(suivant));
      } catch {}
      return suivant;
    });
    show();
  };

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-4 max-w-2xl md:mx-auto">
      <p className="px-1 text-xs font-normal leading-relaxed text-slate-500">
        Choisissez les nouvelles que vous voulez recevoir. Vos réglages sont
        enregistrés automatiquement.
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {NOTIFICATIONS.map((item) => {
          const Icone = item.icone;

          return (
            <div
              key={item.id}
              className="flex min-h-[64px] items-center gap-3 border-b border-slate-100 px-4 py-2 last:border-0"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
                <Icone className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[11px] font-normal leading-snug text-slate-500">
                  {item.description}
                </span>
              </span>
              <button
                onClick={() => basculer(item.id)}
                role="switch"
                aria-checked={notifs[item.id]}
                aria-label={item.label}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center transition-transform active:scale-95"
              >
                <span
                  className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                    notifs[item.id] ? "bg-slate-900" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      notifs[item.id] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <p className="px-1 text-xs font-normal leading-relaxed text-slate-500">
        Les alertes d&apos;urgence sont toujours envoyées en priorité.
      </p>

      {toast}
    </div>
  );
}
