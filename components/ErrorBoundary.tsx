"use client";

import { Component, ReactNode } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#F5F5F7] p-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-7 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TriangleAlert className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
              Oups, un imprévu
            </h1>
            <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
              Cette partie n&apos;a pas pu s&apos;afficher. Vos données restent
              intactes.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] text-base font-extrabold text-white transition-transform duration-200 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
