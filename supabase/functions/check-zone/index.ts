import {
  errorResponse,
  getCompanyFromVapiNumber,
  getSupabaseClient,
  jsonResponse,
  logNovaAction,
  optionsResponse,
  verifyVapiSecret,
} from "../_shared/supabase.ts";

type CheckZoneBody = {
  to_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  call_id?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "POST") return errorResponse("Méthode non autorisée.", 405);
  if (!verifyVapiSecret(request)) return errorResponse("Secret Vapi invalide.", 401);

  const startedAt = Date.now();
  let body: CheckZoneBody;
  try {
    body = (await request.json()) as CheckZoneBody;
  } catch {
    return errorResponse("Corps JSON invalide.");
  }

  if (!body.to_number || !body.address || !body.city) {
    return errorResponse("to_number, address et city sont obligatoires.");
  }

  const supabase = getSupabaseClient();
  const company = await getCompanyFromVapiNumber(supabase, body.to_number);
  if (!company) return errorResponse("Entreprise introuvable pour ce numéro.", 404);

  try {
    const { data, error } = await supabase
      .from("zones")
      .select("city")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .ilike("city", body.city.trim())
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const zone = data as { city: string } | null;
    const output = zone
      ? { in_zone: true, matched_city: zone.city }
      : { in_zone: false, message: "Cette adresse n'est pas dans notre zone d'intervention." };

    await logNovaAction(supabase, {
      company_id: company.id,
      call_id: body.call_id,
      tool_name: "check_zone",
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
      tool_name: "check_zone",
      input: body,
      output: { error: message },
      latency_ms: Date.now() - startedAt,
      success: false,
      error_message: message,
    });
    return errorResponse("Impossible de vérifier la zone d'intervention.", 500);
  }
});
