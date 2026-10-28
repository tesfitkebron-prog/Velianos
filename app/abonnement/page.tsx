"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, LogOut, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { marquerDeconnexionVolontaire } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { accesAutorise } from "@/lib/subscription";
import {
  loadWorkspaceProfile,
  resetWorkspaceProfileCache,
} from "@/lib/workspace";

const MESSAGE_ESSAI_TERMINE =
  "Votre essai gratuit est terminé. Pour continuer à recevoir vos clients, abonnez-vous pour 49€/mois.";

export default function AbonnementPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [deconnexion, setDeconnexion] = useState(false);

  useEffect(() => {
    let monte = true;

    const verifierAcces = async () => {
      const profil = await loadWorkspaceProfile();
      if (!monte || !profil.companyId) return;

      const autorise = accesAutorise(
        profil.subscriptionStatus,
        profil.subscriptionPlan,
        profil.trialEndsAt,
      );

      if (autorise) {
        router.replace("/compte/abonnement");
      }
    };

    void verifierAcces();

    return () => {
      monte = false;
    };
  }, [router]);

  const sabonner = () => {
    showToast(
      "Le paiement sécurisé arrive bientôt. Contactez le support pour activer votre abonnement.",
      { variant: "info", duration: 5000 },
    );
  };

  const seDeconnecter = async () => {
    if (deconnexion) return;

    setDeconnexion(true);
    marquerDeconnexionVolontaire();

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // On redirige quand même vers l'écran de connexion.
    }

    resetWorkspaceProfileCache();
    router.replace("/login");
    router.refresh();
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F5F5F7] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark size={64} />
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">
              Velianos
            </p>
            <p className="mt-1 text-base font-medium text-slate-500">
              Votre assistante terrain
            </p>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <CreditCard className="h-7 w-7" aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
            Votre essai est terminé
          </h1>
          <p className="mt-3 text-lg font-semibold leading-relaxed text-slate-700">
            {MESSAGE_ESSAI_TERMINE}
          </p>

          <div className="mt-6 flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">
              49 €
            </span>
            <span className="text-base font-medium text-slate-500">/ mois</span>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-6 w-full"
            onClick={sabonner}
          >
            S&apos;abonner maintenant
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="mt-3 w-full"
            loading={deconnexion}
            onClick={() => void seDeconnecter()}
          >
            {!deconnexion && <LogOut className="h-5 w-5" aria-hidden="true" />}
            Se déconnecter
          </Button>

          <p className="mt-6 flex items-start gap-2 text-sm font-medium leading-relaxed text-slate-500">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            Sans engagement. Résiliable à tout moment.
          </p>
        </Card>
      </div>
    </main>
  );
}
