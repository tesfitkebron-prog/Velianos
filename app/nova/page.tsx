"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Mic, AlertCircle, Send, ChevronRight, CheckCircle2 } from "lucide-react";

const conversations = [
  { name: "Mme Dupont", initial: "D", summary: "Fuite sous l'évier de la cuisine", time: "il y a 12 min", status: "RDV pris" as const },
  { name: "M. Martin", initial: "M", summary: "Chaudière qui ne démarre plus", time: "il y a 34 min", status: "Info donnée" as const },
  { name: "M. Bernard", initial: "B", summary: "Devis salle de bain", time: "il y a 1h", status: "À vérifier" as const },
  { name: "Mme Rousseau", initial: "R", summary: "Entretien chaudière annuel", time: "il y a 3h", status: "RDV pris" as const },
  { name: "M. Petit", initial: "P", summary: "Rénovation complète", time: "il y a 5h", status: "À vérifier" as const },
];

const statusVariant = { "RDV pris": "success", "Info donnée": "info", "À vérifier": "warning" } as const;

const alerts = [
  { name: "M. Petit", desc: "M. Petit demande un devis pour une salle de bain. Trop complexe pour Nova.", time: "il y a 1h" },
  { name: "Mme Leroy", desc: "Mme Leroy demande une rénovation complète d'appartement. Nova ne peut pas chiffrer.", time: "il y a 2h" },
];

const metrics = [
  { value: "24", label: "Appels traités aujourd'hui" },
  { value: "2min 30", label: "Durée moyenne d'appel" },
  { value: "87%", label: "Demandes qualifiées" },
  { value: "0", label: "Appels manqués" },
];

export default function NovaPage() {
  const [question, setQuestion] = useState("");

  return (
    <AppLayout>
      <div className="w-full pb-12 overflow-x-hidden">
        {/* SECTION 1 — EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Nova</h1>
            <p className="text-base text-text-secondary mt-1">Votre assistante pour les demandes clients.</p>
          </div>
          <div className="flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">Nova est active</span>
          </div>
        </div>

        {/* SECTION 2 — BLOC NOVA HERO */}
        <Card className="bg-nova border-nova text-white rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0 p-4 rounded-full bg-white/10">
              <Mic className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold">Qu'est-ce que Nova a fait pour moi aujourd'hui ?</h2>
              <p className="text-sm text-white/60 mt-2">8 demandes traitées • 3 rendez-vous pris • 2 clients en attente</p>
              <div className="flex items-center gap-2 justify-center md:justify-start mt-4">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-white/50">Nova travaille en ce moment</span>
              </div>
            </div>
            <div className="text-center md:flex-shrink-0">
              <button className="min-h-[44px] px-6 py-3 bg-white text-nova font-semibold rounded-lg text-sm hover:bg-gray-100 flex items-center justify-center gap-2 mx-auto md:mx-0">
                <Mic className="w-4 h-4" /> Écouter le résumé
              </button>
              <p className="text-xs text-white/50 mt-2">Durée : 45 secondes</p>
            </div>
          </div>
        </Card>

        {/* SECTION 3 — GRILLE 2 COLONNES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* COLONNE GAUCHE — CONVERSATIONS RÉCENTES */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="text-lg font-semibold text-text-primary">Conversations récentes</h3>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                Voir tout <ChevronRight size={14} />
              </Button>
            </div>
            <div className="space-y-0">
              {conversations.map((conv, i) => (
                <div key={i} className={`flex items-center gap-3 py-3 ${i < conversations.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-text-primary font-semibold">
                    {conv.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{conv.name}</p>
                    <p className="text-xs text-text-secondary truncate">{conv.summary}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-text-secondary">{conv.time}</span>
                    <Badge variant={statusVariant[conv.status]} className="text-[10px]">{conv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* COLONNE DROITE — NOVA A BESOIN DE VOUS */}
          <Card className="p-5 bg-orange-50/50 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-orange-900">Nova a besoin de vous</h3>
              </div>
              <Badge variant="warning">2</Badge>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-orange-100">
                  <p className="text-sm font-semibold text-text-primary">{alert.name}</p>
                  <p className="text-sm text-text-secondary mt-1">{alert.desc}</p>
                  <p className="text-xs text-text-secondary mt-2">{alert.time}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="sm" className="min-h-[44px]">Rappeler</Button>
                    <Button variant="ghost" size="sm" className="min-h-[44px]">Ignorer</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* SECTION 4 — CHAMP DE QUESTION DIRECTE */}
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-lg font-semibold text-text-primary">Poser une question à Nova</h3>
          </div>
          <p className="text-sm text-text-secondary mt-1">Vérifiez ce que Nova sait sur votre entreprise.</p>
          <div className="flex gap-3 mt-4">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ex : Quel est mon tarif pour un débouchage ?"
              className="flex-1 px-4 py-3 border border-border rounded-lg text-sm bg-white text-text-primary placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
            />
            <Button variant="primary" size="md" className="min-h-[44px] flex items-center gap-2 flex-shrink-0" disabled={!question.trim()}>
              <Send className="w-4 h-4" /> Envoyer
            </Button>
          </div>
        </Card>

        {/* SECTION 5 — MÉTRIQUES DU JOUR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {metrics.map((m, i) => (
            <Card key={i} className="p-5 text-center">
              <p className="text-2xl font-bold text-primary">{m.value}</p>
              <p className="text-xs text-text-secondary mt-1">{m.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}