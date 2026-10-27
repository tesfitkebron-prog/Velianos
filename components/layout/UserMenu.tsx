"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadWorkspaceProfile, resetWorkspaceProfileCache } from "@/lib/workspace";

type UserMenuProps = {
  onSignOut?: () => void;
};

export function UserMenu({ onSignOut }: UserMenuProps) {
  const router = useRouter();
  const [nom, setNom] = useState("Utilisateur");
  const [email, setEmail] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      const profil = await loadWorkspaceProfile();
      if (!actif) return;
      setNom(profil.fullName);
      setEmail(profil.email);
      setChargement(false);
    };

    void charger();

    return () => {
      actif = false;
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    resetWorkspaceProfileCache();
    onSignOut?.();
    router.push("/login");
    router.refresh();
  };

  const initiales = (chargement ? "…" : nom.charAt(0).toUpperCase()) || "U";

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {initiales}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold truncate">{nom}</p>
          <p className="text-slate-400 text-xs font-normal truncate">
            {email || "—"}
          </p>
        </div>
        <button
          onClick={() => void handleSignOut()}
          className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-lg text-slate-400 active:bg-white/10 transition-colors"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
        <span className="text-blue-400 text-xs font-medium">Ligne active</span>
      </div>
    </div>
  );
}

export default UserMenu;
