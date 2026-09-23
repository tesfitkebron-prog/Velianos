"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Sparkles, Calendar, Inbox, Users, FileText,
  MessageSquare, BarChart3, FileBarChart, Building2, Phone,
  Globe, UserCog, Settings, LogOut, ChevronDown, ChevronUp,
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

export function Sidebar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-border flex-col fixed left-0 top-0 h-screen z-30">
      {/* EN-TÊTE FIXE */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded bg-primary" />
          <h1 className="text-xl font-bold text-text-primary">Velianos</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors">
          <Building2 size={16} className="text-text-secondary" />
          <span className="text-sm text-text-primary">Plomberie Karim</span>
          <ChevronDown size={14} className="text-text-secondary ml-auto" />
        </div>
      </div>

      {/* NAVIGATION SCROLLABLE */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <p className="text-xs uppercase text-text-secondary/60 px-3 mb-2">Principal</p>
          <div className="space-y-0.5">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"}`}>
                  <Icon size={18} />{item.label}{item.badge && <span className={`ml-auto ${item.badgeClass || badgeRed}`}>{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase text-text-secondary/60 px-3 mb-2">Analyse</p>
          <div className="space-y-0.5">
            {analysisNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"}`}><Icon size={18} />{item.label}</Link>;
            })}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase text-text-secondary/60 px-3 mb-2">Configuration</p>
          <div className="space-y-0.5">
            {configNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"}`}><Icon size={18} />{item.label}{item.badge && <span className={`ml-auto ${item.badgeClass || badgeRed}`}>{item.badge}</span>}</Link>;
            })}
          </div>
        </div>
      </nav>

      {/* BLOC UTILISATEUR FIXE EN BAS */}
      <div className="flex-shrink-0 p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">K</div>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-text-primary truncate">Karim B.</p><p className="text-xs text-text-secondary">Administrateur</p></div>
          {dropdownOpen ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
        </div>
        {dropdownOpen && (
          <div className="mt-1 bg-white border border-border rounded-lg shadow-sm py-1">
            <Link href="/parametres" className="block px-3 py-2 text-sm text-text-primary hover:bg-gray-100 rounded">Mon profil</Link>
            <Link href="/parametres" className="block px-3 py-2 text-sm text-text-primary hover:bg-gray-100 rounded">Aide & support</Link>
            <Link href="/" className="block px-3 py-2 text-sm text-text-primary hover:bg-gray-100 rounded">Déconnexion</Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;