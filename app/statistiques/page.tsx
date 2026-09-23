"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Phone, Calendar, Euro, Clock } from "lucide-react";

const kpis = [
  { icon: Phone, value: "247", label: "Appels traités", delta: "+18% vs mois dernier" },
  { icon: Calendar, value: "89", label: "Rendez-vous pris", delta: "+24% vs mois dernier" },
  { icon: Euro, value: "18 450 €", label: "Estimation gagnée", delta: "+31% vs mois dernier" },
  { icon: Clock, value: "2min 30", label: "Durée moyenne", delta: "-15s vs mois dernier" },
];

const dailyCalls = [
  2, 5, 3, 7, 8, 12, 4, 6, 9, 11, 5, 8, 10, 12, 7, 6, 9, 14, 8, 5, 3, 7, 10, 12, 6, 8, 11, 9, 5, 4,
];

const typesDemandes = [
  { label: "Débouchage", pct: 38, color: "bg-primary" },
  { label: "Installation", pct: 27, color: "bg-success" },
  { label: "Réparation", pct: 22, color: "bg-warning" },
  { label: "Devis", pct: 13, color: "bg-gray-400" },
];

const performance = [
  { label: "Taux de décrochage", value: "100%", color: "text-success" },
  { label: "Demandes qualifiées", value: "87%", color: "text-success" },
  { label: "RDV confirmés", value: "72%", color: "text-warning" },
  { label: "Transferts humains", value: "6%", color: "text-text-secondary" },
];

const topClients = [
  { name: "Mme Dupont", city: "Lyon 3e", rdv: 8, initial: "D" },
  { name: "M. Martin", city: "Villeurbanne", rdv: 6, initial: "M" },
  { name: "Mme Rousseau", city: "Lyon 7e", rdv: 5, initial: "R" },
  { name: "M. Bernard", city: "Lyon 6e", rdv: 4, initial: "B" },
  { name: "Mme Moreau", city: "Lyon 8e", rdv: 3, initial: "M" },
];

const periods = ["7 derniers jours", "30 derniers jours", "3 derniers mois", "Cette année"];

export default function StatistiquesPage() {
  return (
    <AppLayout>
      <div className="w-full">
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Statistiques</h1>
            <p className="text-sm text-text-secondary mt-1">L'activité de Nova sur les 30 derniers jours.</p>
          </div>
          <select className="px-3 py-2 border border-border rounded-lg text-sm bg-white text-text-primary focus:border-primary focus:outline-none min-h-[44px] flex-shrink-0">
            {periods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* KPIs PRINCIPAUX */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {kpis.map((k, i) => (
            <Card key={i} className="p-6 relative">
              <k.icon className="absolute top-4 right-4 w-6 h-6 text-text-secondary/30" />
              <p className="text-3xl md:text-4xl font-bold text-primary">{k.value}</p>
              <p className="text-sm text-text-secondary mt-1">{k.label}</p>
              <p className="text-xs text-text-secondary/70 mt-2">{k.delta}</p>
            </Card>
          ))}
        </div>

        {/* GRAPHIQUE PRINCIPAL — APPELS PAR JOUR */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold text-text-primary">Appels traités par jour</h2>
            </div>
            <Badge variant="info">30 jours</Badge>
          </div>
          <p className="text-xs text-text-secondary mb-4">Moyenne : 8 appels par jour</p>
          <div className="h-48 flex items-end gap-1">
            {dailyCalls.map((val, i) => {
              const isLastThree = i >= dailyCalls.length - 3;
              const maxVal = Math.max(...dailyCalls);
              const height = (val / maxVal) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex items-end"
                  style={{ height: "100%" }}
                >
                  <div
                    className={`rounded-t-sm w-full transition-opacity hover:opacity-80 ${isLastThree ? "bg-primary" : "bg-primary/60"}`}
                    style={{ height: `${height}%` }}
                    title={`${val} appels`}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* DEUX GRAPHIQUES SECONDAIRES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* GRAPHE 1 — RÉPARTITION PAR TYPE */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold text-text-primary">Types de demandes</h2>
            </div>
            <div className="space-y-4 mt-4">
              {typesDemandes.map((t, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-primary">{t.label}</span>
                    <span className="text-text-secondary font-medium">{t.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={t.color}
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* GRAPHE 2 — PERFORMANCE DE NOVA */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold text-text-primary">Performance de Nova</h2>
            </div>
            <div className="space-y-0 mt-4">
              {performance.map((p, i) => (
                <div
                  key={i}
                  className={`flex justify-between py-3 ${i < performance.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span className="text-sm text-text-primary">{p.label}</span>
                  <span className={`font-semibold ${p.color}`}>{p.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* TOP CLIENTS */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold text-text-primary">Top 5 clients</h2>
            </div>
            <Badge variant="info">Ce mois</Badge>
          </div>
          <div className="space-y-0">
            {topClients.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className="w-6 text-center font-bold text-text-secondary">{i + 1}</div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                  {c.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                  <p className="text-xs text-text-secondary">{c.city}</p>
                </div>
                <div className="hidden md:flex flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">{c.rdv}</span>
                  <span className="text-xs text-text-secondary ml-1">RDV</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}