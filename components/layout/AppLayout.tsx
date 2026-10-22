"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import MobileMenu from "@/components/layout/MobileMenu";
import { BottomNav } from "@/components/layout/BottomNav";
import { AssistantProvider } from "@/components/layout/AssistantProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AssistantProvider>
      <ErrorBoundary>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <MobileMenu />
          <div className="flex-1 flex flex-col md:ml-64 min-w-0">
            <TopBar />
            <main className="flex-1 pb-24 md:pb-0">
              <div className="w-full">{children}</div>
            </main>
          </div>
          <BottomNav />
        </div>
      </ErrorBoundary>
    </AssistantProvider>
  );
}

export default AppLayout;