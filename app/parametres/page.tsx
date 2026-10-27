"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  Globe,
  Info,
  Lock,
  LogOut,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/client";
import { useAppToast } from "@/components/ui/AppToast";

const NOTIFICATIONS = [
  {
    id: "client",
    label: "Nouveau client récupéré",
    icone: Bell,
    couleur: "bg-orange-100 text-orange-600",
  },
  {
    id: "resume",
    label: "Résumé du soir (19h)",
    icone: MessageSquare,
    couleur: "bg-blue-100 text-blue-600",
  },
  {
    id: "urgence",
    label: "Alertes urgences",
    icone: Sparkles,
    couleur: "bg-red-100 text-red-600",
  },
] as const;

export default function ParametresPage() {
  return (
    <AppLayout>
      <ContenuParametres />
    </AppLayout>
  );
}

function ContenuParametres() {
  const router = useRouter();
  const { show, toast } = useAppToast();
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    client: true,
    resume: true,
    urgence: true,
  });
  const [deconnexion, setDeconnexion] = useState(false);

  const basculer = (id: string) => {
    setNotifs((etat) => ({ ...etat, [id]: !etat[id] }));
    show("Préférence enregistrée");
  };

  const seDeconnecter = async () => {
    setDeconnexion(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // On redirige quand même vers l'écran de connexion.
    }
    router.push("/login");
    router.refresh();
  };

  const bientot = () => show("Bientôt disponible");

  return (
    <div className="px-4 py-4 md:p-0 space-y-5">
      {/* PROFIL */}
      <Link
        href="/entreprise"
        className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform shadow-sm"
      >
        <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
          KM
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 truncate">Karim Martin</p>
          <p className="text-sm text-slate-500 truncate">
            karim@plomberie-martin.fr
          </p>
          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Plan Pro
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
      </Link>

      {/* MON COMPTE */}
      <section>
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 mb-2">
          Mon Compte
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
          <Ligne
            icone={User}
            couleur="bg-blue-100 text-blue-600"
            label="Informations personnelles"
            valeur="Karim Martin"
            onClick={bientot}
          />
          <Ligne
            icone={Building2}
            couleur="bg-violet-100 text-violet-600"
            label="Mon entreprise"
            href="/entreprise"
          />
          <Ligne
            icone={Lock}
            couleur="bg-slate-100 text-slate-600"
            label="Mot de passe"
            valeur="Modifier"
            onClick={bientot}
          />
          <Ligne
            icone={CreditCard}
            couleur="bg-emerald-100 text-emerald-600"
            label="Mon abonnement"
            valeur="Pro · 49 €/mois"
            onClick={bientot}
          />
        </div>
      </section>

      {/* APPLICATION */}
      <section>
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 mb-2">
          Application
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
          {NOTIFICATIONS.map((item) => {
            const Icone = item.icone;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 min-h-[52px]"
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.couleur}`}
                >
                  <Icone className="w-4 h-4" />
                </span>
                <span className="flex-1 text-sm text-slate-700">
                  {item.label}
                </span>
                <button
                  onClick={() => basculer(item.id)}
                  role="switch"
                  aria-checked={notifs[item.id]}
                  aria-label={item.label}
                  className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 active:scale-95 ${
                    notifs[item.id] ? "bg-[#00D26A]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      notifs[item.id] ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}

          <Ligne
            icone={Globe}
            couleur="bg-cyan-100 text-cyan-600"
            label="Langue"
            valeur="Français"
            onClick={bientot}
          />
          <Ligne
            icone={Info}
            couleur="bg-slate-100 text-slate-600"
            label="Version"
            valeur="1.0.0"
            chevron={false}
          />
        </div>
      </section>

      {/* DECONNEXION */}
      <div className="pt-1">
        <button
          onClick={seDeconnecter}
          disabled={deconnexion}
          className="w-full bg-white border border-slate-200 hover:bg-red-50 active:bg-red-50 active:scale-[0.99] text-red-600 font-semibold h-13 min-h-[52px] rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          {deconnexion ? "Déconnexion…" : "Se déconnecter"}
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-3">
          Velianos v1.0.0 · Fait pour les artisans
        </p>
      </div>

      {toast}
    </div>
  );
}

type LigneProps = {
  icone: typeof User;
  couleur: string;
  label: string;
  valeur?: string;
  href?: string;
  chevron?: boolean;
  onClick?: () => void;
};

function Ligne({
  icone: Icone,
  couleur,
  label,
  valeur,
  href,
  chevron = true,
  onClick,
}: LigneProps) {
  const contenu = (
    <>
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${couleur}`}
      >
        <Icone className="w-4 h-4" />
      </span>
      <span className="flex-1 text-sm text-slate-700">{label}</span>
      {valeur && (
        <span className="text-sm text-slate-400 truncate max-w-[45%] text-right">
          {valeur}
        </span>
      )}
      {chevron && (
        <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3 min-h-[52px] hover:bg-slate-50 active:bg-slate-50 transition-colors"
      >
        {contenu}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 min-h-[52px] hover:bg-slate-50 active:bg-slate-50 transition-colors text-left"
    >
      {contenu}
    </button>
  );
}
