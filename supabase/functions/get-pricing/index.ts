import {
  errorResponse,
  getCompanyFromVapiNumber,
  getSupabaseClient,
  jsonResponse,
  logNovaAction,
  optionsResponse,
  verifyVapiSecret,
} from "../_shared/supabase.ts";

type GetPricingBody = {
  to_number?: string;
  service_label?: string;
  call_id?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "POST") return errorResponse("Méthode non autorisée.", 405);
  if (!verifyVapiSecret(request)) return errorResponse("Secret Vapi invalide.", 401);

  const startedAt = Date.now();
  let body: GetPricingBody;
  try {
    body = (await request.json()) as GetPricingBody;
  } catch {
    return errorResponse("Corps JSON invalide.");
  }

  if (!body.to_number || !body.service_label) {
    return errorResponse("to_number et service_label sont obligatoires.");
  }

  const supabase = getSupabaseClient();
  const company = await getCompanyFromVapiNumber(supabase, body.to_number);
  if (!company) return errorResponse("Entreprise introuvable pour ce numéro.", 404);

  try {
    const keyword = body.service_label.trim();
    const { data, error } = await supabase
      .from("pricing_rules")
      .select("label, min_price_cents, max_price_cents")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .ilike("label", `%${keyword}%`)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const rule = data as {
      label: string;
      min_price_cents: number | null;
      max_price_cents: number | null;
    } | null;

    const output = rule
      ? {
          found: true,
          label: rule.label,
          min_price_cents: rule.min_price_cents,
          max_price_cents: rule.max_price_cents,
          currency: "EUR",
        }
      : {
          found: false,
          message: "Aucun tarif configuré pour cette prestation. Nova doit demander une validation humaine.",
        };

    await logNovaAction(supabase, {
      company_id: company.id,
      call_id: body.call_id,
      tool_name: "get_pricing",
      input: body,
      output,
      latency_ms: Date.now() - startedAt,
      success: true,
    });

    return jsonResponse(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    await logNovaAction(supabase, {
      company_id: company.id,
      call_id: body.call_id,
      tool_name: "get_pricing",
      input: body,
      output: { error: message },
      latency_ms: Date.now() - startedAt,
      success: false,
      error_message: message,
    });
    return errorResponse("Impossible de récupérer le tarif.", 500);
  }
});
