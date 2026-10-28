import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service-role.
 *
 * À utiliser uniquement dans les routes API / actions serveur. Il contourne
 * les politiques RLS et ne doit jamais être importé dans un composant client.
 */
export function createAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    serviceRoleKey === "à_remplir_par_moi"
  ) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
