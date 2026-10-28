import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AbonnementBody = {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

function texte(valeur: unknown): string {
  return typeof valeur === "string" ? valeur.trim() : "";
}

export async function POST(request: Request) {
  try {
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

    const companyId = (profil?.company_id as string | undefined) ?? "";
    if (!companyId) {
      return NextResponse.json(
        { error: "Aucune entreprise associée à ce compte." },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | AbonnementBody
      | null;
    const endpoint = texte(body?.endpoint);
    const p256dh = texte(body?.keys?.p256dh);
    const auth = texte(body?.keys?.auth);

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: "Abonnement push invalide." },
        { status: 400 },
      );
    }

    try {
      const url = new URL(endpoint);
      if (url.protocol !== "https:") throw new Error("protocol");
    } catch {
      return NextResponse.json(
        { error: "Endpoint push invalide." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète." },
        { status: 500 },
      );
    }

    const { error } = await admin.from("push_subscriptions").upsert(
      {
        company_id: companyId,
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (erreur) {
    console.error("Enregistrement de l'abonnement push impossible.", erreur);
    return NextResponse.json(
      { error: "Impossible d'enregistrer cet appareil." },
      { status: 500 },
    );
  }
}
