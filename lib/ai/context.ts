import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  construireSystemPrompt,
  type ContexteAssistant,
  type TarifAssistant,
} from "@/lib/ai-prompt";
import { formaterTelephone } from "@/lib/clients";

type CompanyRow = {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  working_hours: unknown;
  knowledge_base: string | null;
};

type KnowledgeRow = {
  type: string | null;
  content: string | null;
};

function formaterHoraires(valeur: unknown): string {
  if (!valeur || typeof valeur !== "object") return "";
  const objet = valeur as Record<string, unknown>;
  if (typeof objet.label === "string" && objet.label.trim()) {
    return objet.label.trim();
  }

  const jours = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];

  return jours
    .flatMap((jour) => {
      const plage = objet[jour];
      if (!plage || typeof plage !== "object") return [];
      const { start, end } = plage as { start?: string; end?: string };
      if (!start || !end) return [];
      return [
        `${jour.charAt(0).toUpperCase()}${jour.slice(1)} ${start}-${end}`,
      ];
    })
    .join(" · ");
}

export type ContexteEntreprise = {
  companyId: string;
  companyName: string;
  contexte: ContexteAssistant;
  systemPrompt: string;
};

/**
 * Charge toutes les informations utiles au prompt système d'une entreprise :
 * profil, zone, tarifs, ton, vocabulaire et texte extrait des PDF.
 */
export async function chargerContexteAssistant(
  companyId: string,
): Promise<ContexteEntreprise | null> {
  const admin = createAdminClient();
  if (!admin) {
    console.error("Client Supabase admin indisponible.");
    return null;
  }

  const [
    entrepriseRes,
    zonesRes,
    tarifsRes,
    preferencesRes,
    documentsRes,
  ] = await Promise.all([
    admin
      .from("companies")
      .select(
        "id, name, phone, address, description, working_hours, knowledge_base",
      )
      .eq("id", companyId)
      .maybeSingle(),
    admin
      .from("zones")
      .select("city")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("city", { ascending: true }),
    admin
      .from("pricing_rules")
      .select("label, min_price_cents, max_price_cents")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("label", { ascending: true }),
    admin
      .from("company_knowledge")
      .select("type, content")
      .eq("company_id", companyId)
      .in("type", ["assistant_tone", "assistant_vocabulary"])
      .order("created_at", { ascending: false }),
    admin
      .from("company_knowledge")
      .select("title")
      .eq("company_id", companyId)
      .eq("type", "pdf")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const erreur =
    entrepriseRes.error ??
    zonesRes.error ??
    tarifsRes.error ??
    preferencesRes.error ??
    documentsRes.error;
  if (erreur) {
    console.error("Chargement du contexte entreprise impossible.", erreur);
    return null;
  }

  const entreprise = entrepriseRes.data as CompanyRow | null;
  if (!entreprise) return null;

  const preferences = (preferencesRes.data ?? []) as KnowledgeRow[];
  const ton =
    preferences.find((ligne) => ligne.type === "assistant_tone")?.content ??
    "";
  const vocabulaire =
    preferences.find((ligne) => ligne.type === "assistant_vocabulary")
      ?.content ?? "";

  const tarifs: TarifAssistant[] = (tarifsRes.data ?? []).map((tarif) => ({
    label: (tarif.label as string | null) ?? "Prestation",
    min:
      typeof tarif.min_price_cents === "number"
        ? tarif.min_price_cents / 100
        : null,
    max:
      typeof tarif.max_price_cents === "number"
        ? tarif.max_price_cents / 100
        : null,
  }));

  const contexte: ContexteAssistant = {
    nom: entreprise.name ?? "",
    telephone: formaterTelephone(entreprise.phone),
    adresse: entreprise.address ?? "",
    description: entreprise.description ?? "",
    horaires: formaterHoraires(entreprise.working_hours),
    zones: (zonesRes.data ?? [])
      .map((zone) => zone.city as string)
      .filter(Boolean),
    tarifs,
    documents: (documentsRes.data ?? [])
      .map((document) => (document.title as string | null) ?? "")
      .filter(Boolean),
    ton,
    vocabulaire,
    knowledgeBase: entreprise.knowledge_base ?? "",
  };

  return {
    companyId: entreprise.id,
    companyName: entreprise.name ?? "",
    contexte,
    systemPrompt: construireSystemPrompt(contexte),
  };
}
