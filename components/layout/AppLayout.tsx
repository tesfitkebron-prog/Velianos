"use client";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import MobileMenu from "./MobileMenu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;