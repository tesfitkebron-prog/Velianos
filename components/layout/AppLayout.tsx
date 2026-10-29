"use client";

import { usePathname } from "next/navigation";
import { AssistantProvider } from "./AssistantProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { NetworkBanner } from "@/components/ui/NetworkBanner";
import { useScrollRestoration } from "./useScrollRestoration";
import { useRetourAndroid } from "./useRetourAndroid";
import { usePaywallGuard } from "./usePaywallGuard";
import { cheminParent } from "@/lib/navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { mainRef, contentRef } = useScrollRestoration();
  const pathname = usePathname();

  useRetourAndroid(cheminParent(pathname));
  usePaywallGuard();

  return (
    <AssistantProvider>
      <ErrorBoundary>
        <div className="flex h-[100dvh] flex-col bg-[#F5F5F7]">
          <header className="sticky top-0 z-50 w-full bg-[#F5F5F7]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
            <TopBar />
          </header>

          <NetworkBanner />

          <main
            ref={mainRef}
            className="w-full flex-1 overflow-y-auto pb-[calc(9.5rem+env(safe-area-inset-bottom))]"
          >
            <div
              ref={contentRef}
              className="mx-auto w-full max-w-2xl px-4 md:px-6"
            >
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
