import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, TrendingUp, TrendingDown, BarChart3, AlertTriangle,
  CheckCircle2, ArrowRight, DollarSign, Briefcase, Receipt,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

const SEGMENTO_CHIP: Record<string, string> = {
  supermercado: "bg-blue-100 text-blue-700",
  farmacia: "bg-green-100 text-green-700",
  pet: "bg-orange-100 text-orange-700",
  materiais_construcao: "bg-gray-200 text-gray-700",
  outros: "bg-purple-100 text-purple-700",
};

/* ─── types ─── */
interface KPI {
  label: string;
  value: number;
  prev: number;
  icon: React.ElementType;
  prefix?: string;
  roles: string[];
  color?: string;
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
  const [funnelData, setFunnelData] = useState<{ stage: string; label: string; count: number; potencial: number }[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [monthCompensations, setMonthCompensations] = useState<{ empresa: string; tese: string; valor: number }[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [motorStats, setMotorStats] = useState({ totalDiag: 0, lpLeads30d: 0, conversionRate: 0 });
  const [bottomStats, setBottomStats] = useState({ clientes: 0, teses: 0, combinacoes: 0 });

  const role = userRole ?? "comercial";
  const showLeads = ["admin", "pmo", "comercial"].includes(role);
  const showClientes = ["admin", "pmo", "gestor_tributario"].includes(role);

  const fetchData = useCallback(async () => {
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
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
        { label: "Potencial da carteira", value: potRes as number, prev: 0, icon: DollarSign, prefix: "R$ ", roles: ["admin", "pmo", "comercial"], color: "text-red-600" },
      );
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
        { label: "Total compensado", value: compTotal, prev: compPrevTotal, icon: CheckCircle2, prefix: "R$ ", roles: ["admin", "pmo", "gestor_tributario"], color: "text-green-700" },
        { label: "Honorários a receber", value: honTotal, prev: 0, icon: Receipt, prefix: "R$ ", roles: ["admin", "pmo", "gestor_tributario"] },
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
    setAlerts(alertItems.slice(0, 5));

    // ─── Funnel with potencial ───
    if (showLeads) {
      const { data: leads } = await supabase.from("leads").select("status_funil, id")
        .not("status_funil", "in", "(perdido,nao_vai_fazer,cliente_ativo)");
      const counts: Record<string, number> = {};
      const leadsByStage: Record<string, string[]> = {};
      FUNNEL_STAGES.forEach(s => { counts[s.value] = 0; leadsByStage[s.value] = []; });
      (leads ?? []).forEach(l => {
        if (counts[l.status_funil] !== undefined) {
          counts[l.status_funil]++;
          leadsByStage[l.status_funil].push(l.id);
        }
      });

      // Get potentials for all active leads
      const allIds = (leads ?? []).map(l => l.id);
      const { data: rels } = allIds.length
        ? await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", allIds)
        : { data: [] };
      const potMap: Record<string, number> = {};
      (rels ?? []).forEach(r => { potMap[r.lead_id] = Math.max(potMap[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });

      setFunnelData(FUNNEL_STAGES.map(s => ({
        stage: s.value,
        label: s.label,
        count: counts[s.value] ?? 0,
        potencial: leadsByStage[s.value].reduce((sum, id) => sum + (potMap[id] ?? 0), 0),
      })));
    }

    // ─── Recent Leads ───
    if (showLeads) {
      const { data: recent } = await supabase.from("leads").select("empresa, segmento, criado_em, id")
        .not("status_funil", "in", "(perdido,nao_vai_fazer)")
        .order("criado_em", { ascending: false }).limit(5);
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

    // ─── Bottom stats ───
    const [{ count: totalClientes }, { data: motorTeses }] = await Promise.all([
      supabase.from("clientes").select("id", { count: "exact", head: true }),
      supabase.from("motor_teses_config").select("regimes_elegiveis, segmentos_elegiveis").eq("ativo", true),
    ]);
    const tesesAtivas = motorTeses?.length ?? 0;
    const combSet = new Set<string>();
    (motorTeses ?? []).forEach(t => {
      (t.regimes_elegiveis ?? []).forEach((r: string) => {
        (t.segmentos_elegiveis ?? []).forEach((s: string) => {
          combSet.add(`${r}:${s}`);
        });
      });
    });
    setBottomStats({ clientes: totalClientes ?? 0, teses: tesesAtivas, combinacoes: combSet.size });

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
  const funnelTotal = useMemo(() => funnelData.reduce((s, f) => s + f.potencial, 0), [funnelData]);

  const variation = (cur: number, prev: number) => {
    if (!prev) return null;
    const pct = Math.round(((cur - prev) / prev) * 100);
    return pct;
  };

  const visibleKpis = kpis.filter(k => k.roles.includes(role));
  const currentMonth = format(new Date(), "MMMM", { locale: ptBR });

  const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    pmo: "PMO",
    gestor_tributario: "Gestor Tributário",
    comercial: "Comercial",
    cliente: "Cliente",
  };

  return (
    <div className="bg-[#f4f5f7] -m-6 min-h-[calc(100vh-64px)]">
      {/* SECTION 1 — Header strip */}
      <div className="bg-[#0a1564] h-[72px] px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {greeting()}, {profile?.full_name?.split(" ")[0] || "usuário"}
          </h1>
          <p className="text-xs text-white/60">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })} — Aqui está o resumo do momento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/80 bg-white/10 rounded-full px-3 py-1 font-medium">
            {ROLE_LABELS[role] ?? role}
          </span>
          <span className="text-[11px] text-white/60 bg-white/10 rounded-full px-3 py-1">
            {format(new Date(), "HH:mm")}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* SECTION 2 — KPI strip */}
        <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex divide-x divide-gray-100 overflow-x-auto">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1 min-w-[140px] p-4">
                  <Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-24" />
                </div>
              ))
            : visibleKpis.map((k) => {
                const v = variation(k.value, k.prev);
                return (
                  <div key={k.label} className="flex-1 min-w-[140px] px-4 py-3 flex items-center gap-3">
                    <k.icon className="h-5 w-5 text-[#0a1564] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xl font-extrabold ${k.color ?? "text-[#0a1564]"}`}>
                        {k.prefix ? (
                          <AnimatedNumber value={k.value} prefix={k.prefix === "R$ " ? "R$ " : ""} />
                        ) : (
                          <AnimatedNumber value={k.value} />
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500 leading-tight truncate">{k.label}</p>
                    </div>
                    {v !== null && (
                      <span className={`text-[11px] font-semibold flex items-center gap-0.5 flex-shrink-0 ${v >= 0 ? "text-[#166534]" : "text-[#991b1b]"}`}>
                        {v >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {v > 0 ? "+" : ""}{v}%
                      </span>
                    )}
                  </div>
                );
              })
          }
        </div>

        {/* SECTION 3 — Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-4">
          {/* Left column */}
          <div className="space-y-4">
            {/* Alerts */}
            {!loading && (showLeads || showClientes) && (
              <div className={`bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${alerts.length > 0 ? "border-l-[3px] border-l-amber-400" : ""}`}>
                {alerts.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-700 px-5 py-3">
                    <CheckCircle2 className="h-4 w-4" /> Tudo em ordem — nenhuma ação urgente.
                  </div>
                ) : (
                  <div className="px-5 py-3 space-y-0">
                    <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> {alerts.length} alerta{alerts.length > 1 ? "s" : ""}
                    </p>
                    {alerts.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
                        onClick={() => navigate(a.link)}
                      >
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${a.type === "lead" ? "bg-amber-500" : "bg-red-500"}`} />
                        <span className="text-sm font-semibold text-gray-900 truncate">{a.empresa}</span>
                        <span className="text-xs text-gray-500 truncate flex-1">{a.detail}</span>
                        <span className="text-[11px] font-semibold text-red-600 whitespace-nowrap">há {a.days}d</span>
                        <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Funnel */}
            {showLeads && !loading && (
              <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-5 py-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Funil comercial</p>
                <div className="space-y-1">
                  {funnelData
                    .filter(f => f.count > 0 || f.stage === "novo" || f.stage === "levantamento_teses")
                    .map((f) => (
                      <div
                        key={f.stage}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded py-1.5 px-1 -mx-1 transition-colors"
                        onClick={() => navigate(`/pipeline?etapa=${f.stage}`)}
                      >
                        <span className="text-xs text-gray-600 w-32 text-right flex-shrink-0 truncate">{f.label}</span>
                        <div className="flex-1 bg-gray-100 rounded h-5 relative overflow-hidden">
                          <div
                            className="h-full bg-[#0a1564] rounded transition-all duration-700"
                            style={{ width: `${Math.max((f.count / funnelMax) * 100, f.count > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900 w-8 text-right">{f.count}</span>
                        <span className="text-[11px] text-gray-400 w-20 text-right">{f.potencial > 0 ? formatCurrency(f.potencial) : "—"}</span>
                      </div>
                    ))}
                </div>
                {funnelTotal > 0 && (
                  <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Total potencial: </span>
                    <span className="text-xs font-bold text-gray-900 ml-1">{formatCurrency(funnelTotal)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Recent leads */}
            {showLeads && (
              <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-5 py-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Últimos leads</p>
                {loading ? (
                  <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                ) : recentLeads.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">Nenhum lead ainda.</p>
                ) : (
                  <div className="space-y-0">
                    {recentLeads.map((l, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{l.empresa || "Sem empresa"}</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SEGMENTO_CHIP[l.segmento] ?? "bg-gray-100 text-gray-600"}`}>
                              {SEGMENTO_LABELS[l.segmento] ?? l.segmento}
                            </span>
                            <span className="text-[10px] text-gray-400">{timeAgo(l.criado_em)}</span>
                          </div>
                        </div>
                        {l.potencial > 0 && (
                          <span className="text-sm font-bold text-green-700 ml-2">{formatCurrency(l.potencial)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => navigate("/pipeline")}
                  className="text-xs font-semibold text-[#0a1564] hover:text-[#0a1564]/80 mt-2 flex items-center gap-1 transition-colors"
                >
                  Ver pipeline <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Month compensations */}
            {showClientes && (
              <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-5 py-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Compensações do mês</p>
                {loading ? (
                  <Skeleton className="h-8 w-full" />
                ) : monthCompensations.length === 0 ? (
                  <p className="text-xs text-gray-500">R$ 0 registrado em {currentMonth}</p>
                ) : (
                  <>
                    <p className="text-xl font-extrabold text-green-700 mb-2">{formatCurrency(monthTotal)}</p>
                    <div className="space-y-0">
                      {monthCompensations.map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-900 truncate">{c.empresa}</p>
                            <p className="text-[10px] text-gray-400">{c.tese}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-700 ml-2">{formatCurrency(c.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <button
                  onClick={() => navigate("/clientes")}
                  className="text-xs font-semibold text-[#0a1564] hover:text-[#0a1564]/80 mt-2 flex items-center gap-1 transition-colors"
                >
                  Ver clientes <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Motor performance */}
            {showLeads && !loading && (
              <div className="bg-[#0a1564] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-5 py-4">
                <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest mb-3">Performance do Motor</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xl font-extrabold text-white"><AnimatedNumber value={motorStats.totalDiag} /></p>
                    <p className="text-[10px] text-white/60">Diagnósticos</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-white"><AnimatedNumber value={motorStats.lpLeads30d} /></p>
                    <p className="text-[10px] text-white/60">Leads LP 30d</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-white"><AnimatedNumber value={motorStats.conversionRate} /></p>
                    <p className="text-[10px] text-white/60">Conversão %</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4 — Bottom strip */}
        <div className="bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] h-16 flex items-center divide-x divide-gray-100">
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Clientes na carteira</p>
            <p className="text-lg font-extrabold text-gray-900">{bottomStats.clientes}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Teses configuradas</p>
            <p className="text-lg font-extrabold text-gray-900">{bottomStats.teses}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Combinações cobertas</p>
            <p className="text-lg font-extrabold text-gray-900">{bottomStats.combinacoes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
