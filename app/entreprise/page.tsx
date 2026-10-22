"use client";

import { useState } from "react";
import { Pencil, Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

type SectionKey = "horaires" | "zones" | "tarifs";

const horairesParDefaut = "Lundi au Vendredi, de 8h à 18h";
const zonesParDefaut = "Lyon, Villeurbanne, Caluire-et-Cuire";
const tarifsParDefaut = [
  { nom: "Débouchage évier", prix: "80€ - 150€" },
  { nom: "Réparation fuite", prix: "120€ - 200€" },
  { nom: "Remplacement chauffe-eau", prix: "400€ - 800€" },
];

export default function EntreprisePage() {
  return (
    <AppLayout>
      <ContenuEntreprise />
    </AppLayout>
  );
}

function ContenuEntreprise() {
  const [horaires, setHoraires] = useState(horairesParDefaut);
  const [zones, setZones] = useState(zonesParDefaut);
  const [tarifs, setTarifs] = useState(tarifsParDefaut);
  const [edition, setEdition] = useState<SectionKey | null>(null);
  const [valeurEdition, setValeurEdition] = useState("");

  const ouvrirEdition = (section: SectionKey) => {
    setEdition(section);
    if (section === "horaires") setValeurEdition(horaires);
    if (section === "zones") setValeurEdition(zones);
    if (section === "tarifs") setValeurEdition(tarifs.map(t => `${t.nom} : ${t.prix}`).join("\n"));
  };

  const sauverEdition = () => {
    if (edition === "horaires") setHoraires(valeurEdition);
    if (edition === "zones") setZones(valeurEdition);
    if (edition === "tarifs") {
      const lignes = valeurEdition.split("\n").filter(Boolean);
      setTarifs(lignes.map(l => {
        const [nom, ...prixParts] = l.split(":");
        return { nom: nom.trim(), prix: prixParts.join(":").trim() };
      }));
    }
    setEdition(null);
    setValeurEdition("");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mon entreprise</h1>
        <p className="text-sm text-slate-500 mt-1">Les informations que votre assistant utilise pour répondre à vos clients.</p>
      </div>

      <div className="space-y-4 mt-6">
        {/* HORAIRES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="font-bold text-slate-900">Horaires de travail</h2>
              <p className="text-slate-600 mt-2">{horaires}</p>
            </div>
            <button onClick={() => ouvrirEdition("horaires")} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
          </div>
        </div>

        {/* ZONES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="font-bold text-slate-900">Zones d'intervention</h2>
              <p className="text-slate-600 mt-2">{zones}</p>
            </div>
            <button onClick={() => ouvrirEdition("zones")} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
          </div>
        </div>

        {/* TARIFS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
          <div className="flex items-start justify-between mb-2">
            <h2 className="font-bold text-slate-900">Mes prestations et tarifs</h2>
            <button onClick={() => ouvrirEdition("tarifs")} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
          </div>
          <div className="space-y-2">
            {tarifs.map((t, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-600">{t.nom}</span>
                <span className="font-medium text-slate-900">{t.prix}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALE EDITION */}
      {edition && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4" onClick={() => setEdition(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Modifier {edition === "horaires" ? "les horaires" : edition === "zones" ? "les zones" : "les tarifs"}
            </h3>
            <textarea
              value={valeurEdition}
              onChange={e => setValeurEdition(e.target.value)}
              rows={edition === "tarifs" ? 6 : 3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none mb-4"
              placeholder={edition === "tarifs" ? "Une ligne par prestation : Nom : Prix" : ""}
            />
            <div className="flex gap-3">
              <button onClick={() => { setEdition(null); setValeurEdition(""); }} className="flex-1 text-slate-600 hover:bg-slate-100 px-4 py-3 rounded-xl min-h-[48px]">Annuler</button>
              <button onClick={sauverEdition} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px]">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* BADGE SECURITE */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          Vos données sont sécurisées et confidentielles.
        </p>
      </div>
    </div>
  );
}