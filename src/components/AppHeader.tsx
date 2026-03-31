import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface StuckLead {
  id: string;
  empresa: string;
  days: number;
}

export function AppHeader() {
  const { profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<StuckLead[]>([]);

  const canSeeNotifications = ["admin", "comercial", "pmo"].includes(userRole ?? "");

  useEffect(() => {
    if (!canSeeNotifications) return;

    const fetch = async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
      const { data } = await supabase
        .from("leads")
        .select("id, empresa, status_funil_atualizado_em")
        .eq("status_funil", "contrato_emitido")
        .lt("status_funil_atualizado_em", threeDaysAgo);

      if (data) {
        setNotifications(
          data.map((l) => ({
            id: l.id,
            empresa: l.empresa,
            days: Math.floor((Date.now() - new Date(l.status_funil_atualizado_em!).getTime()) / 86400000),
          }))
        );
      }
    };

    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [canSeeNotifications]);

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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-dash-red" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Notificações</p>
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">Nenhuma notificação</p>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-border">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => navigate("/pipeline")}
                    className="w-full text-left px-4 py-3 hover:bg-[rgba(10,21,100,0.03)] transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">{n.empresa}</p>
                    <p className="text-xs text-muted-foreground">
                      Contrato emitido há {n.days} dias sem avanço
                    </p>
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>

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
