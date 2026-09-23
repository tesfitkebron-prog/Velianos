"use client";

import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Rocket, TrendingUp, AlertCircle, CalendarCheck, Inbox,
  Users, Euro, Phone, Globe, Calendar, MessageSquare, Mic, Settings,
  Paperclip, Send, Sparkles,
} from "lucide-react";

const rendezVous = [
  { heure: "9h00", client: "Mme Dupont", type: "Débouchage", nova: true },
  { heure: "11h30", client: "M. Martin", type: "Installation", nova: false },
  { heure: "14h00", client: "Mme Lefèvre", type: "Réparation", nova: true },
];

const actionsNova = [
  { text: "RDV pris avec M. Dupont pour demain 10h", time: "il y a 12 min", color: "green" },
  { text: "Info donnée à Mme Martin sur le débouchage", time: "il y a 34 min", color: "blue" },
  { text: "RDV pris avec M. Bernard pour jeudi 14h", time: "il y a 1h", color: "green" },
  { text: "Devis salle de bain de M. Petit nécessite validation", time: "il y a 2h", color: "orange" },
  { text: "RDV pris avec Mme Rousseau pour vendredi 9h", time: "il y a 3h", color: "green" },
];

const demandesEnAttente = [
  { client: "M. Petit", demande: "demande un devis pour une salle de bain. Trop complexe pour Nova." },
  { client: "Mme Leroy", demande: "a demandé un devis pour une rénovation complète. Nova ne peut pas chiffrer." },
];

const equipe = [
  { nom: "Karim B.", role: "Administrateur", initiale: "K", color: "bg-primary", rdv: "3 RDV" },
  { nom: "Sarah L.", role: "Technicienne", initiale: "S", color: "bg-success", rdv: "2 RDV" },
  { nom: "Antoine D.", role: "Plombier", initiale: "A", color: "bg-warning", rdv: "En congé" },
];

const donneesSemaine = [
  { jour: "Lun", rdv: 3 },
  { jour: "Mar", rdv: 5 },
  { jour: "Mer", rdv: 2 },
  { jour: "Jeu", rdv: 6 },
  { jour: "Ven", rdv: 4, aujourdHui: true },
  { jour: "Sam", rdv: 1 },
  { jour: "Dim", rdv: 0 },
];

function useCountUp(end: number, duration = 800): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);
  return count;
}

