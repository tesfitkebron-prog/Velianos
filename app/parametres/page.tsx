"use client";

import { useState } from "react";
import { Lock, CreditCard, Bell, LogOut, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function ParametresPage() {
  return (
    <AppLayout>
      <ContenuParametres />
    </AppLayout>
  );
}

function ContenuParametres() {
  const [notifClient, setNotifClient] = useState(true);
  const [notifResume, setNotifResume] = useState(true);
  const [notifUrgence, setNotifUrgence] = useState(true);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900">Réglages</h1>

      <div className="space-y-6 mt-6">
        {/* MON COMPTE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900 mb-4">Mon compte</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nom</span>
              <span className="font-medium text-slate-900">Karim Martin</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-900">karim@plomberie-martin.fr</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-white border border-slate-200 text-slate-700 font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-slate-50">
            <Lock className="w-5 h-5" />
            Modifier le mot de passe
          </button>
        </div>

        {/* MON ABONNEMENT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900 mb-4">Mon abonnement</h2>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
            <p className="text-lg font-bold text-slate-900">Plan Pro - 49 € / mois</p>
            <p className="text-sm text-emerald-600 font-medium mt-1">Rentabilisé dès le 1er chantier sauvé.</p>
          </div>
          <button className="w-full bg-slate-900 text-white font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-slate-800">
            <CreditCard className="w-5 h-5" />
            Gérer mon abonnement
          </button>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            Notifications
          </h2>
          <div className="space-y-3">
            {[
              { id: "client", label: "Nouveau client récupéré", actif: notifClient, setActif: setNotifClient },
              { id: "resume", label: "Résumé du soir (19h)", actif: notifResume, setActif: setNotifResume },
              { id: "urgence", label: "Alertes urgences", actif: notifUrgence, setActif: setNotifUrgence },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-slate-700">{item.label}</span>
                <button
                  onClick={() => item.setActif(!item.actif)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    item.actif ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  aria-label={item.label}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      item.actif ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* DECONNEXION */}
        <button className="w-full bg-red-50 text-red-600 border border-red-200 font-medium h-12 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-red-100">
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}