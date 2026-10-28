import { createClient } from "@/lib/supabase/client";

export type WorkspaceProfile = {
  userId: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  companyId: string | null;
  companyName: string;
  address?: string;
  phone?: string;
  siret?: string;
  description?: string;
  horaires?: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  assistantActive: boolean;
};

export const EMPTY_WORKSPACE_PROFILE: WorkspaceProfile = {
  userId: null,
  firstName: "",
  lastName: "",
  fullName: "Utilisateur",
  email: "",
  role: "Compte",
  companyId: null,
  companyName: "Mon entreprise",
  subscriptionPlan: "pro",
  subscriptionStatus: "trialing",
  trialEndsAt: null,
  assistantActive: true,
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

const emptyProfile = EMPTY_WORKSPACE_PROFILE;

let cache: WorkspaceProfile | null = null;
let pending: Promise<WorkspaceProfile> | null = null;

export async function loadWorkspaceProfile(): Promise<WorkspaceProfile> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return emptyProfile;
    if (cache?.userId === user.id) return cache;

    if (pending) return pending;

    pending = (async () => {
      try {
        const metadata = user.user_metadata as {
          first_name?: string;
          last_name?: string;
        };

        const { data: profile } = await supabase
          .from("users")
          .select("first_name, last_name, role, company_id")
          .eq("id", user.id)
          .maybeSingle();

        const firstName = profile?.first_name || metadata.first_name || "";
        const lastName = profile?.last_name || metadata.last_name || "";
        const companyId = (profile?.company_id as string | null) ?? null;

        let companyName = emptyProfile.companyName;
        let address = "";
        let phone = "";
        let siret = "";
        let description = "";
        let horaires = "";
        let subscriptionPlan = emptyProfile.subscriptionPlan;
        let subscriptionStatus = emptyProfile.subscriptionStatus;
        let trialEndsAt: string | null = null;
        let assistantActive = true;

        if (companyId) {
          const { data: company } = await supabase
            .from("companies")
            .select(
              "name, address, phone, siret, description, working_hours, subscription_plan, subscription_status, trial_ends_at",
            )
            .eq("id", companyId)
            .maybeSingle();

          const { data: assistant } = await supabase
            .from("companies")
            .select("assistant_active")
            .eq("id", companyId)
            .maybeSingle();

          if (company?.name) companyName = company.name;
          if (company?.address) address = company.address;
          if (company?.phone) phone = company.phone;
          if (company?.siret) siret = company.siret;
          if (company?.description) description = company.description;
          horaires = formaterHoraires(company?.working_hours);
          if (company?.subscription_plan) {
            subscriptionPlan = company.subscription_plan;
          }
          if (company?.subscription_status) {
            subscriptionStatus = company.subscription_status;
          }
          trialEndsAt = (company?.trial_ends_at as string | null) ?? null;
          if (typeof assistant?.assistant_active === "boolean") {
            assistantActive = assistant.assistant_active;
          }
        }

        const result: WorkspaceProfile = {
          userId: user.id,
          firstName,
          lastName,
          fullName:
            [firstName, lastName].filter(Boolean).join(" ") ||
            user.email?.split("@")[0] ||
            emptyProfile.fullName,
          email: user.email ?? "",
          role:
            profile?.role === "admin"
              ? "Administrateur"
              : profile?.role === "technicien"
                ? "Technicien"
                : profile?.role === "employe"
                  ? "Employé"
                  : emptyProfile.role,
          companyId,
          companyName,
          address,
          phone,
          siret,
          description,
          horaires,
          subscriptionPlan,
          subscriptionStatus,
          trialEndsAt,
          assistantActive,
        };

        cache = result;
        return result;
      } catch {
        return emptyProfile;
      }
    })();

    try {
      return await pending;
    } finally {
      pending = null;
    }
  } catch {
    return emptyProfile;
  }
}

export async function saveWorkspaceProfile(
  data: Partial<WorkspaceProfile>,
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non authentifié");

  const profile = await loadWorkspaceProfile();
  if (!profile.companyId) throw new Error("Aucune entreprise trouvée");

  const miseAJour: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.companyName !== undefined) miseAJour.name = data.companyName;
  if (data.address !== undefined) miseAJour.address = data.address;
  if (data.phone !== undefined) miseAJour.phone = data.phone;
  if (data.siret !== undefined) miseAJour.siret = data.siret;
  if (data.description !== undefined) {
    miseAJour.description = data.description;
  }

  const { error } = await supabase
    .from("companies")
    .update(miseAJour)
    .eq("id", profile.companyId);

  if (error) throw error;

  resetWorkspaceProfileCache();
}

export async function setAssistantActive(valeur: boolean): Promise<void> {
  const supabase = createClient();
  const profile = await loadWorkspaceProfile();
  if (!profile.companyId) return;

  const { error } = await supabase
    .from("companies")
    .update({ assistant_active: valeur, updated_at: new Date().toISOString() })
    .eq("id", profile.companyId);

  if (!error && cache) {
    cache = { ...cache, assistantActive: valeur };
  }
}

export function resetWorkspaceProfileCache() {
  cache = null;
  pending = null;
}
