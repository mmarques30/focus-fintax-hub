import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, TrendingUp, TrendingDown, AlertTriangle,
  ArrowRight, DollarSign, Briefcase, Receipt, Info,
  CheckCircle2, BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PIPELINE_STAGES, ACTIVE_STAGES, formatCurrency, daysSince, SEGMENTO_LABELS, getScoreLabel, SCORE_CONFIG } from "@/lib/pipeline-constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

const compactCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(v);

const fullCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const FUNNEL_STAGES = [
  { value: "novo", label: "Prospecção" },
  { value: "qualificado", label: "Qualificado" },
  { value: "levantamento_teses", label: "Levantamento" },
  { value: "em_apresentacao", label: "Apresentação" },
  { value: "contrato_emitido", label: "Contrato Emitido" },
  { value: "contrato_assinado", label: "Contrato Assinado" },
];

const FUNNEL_BORDER: Record<string, string> = {
  novo: "border-l-[8px]",
  qualificado: "border-l-[6px]",
  levantamento_teses: "border-l-[4px]",
  em_apresentacao: "border-l-[3px]",
  contrato_emitido: "border-l-[2px]",
  contrato_assinado: "border-l-[1px]",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", pmo: "PMO", gestor_tributario: "Gestor Tributário", comercial: "Comercial", cliente: "Cliente",
};

const MONTH_ABBR: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

/* ─── types ─── */
interface FunnelRow { stage: string; label: string; count: number; potencial: number; avgDays: number }
interface RecentLead { id: string; empresa: string; segmento: string; criado_em: string; potencial: number; score: number | null }
interface MonthBar { month: string; label: string; valor: number }
interface ClientRank { id: string; empresa: string; compensado: number; saldo: number; identificado: number }

