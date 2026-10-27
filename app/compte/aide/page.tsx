"use client";

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
      "Vérifiez qu'il est bien actif en haut de l'écran Mon compte. Si le problème continue, écrivez au support.",
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
      <div className="px-4 md:px-0 pt-4 md:pt-0 pb-10 space-y-4 max-w-2xl md:mx-auto">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">
                Besoin d&apos;un coup de main ?
              </h2>
              <p className="text-xs font-normal text-slate-500">
                Nous répondons sous 24 h ouvrées.
              </p>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Link
            href="mailto:support@velianos.fr"
            className="flex min-h-[56px] items-center gap-3 border-b border-slate-100 px-4 transition-colors active:bg-slate-50 active:scale-[0.99]"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
              <Mail className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-900">
                Écrire au support
              </span>
              <span className="block text-[11px] font-normal text-slate-400">
                support@velianos.fr
              </span>
            </span>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          </Link>

          <Link
            href="/entreprise"
            className="flex min-h-[56px] items-center gap-3 border-b border-slate-100 px-4 transition-colors active:bg-slate-50 active:scale-[0.99]"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-900">
                Compléter mon entreprise
              </span>
              <span className="block text-[11px] font-normal text-slate-400">
                Horaires, zones et tarifs
              </span>
            </span>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          </Link>

          <Link
            href="/messages"
            className="flex min-h-[56px] items-center gap-3 px-4 transition-colors active:bg-slate-50 active:scale-[0.99]"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
              <MessageSquare className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-slate-900">
                Voir mes conversations
              </span>
              <span className="block text-[11px] font-normal text-slate-400">
                Les SMS échangés avec vos clients
              </span>
            </span>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          </Link>
        </div>

        <section>
          <h3 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Questions fréquentes
          </h3>
          <div className="space-y-2">
            {QUESTIONS.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h4 className="text-sm font-semibold text-slate-900">
                  {item.question}
                </h4>
                <p className="mt-1 text-sm font-normal leading-relaxed text-slate-600">
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
