"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search } from "lucide-react";

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const clients = [
    { nom: "Mme Dupont", tel: "06 12 34 56 78", ville: "Lyon 3e", rdv: "Demain 9h00" },
    { nom: "M. Martin", tel: "06 23 45 67 89", ville: "Villeurbanne", rdv: "Jeudi 14h00" },
    { nom: "M. Bernard", tel: "06 34 56 78 90", ville: "Lyon 6e", rdv: null },
    { nom: "Mme Rousseau", tel: "06 45 67 89 01", ville: "Lyon 7e", rdv: "Vendredi 9h00" },
    { nom: "M. Petit", tel: "06 56 78 90 12", ville: "Lyon 2e", rdv: null },
    { nom: "Mme Leroy", tel: "06 67 89 01 23", ville: "Villeurbanne", rdv: null },
    { nom: "M. Dupuis", tel: "06 78 90 12 34", ville: "Lyon 3e", rdv: "Lundi 10h30" },
    { nom: "Mme Moreau", tel: "06 89 01 23 45", ville: "Lyon 8e", rdv: "Samedi 11h00" },
  ];

  const filtered = clients.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.tel.includes(search) ||
    c.ville.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Clients</h1>
            <p className="text-sm text-text-secondary mt-1">Tous vos clients et leur historique.</p>
          </div>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un client
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone ou ville..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </Card>

        <div className="space-y-3">
          {filtered.map((client, i) => (
            <Card key={i} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">{client.nom.charAt(client.nom.indexOf(" ") + 1) || client.nom.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-text-primary truncate">{client.nom}</p>
                  <p className="text-sm text-text-secondary mt-0.5">{client.tel}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{client.ville}</p>
                </div>
                <div className="hidden md:block text-right flex-shrink-0">
                  {client.rdv ? (
                    <>
                      <p className="text-xs text-text-secondary">Prochain RDV</p>
                      <p className="text-sm font-medium text-primary mt-0.5">{client.rdv}</p>
                    </>
                  ) : (
                    <p className="text-xs text-text-secondary italic">Aucun RDV à venir</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-xs text-text-secondary mt-6 text-center">
          {filtered.length} clients • {clients.filter((c) => c.rdv).length} rendez-vous à venir
        </p>
      </div>
    </AppLayout>
  );
}