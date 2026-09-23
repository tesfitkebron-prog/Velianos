"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Phone, Copy, Info, AlertTriangle, CheckCircle2, HelpCircle, Smartphone } from "lucide-react";

type Operator = "orange" | "sfr" | "bouygues" | "free" | "autre" | null;

export default function ConnexionTelephonePage() {
  const [selectedOperator, setSelectedOperator] = useState<Operator>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success">("idle");
  const [copied, setCopied] = useState(false);

  const phoneNumber = "04 28 12 34 56";

  const getUssdCode = () => {
    if (!selectedOperator || selectedOperator === "autre") return "";
    if (selectedOperator === "free") return "*61*0428123456**20#";
    return "*61*0428123456#";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleTest = () => {
    setTestStatus("testing");
    setTimeout(() => setTestStatus("success"), 3000);
  };

  return (
    <AppLayout>
      <div className="w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Connexion téléphone</h1>
        <p className="text-base text-text-secondary mt-2">Branchez votre numéro à Nova en 2 minutes. Vous gardez votre numéro actuel.</p>

        <Card className="mt-8 border-l-4 border-l-warning">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            <span className="font-semibold text-text-primary">Téléphone non connecté</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">Nova ne peut pas encore répondre à vos appels.</p>
        </Card>

        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full mr-3"></span>
            <h2 className="text-lg font-semibold text-text-primary">Votre numéro Nova</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center mt-4">
            <p className="text-xs text-text-secondary uppercase tracking-wide">Votre numéro dédié Velianos</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-3xl font-bold text-primary font-mono">{phoneNumber}</span>
              <button onClick={() => copyToClipboard(phoneNumber.replace(/\s/g, ""))} className="p-2 hover:bg-gray-200 rounded-lg">
                <Copy className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-2">C'est vers ce numéro que vos appels manqués seront renvoyés.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mt-4 flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-primary/80">Vous n'avez pas besoin de changer votre numéro actuel. Vos clients continuent d'appeler votre numéro habituel. Nova prend le relais quand vous ne pouvez pas décrocher.</p>
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span>
            <h3 className="text-base font-semibold text-text-primary ml-3">Choisissez votre opérateur</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {(["orange", "sfr", "bouygues", "free"] as const).map((op) => (
              <button
                key={op}
                onClick={() => setSelectedOperator(op)}
                className={`h-20 bg-white border rounded-lg flex flex-col items-center justify-center gap-2 capitalize ${selectedOperator === op ? "border-2 border-primary bg-primary/5" : "border-border"}`}
              >
                <Smartphone className="w-5 h-5 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">{op}</span>
              </button>
            ))}
            <button
              onClick={() => setSelectedOperator("autre")}
              className={`h-20 bg-white border rounded-lg flex flex-col items-center justify-center gap-2 ${selectedOperator === "autre" ? "border-2 border-primary bg-primary/5" : "border-border"}`}
            >
              <HelpCircle className="w-5 h-5 text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">Autre</span>
            </button>
          </div>
          <p className="text-xs text-text-secondary italic mt-4">Vous êtes chez Sosh, RED, B&You, La Poste Mobile ou un autre opérateur ? Choisissez l'opérateur principal correspondant. Le code USSD est identique.</p>
        </Card>

        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</span>
            <h3 className="text-base font-semibold text-text-primary ml-3">Copiez ce code sur votre téléphone</h3>
          </div>
          {!selectedOperator && (
            <p className="text-sm text-text-secondary italic mt-4">Sélectionnez d'abord votre opérateur ci-dessus.</p>
          )}
          {selectedOperator === "autre" && (
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-primary">Comment trouver votre opérateur principal ?</h4>
              <ul className="text-sm text-primary/80 mt-2 list-disc list-inside space-y-1">
                <li>Sosh, Lebara, Lycamobile → choisissez Orange</li>
                <li>RED by SFR, La Poste Mobile, Coriolis, Prixtel → choisissez SFR</li>
                <li>B&You, Cdiscount Mobile, NRJ Mobile, Auchan Telecom → choisissez Bouygues</li>
                <li>Vous ne savez pas ? Appelez le 33700 (gratuit) depuis votre mobile, votre opérateur sera affiché.</li>
              </ul>
              <Button variant="ghost" size="sm" className="mt-3">Contacter le support</Button>
            </div>
          )}
          {selectedOperator && selectedOperator !== "autre" && (
            <div>
              <div className="bg-gray-900 rounded-xl p-6 mt-4 text-center">
                <p className="text-2xl font-mono text-white">{getUssdCode()}</p>
                <button onClick={() => copyToClipboard(getUssdCode())} className="bg-white text-gray-900 px-4 py-2 rounded-lg mt-4 inline-flex items-center gap-2 font-medium">
                  <Copy className="w-4 h-4" />
                  {copied ? "Copié !" : "Copier le code"}
                </button>
              </div>
              <p className="text-sm text-text-secondary mt-4">
                {selectedOperator === "free"
                  ? "Ouvrez l'application Téléphone, collez ce code et appuyez sur Appeler. Vous pouvez changer le délai avant bascule en modifiant le nombre à la fin (minimum 5 secondes)."
                  : "Ouvrez l'application Téléphone de votre mobile, collez ce code et appuyez sur Appeler. Un message de confirmation va apparaître."}
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-900">Le renvoi d'appel est facturé par votre opérateur (~0,15 €/min). Gratuit chez Free, Orange et SFR sur la plupart des forfaits.</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</span>
            <h3 className="text-base font-semibold text-text-primary ml-3">Testez maintenant</h3>
          </div>
          <p className="text-sm text-text-secondary mt-3">Appelez-vous depuis un autre téléphone. Ne décrochez pas. Si Nova décroche et dit votre nom, c'est gagné.</p>
          {testStatus === "idle" && (
            <Button variant="primary" size="lg" onClick={handleTest} className="w-full mt-4">
              <Phone className="w-4 h-4 mr-2" />
              Lancer le test de vérification
            </Button>
          )}
          {testStatus === "testing" && (
            <Button variant="primary" size="lg" disabled className="w-full mt-4">
              Test en cours...
            </Button>
          )}
          {testStatus === "success" && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 mt-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-success">Test réussi ! Nova a bien répondu à votre appel.</p>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="p-5 bg-gray-50">
            <HelpCircle className="w-6 h-6 text-text-secondary" />
            <h4 className="text-base font-semibold text-text-primary mt-3">Ça ne marche pas ?</h4>
            <p className="text-sm text-text-secondary mt-2">Vérifiez que vous avez bien recopié le code. Consultez notre guide pas-à-pas.</p>
            <Button variant="ghost" size="sm" className="mt-3">Voir le guide</Button>
          </Card>
          <Card className="p-5 bg-gray-50">
            <Phone className="w-6 h-6 text-text-secondary" />
            <h4 className="text-base font-semibold text-text-primary mt-3">Besoin d'un numéro dédié ?</h4>
            <p className="text-sm text-text-secondary mt-2">Vous pouvez utiliser un numéro Velianos dédié comme numéro professionnel. Cela évite le renvoi d'appel.</p>
            <Button variant="ghost" size="sm" className="mt-3">En savoir plus</Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}