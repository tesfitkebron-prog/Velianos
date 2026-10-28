"use client";

import { useEffect, useState } from "react";
import { Bell, MessageSquare, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toggle } from "@/components/ui/Toggle";

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
  const [notifs, setNotifs] = useState(etatParDefaut);
  const [enregistre, setEnregistre] = useState(false);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE);
      if (brut) {
        const sauvegarde = JSON.parse(brut) as Partial<
          Record<CleNotification, boolean>
        >;
        setNotifs((etat) => ({ ...etat, ...sauvegarde }));
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
    setEnregistre(true);
    window.setTimeout(() => setEnregistre(false), 1800);
  };

  return (
    <div className="space-y-5 pt-5">
      <p className="px-2 text-base font-medium leading-relaxed text-slate-600">
        Choisissez les nouvelles que vous voulez recevoir. Vos réglages sont
        enregistrés automatiquement.
      </p>

      <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        {NOTIFICATIONS.map((item) => {
          const Icone = item.icone;
          return (
            <div
              key={item.id}
              className="flex min-h-[76px] items-center gap-3.5 border-b border-slate-100 px-4 py-3 last:border-0"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
                <Icone className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-slate-900">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-sm font-medium leading-snug text-slate-500">
                  {item.description}
                </span>
              </span>
              <Toggle
                actif={notifs[item.id]}
                onClick={() => basculer(item.id)}
                label={item.label}
              />
            </div>
          );
        })}
      </div>

      <p className="px-2 text-sm font-medium leading-relaxed text-slate-500">
        Les alertes d&apos;urgence sont toujours envoyées en priorité.
      </p>

      {enregistre && (
        <p className="text-center text-base font-semibold text-emerald-600">
          Réglages enregistrés.
        </p>
      )}
    </div>
  );
}
