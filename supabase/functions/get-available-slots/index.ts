import {
  errorResponse,
  getCompanyFromVapiNumber,
  getSupabaseClient,
  jsonResponse,
  logNovaAction,
  optionsResponse,
  verifyVapiSecret,
} from "../_shared/supabase.ts";

type GetAvailableSlotsBody = {
  to_number?: string;
  urgency?: "normal" | "urgent" | "emergency";
  call_id?: string;
};

type WorkingHour = { start: string; end: string };
type WorkingHours = Record<string, WorkingHour | null>;
type BusyPeriod = { start_at: string; end_at: string };
type Slot = { start_at: string; end_at: string; label: string };

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const;
const SLOT_DURATION_MS = 60 * 60 * 1000;

function getZonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = part.value;
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedDateParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - date.getTime();
}

function zonedDateTimeToUtc(date: Date, time: string, timeZone: string): Date {
  const [year, month, day] = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
  const [hour, minute] = time.split(":").map(Number);
  const wallClockGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const firstOffset = getTimeZoneOffsetMs(wallClockGuess, timeZone);
  let result = new Date(wallClockGuess.getTime() - firstOffset);
  const secondOffset = getTimeZoneOffsetMs(result, timeZone);
  if (firstOffset !== secondOffset) result = new Date(wallClockGuess.getTime() - secondOffset);
  return result;
}

function overlaps(start: Date, end: Date, periods: BusyPeriod[]): boolean {
  return periods.some((period) => start < new Date(period.end_at) && end > new Date(period.start_at));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return optionsResponse();
  if (request.method !== "POST") return errorResponse("Méthode non autorisée.", 405);
  if (!verifyVapiSecret(request)) return errorResponse("Secret Vapi invalide.", 401);

  const startedAt = Date.now();
  let body: GetAvailableSlotsBody;
  try {
    body = (await request.json()) as GetAvailableSlotsBody;
  } catch {
    return errorResponse("Corps JSON invalide.");
  }
  if (!body.to_number) return errorResponse("to_number est obligatoire.");

  const supabase = getSupabaseClient();
  const company = await getCompanyFromVapiNumber(supabase, body.to_number);
  if (!company) return errorResponse("Entreprise introuvable pour ce numéro.", 404);

  try {
    const now = new Date();
    const urgency = body.urgency ?? "normal";
    const windowEnd = new Date(now.getTime() + (urgency === "emergency" ? 24 : 7 * 24) * 60 * 60 * 1000);
    const minimumStart = urgency === "emergency" ? now : new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("start_at, end_at")
      .eq("company_id", company.id)
      .in("status", ["confirmed", "pending"])
      .gte("start_at", now.toISOString())
      .lt("start_at", windowEnd.toISOString());

    if (appointmentsError) throw appointmentsError;

    const { data: blockedData, error: blockedError } = await supabase
      .from("blocked_periods")
      .select("start_at, end_at")
      .eq("company_id", company.id)
      .gte("start_at", now.toISOString())
      .lt("start_at", windowEnd.toISOString());

    const missingBlockedPeriods = blockedError?.code === "42P01" || blockedError?.code === "PGRST205";
    if (blockedError && !missingBlockedPeriods) throw blockedError;

    const busyPeriods = [
      ...((appointments ?? []) as BusyPeriod[]),
      ...((blockedData ?? []) as BusyPeriod[]),
    ];
    const workingHours = (company.working_hours ?? {}) as WorkingHours;
    const zonedNow = getZonedDateParts(now, company.timezone);
    const calendarDay = new Date(Date.UTC(zonedNow.year, zonedNow.month - 1, zonedNow.day));
    const slots: Slot[] = [];

    for (let dayOffset = 0; dayOffset < 7 && slots.length < 5; dayOffset += 1) {
      const day = new Date(calendarDay);
      day.setUTCDate(day.getUTCDate() + dayOffset);
      const dayName = DAY_NAMES[day.getUTCDay()];
      const hours = workingHours[dayName];
      if (!hours) continue;

      const workStart = zonedDateTimeToUtc(day, hours.start, company.timezone);
      const workEnd = zonedDateTimeToUtc(day, hours.end, company.timezone);
      for (let startMs = workStart.getTime(); startMs + SLOT_DURATION_MS <= workEnd.getTime(); startMs += SLOT_DURATION_MS) {
        const start = new Date(startMs);
        const end = new Date(startMs + SLOT_DURATION_MS);
        if (start < minimumStart || start >= windowEnd) continue;
        if (overlaps(start, end, busyPeriods)) continue;
        slots.push({
          start_at: start.toISOString(),
          end_at: end.toISOString(),
          label: new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: company.timezone }).format(start),
        });
        if (slots.length === 5) break;
      }
    }

    const output = { slots, count: slots.length };
    await logNovaAction(supabase, {
      company_id: company.id,
      call_id: body.call_id,
      tool_name: "get_available_slots",
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
      tool_name: "get_available_slots",
      input: body,
      output: { error: message },
      latency_ms: Date.now() - startedAt,
      success: false,
      error_message: message,
    });
    return errorResponse("Impossible de calculer les créneaux disponibles.", 500);
  }
});
