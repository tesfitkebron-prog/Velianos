"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Phone as PhoneIcon, Copy, Check, Info, AlertCircle, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding } from "./actions";

const paniers = [
  { valeur: "100", label: "100 €" },
  { valeur: "150", label: "150 €" },
  { valeur: "200", label: "200 €" },
  { valeur: "250", label: "250 €+" },
];

const genererNumero = () => {
  const chiffres = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `01 84 60 ${chiffres.slice(0, 2)} ${chiffres.slice(2)}`;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [nomCommercial, setNomCommercial] = useState("");
  const [panierMoyen, setPanierMoyen] = useState("150");
  const [ville, setVille] = useState("");
  const [telephone, setTelephone] = useState("");
  const [numero, setNumero] = useState("");
  const [copie, setCopie] = useState<"numero" | "code" | null>(null);

  const suffixe = numero.replace(/\D/g, "").slice(-4);
  const codeRenvoi = `*61*018460${suffixe}#`;

  const copier = async (valeur: string, type: "numero" | "code") => {
    try {
      await navigator.clipboard.writeText(valeur);
    } catch {}
    setCopie(type);
    setTimeout(() => setCopie(null), 2000);
  };

  const terminer = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const metadata = (user?.user_metadata ?? {}) as {
        first_name?: string;
        last_name?: string;
      };

      const montant = Number(panierMoyen);

      await completeOnboarding({
        accessToken: session.access_token,
        companyName: nomCommercial.trim(),
        phone: telephone.trim(),
        city: ville.trim(),
        firstName: metadata.first_name ?? "",
        lastName: metadata.last_name ?? "",
        workingHours: {},
        zones: ville.trim() ? [ville.trim()] : [],
        services: [
          { name: "Intervention standard", min: String(montant), max: String(montant) },
        ],
      }).catch(() => null);
    }

    router.push("/dashboard");
    router.refresh();
  };

  const formulaireValide =
    nomCommercial.trim().length > 0 && ville.trim().length > 0 && telephone.trim().length > 0;

  const progression = etape === 1 ? 33 : etape === 2 ? 66 : 100;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* PROGRESSION */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-2">Étape {etape} sur 3</p>
          <div className="w-full h-2 bg-slate-200 rounded-full">
            <div
              className="bg-[#00D26A] h-full rounded-full transition-all duration-500"
              style={{ width: `${progression}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Vous pouvez passer chaque étape et revenir plus tard.
          </p>
        </div>

        {/* ÉTAPE 1 */}
        {etape === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            <span className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
              <Rocket className="w-7 h-7 text-[#0F172A]" />
            </span>

            <h1 className="text-2xl font-bold text-[#0F172A] mt-4">Bienvenue sur Velianos</h1>
            <p className="text-sm text-slate-500 mt-1">Quelques infos pour démarrer.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Nom commercial
                </label>
                <input
                  type="text"
                  value={nomCommercial}
                  onChange={(event) => setNomCommercial(event.target.value)}
                  placeholder="Plomberie Martin"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Panier moyen par intervention
                </label>
                <select
                  value={panierMoyen}
                  onChange={(event) => setPanierMoyen(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[#0F172A] focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"
                >
                  {paniers.map((panier) => (
                    <option key={panier.valeur} value={panier.valeur}>
                      {panier.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Ville principale
                </label>
                <input
                  type="text"
                  value={ville}
                  onChange={(event) => setVille(event.target.value)}
                  placeholder="Lyon"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                  Téléphone professionnel
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(event) => setTelephone(event.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const nouveauNumero = genererNumero();
                setNumero(nouveauNumero);
                setEtape(2);
              }}
              disabled={!formulaireValide}
              className="mt-8 w-full bg-[#00D26A] hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
            >
              Continuer
            </button>

            <button
              onClick={() => void terminer()}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center text-center text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Passer cette étape
            </button>
          </div>
        )}

        {/* ÉTAPE 2 */}
        {etape === 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            <span className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
              <PhoneIcon className="w-7 h-7 text-[#0F172A]" />
            </span>

            <h1 className="text-2xl font-bold text-[#0F172A] mt-4">Votre numéro unique</h1>
            <p className="text-sm text-slate-500 mt-1">
              Voici le numéro que vos clients verront quand vous ne pouvez pas décrocher.
            </p>

            <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl text-center relative">
              <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Votre numéro Velianos
              </p>
              <p className="text-2xl md:text-3xl font-bold text-[#0F172A] font-mono mt-2">
                {numero}
              </p>
              <button
                onClick={() => void copier(numero, "numero")}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Copier le numéro"
              >
                {copie === "numero" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                Ce numéro est unique et vous appartient. Il reste actif tant que votre
                abonnement est actif.
              </p>
            </div>

            <button
              onClick={() => setEtape(3)}
              className="mt-8 w-full bg-[#00D26A] hover:brightness-95 text-white font-semibold py-4 rounded-xl transition-all"
            >
              Continuer
            </button>

            <button
              onClick={() => void terminer()}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center text-center text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Passer cette étape
            </button>
          </div>
        )}

        {/* ÉTAPE 3 */}
        {etape === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            <span className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
              <Wrench className="w-7 h-7 text-[#0F172A]" />
            </span>

            <h1 className="text-2xl font-bold text-[#0F172A] mt-4">Activez votre assistant</h1>
            <p className="text-sm text-slate-500 mt-1">
              Prenez votre téléphone mobile et composez ce code :
            </p>

            <div className="mt-6 p-6 bg-slate-900 rounded-xl">
              <p className="text-xs font-semibold text-[#00D26A] tracking-wide uppercase text-center">
                Code à composer sur votre mobile
              </p>
              <p className="text-xl font-mono text-white mt-3 text-center">{codeRenvoi}</p>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => void copier(codeRenvoi, "code")}
                  className="bg-white text-[#0F172A] px-4 py-2 rounded-lg inline-flex items-center gap-2 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  {copie === "code" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copie === "code" ? "Code copié" : "Copier le code"}
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900">
                Le renvoi d&apos;appel est facturé par votre opérateur (~0,15€/min). Gratuit
                chez Free, Orange et SFR sur la plupart des forfaits.
              </p>
            </div>

            <ol className="mt-6 space-y-2">
              {[
                "Tapez le code ci-dessus sur votre mobile",
                "Appuyez sur la touche d'appel",
                "Vous verrez un message de confirmation",
                "Testez : appelez-vous depuis un autre téléphone, ne décrochez pas. Votre assistant doit répondre.",
              ].map((instruction, index) => (
                <li key={index} className="flex gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-[#0F172A] text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>

            <button
              onClick={() => void terminer()}
              className="mt-8 w-full bg-[#00D26A] hover:brightness-95 text-white font-semibold py-4 rounded-xl transition-all"
            >
              Accéder à mon tableau de bord
            </button>

            <button
              onClick={() => void terminer()}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center text-center text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Passer cette étape
            </button>
          </div>
        )}
      </div>
    </main>
  );
}