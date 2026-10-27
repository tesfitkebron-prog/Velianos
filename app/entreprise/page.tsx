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
    if (section === "tarifs")
      setValeurEdition(tarifs.map((t) => `${t.nom} : ${t.prix}`).join("\n"));
  };

  const sauverEdition = () => {
    if (edition === "horaires") setHoraires(valeurEdition);
    if (edition === "zones") setZones(valeurEdition);
    if (edition === "tarifs") {
      const lignes = valeurEdition.split("\n").filter(Boolean);
      setTarifs(
        lignes.map((l) => {
          const [nom, ...prixParts] = l.split(":");
          return { nom: nom.trim(), prix: prixParts.join(":").trim() };
        }),
      );
    }
    setEdition(null);
    setValeurEdition("");
  };

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-4 max-w-3xl md:mx-auto">
      <p className="px-1 text-sm font-normal leading-snug text-slate-500">
        Les informations que votre assistant utilise pour répondre à vos
        clients.
      </p>

      {/* HORAIRES */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              Horaires de travail
            </h2>
            <p className="text-sm font-normal text-slate-600 mt-1.5">
              {horaires}
            </p>
          </div>
          <button
            onClick={() => ouvrirEdition("horaires")}
            className="text-xs font-medium text-blue-700 bg-blue-50 active:scale-95 px-3 min-h-[44px] rounded-lg flex items-center gap-1.5 flex-shrink-0 transition-transform"
          >
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </button>
        </div>
      </div>

      {/* ZONES */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              Zones d&apos;intervention
            </h2>
            <p className="text-sm font-normal text-slate-600 mt-1.5">{zones}</p>
          </div>
          <button
            onClick={() => ouvrirEdition("zones")}
            className="text-xs font-medium text-blue-700 bg-blue-50 active:scale-95 px-3 min-h-[44px] rounded-lg flex items-center gap-1.5 flex-shrink-0 transition-transform"
          >
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </button>
        </div>
      </div>

      {/* TARIFS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Prestations et tarifs
          </h2>
          <button
            onClick={() => ouvrirEdition("tarifs")}
            className="text-xs font-medium text-blue-700 bg-blue-50 active:scale-95 px-3 min-h-[44px] rounded-lg flex items-center gap-1.5 flex-shrink-0 transition-transform"
          >
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </button>
        </div>
        <div className="mt-2">
          {tarifs.map((t, i) => (
            <div
              key={i}
              className="flex justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0"
            >
              <span className="text-sm font-normal text-slate-600">
                {t.nom}
              </span>
              <span className="text-sm font-medium text-slate-900">
                {t.prix}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODALE EDITION */}
      {edition && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-end md:items-center justify-center"
          onClick={() => setEdition(null)}
        >
          <div
            className="bg-white rounded-t-3xl md:rounded-xl p-5 w-full max-w-md shadow-2xl animate-[sheetUp_.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-4">
              Modifier{" "}
              {edition === "horaires"
                ? "les horaires"
                : edition === "zones"
                  ? "les zones"
                  : "les tarifs"}
            </h3>
            <textarea
              value={valeurEdition}
              onChange={(e) => setValeurEdition(e.target.value)}
              rows={edition === "tarifs" ? 6 : 3}
              className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none mb-4"
              placeholder={
                edition === "tarifs" ? "Une ligne par prestation : Nom : Prix" : ""
              }
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEdition(null);
                  setValeurEdition("");
                }}
                className="flex-1 text-sm font-medium text-slate-600 active:bg-slate-100 px-4 py-3 rounded-xl min-h-[48px] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={sauverEdition}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.99] transition-all"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BADGE SECURITE */}
      <div className="text-center pt-2">
        <p className="text-[11px] font-normal text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Vos données sont sécurisées et confidentielles.
        </p>
      </div>
    </div>
  );
}
