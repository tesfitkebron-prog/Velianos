"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Download, ChevronRight } from "lucide-react";

const statusList = ["Tous les statuts", "Nouvelle", "En cours", "Qualifiée", "Rendez-vous pris", "À vérifier", "Terminée"];
const sortOptions = ["Plus récentes", "Plus anciennes"];
const statusVariant = { "Nouvelle": "info", "En cours": "neutral", "Qualifiée": "info", "Rendez-vous pris": "success", "À vérifier": "warning", "Terminée": "neutral" };

const demands = [
  { name: "Mme Dupont", initial: "D", summary: "Fuite sous l'évier de la cuisine, eau qui coule en continu.", time: "il y a 12 min", status: "Rendez-vous pris" as const, source: "Nova appel" },
  { name: "M. Martin", initial: "M", summary: "Chaudière qui ne démarre plus, plus d'eau chaude depuis hier soir.", time: "il y a 34 min", status: "Qualifiée" as const, source: "Nova appel" },
  { name: "M. Bernard", initial: "B", summary: "Devis pour rénovation complète salle de bain, 6m², douche italienne.", time: "il y a 1h", status: "À vérifier" as const, source: "Nova appel" },
  { name: "Mme Rousseau", initial: "R", summary: "Entretien annuel chaudière gaz, contrat à jour.", time: "il y a 3h", status: "Rendez-vous pris" as const, source: "Widget" },
  { name: "M. Petit", initial: "P", summary: "Rénovation complète appartement, cuisine + SDB + WC.", time: "il y a 5h", status: "À vérifier" as const, source: "Nova appel" },
  { name: "Mme Leroy", initial: "L", summary: "Devis pour rénovation complète de l'appartement, 3 pièces.", time: "il y a 6h", status: "En cours" as const, source: "Nova appel" },
  { name: "M. Dupuis", initial: "D", summary: "Installation chauffe-eau électrique 200L, remplacement ancien.", time: "hier", status: "Terminée" as const, source: "Nova appel" },
  { name: "Mme Moreau", initial: "M", summary: "Débouchage évier cuisine, eau stagnante.", time: "hier", status: "Terminée" as const, source: "Widget" },
];

const stats = [
  { value: "12", label: "Nouvelles" },
  { value: "8", label: "En cours" },
  { value: "5", label: "À vérifier" },
  { value: "23", label: "Terminées cette semaine" },
];

export default function DemandesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusList[0]);
  const [sort, setSort] = useState(sortOptions[0]);

  return (
    <AppLayout>
      <div className="w-full">
        {/* EN-TÊTE */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Demandes</h1>
          <p className="text-sm text-text-secondary mt-1">Toutes les demandes reçues par Nova.</p>
        </div>

        {/* BARRE DE FILTRES */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un client ou un besoin..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-white text-text-primary focus:border-primary focus:outline-none min-h-[44px] min-w-[160px]"
            >
              {statusList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-white text-text-primary focus:border-primary focus:outline-none min-h-[44px] min-w-[140px]"
            >
              {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button variant="ghost" size="sm" className="min-h-[44px] flex items-center gap-2 flex-shrink-0">
              <Download className="w-4 h-4" /> Exporter
            </Button>
          </div>
        </Card>

        {/* STATISTIQUES RAPIDES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <Card key={i} className="p-5 text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-text-secondary mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* LISTE DES DEMANDES */}
        <div className="space-y-3">
          {demands.map((demand, i) => (
            <Card key={i} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-text-primary font-semibold flex-shrink-0">
                  {demand.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-text-primary truncate">{demand.name}</span>
                    <Badge variant={statusVariant[demand.status]} className="text-[10px] flex-shrink-0">{demand.status}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{demand.summary}</p>
                  <p className="text-xs text-text-secondary mt-2">{demand.time} • Source : {demand.source}</p>
                </div>
                <div className="hidden md:flex flex-shrink-0">
                  <Button variant="ghost" size="sm" className="min-h-[44px]"><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}