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
            {/* HEADER FIXE (TopBar) */}
            <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md md:left-64">
              <TopBar />
            </header>

            {/* ZONE DE SCROLL (Le contenu de la page) */}
            <main className="flex-1 overflow-y-auto overscroll-contain scroll-pt-[60px] bg-[#F8FAFC] pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-14">
              <div className="h-full md:max-w-5xl md:mx-auto md:px-8 md:pb-8">{children}</div>
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
