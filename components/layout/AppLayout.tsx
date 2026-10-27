"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import MobileMenu from "./MobileMenu";
import { AssistantProvider } from "./AssistantProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AssistantProvider>
      <ErrorBoundary>
        <div className="flex h-[100dvh] bg-[#F8FAFC] overflow-hidden">
          {/* SIDEBAR (PC uniquement) */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <Sidebar />
          </div>

          {/* MENU MOBILE (bouton hamburger) */}
          <MobileMenu />

          {/* CONTENU PRINCIPAL */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* HEADER (TopBar) */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200">
              <TopBar />
            </div>

            {/* ZONE DE SCROLL (Le contenu de la page) */}
            <main className="flex-1 overflow-y-auto overscroll-contain">
              <div className="md:max-w-5xl md:mx-auto md:p-6">{children}</div>
            </main>

            {/* BOTTOM NAV (Mobile uniquement) */}
            <div className="md:hidden flex-shrink-0">
              <BottomNav />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AssistantProvider>
  );
}

export default AppLayout;
