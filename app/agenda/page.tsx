"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState("semaine");

  const jours = [
    { nom: "Lun", date: "18", rdvs: [{ h: "09:00", c: "Mme Dupont", t: "Débouchage" }] },
    { nom: "Mar", date: "19", rdvs: [{ h: "10:30", c: "M. Bernard", t: "Devis" }] },
    { nom: "Mer", date: "20", rdvs: [{ h: "09:00", c: "Mme Rousseau", t: "Entretien" }] },
    { nom: "Jeu", date: "21", rdvs: [{ h: "11:00", c: "Mme Lefèvre", t: "Urgence" }] },
    { nom: "Ven", date: "22", rdvs: [{ h: "09:00", c: "M. Dupuis", t: "Installation" }] },
  ];

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Agenda</h1>
            <p className="text-sm text-text-secondary mt-1">Vos rendez-vous de la semaine.</p>
          </div>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau rendez-vous
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-sm">18 - 22 septembre 2026</span>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode("jour")} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === "jour" ? "bg-white text-primary shadow-sm" : "text-text-secondary"}`}>Jour</button>
              <button onClick={() => setViewMode("semaine")} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === "semaine" ? "bg-white text-primary shadow-sm" : "text-text-secondary"}`}>Semaine</button>
              <button onClick={() => setViewMode("mois")} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === "mois" ? "bg-white text-primary shadow-sm" : "text-text-secondary"}`}>Mois</button>
            </div>
          </div>
        </Card>

        {viewMode === "semaine" && (
          <Card className="p-4 md:p-6">
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {jours.map((jour) => (
                <div key={jour.nom}>
                  <div className="text-center py-2 border-b border-border mb-3">
                    <p className="text-xs font-semibold text-text-primary">{jour.nom}</p>
                    <p className="text-xs text-text-secondary">{jour.date}</p>
                  </div>
                  <div className="space-y-2 min-h-[300px]">
                    {jour.rdvs.map((rdv, i) => (
                      <div key={i} className="p-2 rounded text-xs bg-success/10 border-l-2 border-success">
                        <p className="font-semibold text-text-primary">{rdv.h}</p>
                        <p className="text-text-primary truncate">{rdv.c}</p>
                        <p className="text-text-secondary truncate">{rdv.t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {viewMode === "jour" && (
          <Card className="p-6">
            <p className="text-sm text-text-secondary">Vue jour — à venir</p>
          </Card>
        )}

        {viewMode === "mois" && (
          <Card className="p-6">
            <p className="text-sm text-text-secondary">Vue mois — à venir</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}