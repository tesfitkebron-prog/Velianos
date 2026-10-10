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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return emptyProfile;
  if (cache?.userId === user.id) return cache;

  if (pending) return pending;

  pending = (async () => {
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
    if (companyId) {
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .maybeSingle();
      if (company?.name) companyName = company.name;
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
    };

    cache = result;
    return result;
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}

export function resetWorkspaceProfileCache() {
  cache = null;
}
