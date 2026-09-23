"use client";

import { useState } from "react";
import {
  LayoutDashboard, Sparkles, Calendar, Inbox, Users, FileText,
  MessageSquare, BarChart3, FileBarChart, Building2, Phone,
  Globe, UserCog, Settings, X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const badgeRed = "bg-danger text-white text-xs px-1.5 py-0.5 rounded-full font-medium";
const badgeOrange = "bg-warning text-white text-xs px-1.5 py-0.5 rounded-full font-medium";

const mainNav = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/nova", label: "Nova", icon: Sparkles },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/demandes", label: "Demandes", icon: Inbox, badge: "3", badgeClass: badgeRed },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/devis", label: "Devis & Factures", icon: FileText },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: "2", badgeClass: badgeRed },
];
const analysisNav = [
  { href: "/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/rapports", label: "Rapports", icon: FileBarChart },
];
const configNav = [
  { href: "/entreprise", label: "Mon entreprise", icon: Building2 },
  { href: "/connexion-telephone", label: "Connexion téléphone", icon: Phone, badge: "!", badgeClass: badgeOrange },
  { href: "/connexion-agenda", label: "Connexion agenda", icon: Calendar, badge: "!", badgeClass: badgeOrange },
  { href: "/site-web", label: "Site web", icon: Globe, badge: "!", badgeClass: badgeOrange },
  { href: "/equipe", label: "Équipe", icon: UserCog },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 w-11 h-11 bg-white border border-border rounded-lg flex items-center justify-center shadow-sm"
          aria-label="Ouvrir le menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      )}

      {isOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <aside className="md:hidden fixed top-0 left-0 h-full w-72 bg-white border-r border-border z-50 transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-lg font-bold text-text-primary">Velianos</span>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Fermer le menu">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <nav className="p-4 overflow-y-auto">
              <p className="text-xs uppercase text-text-secondary/60 px-3 mb-2">Principal</p>
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-gray-100">
                    <Icon size={18} />{item.label}{item.badge && <span className={`ml-auto ${item.badgeClass}`}>{item.badge}</span>}
                  </Link>
                );
              })}
              <p className="text-xs uppercase text-text-secondary/60 px-3 mb-2 mt-4">Analyse</p>
              {analysisNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-gray-100">
                    <Icon size={18} />{item.label}
                  </Link>
                );
              })}
              <p className="text-xs uppercase text-text-secondary/60 px-3 mb-2 mt-4">Configuration</p>
              {configNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-gray-100">
                    <Icon size={18} />{item.label}{item.badge && <span className={`ml-auto ${item.badgeClass}`}>{item.badge}</span>}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}