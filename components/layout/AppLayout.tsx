"use client";

import { AssistantProvider } from "./AssistantProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { NetworkBanner } from "@/components/ui/NetworkBanner";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AssistantProvider>
      <ErrorBoundary>
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#F5F5F7]">
          <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200/50 bg-[#F5F5F7]/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
            <TopBar />
          </header>

          <NetworkBanner />

          <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(6rem+env(safe-area-inset-top))] md:px-6">
            {children}
          </main>

          <BottomNav />
        </div>
      </ErrorBoundary>
    </AssistantProvider>
  );
}

export default AppLayout;
