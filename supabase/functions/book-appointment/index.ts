import {
  errorResponse,
  getCompanyFromVapiNumber,
  getSupabaseClient,
  jsonResponse,
  logNovaAction,
  optionsResponse,
  verifyVapiSecret,
} from "../_shared/supabase.ts";

type BookAppointmentBody = {
  to_number?: string;
  tool_call_id?: string;
  client?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    postal_code?: string;
  };
  start_at?: string;
  end_at?: string;
  title?: string;
  description?: string;
  urgency?: string;
  estimated_price_min_cents?: number;
  estimated_price_max_cents?: number;
  call_id?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "POST") return errorResponse("Méthode non autorisée.", 405);
  if (!verifyVapiSecret(request)) return errorResponse("Secret Vapi invalide.", 401);

  const startedAt = Date.now();
  let body: BookAppointmentBody;
  try {
    body = (await request.json()) as BookAppointmentBody;
  } catch {
    return errorResponse("Corps JSON invalide.");
  }

  if (!body.to_number || !body.tool_call_id || !body.client?.phone || !body.client.address || !body.client.city) {
    return errorResponse("to_number, tool_call_id et les informations client essentielles sont obligatoires.");
  }
  if (!body.start_at || !body.end_at || !body.title) {
    return errorResponse("start_at, end_at et title sont obligatoires.");
  }

  const start = new Date(body.start_at);
  const end = new Date(body.end_at);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    return errorResponse("Les dates de rendez-vous sont invalides.");
  }

  const supabase = getSupabaseClient();
  const company = await getCompanyFromVapiNumber(supabase, body.to_number);
  if (!company) return errorResponse("Entreprise introuvable pour ce numéro.", 404);

  try {
    const { data: existingAction, error: existingActionError } = await supabase
      .from("nova_actions")
      .select("output")
      .eq("company_id", company.id)
      .eq("tool_name", "book_appointment")
      .eq("tool_call_id", body.tool_call_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingActionError) throw existingActionError;
    if (existingAction?.output) return jsonResponse(existingAction.output);

    const { data: existingClient, error: clientLookupError } = await supabase
      .from("clients")
      .select("id")
      .eq("company_id", company.id)
      .eq("phone", body.client.phone.trim())
      .maybeSingle();

    if (clientLookupError) throw clientLookupError;

    let clientId = (existingClient as { id: string } | null)?.id;
    if (!clientId) {
      const { data: createdClient, error: clientCreateError } = await supabase
        .from("clients")
        .insert({
          company_id: company.id,
          first_name: body.client.first_name ?? null,
          last_name: body.client.last_name ?? null,
          phone: body.client.phone.trim(),
          email: body.client.email ?? null,
          address: body.client.address,
          city: body.client.city,
          postal_code: body.client.postal_code ?? null,
          source: "nova_call",
        })
        .select("id")
        .single();
      if (clientCreateError) throw clientCreateError;
      clientId = (createdClient as { id: string }).id;
    }

    const { data: createdAppointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        company_id: company.id,
        client_id: clientId,
        title: body.title,
        description: body.description ?? null,
        address: body.client.address,
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        status: "confirmed",
        source: "nova_call",
        estimated_price_min_cents: body.estimated_price_min_cents ?? null,
        estimated_price_max_cents: body.estimated_price_max_cents ?? null,
        urgency: body.urgency ?? "normal",
        call_id: body.call_id ?? null,
      })
      .select("id")
      .single();

    if (appointmentError) throw appointmentError;
    const appointmentId = (createdAppointment as { id: string }).id;

    const { data: admins, error: adminError } = await supabase
      .from("users")
      .select("id")
      .eq("company_id", company.id)
      .eq("role", "admin")
      .eq("is_active", true);

    if (adminError) throw adminError;
    const adminIds = ((admins ?? []) as { id: string }[]).map((admin) => admin.id);
    if (adminIds.length > 0) {
      const { error: notificationError } = await supabase.from("notifications").insert(
        adminIds.map((userId) => ({
          company_id: company.id,
          user_id: userId,
          type: "appointment_booked",
          title: "Nouveau RDV pris par Nova",
          body: `${body.client.first_name ?? "Client"} ${body.client.last_name ?? ""} — ${body.title}`,
          link: `/agenda`,
        })),
      );
      if (notificationError) console.error("Impossible de créer la notification", notificationError);
    }

    console.info(JSON.stringify({
      queue: "appointment_confirmation_sms",
      company_id: company.id,
      appointment_id: appointmentId,
      client_id: clientId,
    }));

    const dateLabel = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: company.timezone }).format(start);
    const timeLabel = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short", timeZone: company.timezone }).format(start);
    const output = {
      success: true,
      appointment_id: appointmentId,
      client_id: clientId,
      message: `RDV confirmé pour ${dateLabel} à ${timeLabel}.`,
    };

    await logNovaAction(supabase, {
      company_id: company.id,
      call_id: body.call_id,
      tool_name: "book_appointment",
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
      tool_name: "book_appointment",
      input: body,
      output: { error: message },
      latency_ms: Date.now() - startedAt,
      success: false,
      error_message: message,
    });
    return errorResponse("Impossible de créer le rendez-vous.", 500);
  }
});
