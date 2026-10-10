"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding } from "./actions";

const paniers = [
  { valeur: "100", label: "100 €" },
  { valeur: "150", label: "150 €" },
  { valeur: "200", label: "200 €" },
  { valeur: "250", label: "250 €+" },
];

const numeroVelianos = "01 84 60 83 47";
const codeRenvoi = "*61*0184608347#";

export default function OnboardingPage() {
  const router = useRouter();
  const [etape, setEtape] = useState(1);
  const [nomCommercial, setNomCommercial] = useState("");
  const [panierMoyen, setPanierMoyen] = useState("150");
  const [ville, setVille] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState<"numero" | "code" | null>(null);

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const metadata = user.user_metadata as {
        first_name?: string;
        last_name?: string;
      };

      if (actif) {
        setPrenom(metadata.first_name || "");
        setNom(metadata.last_name || "");
      }
    };

    void charger();

    return () => {
      actif = false;
    };
  }, [router]);

  const copier = async (valeur: string, type: "numero" | "code") => {
    try {
      await navigator.clipboard.writeText(valeur);
    } catch {}
    setCopie(type);
    setTimeout(() => setCopie(null), 2000);
  };

  const terminer = async () => {
    setChargement(true);
    setErreur(null);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setErreur("Votre session a expiré. Reconnectez-vous.");
      setChargement(false);
      return;
    }

    const montant = Number(panierMoyen);

    const resultat = await completeOnboarding({
      accessToken: session.access_token,
      companyName: nomCommercial.trim(),
      phone: "",
      city: ville.trim(),
      firstName: prenom,
      lastName: nom,
      workingHours: {},
      zones: ville.trim() ? [ville.trim()] : [],
      services: [{ name: "Intervention standard", min: String(montant), max: String(montant) }],
    });

    if (resultat.error) {
      setErreur(resultat.error);
      setChargement(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:py-16">
      <div className="max-w-lg mx-auto mt-8 md:mt-20">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          {/* ÉTAPE 1 */}
          {etape === 1 && (
            <div>
              <Rocket className="w-12 h-12 text-emerald-500" />

              <h1 className="text-2xl font-bold text-slate-900 mt-4">
                Bienvenue sur Velianos
              </h1>
              <p className="text-slate-600 mt-1">Quelques infos pour démarrer.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Nom commercial
                  </label>
                  <input
                    type="text"
                    value={nomCommercial}
                    onChange={(event) => setNomCommercial(event.target.value)}
                    placeholder="Plomberie Martin"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Panier moyen par intervention
                  </label>
                  <select
                    value={panierMoyen}
                    onChange={(event) => setPanierMoyen(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {paniers.map((panier) => (
                      <option key={panier.valeur} value={panier.valeur}>
                        {panier.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Ville principale
                  </label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(event) => setVille(event.target.value)}
                    placeholder="Lyon"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={() => setEtape(2)}
                disabled={!nomCommercial.trim() || !ville.trim()}
                className="w-full mt-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold transition-colors"
              >
                Continuer
              </button>
            </div>
          )}

          {/* ÉTAPE 2 */}
          {etape === 2 && (
            <div>
              <Rocket className="w-12 h-12 text-emerald-500" />

              <h1 className="text-2xl font-bold text-slate-900 mt-4">Votre numéro unique</h1>
              <p className="text-slate-600 mt-1">
                C&apos;est le numéro que vos clients appellent.
              </p>

              <div className="relative bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center mt-6">
                <p className="text-xs text-emerald-700 uppercase tracking-wide">
                  Votre numéro Velianos
                </p>
                <p className="text-3xl font-bold text-emerald-600 font-mono mt-2">
                  {numeroVelianos}
                </p>
                <button
                  onClick={() => void copier(numeroVelianos, "numero")}
                  className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  aria-label="Copier le numéro"
                >
                  {copie === "numero" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={() => setEtape(3)}
                className="w-full mt-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold transition-colors"
              >
                Continuer
              </button>
            </div>
          )}

          {/* ÉTAPE 3 */}
          {etape === 3 && (
            <div>
              <Rocket className="w-12 h-12 text-emerald-500" />

              <h1 className="text-2xl font-bold text-slate-900 mt-4">
                Activez votre assistant
              </h1>
              <p className="text-slate-600 mt-2">
                Prenez votre téléphone portable et composez ce code :
              </p>

              <div className="bg-slate-900 rounded-xl p-6 mt-4 text-center">
                <p className="text-xl font-mono text-emerald-400">{codeRenvoi}</p>
                <button
                  onClick={() => void copier(codeRenvoi, "code")}
                  className="mt-3 px-4 py-2 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {copie === "code" ? "Copié" : "Copier"}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-900">
                  Une fois ce code activé, votre assistant répondra automatiquement quand
                  vous ne pourrez pas décrocher.
                </p>
              </div>

              {erreur && <p className="text-sm text-red-500 mt-4">{erreur}</p>}

              <button
                onClick={() => void terminer()}
                disabled={chargement}
                className="w-full mt-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-900 font-bold transition-colors"
              >
                {chargement ? "Activation..." : "Accéder à mon tableau de bord"}
              </button>
            </div>
          )}
        </div>

        {/* PROGRESSION */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3].map((numero) => (
            <span
              key={numero}
              className={`h-2 rounded-full transition-all ${
                numero === etape ? "w-8 bg-emerald-500" : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-xs text-slate-500 mt-3">
          Étape {etape} sur 3
        </p>
      </div>
    </main>
  );
}