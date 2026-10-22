import { createClient } from "@/lib/supabase/client";

export type Company = {
  id: string;
  name: string;
  phone: string | null;
  vapi_phone_number: string | null;
  address: string | null;
  city: string | null;
  onboarding_completed: boolean | null;
  subscription_plan: string | null;
};

export async function getCurrentCompany(): Promise<Company | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("company_id, companies(*)")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  const relation = data.companies as Company[] | Company | null;

  if (Array.isArray(relation)) return relation[0] ?? null;

  return relation ?? null;
}

export async function getCurrentCompanyId(): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return data.company_id as string;
}