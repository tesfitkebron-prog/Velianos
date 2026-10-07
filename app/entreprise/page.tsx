"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Building2, Clock, MapPin, Euro, Upload, Camera, FileText,
  FileSpreadsheet, Image, Plus, X, Info, Sparkles, Save,
} from "lucide-react";

type FileStatus = "Traité" | "En cours";

export default function EntreprisePage() {
  const [dailyHours, setDailyHours] = useState({
    lundi: { open: true, start: "08:00", end: "18:00" },
    mardi: { open: true, start: "08:00", end: "18:00" },
    mercredi: { open: true, start: "08:00", end: "18:00" },
    jeudi: { open: true, start: "08:00", end: "18:00" },
    vendredi: { open: true, start: "08:00", end: "18:00" },
    samedi: { open: false, start: "", end: "" },
    dimanche: { open: false, start: "", end: "" },
  });
  const [zones, setZones] = useState(["Lyon", "Villeurbanne"]);
  const [services, setServices] = useState([
    { name: "Débouchage évier", min: "80", max: "150" },
    { name: "Remplacement chauffe-eau", min: "400", max: "800" },
    { name: "Recherche de fuite", min: "150", max: "300" },
  ]);
  const [files, setFiles] = useState<Array<{ name: string; size: string; status: FileStatus }>>([
    { name: "tarifs-2026.pdf", size: "245 Ko", status: "Traité" as const },
    { name: "plaquette-plomberie.pdf", size: "1,2 Mo", status: "Traité" as const },
  ]);
  const [freeText, setFreeText] = useState(
    "Je fais les dépannages de fuite d'eau, les débouchages, l'installation de chauffe-eau et les rénovations de salle de bain.\n\nJe me déplace dans Lyon et Villeurbanne.\n\nJe travaille du lundi au vendredi de 8h à 18h.\n\nJe facture un déplacement de 30€ pour les interventions en urgence."
  );
  const [rdvRules, setRdvRules] = useState({
    duration: "60",
    minDelay: "2",
    maxPerDay: "8",
    lunchStart: "12:00",
    lunchEnd: "14:00",
  });
  const [newZone, setNewZone] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceMin, setNewServiceMin] = useState("");
  const [newServiceMax, setNewServiceMax] = useState("");
  const [lastSaved] = useState("il y a 2 minutes");

  const filledSections = [
    dailyHours.lundi.open, zones.length > 0, services.length > 0, files.length > 0, freeText.length > 0,
  ].filter(Boolean).length;
  const progress = Math.round((filledSections / 6) * 100);

  const toggleDay = (day: string) => {
    setDailyHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], open: !prev[day as keyof typeof prev].open } }));
  };
  const updateDay = (day: string, field: string, value: string) => {
    setDailyHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], [field]: value } }));
  };
  const addZone = () => {
    if (newZone.trim() && !zones.includes(newZone.trim())) setZones([...zones, newZone.trim()]);
    setNewZone("");
  };
  const removeZone = (index: number) => setZones(zones.filter((_, i) => i !== index));
  const addService = () => {
    if (newServiceName.trim()) setServices([...services, { name: newServiceName.trim(), min: newServiceMin || "0", max: newServiceMax || "0" }]);
    setNewServiceName(""); setNewServiceMin(""); setNewServiceMax("");
  };
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));
  const addFile = (name: string, size: string) => {
    setFiles([...files, { name, size, status: "En cours" }]);
    setTimeout(() => setFiles(f => f.map(f => f.name === name ? { ...f, status: "Traité" } : f)), 2000);
  };
  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) addFile(f.name, `${(f.size / 1024).toFixed(0)} Ko`);
    e.target.value = "";
  };

  return (
    <AppLayout>
      <div className="w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Mon entreprise</h1>
        <p className="text-base text-text-secondary mt-2">Plus vous donnez d'informations à Nova, mieux elle répondra à vos clients.</p>

        {/* BANDEAU DE PROGRESSION */}
        <Card className="mt-4 p-4 bg-primary/5 border border-primary/20">
          <p className="text-sm font-semibold text-primary">Votre entreprise est configurée à {progress}%</p>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-text-secondary mt-1">Complétez les sections ci-dessous pour que Nova soit plus précise.</p>
        </Card>

        {/* SECTION 1 — INFORMATIONS DE BASE */}
        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full mr-3" />
            <h2 className="text-lg font-semibold text-text-primary">Informations de base</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Ces informations permettent à Nova de se présenter aux clients.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input label="Nom de l'entreprise" placeholder="Plomberie Karim" />
            <Input label="Téléphone professionnel" placeholder="06 12 34 56 78" />
            <Input label="Adresse" placeholder="12 rue de la République" />
            <Input label="Code postal" placeholder="69003" />
            <Input label="Ville" placeholder="Lyon" />
            <Input label="SIRET (optionnel)" placeholder="123 456 789 00012" />
          </div>
        </Card>

        {/* SECTION 2 — HORAIRES */}
        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full mr-3" />
            <h2 className="text-lg font-semibold text-text-primary">Horaires de travail</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Nova proposera des rendez-vous uniquement pendant ces horaires.</p>
          <div className="mt-4">
            {Object.entries(dailyHours).map(([day, hours]) => (
              <div key={day} className="flex flex-col gap-2 py-3 border-b border-border md:grid md:grid-cols-12 md:gap-3 md:items-center md:py-2">
                <div className="flex items-center justify-between md:col-span-3">
                  <span className="font-medium text-text-primary capitalize">{day}</span>
                  <button onClick={() => toggleDay(day)} className={`min-h-[44px] px-3 rounded-lg text-sm font-medium ${hours.open ? "bg-primary/10 text-primary" : "bg-gray-100 text-text-secondary"}`}>
                    {hours.open ? "Ouvert" : "Fermé"}
                  </button>
                </div>
                {hours.open && (
                  <div className="flex items-center gap-2 md:col-span-9">
                    <input type="time" value={hours.start} onChange={e => updateDay(day, "start", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-text-primary focus:border-primary focus:outline-none" />
                    <span className="text-text-secondary text-sm">à</span>
                    <input type="time" value={hours.end} onChange={e => updateDay(day, "end", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-text-primary focus:border-primary focus:outline-none" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 3 — ZONES */}
        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full mr-3" />
            <h2 className="text-lg font-semibold text-text-primary">Zones d'intervention</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Nova vérifiera que le client est bien dans votre zone avant de prendre un rendez-vous.</p>
          <div className="mt-4 space-y-2">
            {zones.map((zone, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <MapPin size={16} className="text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-text-primary flex-1">{zone}</span>
                <button onClick={() => removeZone(i)} className="p-1 hover:bg-gray-200 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"><X size={16} className="text-text-secondary" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input type="text" value={newZone} onChange={e => setNewZone(e.target.value)} placeholder="Ajouter une zone" className="w-full flex-1 rounded-lg border border-border px-3 py-2.5 text-sm bg-surface text-text-primary placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]" />
            <button onClick={addZone} className="min-h-[44px] px-4 rounded-lg border border-border bg-white text-text-secondary hover:bg-gray-100 flex items-center gap-1 font-medium">
              <Plus size={16} /> Ajouter
            </button>
          </div>
        </Card>

        {/* SECTION 4 — PRESTATIONS */}
        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full mr-3" />
            <h2 className="text-lg font-semibold text-text-primary">Prestations et tarifs</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Nova donnera une fourchette de prix à vos clients en se basant sur cette grille. Elle ne donnera JAMAIS un prix en dehors.</p>
          <div className="mt-4 space-y-3">
            {services.map((svc, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg relative">
                <button onClick={() => removeService(i)} className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"><X size={16} className="text-text-secondary" /></button>
                <input type="text" value={svc.name} onChange={e => { const n = [...services]; n[i].name = e.target.value; setServices(n); }} className="w-full rounded border border-border px-3 py-2 text-sm bg-white text-text-primary focus:border-primary focus:outline-none min-h-[44px]" placeholder="Nom prestation" />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input type="text" value={svc.min} onChange={e => { const n = [...services]; n[i].min = e.target.value; setServices(n); }} placeholder="Min €" className="w-full rounded border border-border px-3 py-2 text-sm bg-white text-text-primary focus:border-primary focus:outline-none min-h-[44px]" />
                  <input type="text" value={svc.max} onChange={e => { const n = [...services]; n[i].max = e.target.value; setServices(n); }} placeholder="Max €" className="w-full rounded border border-border px-3 py-2 text-sm bg-white text-text-primary focus:border-primary focus:outline-none min-h-[44px]" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Nom prestation" className="w-full flex-1 rounded-lg border border-border px-3 py-2.5 text-sm bg-surface text-text-primary placeholder:text-secondary focus:border-primary focus:outline-none min-h-[44px]" />
            <input type="text" value={newServiceMin} onChange={e => setNewServiceMin(e.target.value)} placeholder="Min €" className="w-full md:w-24 rounded-lg border border-border px-3 py-2.5 text-sm bg-surface text-text-primary placeholder:text-secondary focus:border-primary focus:outline-none min-h-[44px]" />
            <input type="text" value={newServiceMax} onChange={e => setNewServiceMax(e.target.value)} placeholder="Max €" className="w-full md:w-24 rounded-lg border border-border px-3 py-2.5 text-sm bg-surface text-text-primary placeholder:text-secondary focus:border-primary focus:outline-none min-h-[44px]" />
            <button onClick={addService} className="min-h-[44px] px-4 rounded-lg border border-border bg-white text-text-secondary hover:bg-gray-100 flex items-center gap-1 font-medium">
              <Plus size={16} /> Ajouter
            </button>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 mt-4 flex gap-3">
            <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-primary/80">Nova dira toujours "environ X€ à Y€" à vos clients. Pour un devis précis, elle vous demandera de rappeler le client.</p>
          </div>
        </Card>

        {/* SECTION 5 — DOCUMENTS */}
        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full mr-3" />
            <h2 className="text-lg font-semibold text-text-primary">Ce que Nova doit savoir</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Ajoutez vos documents (tarifs, plaquettes, contrats) et tout ce que Nova doit savoir sur votre activité. Plus elle en sait, mieux elle répondra.</p>

          {/* ZONE UPLOAD */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 md:p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer mt-4">
            <Upload size={40} className="w-10 h-10 text-text-secondary mx-auto" />
            <p className="text-sm font-medium text-text-primary mt-3">Glissez vos documents ici ou cliquez pour parcourir</p>
            <p className="text-xs text-text-secondary mt-1">PDF, Word, Excel, photos acceptés. Max 10 Mo par fichier.</p>
            <div className="flex flex-col md:flex-row justify-center gap-3 mt-4">
              <button className="w-full md:w-auto min-h-[44px] px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-hover">
                <Upload size={16} /> Choisir un fichier
              </button>
              <button className="w-full md:w-auto min-h-[44px] px-4 py-2 border border-border rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-100">
                <Camera size={16} /> Prendre une photo
                <input type="file" accept="image/*" capture="environment" className="hidden" />
              </button>
            </div>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleFileUpload} />
          </div>

          {/* LISTE FICHIERS */}
          <div className="mt-4 space-y-2">
            {files.map((file, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg flex items-start gap-3">
                {file.name.endsWith(".pdf") ? <FileText size={20} className="text-primary flex-shrink-0 mt-0.5" /> : file.name.match(/\.(xls|xlsx|csv)$/i) ? <FileSpreadsheet size={20} className="text-green-500 flex-shrink-0 mt-0.5" /> : <Image size={20} className="text-primary flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary break-all">{file.name}</p>
                  <p className="text-xs text-text-secondary">{file.size}</p>
                </div>
                <Badge variant={file.status === "Traité" ? "success" : "warning"} className="flex-shrink-0">{file.status}</Badge>
                <button onClick={() => removeFile(i)} className="p-1 hover:bg-gray-200 rounded min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"><X size={16} className="text-text-secondary" /></button>
              </div>
            ))}
          </div>

          {/* ZONE TEXTE LIBRE */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-text-primary">Ou écrivez directement ce que Nova doit savoir</p>
            <textarea rows={6} value={freeText} onChange={e => setFreeText(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm mt-3 bg-white text-text-primary placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            <p className="text-xs text-text-secondary mt-1">{freeText.length} / 5000 caractères</p>
            <div className="bg-blue-50 rounded-lg p-3 mt-4 flex gap-3">
              <Sparkles size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-primary/80">Astuce : écrivez comme si vous parliez à un nouvel employé. Nova comprend le langage naturel.</p>
            </div>
          </div>
        </Card>

        {/* SECTION 6 — RÈGLES */}
        <Card className="mt-6 p-6">
          <div className="flex items-center">
            <span className="w-1 h-5 bg-primary rounded-full mr-3" />
            <h2 className="text-lg font-semibold text-text-primary">Règles de prise de rendez-vous</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Ces règles déterminent comment Nova propose des créneaux.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input label="Durée par défaut d'un RDV (minutes)" placeholder="60" value={rdvRules.duration} onChange={e => setRdvRules({ ...rdvRules, duration: e.target.value })} />
            <Input label="Délai minimum avant un RDV (heures)" placeholder="2" value={rdvRules.minDelay} onChange={e => setRdvRules({ ...rdvRules, minDelay: e.target.value })} />
            <Input label="Nombre max de RDV par jour" placeholder="8" value={rdvRules.maxPerDay} onChange={e => setRdvRules({ ...rdvRules, maxPerDay: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Pause début" placeholder="12:00" value={rdvRules.lunchStart} onChange={e => setRdvRules({ ...rdvRules, lunchStart: e.target.value })} />
              <Input label="Pause fin" placeholder="14:00" value={rdvRules.lunchEnd} onChange={e => setRdvRules({ ...rdvRules, lunchEnd: e.target.value })} />
            </div>
          </div>
        </Card>
      </div>

      {/* BOUTON STICKY EN BAS */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-border p-4 flex items-center justify-between gap-3 z-40">
        <p className="text-xs text-text-secondary truncate">Dernière sauvegarde : {lastSaved}</p>
        <Button variant="primary" size="md" className="min-h-[44px] flex-shrink-0">
          <Save size={16} className="mr-2" /> Enregistrer les modifications
        </Button>
      </div>
    </AppLayout>
  );
}
