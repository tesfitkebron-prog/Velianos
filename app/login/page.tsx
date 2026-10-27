"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem("velianos_bienvenue") !== "1") {
        router.replace("/bienvenue");
      }
    } catch {
      // Stockage local indisponible : on affiche la connexion.
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            <span className="text-2xl font-bold tracking-tight text-text-primary">Velianos</span>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-text-primary">Se connecter</h1>
          <p className="mt-1 text-sm text-text-secondary">Accédez à votre espace Velianos.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="Email" type="email" placeholder="karim@exemple.fr" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            <Input label="Mot de passe" type="password" placeholder="Votre mot de passe" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              S’inscrire
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-slate-500">
            Aucune carte bancaire demandée. Aucun engagement.
          </p>
        </Card>
      </div>
    </main>
  );
}