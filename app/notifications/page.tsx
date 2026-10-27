"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAssistant } from "@/components/layout/AssistantProvider";
import { ClientSheet } from "@/components/clients/ClientSheet";
import {
  NotificationCard,
  type TypeNotification,
  type UrgenceNotification,
} from "@/components/ui/NotificationCard";
import { trouverClient, type ClientFiche } from "@/lib/clients";

type Notification = {
  id: string;
  type: TypeNotification;
  nom: string;
  probleme: string;
  heure: string;
  telephone: string;
  urgence: UrgenceNotification;
};

const NOTIFICATIONS_INITIALES: Notification[] = [
  {
    id: "1",
    type: "appel",
    nom: "M. Dupont",
    probleme: "Fuite sous évier",
    heure: "il y a 5 min",
    telephone: "0612345678",
    urgence: "urgent",
  },
  {
    id: "2",
    type: "sms",
    nom: "Mme Martin",
    probleme: "Chauffe-eau en panne",
    heure: "il y a 2 h",
    telephone: "0698765432",
    urgence: "attention",
  },
  {
    id: "3",
    type: "rdv",
    nom: "M. Bernard",
    probleme: "Demande de devis",
    heure: "hier",
    telephone: "0711223344",
    urgence: null,
  },
];

export default function NotificationsPage() {
  return (
    <AppLayout>
      <NotificationsContent />
    </AppLayout>
  );
}

function NotificationsContent() {
  const { actif, notifier } = useAssistant();
  const [notifications, setNotifications] = useState<Notification[]>(
    NOTIFICATIONS_INITIALES,
  );
  const [clientOuvert, setClientOuvert] = useState<ClientFiche | null>(null);

  const marquerTraite = (client: ClientFiche) => {
    const notification = notifications.find((item) => item.id === client.id);
    setNotifications((precedent) =>
      precedent.filter((item) => item.id !== client.id),
    );
    setClientOuvert(null);

    if (notification) {
      notifier(`${client.nom} marqué comme traité.`, () =>
        setNotifications((precedent) =>
          [...precedent, notification].sort((a, b) =>
            a.id.localeCompare(b.id),
          ),
        ),
      );
    }
  };

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-normal text-slate-500">
          {notifications.length} notification
          {notifications.length > 1 ? "s" : ""} à consulter
        </p>
        <span
          className={`text-[11px] font-medium rounded-md px-2 py-0.5 ${
            actif
              ? "text-slate-600 bg-slate-100"
              : "text-orange-700 bg-orange-50"
          }`}
        >
          {actif ? "Assistant actif" : "En pause"}
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-slate-700" />
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Aucune notification.
          </p>
          <p className="text-xs font-normal text-slate-500 mt-1">
            Votre assistant gère. Vous serez prévenu si un client a besoin de
            vous.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              type={notification.type}
              nom={notification.nom}
              probleme={notification.probleme}
              heure={notification.heure}
              telephone={notification.telephone}
              urgence={notification.urgence}
              onVoir={() => setClientOuvert(trouverClient(notification.id))}
            />
          ))}
        </div>
      )}

      <p className="text-center text-[11px] font-normal text-slate-400 pt-1">
        Chaque alerte correspond à une action de votre assistant.
      </p>

      {clientOuvert && (
        <ClientSheet
          client={clientOuvert}
          onClose={() => setClientOuvert(null)}
          onTreated={marquerTraite}
        />
      )}
    </div>
  );
}
