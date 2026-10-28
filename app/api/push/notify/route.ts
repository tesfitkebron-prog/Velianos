import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { envoyerNotificationPush } from "@/lib/push/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NotifyBody = {
  companyId?: unknown;
  title?: unknown;
  body?: unknown;
  url?: unknown;
  tag?: unknown;
};

function texte(valeur: unknown): string {
  return typeof valeur === "string" ? valeur.trim() : "";
}

function jetonAutorise(request: Request): boolean {
  const secret = process.env.PUSH_NOTIFY_SECRET?.trim();
  if (!secret) return false;

  const entete = request.headers.get("authorization") ?? "";
  const jeton = entete.toLowerCase().startsWith("bearer ")
    ? entete.slice(7).trim()
    : "";
  return jeton === secret;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as NotifyBody | null;
    if (!body) {
      return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
    }

    const titre = texte(body.title);
    const contenu = texte(body.body);
    if (!titre || !contenu) {
      return NextResponse.json(
        { error: "Titre et message obligatoires." },
        { status: 400 },
      );
    }

    let companyId = texte(body.companyId);

    if (jetonAutorise(request)) {
      if (!companyId) {
        return NextResponse.json(
          { error: "companyId obligatoire pour un appel serveur." },
          { status: 400 },
        );
      }
    } else {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: "Votre session a expiré." },
          { status: 401 },
        );
      }

      const { data: profil, error: profilError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      if (profilError) throw profilError;

      const companyUtilisateur =
        (profil?.company_id as string | undefined) ?? "";
      if (!companyUtilisateur) {
        return NextResponse.json(
          { error: "Aucune entreprise associée à ce compte." },
          { status: 403 },
        );
      }

      if (companyId && companyId !== companyUtilisateur) {
        return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
      }

      companyId = companyUtilisateur;
    }

    const resultat = await envoyerNotificationPush(companyId, {
      title: titre,
      body: contenu,
      url: texte(body.url) || "/clients",
      tag: texte(body.tag) || "velianos-notification",
    });

    return NextResponse.json({
      ok: true,
      configure: resultat.configure,
      sent: resultat.envoyees,
      failed: resultat.echouees,
    });
  } catch (erreur) {
    console.error("Envoi de la notification push impossible.", erreur);
    return NextResponse.json(
      { error: "Impossible d'envoyer la notification." },
      { status: 500 },
    );
  }
}
