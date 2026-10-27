"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <head>
        <title>Erreur - Velianos</title>
      </head>
      <body className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Une erreur est survenue</h1>
          <p className="text-slate-500 mb-6">
            L'application a rencontré un problème inattendu.
          </p>
          <button
            onClick={reset}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold py-3 px-6 rounded-xl transition-colors min-h-[50px]"
          >
            Réessayer
          </button>
          <p className="text-xs text-slate-400 mt-4">
            Si le problème persiste, rechargez la page (F5).
          </p>
        </div>
      </body>
    </html>
  );
}