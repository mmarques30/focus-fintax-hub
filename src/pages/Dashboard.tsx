import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, TrendingUp, TrendingDown, BarChart3, AlertTriangle,
  CheckCircle2, ArrowRight, DollarSign, Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PIPELINE_STAGES, ACTIVE_STAGES, formatCurrency, daysSince, SEGMENTO_LABELS } from "@/lib/pipeline-constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ─── helpers ─── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  useEffect(() => {
    if (!ref.current) return;
    const start = prev.current;
    const end = value;
    const duration = 800;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(start + (end - start) * ease);
      if (ref.current) ref.current.textContent = prefix + cur.toLocaleString("pt-BR");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prev.current = end;
  }, [value, prefix]);
  return <span ref={ref}>{prefix}{value.toLocaleString("pt-BR")}</span>;
}

function timeAgo(date: string) {
  const d = daysSince(date);
  if (d === 0) return "Hoje";
  if (d === 1) return "Ontem";
  return `há ${d} dias`;
}

/* ─── types ─── */
interface KPI {
  label: string;
  value: number;
  prev: number;
  icon: React.ElementType;
  prefix?: string;
  roles: string[];
}

interface Alert {
  type: "lead" | "processo";
  empresa: string;
  detail: string;
  days: number;
  link: string;
}

const FUNNEL_STAGES = ACTIVE_STAGES.filter(s => s.value !== "cliente_ativo");
const STAGE_LABEL: Record<string, string> = Object.fromEntries(PIPELINE_STAGES.map(s => [s.value, s.label]));

