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
        <div className="app-surface flex h-[100dvh] flex-col overflow-hidden">
          <header className="flex-shrink-0 border-b border-slate-200/70 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
            <TopBar />
          </header>

          <NetworkBanner />

          <main
            ref={mainRef}
            className={
              estAssistant
                ? "min-h-0 w-full flex-1 overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))]"
                : "min-h-0 w-full flex-1 overflow-y-auto pb-[calc(4.75rem+env(safe-area-inset-bottom))]"
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
