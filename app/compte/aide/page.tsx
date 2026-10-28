import Link from "next/link";
import {
  Building2,
  ChevronRight,
  HelpCircle,
  Mail,
  MessageSquare,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const QUESTIONS = [
  {
    question: "Mon assistant ne répond pas. Que faire ?",
    reponse:
      "Vérifiez qu'il est bien actif sur l'écran Mon compte. Si le problème continue, écrivez au support.",
  },
  {
    question: "Comment modifier mes horaires ou mes tarifs ?",
    reponse:
      "Ouvrez Mon entreprise depuis votre compte. Vos changements servent immédiatement à votre assistant.",
  },
  {
    question: "Puis-je reprendre la main sur une conversation ?",
    reponse:
      "Oui. Depuis une conversation SMS, appuyez sur « Reprendre la main » : l'assistant arrête de répondre.",
  },
];

export default function AidePage() {
  return (
    <AppLayout>
      <div className="space-y-5 pt-5">
        <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
              <HelpCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Besoin d&apos;un coup de main ?
              </h1>
              <p className="text-base font-medium text-slate-500">
                Nous répondons sous 24 h ouvrées.
              </p>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <LienAide
            icone={Mail}
            titre="Écrire au support"
            sousTitre="support@velianos.fr"
            href="mailto:support@velianos.fr"
          />
          <LienAide
            icone={Building2}
            titre="Compléter mon entreprise"
            sousTitre="Horaires, zones et tarifs"
            href="/entreprise"
          />
          <LienAide
            icone={MessageSquare}
            titre="Voir mes conversations"
            sousTitre="Les SMS échangés avec vos clients"
            href="/messages"
          />
        </div>

        <section>
          <h2 className="mb-2 px-2 text-sm font-extrabold uppercase tracking-wide text-slate-400">
            Questions fréquentes
          </h2>
          <div className="space-y-2.5">
            {QUESTIONS.map((item) => (
              <div
                key={item.question}
                className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              >
                <h3 className="text-base font-extrabold text-slate-900">
                  {item.question}
                </h3>
                <p className="mt-1.5 text-base font-medium leading-relaxed text-slate-600">
                  {item.reponse}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function LienAide({
  icone: Icone,
  titre,
  sousTitre,
  href,
}: {
  icone: typeof Mail;
  titre: string;
  sousTitre: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-16 items-center gap-3.5 border-b border-slate-100 px-4 py-3 transition-colors last:border-0 active:bg-slate-50"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0A2540]">
        <Icone className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-slate-900">
          {titre}
        </span>
        <span className="block truncate text-sm font-medium text-slate-400">
          {sousTitre}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" aria-hidden="true" />
    </Link>
  );
}