export default function Dashboard() {
  const { profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [funnelData, setFunnelData] = useState<{ stage: string; label: string; count: number }[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [monthCompensations, setMonthCompensations] = useState<{ empresa: string; tese: string; valor: number }[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [motorStats, setMotorStats] = useState({ totalDiag: 0, lpLeads30d: 0, conversionRate: 0 });

  const role = userRole ?? "comercial";
  const showLeads = ["admin", "pmo", "comercial"].includes(role);
  const showClientes = ["admin", "pmo", "gestor_tributario"].includes(role);

  const fetchData = useCallback(async () => {
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
    const d60 = new Date(now.getTime() - 60 * 86400000).toISOString();
    const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
    const d1 = new Date(now.getTime() - 1 * 86400000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

    const results: KPI[] = [];

    // ─── Leads KPIs ───
    if (showLeads) {
      const [pipelineRes, pipelinePrev, newRes, newPrev, potRes] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true })
          .not("status_funil", "in", "(perdido,nao_vai_fazer)"),
        supabase.from("leads").select("id", { count: "exact", head: true })
          .not("status_funil", "in", "(perdido,nao_vai_fazer)")
          .lt("criado_em", d30),
        supabase.from("leads").select("id", { count: "exact", head: true })
          .gte("criado_em", d7),
        supabase.from("leads").select("id", { count: "exact", head: true })
          .gte("criado_em", new Date(now.getTime() - 14 * 86400000).toISOString())
          .lt("criado_em", d7),
        supabase.from("relatorios_leads").select("estimativa_total_maxima, lead_id")
          .then(async ({ data: rels }) => {
            if (!rels?.length) return 0;
            const leadIds = [...new Set(rels.map(r => r.lead_id))];
            const { data: activeLeads } = await supabase.from("leads").select("id")
              .in("id", leadIds)
              .not("status_funil", "in", "(perdido,nao_vai_fazer)");
            const activeIds = new Set(activeLeads?.map(l => l.id) ?? []);
            // Get max estimate per lead
            const byLead: Record<string, number> = {};
            rels.forEach(r => {
              if (activeIds.has(r.lead_id)) {
                byLead[r.lead_id] = Math.max(byLead[r.lead_id] ?? 0, Number(r.estimativa_total_maxima));
              }
            });
            return Object.values(byLead).reduce((s, v) => s + v, 0);
          }),
      ]);

      results.push(
        { label: "Leads no pipeline", value: pipelineRes.count ?? 0, prev: pipelinePrev.count ?? 0, icon: Users, roles: ["admin", "pmo", "comercial"] },
        { label: "Novos leads (7d)", value: newRes.count ?? 0, prev: newPrev.count ?? 0, icon: TrendingUp, roles: ["admin", "pmo", "comercial"] },
      );
      results.push({ label: "Potencial da carteira", value: potRes as number, prev: 0, icon: BarChart3, prefix: "R$ ", roles: ["admin", "pmo", "comercial"] });
    }

    // ─── Clientes KPIs ───
    if (showClientes) {
      const [clientesRes, clientesPrev, compRes, compPrev, honRes] = await Promise.all([
        supabase.from("clientes").select("id", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("clientes").select("id", { count: "exact", head: true }).eq("status", "ativo").lt("criado_em", d30),
        supabase.from("compensacoes_mensais").select("valor_compensado"),
        supabase.from("compensacoes_mensais").select("valor_compensado").lt("criado_em", d30),
        supabase.from("processos_teses").select("valor_honorario")
          .in("status_processo", ["compensando", "pedido_feito_receita"]),
      ]);

      const compTotal = (compRes.data ?? []).reduce((s, r) => s + Number(r.valor_compensado ?? 0), 0);
      const compPrevTotal = (compPrev.data ?? []).reduce((s, r) => s + Number(r.valor_compensado ?? 0), 0);
      const honTotal = (honRes.data ?? []).reduce((s, r) => s + Number(r.valor_honorario ?? 0), 0);

      results.push(
        { label: "Clientes ativos", value: clientesRes.count ?? 0, prev: clientesPrev.count ?? 0, icon: Briefcase, roles: ["admin", "pmo", "gestor_tributario"] },
        { label: "Total compensado", value: compTotal, prev: compPrevTotal, icon: DollarSign, prefix: "R$ ", roles: ["admin", "pmo", "gestor_tributario"] },
        { label: "Honorários a receber", value: honTotal, prev: 0, icon: FileText, prefix: "R$ ", roles: ["admin", "pmo", "gestor_tributario"] },
      );
    }

    setKpis(results);

    // ─── Alerts ───
    const alertItems: Alert[] = [];
    if (showLeads) {
      const { data: stalledLeads } = await supabase.from("leads").select("empresa, status_funil_atualizado_em, id")
        .eq("status_funil", "novo").lt("status_funil_atualizado_em", d1);
      (stalledLeads ?? []).forEach(l => {
        alertItems.push({
          type: "lead", empresa: l.empresa || "Sem empresa",
          detail: "Lead parado em Novo",
          days: daysSince(l.status_funil_atualizado_em!),
          link: "/pipeline",
        });
      });
    }
    if (showClientes) {
      const d15 = new Date(now.getTime() - 15 * 86400000).toISOString();
      const d7ago = new Date(now.getTime() - 7 * 86400000).toISOString();
      const { data: stalledProc } = await supabase.from("processos_teses")
        .select("tese, nome_exibicao, atualizado_em, status_processo, status_contrato, cliente_id")
        .or(`and(status_processo.eq.nao_protocolado,atualizado_em.lt.${d15}),and(status_contrato.eq.aguardando_assinatura,atualizado_em.lt.${d7ago})`);
      if (stalledProc?.length) {
        const clienteIds = [...new Set(stalledProc.map(p => p.cliente_id))];
        const { data: clientes } = await supabase.from("clientes").select("id, empresa").in("id", clienteIds);
        const map = Object.fromEntries((clientes ?? []).map(c => [c.id, c.empresa]));
        stalledProc.forEach(p => {
          alertItems.push({
            type: "processo",
            empresa: map[p.cliente_id] ?? "—",
            detail: p.nome_exibicao,
            days: daysSince(p.atualizado_em!),
            link: `/clientes/${p.cliente_id}`,
          });
        });
      }
    }
    alertItems.sort((a, b) => b.days - a.days);
    setAlerts(alertItems.slice(0, 8));

    // ─── Funnel ───
    if (showLeads) {
      const { data: leads } = await supabase.from("leads").select("status_funil")
        .not("status_funil", "in", "(perdido,nao_vai_fazer,cliente_ativo)");
      const counts: Record<string, number> = {};
      FUNNEL_STAGES.forEach(s => counts[s.value] = 0);
      (leads ?? []).forEach(l => { if (counts[l.status_funil] !== undefined) counts[l.status_funil]++; });
      setFunnelData(FUNNEL_STAGES.map(s => ({ stage: s.value, label: s.label, count: counts[s.value] ?? 0 })));
    }

    // ─── Recent Leads ───
    if (showLeads) {
      const { data: recent } = await supabase.from("leads").select("empresa, segmento, criado_em, id")
        .not("status_funil", "in", "(perdido,nao_vai_fazer)")
        .order("criado_em", { ascending: false }).limit(5);
      // get potentials
      const ids = (recent ?? []).map(r => r.id);
      const { data: rels } = ids.length
        ? await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", ids)
        : { data: [] };
      const potMap: Record<string, number> = {};
      (rels ?? []).forEach(r => { potMap[r.lead_id] = Math.max(potMap[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });
      setRecentLeads((recent ?? []).map(r => ({ ...r, potencial: potMap[r.id] ?? 0 })));
    }

    // ─── Month compensations ───
    if (showClientes) {
      const { data: comp } = await supabase.from("compensacoes_mensais")
        .select("valor_compensado, processo_tese_id, cliente_id")
        .gte("mes_referencia", monthStart);
      if (comp?.length) {
        const ptIds = [...new Set(comp.map(c => c.processo_tese_id))];
        const cIds = [...new Set(comp.map(c => c.cliente_id))];
        const [{ data: pts }, { data: cls }] = await Promise.all([
          supabase.from("processos_teses").select("id, nome_exibicao").in("id", ptIds),
          supabase.from("clientes").select("id, empresa").in("id", cIds),
        ]);
        const ptMap = Object.fromEntries((pts ?? []).map(p => [p.id, p.nome_exibicao]));
        const clMap = Object.fromEntries((cls ?? []).map(c => [c.id, c.empresa]));
        const items = comp.map(c => ({
          empresa: clMap[c.cliente_id] ?? "—",
          tese: ptMap[c.processo_tese_id] ?? "—",
          valor: Number(c.valor_compensado ?? 0),
        }));
        setMonthCompensations(items.slice(0, 5));
        setMonthTotal(items.reduce((s, i) => s + i.valor, 0));
      } else {
        setMonthCompensations([]);
        setMonthTotal(0);
      }
    }

    // ─── Motor stats ───
    if (showLeads) {
      const [{ count: totalDiag }, { count: lpLeads }, { count: lpClientes }, { count: totalLp }] = await Promise.all([
        supabase.from("relatorios_leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("origem", "formulario_lp").gte("criado_em", d30),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("origem", "formulario_lp").eq("status_funil", "cliente_ativo"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("origem", "formulario_lp"),
      ]);
      setMotorStats({
        totalDiag: totalDiag ?? 0,
        lpLeads30d: lpLeads ?? 0,
        conversionRate: totalLp ? Math.round(((lpClientes ?? 0) / totalLp) * 100) : 0,
      });
    }

    setLoading(false);
  }, [showLeads, showClientes]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel("dashboard-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "compensacoes_mensais" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const funnelMax = useMemo(() => Math.max(...funnelData.map(f => f.count), 1), [funnelData]);

  const variation = (cur: number, prev: number) => {
    if (!prev) return null;
    const pct = Math.round(((cur - prev) / prev) * 100);
    return pct;
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}, {profile?.full_name?.split(" ")[0] || "usuário"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })} — Aqui está o resumo do momento.
        </p>
      </div>

      {/* KPIs */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="min-w-[180px] flex-shrink-0 border-card-border">
                <CardContent className="p-5"><Skeleton className="h-10 w-20 mb-2" /><Skeleton className="h-4 w-28" /></CardContent>
              </Card>
            ))
          : kpis.filter(k => k.roles.includes(role)).map((k) => {
              const v = variation(k.value, k.prev);
              return (
                <Card key={k.label} className="min-w-[180px] flex-shrink-0 border-card-border">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <k.icon className="h-4 w-4 text-muted-foreground" />
                      {v !== null && (
                        <span className={`text-xs font-semibold flex items-center gap-0.5 ${v >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {v >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {v > 0 ? "+" : ""}{v}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-extrabold text-foreground">
                      {k.prefix ? (
                        <AnimatedNumber value={k.value} prefix={k.prefix === "R$ " ? "R$ " : ""} />
                      ) : (
                        <AnimatedNumber value={k.value} />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
                  </CardContent>
                </Card>
              );
            })
        }
      </div>

      {/* Alerts */}
      {!loading && (showLeads || showClientes) && (
        <Card className="border-l-4 border-l-red-500 border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Requer atenção agora
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 py-2">
                <CheckCircle2 className="h-5 w-5" /> Tudo em ordem. Nenhuma ação urgente no momento.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2 transition-colors"
                    onClick={() => navigate(a.link)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{a.empresa}</p>
                      <p className="text-xs text-muted-foreground">{a.detail}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-500 whitespace-nowrap ml-3">há {a.days}d</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Funnel */}
      {showLeads && !loading && (
        <Card className="border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">Funil comercial — leads ativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelData.map((f) => (
              <div
                key={f.stage}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate(`/pipeline?etapa=${f.stage}`)}
              >
                <span className="text-xs text-muted-foreground w-36 text-right flex-shrink-0 truncate">{f.label}</span>
                <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                  <div
                    className="h-full bg-primary/80 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max((f.count / funnelMax) * 100, f.count > 0 ? 8 : 0)}%` }}
                  >
                    {f.count > 0 && <span className="text-xs font-bold text-primary-foreground">{f.count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent leads */}
        {showLeads && (
          <Card className="border-card-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">Últimos leads captados</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum lead ainda.</p>
              ) : (
                <div className="space-y-1">
                  {recentLeads.map((l, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{l.empresa || "Sem empresa"}</p>
                        <p className="text-xs text-muted-foreground">{SEGMENTO_LABELS[l.segmento] ?? l.segmento}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(l.potencial)}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(l.criado_em)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate("/pipeline")}
                className="text-xs font-semibold text-primary hover:text-primary/80 mt-3 flex items-center gap-1 transition-colors"
              >
                Ver pipeline completo <ArrowRight className="h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* Month compensations */}
        {showClientes && (
          <Card className="border-card-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground">Compensações do mês atual</CardTitle>
                {monthTotal > 0 && (
                  <span className="text-lg font-extrabold text-foreground">{formatCurrency(monthTotal)}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : monthCompensations.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma compensação registrada este mês.</p>
              ) : (
                <div className="space-y-1">
                  {monthCompensations.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{c.empresa}</p>
                        <p className="text-xs text-muted-foreground">{c.tese}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground ml-3">{formatCurrency(c.valor)}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate("/clientes")}
                className="text-xs font-semibold text-primary hover:text-primary/80 mt-3 flex items-center gap-1 transition-colors"
              >
                Ver clientes <ArrowRight className="h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Motor performance */}
      {showLeads && !loading && (
        <Card className="border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">Diagnósticos gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-extrabold text-foreground"><AnimatedNumber value={motorStats.totalDiag} /></p>
                <p className="text-xs text-muted-foreground mt-1">Total de diagnósticos</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-foreground"><AnimatedNumber value={motorStats.lpLeads30d} /></p>
                <p className="text-xs text-muted-foreground mt-1">Leads via LP (30d)</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-foreground"><AnimatedNumber value={motorStats.conversionRate} prefix="" /></p>
                <p className="text-xs text-muted-foreground mt-1">Taxa conversão LP → Cliente (%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
