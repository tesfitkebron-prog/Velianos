"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Mail, Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { loadWorkspaceProfile } from "@/lib/workspace";

export default function SecuritePage() {
  return (
    <AppLayout>
      <ContenuSecurite />
    </AppLayout>
  );
}

function ContenuSecurite() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    let monte = true;
    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (monte) setEmail(profil.email);
    };
    void charger();
    return () => {
      monte = false;
    };
  }, []);

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-4 max-w-2xl md:mx-auto">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0F172A]">
            <Shield className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#0F172A]">
              Mot de passe
            </h2>
            <p className="mt-1 text-sm font-normal leading-relaxed text-slate-600">
              Pour changer votre mot de passe, déconnectez-vous puis utilisez
              « Mot de passe oublié » sur l&apos;écran de connexion.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Adresse de connexion
        </h2>
        <p className="mt-1 break-all text-sm font-normal text-slate-600">
          {email || "Aucune adresse enregistrée"}
        </p>
        <p className="mt-2 text-xs font-normal leading-relaxed text-slate-500">
          C&apos;est l&apos;adresse qui reçoit les liens de réinitialisation.
        </p>
      </section>

      <Link
        href="mailto:support@velianos.fr?subject=Acc%C3%A8s%20%C3%A0%20mon%20compte"
        className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-colors active:bg-slate-50 active:scale-[0.99]"
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#0F172A]">
          <Mail className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-[#0F172A]">
            Contacter le support
          </span>
          <span className="block text-[11px] font-normal text-slate-400">
            Réponse sous 24 h ouvrées
          </span>
        </span>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
      </Link>

      <p className="px-1 text-xs font-normal leading-relaxed text-slate-500">
        Si vous avez perdu l&apos;accès à votre boîte e-mail, écrivez à
        support@velianos.fr : nous vérifions votre identité avant de
        réinitialiser l&apos;accès.
      </p>
    </div>
  );
}
