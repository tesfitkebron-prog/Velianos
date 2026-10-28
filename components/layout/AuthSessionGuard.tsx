"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { consommerDeconnexionVolontaire } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

const CHEMINS_AUTH = ["/login", "/signup", "/bienvenue"];

function estCheminAuth(pathname: string): boolean {
  return CHEMINS_AUTH.some(
    (chemin) => pathname === chemin || pathname.startsWith(`${chemin}/`),
  );
}

/**
 * Surveille l'état de session Supabase.
 * Sur SIGNED_OUT (hors déconnexion volontaire) ou jeton expiré, redirige vers
 * /login en affichant le message d'expiration côté page de connexion.
 */
export function AuthSessionGuard(): null {
  const router = useRouter();
  const pathname = usePathname();
  const cheminCourant = useRef(pathname);
  cheminCourant.current = pathname;

  useEffect(() => {
    const supabase = createClient();
    let monte = true;
    let avaitSession = false;
    let redirectionEnCours = false;
    let minuteur: ReturnType<typeof setTimeout> | null = null;

    const redirigerVersLogin = () => {
      if (!monte || redirectionEnCours) return;
      if (estCheminAuth(cheminCourant.current)) return;

      redirectionEnCours = true;
      router.replace("/login?session=expired");
      router.refresh();
    };

    const planifierExpiration = (expiresAt?: number | null) => {
      if (minuteur) clearTimeout(minuteur);
      if (!expiresAt) return;

      const delai = expiresAt * 1000 - Date.now();
      minuteur = setTimeout(
        () => {
          void verifierExpiration();
        },
        Math.max(delai + 1_000, 1_000),
      );
    };

    const verifierExpiration = async () => {
      const { data } = await supabase.auth.getSession();
      if (!monte) return;

      const session = data.session;
      if (!session) {
        redirigerVersLogin();
        return;
      }

      avaitSession = true;

      if (
        session.expires_at &&
        session.expires_at * 1000 <= Date.now() + 5_000
      ) {
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {
          // La session locale est déjà inutilisable.
        }
        redirigerVersLogin();
        return;
      }

      planifierExpiration(session.expires_at);
    };

    const verifierSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!monte || !data.session) return;

      avaitSession = true;
      planifierExpiration(data.session.expires_at);
    };

    void verifierSession();

    const { data: ecoute } = supabase.auth.onAuthStateChange(
      (evenement, session) => {
        if (evenement === "SIGNED_OUT") {
          if (!avaitSession) return;

          avaitSession = false;
          if (minuteur) clearTimeout(minuteur);

          if (consommerDeconnexionVolontaire()) return;

          // On sort du callback Supabase avant de naviguer.
          window.setTimeout(redirigerVersLogin, 0);
          return;
        }

        if (
          evenement === "INITIAL_SESSION" ||
          evenement === "SIGNED_IN" ||
          evenement === "TOKEN_REFRESHED" ||
          evenement === "USER_UPDATED"
        ) {
          avaitSession = Boolean(session);
          if (session) {
            redirectionEnCours = false;
            planifierExpiration(session.expires_at);
          }
        }
      },
    );

    const surVisibilite = () => {
      if (document.visibilityState !== "visible") return;
      void verifierExpiration();
    };

    document.addEventListener("visibilitychange", surVisibilite);

    return () => {
      monte = false;
      if (minuteur) clearTimeout(minuteur);
      document.removeEventListener("visibilitychange", surVisibilite);
      ecoute.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