export default function DashboardPage() {
  const count12 = useCountUp(12);
  const count8 = useCountUp(8);
  const count10 = useCountUp(10);

  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 15 * 60);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ from: "user" | "nova"; text: string }>>([
  { from: "nova", text: "Bonjour Karim. Aujourd'hui j'ai traité 8 demandes, pris 3 rendez-vous et 2 clients attendent votre rappel. Que voulez-vous savoir ?" },
]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { from: "user", text: userMessage }]);
    setChatInput("");
    setTimeout(() => {
      let response = "Je transmets votre question. En attendant, voici ce que je peux vous dire : j'ai traité 8 demandes aujourd'hui.";
      if (chatMessages.length === 0) {
        response = "Bonjour Karim. Aujourd'hui j'ai traité 8 demandes, pris 3 rendez-vous et 2 clients attendent votre rappel. Que voulez-vous savoir ?";
      } else if (chatInput.toLowerCase().includes("appel")) {
        response = "Aujourd'hui j'ai traité 8 appels, dont 3 qui ont abouti à un rendez-vous.";
      } else if (chatInput.toLowerCase().includes("rdv") || chatInput.toLowerCase().includes("rendez")) {
        response = "Vous avez 3 rendez-vous demain : 9h Mme Dupont, 11h30 M. Martin, 14h Mme Lefèvre.";
      } else if (chatInput.toLowerCase().includes("semaine")) {
        response = "Cette semaine, Nova a généré environ 2 450 € sur 12 rendez-vous.";
      }
      setChatMessages(prev => [...prev, { from: "nova", text: response }]);
    }, 1000);
  };

  const handleVoiceClick = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setChatMessages(prev => [...prev, { from: "user", text: "🎤 Message vocal (0:05)" }]);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { from: "nova", text: "Message vocal bien reçu. Je l'ai transmis à l'équipe." }]);
      }, 1000);
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChatMessages(prev => [...prev, { from: "user", text: `📎 Fichier envoyé : ${file.name}` }]);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { from: "nova", text: `Fichier "${file.name}" bien reçu. Je l'ai transmis à l'équipe.` }]);
      }, 1000);
    }
    if (e.target) e.target.value = "";
  };

  return (
    <AppLayout>
      <div className="w-full">

        {/* Zone 1 — Bandeau de statut */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white rounded-xl border border-border gap-2 mb-6">
          <div className="flex flex-col gap-1 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-text-primary">Nova est active</span>
            </div>
            <div className="hidden md:block w-px h-5 bg-border" />
            <span className="text-sm text-text-secondary">Dernier appel il y a 12 min</span>
            <div className="hidden md:block w-px h-5 bg-border" />
            <span className="text-sm text-text-secondary">3 appels récupérés aujourd'hui</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">Voir l'activité</Button>
            <Button variant="ghost" size="sm"><Settings size={16} /></Button>
          </div>
        </div>

        {/* Zone 2 — Bandeau onboarding */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 bg-blue-50/50 border border-primary/20 rounded-xl mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Rocket size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-primary">Complétez votre installation</p>
            <p className="text-sm text-text-secondary mt-0.5">Il vous reste 2 étapes pour activer Nova complètement.</p>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
              <div className="h-2 bg-primary rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
          <Button variant="primary" size="sm" className="w-full md:w-auto">Continuer l'installation</Button>
        </div>

        {/* Zone 3 — Salutation */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Bonjour Karim.</h1>
            <p className="text-base text-text-secondary mt-1">Voici ce qui s'est passé pour votre entreprise.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">Vendredi 18 septembre 2026</span>
            <Badge variant="info">2 RDV ce matin</Badge>
          </div>
        </div>

        {/* Zone 4 — Bloc Nova Hero avec Chat intégré */}
        <div className="bg-[#0B1329] rounded-2xl p-6 md:p-8 mb-6">
          {/* EN-TÊTE DU BLOC */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Qu'est-ce que Nova a fait pour moi aujourd'hui ?</h2>
                <p className="text-sm text-white/60 mt-1">8 demandes traitées • 3 rendez-vous pris • 2 clients en attente</p>
              </div>
            </div>
            <button className="bg-white text-[#0B1329] font-medium px-5 py-3 rounded-lg flex items-center gap-2 hover:bg-white/90 transition flex-shrink-0">
              <Mic className="w-4 h-4" />
              Écouter le résumé
            </button>
          </div>

          {/* ZONE DE CHAT */}
          <div className="pt-6">
            {/* Historique des messages (hauteur fixe, scrollable) */}
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2" ref={messagesEndRef}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.from === "user" ? "justify-end" : ""}`}>
                  {msg.from === "nova" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.from === "nova" ? "bg-white/5 rounded-lg rounded-tl-none" : "bg-primary rounded-lg rounded-tr-none"}`}>
                    <p className="text-sm text-white">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Barre de saisie */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2 border border-white/10">
              {/* Bouton pièce jointe */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                title="Joindre un fichier"
              >
                <Paperclip className="w-5 h-5 text-white/60" />
              </button>
              <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} />

              {/* Bouton micro (vocal) */}
              <button
                onClick={handleVoiceClick}
                className={`p-2 rounded-lg transition ${isRecording ? "bg-red-500 animate-pulse" : "hover:bg-white/10"}`}
                title={isRecording ? "Enregistrement en cours..." : "Enregistrer un message vocal"}
              >
                <Mic className={`w-5 h-5 ${isRecording ? "text-red-500" : "text-white/60"}`} />
              </button>

              {/* Input texte */}
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Posez une question à Nova..."
                className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm px-2 py-2 outline-none"
              />

              {/* Bouton envoyer */}
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() && !isRecording}
                className="p-2 bg-primary hover:bg-primary-hover rounded-lg transition flex-shrink-0"
                title="Envoyer"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Suggestions rapides sous le champ */}
            <div className="flex flex-wrap gap-2 mt-3">
              {["Combien d'appels aujourd'hui ?", "Mes RDV de demain", "Résumé de la semaine"].map((s, i) => (
                <button key={i} onClick={() => { setChatInput(s); handleSendMessage(); }} className="text-xs text-white/60 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone 5 — 4 cartes de stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {[
            { icon: CalendarCheck, chiffre: count12, libelle: "Rendez-vous pris", contexte: "dont 3 cette nuit" },
            { icon: Inbox, chiffre: count8, libelle: "Demandes traitées", contexte: "2min 30 en moyenne" },
            { icon: Users, chiffre: count10, libelle: "Clients aidés", contexte: "dont 4 nouveaux" },
            { icon: Euro, chiffre: "2 450 €", libelle: "Estimation gagnée", contexte: "sur 7 jours" },
          ].map((card, i) => (
            <Card key={i} className="p-5 md:p-6 relative min-h-[140px]">
              <card.icon className="absolute top-5 right-5 w-5 h-5 text-text-secondary/30" />
              <div className="text-left">
                <p className="text-3xl md:text-4xl font-bold text-primary leading-none">{card.chiffre}</p>
                <p className="text-sm text-text-secondary mt-3">{card.libelle}</p>
                <p className="text-xs text-text-secondary/70 mt-1 truncate">{card.contexte}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Zone 6 — État des connexions */}
        <Card className="p-5 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-5 bg-primary rounded-full mr-3" />
            <h3 className="text-base font-semibold text-text-primary">État de vos connexions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-3">
            {[
              { icon: Phone, name: "Téléphone", status: "✓ Connecté", ok: true },
              { icon: Globe, name: "Site web", status: "✓ Connecté", ok: true },
              { icon: Calendar, name: "Agenda", status: "✓ Synchronisé", ok: true },
              { icon: MessageSquare, name: "SMS", status: "⚠ Inactif", ok: false },
            ].map((mod, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <mod.icon size={18} className="text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">{mod.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${mod.ok ? "bg-success" : "bg-warning"}`} />
                  <span className={`text-xs ${mod.ok ? "text-success" : "text-warning"}`}>{mod.status}</span>
                </div>
                {!mod.ok && (
                  <Button variant="ghost" size="sm" className="mt-2 min-h-[44px]">Configurer</Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Zone 7 — Hero Prochain RDV */}
        <Card className="border-l-4 border-l-primary rounded-xl p-4 md:p-6 shadow-sm relative mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
            <div className="col-span-1 md:col-span-6">
              <Badge variant="info" className="px-2 py-1 rounded text-xs font-semibold tracking-wide">PROCHAIN RDV</Badge>
              <h3 className="text-xl font-bold text-text-primary mt-3 md:text-2xl">M. Dupont — Fuite d'eau</h3>
              <p className="text-sm text-text-secondary mt-2">12 rue de la République, Lyon 3e</p>
              <p className="text-xs text-text-secondary/70 mt-2 italic">Prévoir : clé de 12, joints, téflon</p>
            </div>
            <div className="col-span-1 md:col-span-3 flex flex-col items-center">
              <span className="text-xs text-secondary tracking-wide">DANS</span>
              <span className="text-2xl font-bold text-primary text-center md:text-3xl">{hours}h {String(minutes).padStart(2, "0")}min</span>
              <span className="text-sm text-text-secondary text-center mt-1">à 14h00</span>
            </div>
            <div className="col-span-1 md:col-span-3 flex flex-col">
              <Button variant="primary" size="md" className="w-full min-h-[44px]">Appeler le client</Button>
              <Button variant="ghost" size="md" className="w-full mt-2 min-h-[44px]">Voir le détail</Button>
            </div>
          </div>
        </Card>

        {/* Zone 8 — Grille 3 colonnes (Aujourd'hui / Ce que Nova a fait / Cette semaine) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <Card className="p-5 min-h-[300px] flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-5 bg-primary rounded-full mr-3" />
                <h3 className="text-base font-semibold text-text-primary">Aujourd'hui</h3>
                <Badge variant="info" className="text-xs">3 RDV</Badge>
              </div>
              <div className="flex-1 overflow-y-auto space-y-0">
                {rendezVous.map((rdv, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-text-primary flex-shrink-0">
                      {rdv.heure}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{rdv.client}</p>
                      <p className="text-xs text-text-secondary">{rdv.type}</p>
                    </div>
                    {rdv.nova && <Badge variant="info" className="text-xs">Nova</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5 min-h-[300px] flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-5 bg-primary rounded-full mr-3" />
                <h3 className="text-base font-semibold text-text-primary">Ce que Nova a fait</h3>
                <Button variant="ghost" size="sm">Voir tout</Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-0">
                {actionsNova.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        action.color === "green" ? "bg-success/20" : action.color === "blue" ? "bg-primary/20" : "bg-warning/20"
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          action.color === "green" ? "bg-success" : action.color === "blue" ? "bg-primary" : "bg-warning"
                        }`} />
                      </div>
                      {i < actionsNova.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm text-text-primary">{action.text}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{action.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5 min-h-[300px] flex flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full mr-3" />
                  <h3 className="text-base font-semibold text-text-primary">Cette semaine</h3>
                </div>
                <Button variant="ghost" size="sm">Détails</Button>
              </div>
              <div className="flex-1 flex items-end">
                <div className="flex items-end gap-2 w-full">
                  {donneesSemaine.map((jour, i) => {
                    const maxRdv = Math.max(...donneesSemaine.map(d => d.rdv));
                    const height = jour.rdv > 0 ? (jour.rdv / maxRdv) * 80 : 8;
                    return (
                      <div key={i} className="flex flex-col items-center flex-1" style={{ maxWidth: 24 }}>
                        <div
                          className={`rounded-t-lg w-full ${
                            jour.aujourdHui
                              ? "bg-gradient-to-b from-primary to-primary/60"
                              : "bg-primary/20"
                          }`}
                          style={{ height: `${height}px` }}
                        />
                        <span className="text-xs text-text-secondary mt-2">{jour.jour}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Zone 9 — Nova a besoin de vous + Équipe */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <Card className="lg:col-span-2 p-5 min-h-[240px]">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-warning" />
              <span className="w-1 h-5 bg-warning rounded-full mr-3" />
              <h3 className="text-base font-semibold text-orange-900">Nova a besoin de vous</h3>
              <Badge variant="danger" className="text-xs">2</Badge>
            </div>
            <div className="space-y-3 mt-3">
              {demandesEnAttente.map((d, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-orange-100">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{d.client}</span> {d.demande}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="sm" className="min-h-[44px]">Rappeler</Button>
                    <Button variant="ghost" size="sm" className="min-h-[44px]">Ignorer</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="lg:col-span-1 p-5 min-h-[240px]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-5 bg-primary rounded-full mr-3" />
              <h3 className="text-base font-semibold text-text-primary">Votre équipe</h3>
            </div>
            <div className="space-y-0">
              {equipe.map((membre, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <div className={`w-9 h-9 rounded-full ${membre.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {membre.initiale}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{membre.nom}</p>
                    <p className="text-xs text-text-secondary">{membre.role}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    membre.rdv === "En congé" ? "bg-gray-100 text-text-secondary" : "bg-primary/10 text-primary"
                  }`}>
                    {membre.rdv}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Zone 10 — Bandeau résumé */}
        <Card className="p-5 bg-primary/5 border border-primary/20 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm font-semibold text-text-primary">Nova a récupéré 23 appels cette semaine</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-text-secondary">18 RDV</span>
              <span className="text-text-secondary">97%</span>
              <span className="text-text-secondary">14h</span>
            </div>
            <Button variant="primary" size="sm" className="min-h-[44px] flex-shrink-0">
              Voir le rapport
            </Button>
          </div>
        </Card>

      </div>
    </AppLayout>
  );
}