export default function Dashboard() {
  const { profile, userRole } = useAuth();
  const navigate = useNavigate();
  const role = userRole ?? "comercial";

  // Tab state
  const defaultTab = role === "comercial" ? "comercial" : role === "gestor_tributario" ? "operacional" : (localStorage.getItem("dash_tab") ?? "comercial");
  const [activeTab, setActiveTab] = useState(defaultTab);
  const switchTab = (t: string) => { setActiveTab(t); localStorage.setItem("dash_tab", t); };

  const [loading, setLoading] = useState(true);

  // Commercial state
  const [comLeads, setComLeads] = useState(0);
  const [comNewWeek, setComNewWeek] = useState(0);
  const [comPotencial, setComPotencial] = useState(0);
  const [comContratos, setComContratos] = useState(0);
  const [funnelData, setFunnelData] = useState<FunnelRow[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [stalledLeads, setStalledLeads] = useState<{ empresa: string; days: number; id: string }[]>([]);

  // Operational state
  const [opClientes, setOpClientes] = useState(0);
  const [opCompensado, setOpCompensado] = useState(0);
  const [opHonorarios, setOpHonorarios] = useState(0);
  const [opSaldo, setOpSaldo] = useState(0);
  const [monthlyBars, setMonthlyBars] = useState<MonthBar[]>([]);
  const [topCompensado, setTopCompensado] = useState<ClientRank[]>([]);
  const [topSaldo, setTopSaldo] = useState<ClientRank[]>([]);
  const [currentMonthComp, setCurrentMonthComp] = useState(0);
  const [currentMonthHon, setCurrentMonthHon] = useState(0);
  const [currentMonthClientes, setCurrentMonthClientes] = useState(0);

  const fetchData = useCallback(async () => {
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
    const d1 = new Date(now.getTime() - 1 * 86400000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

    // ═══ COMMERCIAL TAB DATA ═══
    const [pipelineRes, newWeekRes, contratosRes] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }).not("status_funil", "in", "(perdido,nao_vai_fazer)"),
      supabase.from("leads").select("id", { count: "exact", head: true }).gte("criado_em", d7),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status_funil", "contrato_emitido"),
    ]);
    setComLeads(pipelineRes.count ?? 0);
    setComNewWeek(newWeekRes.count ?? 0);
    setComContratos(contratosRes.count ?? 0);

    // Potencial total
    const { data: allActiveLeads } = await supabase.from("leads").select("id").not("status_funil", "in", "(perdido,nao_vai_fazer)");
    const activeIds = (allActiveLeads ?? []).map(l => l.id);
    let potTotal = 0;
    if (activeIds.length) {
      const { data: rels } = await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", activeIds);
      const byLead: Record<string, number> = {};
      (rels ?? []).forEach(r => { byLead[r.lead_id] = Math.max(byLead[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });
      potTotal = Object.values(byLead).reduce((s, v) => s + v, 0);
    }
    setComPotencial(potTotal);

    // Funnel data with avg days
    const { data: funnelLeads } = await supabase.from("leads").select("id, status_funil, status_funil_atualizado_em").not("status_funil", "in", "(perdido,nao_vai_fazer,cliente_ativo)");
    const fCounts: Record<string, { count: number; ids: string[]; totalDays: number }> = {};
    FUNNEL_STAGES.forEach(s => { fCounts[s.value] = { count: 0, ids: [], totalDays: 0 }; });
    (funnelLeads ?? []).forEach(l => {
      if (fCounts[l.status_funil]) {
        fCounts[l.status_funil].count++;
        fCounts[l.status_funil].ids.push(l.id);
        fCounts[l.status_funil].totalDays += l.status_funil_atualizado_em ? daysSince(l.status_funil_atualizado_em) : 0;
      }
    });
    // Get potentials per stage
    const allFunnelIds = (funnelLeads ?? []).map(l => l.id);
    let fPotMap: Record<string, number> = {};
    if (allFunnelIds.length) {
      const { data: fRels } = await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", allFunnelIds);
      (fRels ?? []).forEach(r => { fPotMap[r.lead_id] = Math.max(fPotMap[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });
    }
    setFunnelData(FUNNEL_STAGES.map(s => ({
      stage: s.value, label: s.label,
      count: fCounts[s.value]?.count ?? 0,
      potencial: (fCounts[s.value]?.ids ?? []).reduce((sum, id) => sum + (fPotMap[id] ?? 0), 0),
      avgDays: fCounts[s.value]?.count ? Math.round(fCounts[s.value].totalDays / fCounts[s.value].count) : 0,
    })));

    // Recent leads with score
    const { data: recent } = await supabase.from("leads").select("empresa, segmento, criado_em, id, score_lead")
      .not("status_funil", "in", "(perdido,nao_vai_fazer)").order("criado_em", { ascending: false }).limit(5);
    const recentIds = (recent ?? []).map(r => r.id);
    let rPotMap: Record<string, number> = {};
    if (recentIds.length) {
      const { data: rRels } = await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", recentIds);
      (rRels ?? []).forEach(r => { rPotMap[r.lead_id] = Math.max(rPotMap[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });
    }
    setRecentLeads((recent ?? []).map(r => ({ id: r.id, empresa: r.empresa, segmento: r.segmento, criado_em: r.criado_em, potencial: rPotMap[r.id] ?? 0, score: r.score_lead })));

    // Stalled leads (>1 day in novo)
    const { data: stalled } = await supabase.from("leads").select("empresa, status_funil_atualizado_em, id").eq("status_funil", "novo").lt("status_funil_atualizado_em", d1);
    setStalledLeads((stalled ?? []).map(l => ({ empresa: l.empresa || "Sem empresa", days: daysSince(l.status_funil_atualizado_em!), id: l.id })).sort((a, b) => b.days - a.days));

    // ═══ OPERATIONAL TAB DATA ═══
    const [clientesRes, allCompRes, allProcRes] = await Promise.all([
      supabase.from("clientes").select("id, empresa", { count: "exact" }).eq("status", "ativo"),
      supabase.from("compensacoes_mensais").select("valor_compensado, valor_nf_servico, mes_referencia, cliente_id"),
      supabase.from("processos_teses").select("id, cliente_id, valor_credito, percentual_honorario, valor_honorario"),
    ]);
    const clientes = clientesRes.data ?? [];
    const allComp = allCompRes.data ?? [];
    const allProc = allProcRes.data ?? [];
    setOpClientes(clientesRes.count ?? 0);

    const totalCompensado = allComp.reduce((s, c) => s + Number(c.valor_compensado ?? 0), 0);
    setOpCompensado(totalCompensado);

    const totalHonorarios = allComp.reduce((s, c) => s + Number(c.valor_nf_servico ?? 0), 0);
    setOpHonorarios(totalHonorarios);

    const totalCredito = allProc.reduce((s, p) => s + Number(p.valor_credito ?? 0), 0);
    setOpSaldo(totalCredito - totalCompensado);

    // Monthly bars (last 6 months)
    const monthMap: Record<string, number> = {};
    allComp.forEach(c => {
      const m = String(c.mes_referencia).slice(0, 7); // YYYY-MM
      monthMap[m] = (monthMap[m] ?? 0) + Number(c.valor_compensado ?? 0);
    });
    const sortedMonths = Object.keys(monthMap).sort().slice(-6);
    setMonthlyBars(sortedMonths.map(m => ({
      month: m,
      label: MONTH_ABBR[m.slice(5, 7)] ?? m.slice(5, 7),
      valor: monthMap[m],
    })));

    // Top clients by compensado
    const clienteMap = Object.fromEntries(clientes.map(c => [c.id, c.empresa]));
    const compByClient: Record<string, number> = {};
    allComp.forEach(c => { compByClient[c.cliente_id] = (compByClient[c.cliente_id] ?? 0) + Number(c.valor_compensado ?? 0); });
    const creditByClient: Record<string, number> = {};
    allProc.forEach(p => { creditByClient[p.cliente_id] = (creditByClient[p.cliente_id] ?? 0) + Number(p.valor_credito ?? 0); });

    const allClientIds = [...new Set([...Object.keys(compByClient), ...Object.keys(creditByClient)])];
    const rankings: ClientRank[] = allClientIds.map(id => ({
      id,
      empresa: clienteMap[id] ?? "—",
      compensado: compByClient[id] ?? 0,
      identificado: creditByClient[id] ?? 0,
      saldo: (creditByClient[id] ?? 0) - (compByClient[id] ?? 0),
    }));

    setTopCompensado([...rankings].sort((a, b) => b.compensado - a.compensado).slice(0, 8));
    setTopSaldo([...rankings].sort((a, b) => b.saldo - a.saldo).filter(r => r.saldo > 0).slice(0, 8));

    // Current month summary
    const curMonthComp = allComp.filter(c => String(c.mes_referencia).startsWith(monthStart.slice(0, 7)));
    setCurrentMonthComp(curMonthComp.reduce((s, c) => s + Number(c.valor_compensado ?? 0), 0));
    setCurrentMonthHon(curMonthComp.reduce((s, c) => s + Number(c.valor_nf_servico ?? 0), 0));
    setCurrentMonthClientes(new Set(curMonthComp.map(c => c.cliente_id)).size);

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel("dashboard-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "compensacoes_mensais" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const currentMonth = format(new Date(), "MMMM", { locale: ptBR });
  const opEconomia = opCompensado - opHonorarios;

  return (
    <div className="bg-[#f4f5f7] -m-4 min-h-[calc(100vh-64px)]">
      {/* ═══ Header ═══ */}
      <div className="bg-[#0a1564] h-16 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">
            {greeting()}, {profile?.full_name?.split(" ")[0] || "usuário"}
          </h1>
          <p className="text-xs text-white/50">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
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

      {/* ═══ Tab Switcher ═══ */}
      <div className="flex justify-center border-b border-gray-200 bg-white">
        {[
          { key: "comercial", label: "Visão Comercial" },
          { key: "operacional", label: "Visão Operacional" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === t.key
                ? "text-[#0a1564]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
            {activeTab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0a1564]" />
            )}
          </button>
        ))}
      </div>

      <div className="px-3 py-3 space-y-3">
        {loading ? (
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 flex-1" />)}
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : activeTab === "comercial" ? (
          /* ═══════════════ TAB 1 — VISÃO COMERCIAL ═══════════════ */
          <>
            {/* Row 1 — 4 KPIs */}
            <div className="bg-white rounded-lg shadow-sm flex divide-x divide-gray-100" style={{ height: 80 }}>
              <KPICell label="Leads no pipeline" value={comLeads} color="text-[#0a1564]" />
              <KPICell label="Novos esta semana" value={comNewWeek} color="text-[#0a1564]" />
              <KPICell label="Potencial total" value={comPotencial} color="text-[#c8001e]" format="currency" bold />
              <KPICell
                label="Contratos emitidos"
                value={comContratos}
                color={comContratos > 0 ? "text-amber-600" : "text-gray-400"}
              />
            </div>

            {/* Row 2 — 60/40 */}
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-3">
              {/* LEFT — Funil */}
              <div className="bg-white rounded-lg shadow-sm px-5 py-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Funil comercial</p>
                <div className="space-y-0">
                  {funnelData.filter(f => f.count > 0).map(f => (
                    <div
                      key={f.stage}
                      className={`flex items-center gap-3 py-2 px-2 -mx-2 cursor-pointer hover:bg-gray-50 rounded transition-colors border-l-[#c8001e] ${FUNNEL_BORDER[f.stage] ?? "border-l-[2px]"} ${
                        f.stage === "contrato_emitido" && f.count > 0 ? "bg-amber-50" : ""
                      }`}
                      onClick={() => navigate(`/pipeline?etapa=${f.stage}`)}
                    >
                      <span className="text-xs font-medium text-gray-700 w-28 truncate">{f.label}</span>
                      <span className="text-sm font-bold text-gray-900 w-8 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{f.count}</span>
                      <span className="text-xs text-gray-500 w-24 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{f.potencial > 0 ? compactCurrency(f.potencial) : "—"}</span>
                      {f.avgDays > 3 && (
                        <span className="text-[10px] text-amber-600 font-medium">⏱ {f.avgDays}d</span>
                      )}
                      <ArrowRight className="h-3 w-3 text-gray-300 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — Recent leads */}
              <div className="bg-white rounded-lg shadow-sm px-5 py-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Leads recentes</p>
                <div className="space-y-0">
                  {recentLeads.map(l => {
                    const scoreLetter = getScoreLabel(l.score);
                    const scoreConf = SCORE_CONFIG[scoreLetter];
                    return (
                      <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{l.empresa || "Sem empresa"}</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SEGMENTO_CHIP[l.segmento] ?? "bg-gray-100 text-gray-600"}`}>
                              {SEGMENTO_LABELS[l.segmento] ?? l.segmento}
                            </span>
                            <span className="text-[10px] text-gray-400">{timeAgo(l.criado_em)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${scoreConf.color}`}>{scoreLetter}</span>
                          {l.potencial > 0 && (
                            <span className="text-sm font-bold text-green-700" style={{ fontVariantNumeric: "tabular-nums" }}>{compactCurrency(l.potencial)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => navigate("/pipeline")} className="text-xs font-semibold text-[#0a1564] hover:text-[#0a1564]/80 mt-2 flex items-center gap-1">
                  Ver pipeline <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Row 3 — Alerts */}
            {stalledLeads.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3">
                <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Leads parados
                </p>
                {stalledLeads.slice(0, 3).map((l, i) => (
                  <p key={i} className="text-xs text-amber-800 py-0.5">
                    • <span className="font-semibold">{l.empresa}</span> — há {l.days} dias sem ação
                  </p>
                ))}
                {stalledLeads.length > 3 && (
                  <button onClick={() => navigate("/pipeline")} className="text-xs font-semibold text-amber-700 mt-1 hover:underline">
                    ver todos ({stalledLeads.length})
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* ═══════════════ TAB 2 — VISÃO OPERACIONAL ═══════════════ */
          <>
            {/* Row 1 — 5 KPIs */}
            <div className="bg-white rounded-lg shadow-sm flex divide-x divide-gray-100" style={{ height: 72 }}>
              <KPICell label="Clientes ativos" value={opClientes} color="text-[#0a1564]" />
              <KPICell label="Compensado total" value={opCompensado} color="text-[#166534]" format="currency" bold />
              <KPICell label="Honorários gerados" value={opHonorarios} color="text-[#166534]" format="currency" />
              <KPICell label="Economia líquida clientes" value={opEconomia} color="text-[#166534]" format="currency" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1 min-w-[120px] px-4 flex flex-col justify-center cursor-help">
                      <p className="text-xl font-extrabold text-[#c8001e]" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {compactCurrency(opSaldo)}
                      </p>
                      <p className="text-[11px] text-gray-500 leading-tight flex items-center gap-1">
                        Saldo de créditos <Info className="h-3 w-3 text-gray-400" />
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs max-w-[240px]">Total de créditos identificados ainda não compensados na carteira ativa.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Row 2 — Monthly chart */}
            <div className="bg-white rounded-lg shadow-sm px-5 py-4">
              <p className="text-sm font-bold text-gray-900 mb-1">Evolução mensal — compensações realizadas</p>
              {monthlyBars.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">Nenhuma compensação registrada. Importe dados ou registre manualmente em Clientes.</p>
              ) : (
                <div className="h-[220px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyBars} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => compactCurrency(v)} width={70} />
                      <RechartsTooltip formatter={(v: number) => fullCurrency(v)} labelFormatter={(l) => l} />
                      <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={48} label={{ position: "top", fontSize: 10, fill: "#374151", formatter: (v: number) => compactCurrency(v) }}>
                        {monthlyBars.map((_, i) => (
                          <Cell key={i} fill={i === monthlyBars.length - 1 ? "#1e3a8a" : "#0a1564"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Row 3 — Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-3">
              {/* LEFT — Top compensado */}
              <div className="bg-white rounded-lg shadow-sm px-5 py-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Ranking de compensações</p>
                <div className="space-y-0">
                  {topCompensado.map((c, i) => {
                    const ratio = c.identificado > 0 ? (c.compensado / c.identificado) * 100 : 0;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
                        onClick={() => navigate(`/clientes/${c.id}`)}
                      >
                        <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                        <span className="text-xs font-semibold text-gray-900 truncate flex-1">{c.empresa}</span>
                        <span className="text-xs font-bold text-[#166534] w-24 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{compactCurrency(c.compensado)}</span>
                        <span className={`text-[10px] font-semibold w-20 text-right ${c.saldo > 500000 ? "text-[#c8001e]" : "text-gray-400"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                          {compactCurrency(c.saldo)}
                        </span>
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#166534] rounded-full" style={{ width: `${Math.min(ratio, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {topCompensado.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">Nenhuma compensação registrada.</p>}
                </div>
              </div>

              {/* RIGHT — Top saldo */}
              <div className="bg-white rounded-lg shadow-sm px-5 py-4">
                <p className="text-sm font-bold text-gray-900 mb-0.5">Maior saldo a compensar</p>
                <p className="text-[11px] text-gray-400 mb-3">Priorize esses clientes</p>
                <div className="space-y-0">
                  {topSaldo.map(c => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
                      onClick={() => navigate(`/clientes/${c.id}`)}
                    >
                      <span className="text-xs font-semibold text-gray-900 truncate flex-1">{c.empresa}</span>
                      <div className="text-right ml-2">
                        <p className="text-xs font-bold text-[#c8001e]" style={{ fontVariantNumeric: "tabular-nums" }}>{compactCurrency(c.saldo)}</p>
                        <p className="text-[10px] text-gray-400" style={{ fontVariantNumeric: "tabular-nums" }}>{compactCurrency(c.identificado)}</p>
                      </div>
                    </div>
                  ))}
                  {topSaldo.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">Nenhum saldo pendente.</p>}
                </div>
              </div>
            </div>

            {/* Row 4 — Current month strip */}
            <div className="bg-white rounded-lg shadow-sm h-14 flex items-center px-5">
              {currentMonthComp > 0 ? (
                <div className="flex items-center gap-6 text-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <span className="text-gray-500">Compensado em <span className="capitalize">{currentMonth}</span>: <span className="font-bold text-gray-900">{fullCurrency(currentMonthComp)}</span></span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">Honorários em <span className="capitalize">{currentMonth}</span>: <span className="font-bold text-gray-900">{fullCurrency(currentMonthHon)}</span></span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">Clientes com compensação: <span className="font-bold text-gray-900">{currentMonthClientes}</span></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  Nenhuma compensação registrada em <span className="capitalize">{currentMonth}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Shared KPI Cell ─── */
function KPICell({ label, value, color, format: fmt, bold }: {
  label: string; value: number; color: string; format?: "currency"; bold?: boolean;
}) {
  return (
    <div className="flex-1 min-w-[120px] px-4 flex flex-col justify-center">
      <p className={`text-xl ${bold ? "font-extrabold" : "font-bold"} ${color}`} style={{ fontVariantNumeric: "tabular-nums" }}>
        {fmt === "currency" ? compactCurrency(value) : <AnimatedNumber value={value} />}
      </p>
      <p className="text-[11px] text-gray-500 leading-tight truncate">{label}</p>
    </div>
  );
}
