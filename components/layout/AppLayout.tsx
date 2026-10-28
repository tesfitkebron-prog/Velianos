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
        <div className="flex h-[100dvh] flex-col bg-[#F5F5F7]">
          <header className="sticky top-0 z-50 w-full bg-[#F5F5F7]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
            <TopBar />
          </header>

          <NetworkBanner />

          <main className="w-full flex-1 overflow-y-auto pb-[calc(8rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto w-full max-w-2xl px-4 md:px-6">
              {children}
            </div>
          </main>

          <BottomNav />
        </div>
      </ErrorBoundary>
    </AssistantProvider>
  );
}

export default AppLayout;
