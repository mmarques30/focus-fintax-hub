import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyBR } from "@/lib/clientes-constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  clienteId: string;
}

export function ResumoFinanceiroTab({ clienteId }: Props) {
  const [stats, setStats] = useState({ totalCredito: 0, totalCompensado: 0, totalHonorarios: 0 });
  const [chartData, setChartData] = useState<{ mes: string; valor: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: processos }, { data: compensacoes }] = await Promise.all([
        supabase.from("processos_teses").select("valor_credito, valor_honorario, status_contrato, status_processo").eq("cliente_id", clienteId),
        supabase.from("compensacoes_mensais").select("mes_referencia, valor_compensado").eq("cliente_id", clienteId),
      ]);

      const assinados = (processos || []).filter((p) => p.status_contrato === "assinado");
      const totalCredito = assinados.reduce((s, p) => s + Number(p.valor_credito || 0), 0);
      const totalHonorarios = assinados
        .filter((p) => ["compensando", "a_compensar"].includes(p.status_processo))
        .reduce((s, p) => s + Number(p.valor_honorario || 0), 0);
      const totalCompensado = (compensacoes || []).reduce((s, c) => s + Number(c.valor_compensado || 0), 0);

      setStats({ totalCredito, totalCompensado, totalHonorarios });

      // Build chart: last 12 months
      const monthMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(now, i);
        const key = format(d, "yyyy-MM");
        monthMap[key] = 0;
      }
      (compensacoes || []).forEach((c) => {
        const key = c.mes_referencia?.substring(0, 7);
        if (key && key in monthMap) monthMap[key] += Number(c.valor_compensado || 0);
      });
      setChartData(Object.entries(monthMap).map(([k, v]) => ({
        mes: format(new Date(k + "-01"), "MMM/yy", { locale: ptBR }),
        valor: v,
      })));
    };
    fetchData();
  }, [clienteId]);

  const saldo = stats.totalCredito - stats.totalCompensado;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Crédito Identificado</p><p className="text-xl font-bold">{formatCurrencyBR(stats.totalCredito)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Já Compensado</p><p className="text-xl font-bold">{formatCurrencyBR(stats.totalCompensado)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Saldo Restante</p><p className={`text-xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrencyBR(saldo)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground mb-1">Honorários a Receber</p><p className="text-xl font-bold">{formatCurrencyBR(stats.totalHonorarios)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-4">Compensação mensal — últimos 12 meses</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrencyBR(value)} />
              <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
