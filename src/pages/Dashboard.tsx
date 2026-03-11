import { useEffect, useState } from "react";
import { Users, FileText, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalLeads: number;
  leadsNovos: number;
  relatoriosGerados: number;
  benchmarksAtivos: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalLeads: 0, leadsNovos: 0, relatoriosGerados: 0, benchmarksAtivos: 0 });
  const [recentLeads, setRecentLeads] = useState<{ empresa: string; status: string; criado_em: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [leadsRes, novosRes, relatoriosRes, benchmarksRes, recentRes] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo"),
        supabase.from("relatorios_leads").select("id", { count: "exact", head: true }),
        supabase.from("benchmarks_teses").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("leads").select("empresa, status, criado_em").order("criado_em", { ascending: false }).limit(5),
      ]);

      setStats({
        totalLeads: leadsRes.count ?? 0,
        leadsNovos: novosRes.count ?? 0,
        relatoriosGerados: relatoriosRes.count ?? 0,
        benchmarksAtivos: benchmarksRes.count ?? 0,
      });
      setRecentLeads(recentRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const cards = [
    { label: "Total de Leads", value: stats.totalLeads, icon: Users, color: "text-primary" },
    { label: "Leads Novos", value: stats.leadsNovos, icon: TrendingUp, color: "text-primary" },
    { label: "Relatórios Gerados", value: stats.relatoriosGerados, icon: FileText, color: "text-primary" },
    { label: "Benchmarks Ativos", value: stats.benchmarksAtivos, icon: BarChart3, color: "text-primary" },
  ];

  const statusLabel: Record<string, string> = {
    novo: "Novo",
    em_analise: "Em análise",
    convertido: "Convertido",
    descartado: "Descartado",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-body-text text-sm mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-body-text uppercase tracking-wider">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-9 w-16 bg-muted rounded" />
              ) : (
                <p className="text-3xl font-extrabold text-foreground">{c.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum lead cadastrado ainda.</p>
          ) : (
            <div className="space-y-1">
              {recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <p className="text-sm font-semibold text-foreground">{lead.empresa || "Sem empresa"}</p>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary">
                    {statusLabel[lead.status] ?? lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
