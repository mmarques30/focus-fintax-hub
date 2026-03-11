import { LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function AppHeader() {
  const { profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    gestor: "Gestor",
    operador: "Operador",
    visualizador: "Visualizador",
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{profile?.full_name || "Usuário"}</p>
            <p className="text-xs text-body-text">{ROLE_LABELS[userRole ?? ""] || profile?.cargo || "—"}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">
              {(profile?.full_name || "U")[0].toUpperCase()}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-secondary" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
