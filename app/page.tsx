"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  PhoneMissed,
  XCircle,
  TrendingDown,
  Euro,
  Clock,
  MessageSquare,
  Shield,
  Check,
} from "lucide-react";

const problemCards = [
  {
    icon: PhoneMissed,
    title: "Un client vous appelle",
    text: "Vous êtes sous un évier, en intervention, ou en déplacement.",
  },
  {
    icon: XCircle,
    title: "Vous ne pouvez pas décrocher",
    text: "Le client tombe sur votre messagerie ou raccroche.",
  },
  {
    icon: TrendingDown,
    title: "Il appelle un concurrent",
    text: "Vous perdez un chantier de 150 à 500 €.",
  },
];

const solutionSteps = [
  {
    title: "Vous ne décrochez pas",
    text: "Un client vous appelle pendant une intervention.",
  },
  {
    title: "Un SMS part automatiquement",
    text: "Le client reçoit : « Bonjour, je suis en intervention. Décrivez votre besoin : [lien] ».",
  },
  {
    title: "Vous récupérez le chantier",
    text: "Le client répond, vous recevez sa demande sur votre téléphone.",
  },
];

const benefits = [
  {
    icon: Euro,
    title: "Plus de chantiers",
    text: "Vous récupérez les clients que vous ratiez.",
  },
  {
    icon: Clock,
    title: "Zéro effort",
    text: "Ça marche tout seul, 24h/24, 7j/7.",
  },
  {
    icon: MessageSquare,
    title: "Vos clients sont rassurés",
    text: "Ils ont une réponse immédiate, même quand vous êtes occupé.",
  },
  {
    icon: Shield,
    title: "Sans engagement",
    text: "30 jours gratuits. Vous arrêtez quand vous voulez.",
  },
];

const faq = [
  {
    question: "Ça coûte combien ?",
    answer: "29 €/mois. 30 jours gratuits pour tester.",
  },
  {
    question: "Je dois changer de numéro ?",
    answer: "Non, vous gardez votre numéro actuel.",
  },
  {
    question: "Ça marche comment ?",
    answer: "Un renvoi d'appel se met en place. Quand vous ne décrochez pas, le SMS part automatiquement.",
  },
  {
    question: "Je peux arrêter quand je veux ?",
    answer: "Oui. Sans engagement. Vous arrêtez en 1 clic.",
  },
];

export default function HomePage() {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const scrollToForm = () => {
    document.getElementById("formulaire")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-surface">
      <section className="bg-surface px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
            Ne perdez plus un seul chantier.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-text-secondary">
            Quand vous êtes en intervention, un SMS part automatiquement vers le client qui vous appelle. Vous récupérez le chantier au lieu de le perdre.
          </p>
          <div className="mt-8">
            <Button type="button" variant="primary" size="lg" className="w-full sm:w-auto" onClick={scrollToForm}>
              Accès prioritaire au lancement
            </Button>
            <p className="mt-3 text-xs text-text-secondary">Les 50 premiers auront 3 mois à -50%.</p>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-text-primary">Ce qui se passe aujourd'hui</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {problemCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
                  <Icon className="mx-auto h-10 w-10 text-danger" />
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{card.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{card.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-text-primary">Avec Velianos</h2>
          <div className="mt-8 grid grid-cols-1 items-center gap-6 md:grid-cols-3">
            {solutionSteps.map((step, index) => (
              <div key={step.title} className="contents">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{step.text}</p>
                </div>
                {index < solutionSteps.length - 1 && (
                  <span className="hidden text-center text-2xl text-primary md:block" aria-hidden="true">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-text-primary">Pourquoi les plombiers l'utilisent</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
                  <Icon className="h-8 w-8 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{benefit.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{benefit.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="formulaire" className="bg-surface px-4 py-16 md:py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-10">
          <h2 className="text-center text-2xl font-bold text-text-primary">Accès prioritaire au lancement</h2>
          <p className="mt-2 text-center text-sm text-text-secondary">Laissez vos coordonnées. On vous prévient dès que c'est prêt. Les 50 premiers auront 3 mois à -50%.</p>

          {submitted ? (
            <div className="mt-6 rounded-xl border border-success/20 bg-success/10 p-6 text-center">
              <Check className="mx-auto h-10 w-10 text-success" />
              <p className="mt-3 text-lg font-semibold text-text-primary">Merci ! On vous prévient dès que c'est prêt.</p>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Input label="Votre prénom" placeholder="Karim" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              <Input label="Votre numéro de téléphone" type="tel" placeholder="06 12 34 56 78" value={phone} onChange={(event) => setPhone(event.target.value)} required />
              <Input label="Votre email (optionnel)" type="email" placeholder="karim@exemple.fr" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input label="Votre ville" placeholder="Lyon" value={city} onChange={(event) => setCity(event.target.value)} required />
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Je veux être prévenu
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-xs text-text-secondary">Un SMS de confirmation vous sera envoyé. Pas de spam.</p>
        </div>
      </section>

      <section className="bg-background px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-text-primary">Vos questions</h2>
          <div className="mt-8 space-y-3">
            {faq.map((item) => (
              <div key={item.question} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="text-base font-semibold text-text-primary">{item.question}</h3>
                <p className="mt-2 text-sm text-text-secondary">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-nova px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-lg font-bold">Velianos</p>
          <p className="mt-2 text-sm text-white/70">L'assistant qui répond à vos clients quand vous ne pouvez pas.</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
            <a href="#" className="hover:text-white">Mentions légales</a>
            <a href="#" className="hover:text-white">Politique de confidentialité</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <p className="mt-6 text-xs text-white/40">© 2026 Velianos</p>
        </div>
      </footer>
    </main>
  );
}
