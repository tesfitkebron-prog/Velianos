"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Globe, Sparkles, Code, HelpCircle, RefreshCw, PlayCircle, MessageSquare } from "lucide-react";

export default function SiteWebPage() {
  const [siteUrl, setSiteUrl] = useState("");

  return (
    <AppLayout>
      <div className="w-full">
        {/* EN-TÊTE */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Site web</h1>
          <p className="text-sm text-text-secondary mt-1">Ajoutez Nova à votre site pour que vos visiteurs puissent vous contacter.</p>
        </div>

        {/* STATUT ACTUEL */}
        <Card className="p-5 mt-6 border-l-4 border-l-warning">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="font-semibold text-text-primary">Widget non installé</span>
          </div>
          <p className="text-sm text-text-secondary">Vos visiteurs ne peuvent pas encore contacter Nova depuis votre site.</p>
        </Card>

        {/* ÉTAPE 1 — VOTRE SITE */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Votre site web</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Entrez l'adresse de votre site pour commencer.</p>
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <Input
              placeholder="Ex : plomberie-karim.fr"
              value={siteUrl}
              onChange={e => setSiteUrl(e.target.value)}
            />
            <Button variant="primary" className="min-h-[44px] flex-shrink-0">Connecter mon site</Button>
          </div>
        </Card>

        {/* ÉTAPE 2 — APERÇU DU WIDGET */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Aperçu du widget</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Voici comment le bouton apparaîtra sur votre site.</p>
          <div className="relative min-h-[300px] bg-gray-100 rounded-xl p-8 mt-4">
            <div className="absolute inset-0 opacity-30">
              <div className="h-8 bg-gray-400 rounded mb-6" />
              <div className="h-4 bg-gray-400 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-400 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-400 rounded w-5/6" />
            </div>
            <div className="absolute bottom-6 right-6 relative z-10">
              <button className="bg-primary text-white px-4 py-3 rounded-full flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Demander à notre IA
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" size="sm" className="min-h-[44px]">Changer la couleur</Button>
            <Button variant="ghost" size="sm" className="min-h-[44px]">Changer la position</Button>
          </div>
        </Card>

        {/* ÉTAPE 3 — INSTALLATION */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Installation sur votre site</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Choisissez la méthode qui correspond à votre site.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="border border-border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition">
              <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-text-primary">WordPress</p>
              <p className="text-xs text-text-secondary mt-1">Installation en 2 clics</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition">
              <Code className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-text-primary">Wix / Squarespace</p>
              <p className="text-xs text-text-secondary mt-1">Copier-coller un code</p>
            </div>
            <div className="border border-border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-text-primary">Autre / Je ne sais pas</p>
              <p className="text-xs text-text-secondary mt-1">On vous guide</p>
            </div>
          </div>
        </Card>

        {/* ÉTAPE 4 — VÉRIFICATION */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-semibold text-text-primary">Vérifier l'installation</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Une fois installé, cliquez ici pour vérifier que tout fonctionne.</p>
          <Button variant="primary" className="mt-4 min-h-[44px] flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Vérifier maintenant
          </Button>
        </Card>

        {/* AIDE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="p-5 bg-gray-50">
            <PlayCircle className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-text-primary mt-3">Voir le guide vidéo</h3>
            <p className="text-sm text-text-secondary mt-1">2 minutes pour tout comprendre.</p>
            <Button variant="ghost" size="sm" className="mt-3">Regarder</Button>
          </Card>
          <Card className="p-5 bg-gray-50">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-text-primary mt-3">Besoin d'aide ?</h3>
            <p className="text-sm text-text-secondary mt-1">Notre équipe peut installer le widget pour vous.</p>
            <Button variant="ghost" size="sm" className="mt-3">Contacter le support</Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}