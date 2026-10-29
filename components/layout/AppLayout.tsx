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
  const estAssistant = pathname === "/assistant";

  useRetourAndroid(cheminParent(pathname));
  usePaywallGuard();

  return (
    <AssistantProvider>
      <ErrorBoundary>
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#F5F5F7]">
          <header className="flex-shrink-0 border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)]">
            <TopBar />
          </header>

          <NetworkBanner />

          <main
            ref={mainRef}
            className={
              estAssistant
                ? "min-h-0 w-full flex-1 overflow-hidden"
                : "min-h-0 w-full flex-1 overflow-y-auto pb-4"
            }
          >
            <div
              ref={contentRef}
              className={
                estAssistant
                  ? "mx-auto h-full w-full max-w-2xl"
                  : "mx-auto w-full max-w-2xl"
              }
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
