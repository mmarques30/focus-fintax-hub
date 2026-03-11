import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function AppHeader() {
  const { profile, userRole } = useAuth();

  const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    pmo: "PMO",
    gestor_tributario: "Gestor Tributário",
    comercial: "Comercial",
    cliente: "Cliente",
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-end px-6">
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
      </div>
    </header>
  );
}
