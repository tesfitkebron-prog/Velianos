"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CalendarCheck, Link as LinkIcon, Info, HelpCircle, MessageSquare } from "lucide-react";

export default function ConnexionAgendaPage() {
  const [agendaType, setAgendaType] = useState("internal");
  const [providerTab, setProviderTab] = useState("google");
  const [icsUrl, setIcsUrl] = useState("");

  return (
    <AppLayout>
      <div className="w-full max-w-4xl mx-auto pb-12">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Connexion agenda</h1>
          <p className="text-sm text-text-secondary mt-2">Branchez votre agenda pour que Nova propose des créneaux vraiment disponibles.</p>
        </div>

        <Card className="p-5 border-l-4 border-l-warning mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            <span className="font-semibold text-text-primary">Agenda interne actif</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">Nova utilise l'agenda Velianos. Vous pouvez aussi connecter votre agenda existant ci-dessous.</p>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center mb-1">
            <span className="w-1 h-5 bg-primary rounded-full mr-3"></span>
            <h2 className="text-lg font-semibold text-text-primary">Comment voulez-vous gérer votre agenda ?</h2>
          </div>
          <p className="text-sm text-text-secondary">Choisissez la méthode qui vous convient.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <button onClick={() => setAgendaType("internal")} className={`text-left w-full rounded-lg p-5 border-2 transition ${agendaType === "internal" ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/50"}`}>
              <div className="flex items-start justify-between">
                <CalendarCheck className="w-6 h-6 text-primary" />
                <Badge variant="success">Recommandé</Badge>
              </div>
              <p className="font-semibold text-text-primary mt-3">Agenda Velianos</p>
              <p className="text-sm text-text-secondary mt-2">Simple et intégré. Tous vos RDV au même endroit.</p>
            </button>

            <button onClick={() => setAgendaType("external")} className={`text-left w-full rounded-lg p-5 border-2 transition ${agendaType === "external" ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/50"}`}>
              <LinkIcon className="w-6 h-6 text-primary" />
              <p className="font-semibold text-text-primary mt-3">Connecter mon agenda</p>
              <p className="text-sm text-text-secondary mt-2">Google, Outlook, Apple. Vos RDV existants restent où ils sont.</p>
            </button>
          </div>
        </Card>

        {agendaType === "external" && (
          <Card className="p-6 mb-6">
            <div className="flex items-center mb-1">
              <span className="w-1 h-5 bg-primary rounded-full mr-3"></span>
              <h2 className="text-lg font-semibold text-text-primary">Connecter votre agenda existant</h2>
            </div>
            <p className="text-sm text-text-secondary">Copiez l'adresse secrète de votre agenda et collez-la ci-dessous.</p>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-text-primary">Comment trouver votre adresse ?</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setProviderTab("google")} className={`px-3 py-1.5 text-xs font-medium rounded-md ${providerTab === "google" ? "bg-primary text-white" : "bg-white border border-border text-text-secondary"}`}>Google</button>
                <button onClick={() => setProviderTab("outlook")} className={`px-3 py-1.5 text-xs font-medium rounded-md ${providerTab === "outlook" ? "bg-primary text-white" : "bg-white border border-border text-text-secondary"}`}>Outlook</button>
                <button onClick={() => setProviderTab("apple")} className={`px-3 py-1.5 text-xs font-medium rounded-md ${providerTab === "apple" ? "bg-primary text-white" : "bg-white border border-border text-text-secondary"}`}>Apple</button>
              </div>
              <p className="text-sm text-text-secondary mt-4">
                {providerTab === "google" && "1. Ouvrez Google Agenda sur votre ordinateur. 2. À gauche, cliquez sur votre agenda puis sur les 3 points. 3. Choisissez Paramètres et partage. 4. Descendez jusqu'à Adresse secrète au format iCal. 5. Copiez cette adresse."}
                {providerTab === "outlook" && "1. Ouvrez Outlook.com et allez dans Calendrier. 2. Cliquez sur Paramètres, Calendrier, Calendriers partagés. 3. Publiez votre calendrier et copiez le lien ICS."}
                {providerTab === "apple" && "1. Sur Mac, ouvrez Calendrier. 2. Clic droit sur votre calendrier, Partager, Calendrier public. 3. Copiez l'URL affichée."}
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold text-text-primary">Adresse de votre agenda</label>
              <input type="text" value={icsUrl} onChange={(e) => setIcsUrl(e.target.value)} placeholder="https://calendar.google.com/calendar/ical/..." className="w-full mt-2 border border-border rounded-lg py-3 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <Button variant="primary" className="mt-4">
                <LinkIcon className="w-4 h-4 mr-2" />
                Connecter cet agenda
              </Button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mt-4 flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary/80">Cette adresse est en lecture seule. Velianos ne peut pas modifier votre agenda existant. Vos rendez-vous Nova seront ajoutés uniquement dans Velianos.</p>
            </div>
          </Card>
        )}

        {agendaType === "external" && (
          <Card className="p-6 mb-6">
            <div className="flex items-center mb-1">
              <span className="w-1 h-5 bg-primary rounded-full mr-3"></span>
              <h2 className="text-lg font-semibold text-text-primary">Créneaux déjà occupés</h2>
            </div>
            <p className="text-sm text-text-secondary">Ces créneaux seront bloqués par Nova pour ne pas créer de conflit.</p>

            <div className="mt-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">Lundi 23 septembre — 10h00-11h00</p>
                  <p className="text-xs text-text-secondary mt-0.5">RDV client M. Dubois</p>
                </div>
                <Badge variant="neutral">Occupé</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">Mardi 24 septembre — 14h30-15h30</p>
                  <p className="text-xs text-text-secondary mt-0.5">Déplacement chantier</p>
                </div>
                <Badge variant="neutral">Occupé</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">Mercredi 25 septembre — 09h00-10h00</p>
                  <p className="text-xs text-text-secondary mt-0.5">Rendez-vous dentiste</p>
                </div>
                <Badge variant="neutral">Occupé</Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">Vendredi 27 septembre — 16h00-18h00</p>
                  <p className="text-xs text-text-secondary mt-0.5">Formation</p>
                </div>
                <Badge variant="neutral">Occupé</Badge>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6 bg-gray-50">
          <div className="flex items-center mb-1">
            <span className="w-1 h-5 bg-primary rounded-full mr-3"></span>
            <h2 className="text-lg font-semibold text-text-primary">Comment Nova utilise votre agenda</h2>
          </div>
          <div className="mt-4">
            <div className="flex items-start gap-3 py-3 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0"></span>
              <p className="text-sm text-text-primary">Nova consulte votre agenda avant de proposer un créneau à un client.</p>
            </div>
            <div className="flex items-start gap-3 py-3 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0"></span>
              <p className="text-sm text-text-primary">Elle respecte vos horaires de travail et vos pauses.</p>
            </div>
            <div className="flex items-start gap-3 py-3">
              <span className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0"></span>
              <p className="text-sm text-text-primary">Quand elle crée un RDV, il apparaît immédiatement dans votre agenda Velianos.</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 bg-gray-50">
            <HelpCircle className="w-6 h-6 text-text-secondary" />
            <p className="font-semibold text-text-primary mt-3">Problème de connexion ?</p>
            <p className="text-sm text-text-secondary mt-1">Si votre agenda ne se synchronise pas, consultez notre guide.</p>
            <Button variant="ghost" size="sm" className="mt-3">Voir le guide</Button>
          </Card>
          <Card className="p-5 bg-gray-50">
            <MessageSquare className="w-6 h-6 text-text-secondary" />
            <p className="font-semibold text-text-primary mt-3">Besoin d'aide ?</p>
            <p className="text-sm text-text-secondary mt-1">Notre équipe peut configurer votre agenda à distance.</p>
            <Button variant="ghost" size="sm" className="mt-3">Contacter le support</Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}