"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00D26A]" />
            <span className="text-2xl font-bold tracking-tight text-text-primary">Velianos</span>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-text-primary">Créer votre compte</h1>
          <p className="mt-1 text-sm text-text-secondary">Commencez à utiliser Velianos gratuitement.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="Prénom" placeholder="Karim" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required />
            <Input label="Nom" placeholder="Benali" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" required />
            <Input label="Email" type="email" placeholder="karim@exemple.fr" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            <Input label="Mot de passe" type="password" placeholder="6 caractères minimum" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={6} required />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Création..." : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-slate-500">
            Vous créez votre compte. Vous gardez le contrôle de vos données.
          </p>
          <p className="mt-1 text-center text-xs text-slate-400">
            Aucune carte bancaire demandée. Aucun engagement.
          </p>
        </Card>
      </div>
    </main>
  );
}