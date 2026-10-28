"use server";

import { createAdminClient } from "@/lib/supabase/admin";

type HourRange = { start: string; end: string } | null;

type OnboardingPayload = {
  accessToken: string;
  companyName: string;
  phone: string;
  city: string;
  firstName: string;
  lastName: string;
  workingHours: Record<string, HourRange>;
  zones: string[];
  services: { name: string; min: string; max: string }[];
};

export async function completeOnboarding(payload: OnboardingPayload) {
  const admin = createAdminClient();

  if (!admin) {
    return { error: "Configuration serveur incomplète." };
  }

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(payload.accessToken);

  if (userError || !user) {
    return { error: "Votre session a expiré. Reconnectez-vous." };
  }

  const { data: existingUser } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingUser) {
    return { companyId: existingUser.company_id as string };
  }

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({
      name: payload.companyName.trim(),
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      working_hours: payload.workingHours,
      onboarding_completed: true,
    })
    .select("id")
    .single();

  if (companyError || !company) {
    return { error: "Impossible de créer votre entreprise." };
  }

  const { error: profileError } = await admin.from("users").insert({
    id: user.id,
    company_id: company.id,
    role: "admin",
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    email: user.email,
  });

  if (profileError) {
    await admin.from("companies").delete().eq("id", company.id);
    return { error: "Impossible de créer votre profil." };
  }

  if (payload.zones.length > 0) {
    const { error: zonesError } = await admin.from("zones").insert(
      payload.zones.map((city) => ({
        company_id: company.id,
        city,
        is_active: true,
      })),
    );
    if (zonesError) {
      await admin.from("companies").delete().eq("id", company.id);
      return { error: "Impossible d’enregistrer vos zones." };
    }
  }

  const validServices = payload.services.filter((service) => service.name.trim());
  if (validServices.length > 0) {
    const { error: pricingError } = await admin.from("pricing_rules").insert(
      validServices.map((service) => ({
        company_id: company.id,
        label: service.name.trim(),
        min_price_cents: Math.round(Number(service.min || 0) * 100),
        max_price_cents: Math.round(Number(service.max || 0) * 100),
        is_active: true,
      })),
    );
    if (pricingError) {
      await admin.from("companies").delete().eq("id", company.id);
      return { error: "Impossible d’enregistrer vos tarifs." };
    }
  }

  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      first_name: payload.firstName.trim(),
      last_name: payload.lastName.trim(),
      onboarding_completed: true,
    },
  });

  return { companyId: company.id as string };
}