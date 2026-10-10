"use client";

import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { RefreshCw } from "lucide-react";

type WaitlistEntry = {
  id: string;
  created_at: string;
  first_name: string;
  phone: string;
  email: string | null;
  city: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export default function WaitlistAdminPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from("waitlist")
      .select("id, created_at, first_name, phone, email, city")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Impossible de charger les inscriptions.");
      setEntries([]);
    } else {
      setEntries((data ?? []) as WaitlistEntry[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  return (
    <AppLayout>
      <div className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Liste d’attente</h1>
            <p className="mt-1 text-sm text-text-secondary">Toutes les inscriptions reçues depuis la landing page.</p>
          </div>
          <Button variant="secondary" onClick={() => void loadEntries()} disabled={loading} className="min-h-[44px]">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
        </div>

        <Card className="mt-6">
          <p className="text-lg font-semibold text-text-primary">
            {entries.length} inscription{entries.length > 1 ? "s" : ""}
          </p>

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}

          {!loading && !error && entries.length === 0 && (
            <p className="mt-4 text-sm text-text-secondary">Aucune inscription pour l’instant.</p>
          )}

          {entries.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Prénom</th>
                    <th className="px-3 py-3 font-medium">Téléphone</th>
                    <th className="px-3 py-3 font-medium">Email</th>
                    <th className="px-3 py-3 font-medium">Ville</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap px-3 py-3 text-text-secondary">{formatDate(entry.created_at)}</td>
                      <td className="px-3 py-3 font-medium text-text-primary">{entry.first_name}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-text-primary">{entry.phone}</td>
                      <td className="px-3 py-3 text-text-secondary">{entry.email ?? "—"}</td>
                      <td className="px-3 py-3 text-text-primary">{entry.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}