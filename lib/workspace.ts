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
  tva?: string;
  description?: string;
  horaires?: Array<{ jour: string; ouvert: boolean; debut: string; fin: string }>;
};

const emptyProfile: WorkspaceProfile = {
  userId: null,
  firstName: "",
  lastName: "",
  fullName: "Utilisateur",
  email: "",
  role: "Compte",
  companyId: null,
  companyName: "Mon entreprise",
};

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
        let tva = "";
        let description = "";
        let horaires = [];

        if (companyId) {
          const { data: company } = await supabase
            .from("companies")
            .select("name, address, phone, siret, tva, description, horaires")
            .eq("id", companyId)
            .maybeSingle();
          if (company?.name) companyName = company.name;
          if (company?.address) address = company.address;
          if (company?.phone) phone = company.phone;
          if (company?.siret) siret = company.siret;
          if (company?.tva) tva = company.tva;
          if (company?.description) description = company.description;
          if (company?.horaires) horaires = company.horaires;
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
          tva,
          description,
          horaires,
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

export async function saveWorkspaceProfile(data: Partial<WorkspaceProfile>): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non authentifié");

  const profile = await loadWorkspaceProfile();
  if (!profile.companyId) throw new Error("Aucune entreprise trouvée");

  const { error } = await supabase
    .from("companies")
    .update({
      name: data.companyName,
      address: data.address,
      phone: data.phone,
      siret: data.siret,
      tva: data.tva,
      description: data.description,
      horaires: data.horaires,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.companyId);

  if (error) throw error;

  resetWorkspaceProfileCache();
}

export function resetWorkspaceProfileCache() {
  cache = null;
}