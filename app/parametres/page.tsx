"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, ChevronRight, LogOut } from "lucide-react";

const notifications = [
  { id: "rdv", title: "Nouveau rendez-vous pris", desc: "Recevoir une alerte quand Nova prend un RDV", defaultOn: true },
  { id: "urgence", title: "Demande urgente", desc: "Alerte immédiate si Nova détecte une urgence", defaultOn: true },
  { id: "besoin", title: "Nova a besoin de vous", desc: "Quand Nova n'arrive pas à conclure une demande", defaultOn: true },
  { id: "resume", title: "Résumé quotidien", desc: "Un résumé chaque soir à 19h", defaultOn: true },
  { id: "news", title: "Nouveautés Velianos", desc: "Recevoir les actualités produit", defaultOn: false },
];

const aideItems = [
  "Centre d'aide",
  "Conditions d'utilisation",
  "Politique de confidentialité",
  "Nous contacter",
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${checked ? "bg-primary" : "bg-gray-300"}`}
      aria-checked={checked}
      aria-label={checked ? "Activé" : "Désactivé"}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function ParametresPage() {
  const [notifStates, setNotifStates] = useState(() => {
    const initial: Record<string, boolean> = {};
    notifications.forEach(n => { initial[n.id] = n.defaultOn; });
    return initial;
  });

  const toggleNotif = (id: string) => {
    setNotifStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppLayout>
      <div className="w-full">
        {/* EN-TÊTE */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Paramètres</h1>
          <p className="text-sm text-text-secondary mt-1">Gérez votre compte et vos préférences.</p>
        </div>

        {/* SECTION 1 — MON COMPTE */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Mon compte</h2>
          </div>
          <div className="space-y-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Nom complet</p>
                <p className="text-sm text-text-secondary mt-0.5">Karim Benali</p>
              </div>
              <Button variant="ghost" size="sm" className="min-h-[44px] mt-2 md:mt-0 flex-shrink-0">Modifier</Button>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Email</p>
                <p className="text-sm text-text-secondary mt-0.5">karim@plomberie-karim.fr</p>
              </div>
              <Button variant="ghost" size="sm" className="min-h-[44px] mt-2 md:mt-0 flex-shrink-0">Modifier</Button>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Mot de passe</p>
                <p className="text-sm text-text-secondary mt-0.5">Dernière modification il y a 3 mois</p>
              </div>
              <Button variant="ghost" size="sm" className="min-h-[44px] mt-2 md:mt-0 flex-shrink-0">Modifier</Button>
            </div>
          </div>
        </Card>

        {/* SECTION 2 — MON ENTREPRISE */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Mon entreprise</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Vos informations d'entreprise sont utilisées par Nova pour répondre à vos clients.</p>
          <Button variant="ghost" size="sm" className="mt-4 min-h-[44px] flex items-center gap-2">
            Ouvrir les paramètres de l'entreprise <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>

        {/* SECTION 3 — NOTIFICATIONS */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1 mb-4">Choisissez ce que vous voulez recevoir.</p>
          <div className="space-y-0">
            {notifications.map((n, i) => (
              <div key={n.id} className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{n.desc}</p>
                </div>
                <Toggle
                  checked={notifStates[n.id]}
                  onChange={() => toggleNotif(n.id)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 4 — MON ABONNEMENT */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Mon abonnement</h2>
          </div>
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <p className="text-base font-semibold text-primary">Plan Pro</p>
                <p className="text-xs text-text-secondary mt-1">79 € / mois · 300 minutes incluses</p>
              </div>
              <Badge variant="success" className="flex-shrink-0">Actif</Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">Minutes utilisées</span>
              <span className="font-semibold">147 / 300</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "49%" }} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="primary" className="min-h-[44px] flex-1">Changer de plan</Button>
            <Button variant="ghost" className="min-h-[44px] flex-shrink-0">Voir mes factures</Button>
          </div>
        </Card>

        {/* SECTION 5 — AIDE ET CONFIDENTIALITÉ */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Aide et confidentialité</h2>
          </div>
          <div className="space-y-0">
            {aideItems.map((item, i) => (
              <div key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer hover:bg-gray-50 -mx-4 px-4 rounded">
                <span className="text-sm font-medium text-text-primary">{item}</span>
                <ChevronRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
              </div>
            ))}
          </div>
        </Card>

        {/* BOUTON DE DÉCONNEXION */}
        <div className="mt-6">
          <Button variant="danger" className="w-full min-h-[44px] flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Se déconnecter
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}