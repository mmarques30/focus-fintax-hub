import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AppNotification {
  id: string;
  type: "warning" | "info";
  title: string;
  subtitle: string;
  href: string;
}

export function useNotifications() {
  const { userRole } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const canSee = ["admin", "comercial", "pmo"].includes(userRole ?? "");

  useEffect(() => {
    if (!canSee) { setLoading(false); return; }

    const fetchAlerts = async () => {
      try {
      const alerts: AppNotification[] = [];

      // Alert 1: leads stuck in contrato_emitido > 3 days
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
      const { data: staleLeads } = await supabase
        .from("leads")
        .select("id, empresa, status_funil_atualizado_em")
        .eq("status_funil", "contrato_emitido")
        .lt("status_funil_atualizado_em", threeDaysAgo);

      staleLeads?.forEach((l) => {
        const days = Math.floor(
          (Date.now() - new Date(l.status_funil_atualizado_em!).getTime()) / 86400000
        );
        alerts.push({
          id: `lead-${l.id}`,
          type: "warning",
          title: `${l.empresa} parado em Contrato Emitido`,
          subtitle: `Sem atualização há ${days} dias`,
          href: "/pipeline",
        });
      });

      // Alert 2: clients with saldo zerado (fully compensated)
      const { data: clientes } = await supabase
        .from("clientes")
        .select("id, empresa");

      if (clientes && clientes.length > 0) {
        const clienteIds = clientes.map((c) => c.id);

        const [{ data: processos }, { data: compensacoes }] = await Promise.all([
          supabase
            .from("processos_teses")
            .select("cliente_id, valor_credito")
            .in("cliente_id", clienteIds),
          supabase
            .from("compensacoes_mensais")
            .select("cliente_id, valor_compensado")
            .in("cliente_id", clienteIds),
        ]);

        const creditoMap = new Map<string, number>();
        const compensadoMap = new Map<string, number>();

        processos?.forEach((p) => {
          creditoMap.set(p.cliente_id, (creditoMap.get(p.cliente_id) ?? 0) + (p.valor_credito ?? 0));
        });
        compensacoes?.forEach((c) => {
          compensadoMap.set(c.cliente_id, (compensadoMap.get(c.cliente_id) ?? 0) + (c.valor_compensado ?? 0));
        });

        clientes.forEach((c) => {
          const credito = creditoMap.get(c.id) ?? 0;
          const compensado = compensadoMap.get(c.id) ?? 0;
          if (credito > 0 && compensado >= credito) {
            alerts.push({
              id: `saldo-${c.id}`,
              type: "info",
              title: `${c.empresa} zerou o saldo`,
              subtitle: "Crédito totalmente compensado — considere nova tese",
              href: `/clientes/${c.id}`,
            });
          }
        });
      }

      setNotifications(alerts);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [canSee]);

  return notifications;
}
