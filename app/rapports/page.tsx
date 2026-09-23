"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, Users, Euro, TrendingUp, FileText, Download, Mail } from "lucide-react";

const rapports = [
  { title: "Rapport d'activité", desc: "Vue d'ensemble des appels, RDV et chiffre d'affaires du mois.", icon: BarChart3, iconBg: "bg-primary/10", type: "PDF", period: "Septembre 2026" },
  { title: "Rapport clients", desc: "Liste complète de vos clients avec historique et coordonnées.", icon: Users, iconBg: "bg-success/10", type: "Excel", period: "247 clients" },
  { title: "Rapport financier", desc: "Estimation du chiffre d'affaires généré par Nova.", icon: Euro, iconBg: "bg-warning/10", type: "PDF", period: "18 450 €" },
  { title: "Performance de Nova", desc: "Taux de décrochage, qualification et confirmation des RDV.", icon: TrendingUp, iconBg: "bg-primary/10", type: "PDF", period: "30 derniers jours" },
];

const recents = [
  { title: "Rapport d'activité", subtitle: "Septembre 2026", time: "il y a 2 jours", type: "PDF" },
  { title: "Rapport clients", subtitle: "15 septembre 2026", time: "il y a 6 jours", type: "Excel" },
  { title: "Rapport financier", subtitle: "Septembre 2026", time: "il y a 8 jours", type: "PDF" },
  { title: "Performance Nova", subtitle: "Semaine 38", time: "il y a 10 jours", type: "PDF" },
  { title: "Rapport d'activité", subtitle: "Août 2026", time: "il y a 1 mois", type: "PDF" },
];

export default function RapportsPage() {
  return (
    <AppLayout>
      <div className="w-full">
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Rapports</h1>
            <p className="text-sm text-text-secondary mt-1">Analysez et exportez l'activité de votre entreprise.</p>
          </div>
          <Button variant="primary" className="min-h-[44px] flex items-center gap-2 flex-shrink-0">
            <Download className="w-4 h-4" /> Exporter tout
          </Button>
        </div>

        {/* CARTES DE RAPPORTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {rapports.map((r, i) => (
            <Card key={i} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative">
                <div className={`w-12 h-12 rounded-lg ${r.iconBg} flex items-center justify-center`}>
                  <r.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-text-primary mt-3">{r.title}</h3>
              <p className="text-sm text-text-secondary mt-1">{r.desc}</p>
              <div className="flex items-center justify-between mt-4">
                <Badge variant="neutral">{r.type}</Badge>
                <span className="text-xs text-text-secondary">{r.period}</span>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full min-h-[44px]">
                <Download className="w-4 h-4 mr-2" /> Télécharger
              </Button>
            </Card>
          ))}
        </div>

        {/* RAPPORTS RÉCENTS */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold text-text-primary">Rapports récents</h2>
            </div>
            <Badge variant="info">5</Badge>
          </div>
          <div className="space-y-0">
            {recents.map((r, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                <FileText className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{r.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{r.subtitle} • {r.time}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={r.type === "PDF" ? "danger" : "success"} className="text-[10px]">{r.type}</Badge>
                  <Button variant="ghost" size="sm" className="min-h-[44px] p-2"><Download className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* EXPORTS AUTOMATIQUES */}
        <Card className="p-6 mt-6 bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-primary">Recevez vos rapports par email</h3>
              <p className="text-sm text-primary/80 mt-1">Recevez automatiquement un rapport d'activité chaque lundi matin.</p>
              <Button variant="primary" size="sm" className="mt-3 min-h-[44px]">Activer l'envoi automatique</Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}