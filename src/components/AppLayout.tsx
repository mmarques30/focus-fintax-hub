import { useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const noPadding = pathname === "/dashboard";

  return (
    <div className="min-h-screen flex w-full bg-sidebar">
      <AppSidebar />
      <div className="flex-1 flex flex-col bg-background rounded-tl-2xl overflow-hidden">
        <AppHeader />
        <main className={cn("flex-1 overflow-auto", !noPadding && "p-4")}>
          {children}
        </main>
      </div>
    </div>
  );
}
