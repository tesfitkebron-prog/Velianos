"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Calendar,
  ChevronRight,
  MessageSquare,
  Phone,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageError, PageSkeleton } from "@/components/ui/PageState";
import { createClient } from "@/lib/supabase/client";
import {
  chargerNotifications,
  marquerNotificationsLues,
  type NotificationApp,
} from "@/lib/notifications";
import { tempsRelatif } from "@/lib/clients";

const ICONES: Record<string, typeof Bell> = {
  appel: Phone,
  call: Phone,
  sms: MessageSquare,
  message: MessageSquare,
  rdv: Calendar,
  appointment: Calendar,
};

export default function NotificationsPage() {
  return (
    <AppLayout>
      <NotificationsContent />
    </AppLayout>
  );
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationApp[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const companyId = useRef<string | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    const resultat = await chargerNotifications();
    setNotifications(resultat.notifications);
    setErreur(resultat.erreur);
    setChargement(false);
    void marquerNotificationsLues();
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    let monte = true;
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!monte || !user) return;
      const { data } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      companyId.current = (data?.company_id as string | undefined) ?? null;
      if (!companyId.current) return;

      const canal = supabase
        .channel(`velianos-notifications-${companyId.current}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `company_id=eq.${companyId.current}`,
          },
          () => {
            if (minuteur.current) clearTimeout(minuteur.current);
            minuteur.current = setTimeout(() => void charger(), 450);
          },
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(canal);
      };
    };

    const promesse = init();
    return () => {
      monte = false;
      if (minuteur.current) clearTimeout(minuteur.current);
      void promesse.then((nettoyage) => nettoyage?.());
    };
  }, [charger]);

  if (chargement) {
    return (
      <div className="pt-5">
        <PageSkeleton lignes={4} />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="pt-5">
        <PageError message={erreur} onRetry={() => void charger()} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-5">
      <p className="animate-fade-up px-1 text-lg font-medium text-slate-600">
        Tout ce que votre assistant a fait pour vous.
      </p>

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Aucune notification"
          description="Les nouveaux appels, messages et rendez-vous apparaîtront ici."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification, index) => {
            const Icone = ICONES[notification.type] ?? Bell;
            const contenu = (
              <>
                <span
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
                    notification.lue
                      ? "bg-slate-100 text-slate-500"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <Icone className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-base font-extrabold text-slate-900">
                      {notification.titre}
                    </span>
                    {!notification.lue && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </span>
                  {notification.texte && (
                    <span className="mt-0.5 block text-base font-medium leading-snug text-slate-600">
                      {notification.texte}
                    </span>
                  )}
                  <span className="mt-1 block text-sm font-medium text-slate-400">
                    {tempsRelatif(notification.creeLe)}
                  </span>
                </span>
                {notification.lien && (
                  <ChevronRight
                    className="h-5 w-5 flex-shrink-0 text-slate-300"
                    aria-hidden="true"
                  />
                )}
              </>
            );

            const classes =
              "flex w-full animate-fade-up items-start gap-3.5 rounded-[24px] bg-white p-4 text-left shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-transform duration-200 active:scale-[0.98]";

            return notification.lien ? (
              <Link
                key={notification.id}
                href={notification.lien}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                className={classes}
              >
                {contenu}
              </Link>
            ) : (
              <div
                key={notification.id}
                style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                className={classes}
              >
                {contenu}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
