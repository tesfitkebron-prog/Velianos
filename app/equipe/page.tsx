"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Info, MoreVertical, UserPlus, Mail, Phone } from "lucide-react";

const membres = [
  { nom: "Karim B.", email: "karim@plomberie-karim.fr", tel: "06 12 34 56 78", role: "Administrateur", statut: "Actif", avatarColor: "bg-primary" },
  { nom: "Sarah L.", email: "sarah@plomberie-karim.fr", tel: "06 23 45 67 89", role: "Employée", statut: "Actif", avatarColor: "bg-success" },
  { nom: "Antoine D.", email: "antoine@plomberie-karim.fr", tel: "06 34 56 78 90", role: "Employé", statut: "Actif", avatarColor: "bg-warning" },
];

const stats = [
  { value: "3", label: "Membres actifs" },
  { value: "1", label: "Administrateur" },
  { value: "2", label: "Employés" },
  { value: "3", label: "RDV aujourd'hui" },
];

const roleVariant = { "Administrateur": "info", "Employé": "neutral", "Employée": "neutral" };

export default function EquipePage() {
  return (
    <AppLayout>
      <div className="w-full">
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Équipe</h1>
            <p className="text-sm text-text-secondary mt-1">Gérez les membres de votre équipe et leurs accès.</p>
          </div>
          <Button variant="primary" className="min-h-[44px] flex items-center gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" /> Ajouter un membre
          </Button>
        </div>

        {/* BANDEAU D'INFO */}
        <Card className="p-5 mt-6 bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary">Comment ça marche ?</p>
              <p className="text-sm text-primary/80 mt-1">Votre équipe peut se connecter à Velianos avec son propre compte. Chaque membre voit uniquement ses rendez-vous et ses clients assignés.</p>
            </div>
          </div>
        </Card>

        {/* STATISTIQUES ÉQUIPE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {stats.map((s, i) => (
            <Card key={i} className="p-5 text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-text-secondary mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* LISTE DES MEMBRES */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold text-text-primary">Membres de l'équipe</h2>
            </div>
            <Badge variant="info">3</Badge>
          </div>
          <div className="space-y-0">
            {membres.map((m, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                <div className={`w-12 h-12 rounded-full ${m.avatarColor} flex items-center justify-center flex-shrink-0 text-white font-semibold`}>
                  {m.nom.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-text-primary truncate">{m.nom}</span>
                    <Badge variant={roleVariant[m.role]} className="text-[10px] flex-shrink-0">{m.role}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5">{m.email}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{m.tel}</p>
                </div>
                <div className="hidden md:block text-right flex-shrink-0 w-32">
                  <p className="text-xs text-text-secondary">Statut</p>
                  <p className="flex items-center gap-1 mt-0.5 text-sm font-medium text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {m.statut}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="min-h-[44px] flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* INVITER UN MEMBRE */}
        <Card className="p-6 mt-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-base font-semibold text-text-primary">Ajouter un nouveau membre</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Un lien d'invitation personnel sera envoyé. La personne pourra créer son compte en 1 minute.</p>
          <Button variant="primary" className="mt-4 min-h-[44px] flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Envoyer une invitation
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}