"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Lock,
  LogOut,
  MessageSquare,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { createClient } from "@/lib/supabase/client";
import { loadWorkspaceProfile } from "@/lib/workspace";
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

type Feuille = { titre: string; texte: string } | null;

export default function ComptePage() {
  return (
    <AppLayout>
      <ContenuCompte />
    </AppLayout>
  );
}

function ContenuCompte() {
  const router = useRouter();
  const { show, toast } = useAppToast();
  const [notificationsOuvertes, setNotificationsOuvertes] = useState(false);
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    client: true,
    resume: true,
    urgence: true,
  });
  const [deconnexion, setDeconnexion] = useState(false);
  const [feuille, setFeuille] = useState<Feuille>(null);
  const [profil, setProfil] = useState({
    nom: "Karim Martin",
    email: "karim@plomberie-martin.fr",
    initiales: "KM",
    entreprise: "Plomberie Martin",
  });

  useEffect(() => {
    let monte = true;
    const charger = async () => {
      const donnees = await loadWorkspaceProfile();
      if (!monte) return;
      const initiales =
        donnees.fullName
          .split(" ")
          .filter(Boolean)
          .map((partie) => partie.charAt(0))
          .join("")
          .slice(0, 2)
          .toUpperCase() || "V";
      setProfil({
        nom: donnees.fullName || "Utilisateur",
        email: donnees.email || "—",
        initiales,
        entreprise: donnees.companyName || "Mon entreprise",
      });
    };
    void charger();
    return () => {
      monte = false;
    };
  }, []);

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

  return (
    <div className="px-4 py-4 md:p-0 space-y-5">
      {/* PROFIL */}
      <button
        onClick={() =>
          setFeuille({
            titre: "Mon profil",
            texte: `${profil.nom}\n${profil.email}\n\nVotre profil est relié à ${profil.entreprise}. Pour modifier vos informations, rendez-vous dans « Mon entreprise ».`,
          })
        }
        className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform shadow-sm text-left"
      >
        <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
          {profil.initiales}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 truncate">{profil.nom}</p>
          <p className="text-sm text-slate-500 truncate">{profil.email}</p>
          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Plan Pro
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
      </button>

      {/* MON COMPTE */}
      <section>
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 mb-2">
          Mon Compte
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
          <Ligne
            icone={User}
            couleur="bg-blue-100 text-blue-600"
            label="Mon profil"
            valeur={profil.nom}
            onClick={() =>
              setFeuille({
                titre: "Mon profil",
                texte: `${profil.nom}\n${profil.email}\n\nVotre compte est actif sur ${profil.entreprise}.`,
              })
            }
          />
          <Ligne
            icone={Building2}
            couleur="bg-violet-100 text-violet-600"
            label="Mon entreprise"
            valeur={profil.entreprise}
            href="/entreprise"
          />
          <Ligne
            icone={Bell}
            couleur="bg-orange-100 text-orange-600"
            label="Notifications"
            chevron={!notificationsOuvertes}
            chevronBas={notificationsOuvertes}
            onClick={() => setNotificationsOuvertes((ouvert) => !ouvert)}
          />

          {notificationsOuvertes && (
            <div className="bg-slate-50/60 divide-y divide-slate-100">
              {NOTIFICATIONS.map((item) => {
                const Icone = item.icone;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 pl-14 pr-4 py-3 min-h-[52px]"
                  >
                    <Icone className={`w-4 h-4 flex-shrink-0 ${item.couleur.split(" ")[1]}`} />
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
                          notifs[item.id]
                            ? "translate-x-[22px]"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* AIDE ET LÉGAL */}
      <section>
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 mb-2">
          Aide &amp; légal
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
          <Ligne
            icone={Lock}
            couleur="bg-slate-100 text-slate-600"
            label="Confidentialité"
            onClick={() =>
              setFeuille({
                titre: "Confidentialité",
                texte:
                  "Vos données clients sont stockées de façon sécurisée et ne sont jamais revendues.\n\nLes enregistrements d'appels sont conservés 90 jours, puis supprimés automatiquement.\n\nVous pouvez demander la suppression complète de votre compte à tout moment.",
              })
            }
          />
          <Ligne
            icone={FileText}
            couleur="bg-indigo-100 text-indigo-600"
            label="Conditions d'utilisation"
            onClick={() =>
              setFeuille({
                titre: "Conditions d'utilisation",
                texte:
                  "Velianos est un assistant téléphonique destiné aux artisans.\n\nL'abonnement Pro est sans engagement, résiliable à tout moment depuis votre compte.\n\nL'assistant qualifie les demandes mais ne remplace pas votre intervention.",
              })
            }
          />
          <Ligne
            icone={HelpCircle}
            couleur="bg-cyan-100 text-cyan-600"
            label="Aide"
            onClick={() =>
              setFeuille({
                titre: "Aide",
                texte:
                  "Besoin d'un coup de main ?\n\nÉcrivez-nous à support@velianos.fr, nous répondons sous 24 h ouvrées.\n\nVous pouvez aussi demander directement à votre assistant depuis l'onglet Assistant.",
              })
            }
          />
        </div>
      </section>

      {/* ABONNEMENT */}
      <Link
        href="/entreprise"
        className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 min-h-[52px] shadow-sm active:bg-slate-50 transition-colors"
      >
        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-4 h-4" />
        </span>
        <span className="flex-1 text-sm text-slate-700">Mon abonnement</span>
        <span className="text-sm text-slate-400">Pro · 49 €/mois</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </Link>

      {/* DECONNEXION */}
      <div>
        <button
          onClick={seDeconnecter}
          disabled={deconnexion}
          className="w-full bg-white border border-slate-200 hover:bg-red-50 active:bg-red-50 active:scale-[0.99] text-red-600 font-semibold min-h-[52px] rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          {deconnexion ? "Déconnexion…" : "Se déconnecter"}
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-3">
          Velianos v1.0.0 · Fait pour les artisans
        </p>
      </div>

      {/* FEUILLE D'INFORMATION */}
      {feuille && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setFeuille(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[85dvh] flex flex-col animate-[sheetUp_.25s_ease-out]"
          >
            <div className="md:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0">
              <span className="w-10 h-1 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">
                {feuille.titre}
              </h2>
              <button
                onClick={() => setFeuille(null)}
                aria-label="Fermer"
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="px-5 pb-6 text-sm leading-relaxed text-slate-600 whitespace-pre-line overflow-y-auto">
              {feuille.texte}
            </p>
          </div>
        </div>
      )}

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
  chevronBas?: boolean;
  onClick?: () => void;
};

function Ligne({
  icone: Icone,
  couleur,
  label,
  valeur,
  href,
  chevron = true,
  chevronBas = false,
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
        <ChevronRight
          className={`w-4 h-4 text-slate-300 flex-shrink-0 transition-transform ${
            chevronBas ? "rotate-90" : ""
          }`}
        />
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
