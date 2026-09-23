import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-vapi-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

export type SupabaseClientInstance = SupabaseClient;

export type Company = {
  id: string;
  name: string;
  timezone: string;
  working_hours: Record<string, { start: string; end: string } | null> | null;
};

export type NovaActionInput = {
  company_id: string;
  call_id?: string | null;
  tool_name: string;
  input: unknown;
  output: unknown;
  latency_ms: number;
  success: boolean;
  error_message?: string | null;
};

export function getSupabaseClient(): SupabaseClientInstance {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configuration Supabase manquante.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getCompanyFromVapiNumber(
  supabase: SupabaseClientInstance,
  toNumber: string,
): Promise<Company | null> {
  return supabase
    .from("companies")
    .select("id, name, timezone, working_hours")
    .eq("vapi_phone_number", toNumber.trim())
    .eq("is_active", true)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) throw error;
      return (data as Company | null) ?? null;
    });
}

export function verifyVapiSecret(request: Request): boolean {
  const expectedSecret = Deno.env.get("VAPI_WEBHOOK_SECRET");
  if (!expectedSecret || expectedSecret === "à_remplir_par_moi") return true;
  return request.headers.get("x-vapi-secret") === expectedSecret;
}

export async function logNovaAction(
  supabase: SupabaseClientInstance,
  action: NovaActionInput,
): Promise<void> {
  const { error } = await supabase.from("nova_actions").insert({
    company_id: action.company_id,
    call_id: action.call_id ?? null,
    tool_name: action.tool_name,
    input: action.input,
    output: action.output,
    latency_ms: action.latency_ms,
    success: action.success,
    error_message: action.error_message ?? null,
  });

  if (error) console.error("Impossible d’enregistrer nova_action", error);
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export function optionsResponse(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
