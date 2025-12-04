import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <AppHeader />
        <main className="p-4 pt-16 sm:p-6 sm:pt-6 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
