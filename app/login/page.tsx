"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MESSAGE_SESSION_EXPIREE } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BrandMark } from "@/components/ui/BrandMark";
import { useToast } from "@/components/ui/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parametres = new URLSearchParams(window.location.search);
    const sessionExpiree = parametres.get("session") === "expired";

    if (!sessionExpiree) {
      return;
    }

    showToast(MESSAGE_SESSION_EXPIREE, {
      variant: "warning",
      duration: 6000,
    });

    parametres.delete("session");
    const requete = parametres.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${requete ? `?${requete}` : ""}`,
    );
  }, [showToast]);

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
    <main className="min-h-[100dvh] bg-[#F4F6FC] px-4 py-12 md:py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark size={64} />
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900">
              Velianos
            </p>
            <p className="mt-1 text-base font-medium text-slate-500">
              Votre assistante terrain
            </p>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Se connecter
          </h1>
          <p className="mt-1 text-base font-medium text-slate-600">
            Accédez à votre espace Velianos.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="karim@exemple.fr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-600">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-base font-medium text-slate-600">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-extrabold text-emerald-600">
              S&apos;inscrire
            </Link>
          </p>

          <p className="mt-4 text-center text-sm font-medium text-slate-400">
            Aucune carte bancaire demandée. Aucun engagement.
          </p>
        </Card>
      </div>
    </main>
  );
}
