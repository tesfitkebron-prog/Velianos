"use client";

import {
  Brain,
  CheckCircle2,
  ChevronDown,
  Building2,
  Clock,
  MapPin,
  Euro,
  FileText,
  Upload,
  Paperclip,
  AlertCircle,
  Check,
} from "lucide-react";

interface ConfigPanelProps {
  completion: number;
  setCompletion: (v: number) => void;
  configComplete: boolean;
}

export function ConfigPanel({ completion, setCompletion, configComplete }: ConfigPanelProps) {
  const infosConnues = [
    { label: "Nom de l'entreprise", valeur: "Plomberie Martin", icone: Building2, complete: true },
    { label: "Horaires", valeur: "Lun-Ven 8h-18h · Sam 8h-12h", icone: Clock, complete: true },
    { label: "Zones d'intervention", valeur: "Lyon, Villeurbanne, Caluire", icone: MapPin, complete: true },
    { label: "Tarifs / Prestations", valeur: "4 prestations configurées", icone: Euro, complete: true },
    { label: "Documents (PDF)", valeur: "Aucun document", icone: FileText, complete: false },
  ];

  if (configComplete) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Configuration complète ✓</span>
          </div>
          <button
            onClick={() => setCompletion(80)}
            className="text-xs text-emerald-600 hover:underline"
          >
            Modifier
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-3 border-b border-slate-200 cursor-pointer flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-500" />
              Ce que sait votre assistant
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform" />
          </div>
          <div className="px-3 pb-3 space-y-2">
            {[
              { label: "Nom de l'entreprise", valeur: "Plomberie Martin", icone: Building2 },
              { label: "Horaires", valeur: "Lun-Ven 8h-18h · Sam 8h-12h", icone: Clock },
              { label: "Zones d'intervention", valeur: "Lyon, Villeurbanne, Caluire", icone: MapPin },
              { label: "Tarifs / Prestations", valeur: "4 prestations configurées", icone: Euro },
              { label: "Documents (PDF)", valeur: "Aucun document", icone: FileText },
            ].map((info, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <info.icone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{info.label}</p>
                  <p className="text-sm text-slate-900 truncate">{info.valeur}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-3 border-b border-slate-200 cursor-pointer flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-500" />
              Documents & Fichiers
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform" />
          </div>
          <div className="px-3 pb-3">
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-100 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 mb-1">Glissez vos documents ici</p>
              <p className="text-xs text-slate-500 mb-3">Tarifs, plaquettes, contrats (PDF)</p>
              <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Paperclip className="w-4 h-4" /> Choisir un fichier
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-emerald-500" />
          <p className="text-lg font-bold text-slate-900">
            Votre assistant connaît votre entreprise à <span className="text-emerald-600">{completion}%</span>
          </p>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">Complétez les informations pour atteindre 100%.</p>
        <button
          onClick={() => setCompletion(completion < 100 ? 100 : 80)}
          className="mt-3 w-full py-2 px-4 bg-[#00D26A] hover:brightness-95 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {completion < 100 ? "✨ Simuler 100% (démo)" : "↩️ Revenir à 80% (démo)"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Ce que sait votre assistant
        </h3>
        <div className="space-y-3">
          {infosConnues.map((info, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${info.complete ? "bg-emerald-100" : "bg-orange-100"}`}>
                {info.complete ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{info.label}</p>
                <p className="text-sm text-slate-900 mt-0.5 truncate">{info.valeur}</p>
              </div>
              <button className="text-xs text-emerald-600 hover:underline flex-shrink-0">Modifier</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-100 transition-colors">
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700 mb-1">Glissez vos documents ici</p>
        <p className="text-xs text-slate-500 mb-4">Tarifs, plaquettes, contrats (PDF)</p>
        <input
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          id="file-upload"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              setCompletion(100);
            }
          }}
        />
        <label htmlFor="file-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
          <Paperclip className="w-4 h-4" />
          Choisir un fichier
        </label>
      </div>
    </div>
  );
}