import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEGMENTO_LABELS, getScoreLabel, SCORE_CONFIG, daysSince } from "@/lib/pipeline-constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ─── helpers ─── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const compactCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(v);

const fullCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function timeAgo(date: string) {
  const d = daysSince(date);
  if (d === 0) return "Hoje";
  if (d === 1) return "Ontem";
  return `há ${d} dias`;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", pmo: "PMO", gestor_tributario: "Gestor Tributário", comercial: "Comercial", cliente: "Cliente",
};

const MONTH_ABBR: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

const SEGMENTO_CHIP: Record<string, { bg: string; color: string }> = {
  supermercado: { bg: "#eff6ff", color: "#1d4ed8" },
  farmacia: { bg: "#f0fdf4", color: "#15803d" },
  pet: { bg: "#fff7ed", color: "#c2410c" },
  materiais_construcao: { bg: "#f5f5f4", color: "#44403c" },
  outros: { bg: "#f3f4f6", color: "#6b7280" },
};

const SEGMENTO_BAR_COLOR: Record<string, string> = {
  supermercado: "#1d4ed8",
  farmacia: "#15803d",
  pet: "#c2410c",
  materiais_construcao: "#44403c",
  outros: "#6b7280",
};

const SCORE_CHIP: Record<string, { bg: string; color: string }> = {
  A: { bg: "#fef2f2", color: "#991b1b" },
  B: { bg: "#fff7ed", color: "#92400e" },
  C: { bg: "#fefce8", color: "#713f12" },
  D: { bg: "#f3f4f6", color: "#9ca3af" },
};

const SCORE_VAL_COLOR: Record<string, string> = {
  A: "var(--dash-red)",
  B: "var(--dash-amber)",
  C: "var(--ink-60)",
  D: "var(--ink-35)",
};

const FUNNEL_STAGES_COM = [
  { value: "novo", label: "Prospecção / Novo", color: "#6366f1" },
  { value: "qualificado", label: "Qualificado", color: "#3b82f6" },
  { value: "levantamento_teses", label: "Levantamento de Teses", color: "#0ea5e9" },
  { value: "em_apresentacao", label: "Apresentação", color: "#06b6d4" },
  { value: "contrato_emitido", label: "Contrato Emitido", color: "var(--dash-amber)" },
  { value: "cliente_ativo", label: "Cliente Ativo", color: "var(--dash-green)" },
];

const ORIGEM_LABELS: Record<string, string> = {
  formulario: "Formulário LP",
  manual: "Manual",
  meta_ads: "Meta Ads",
};

/* ─── types ─── */
interface FunnelRow { stage: string; label: string; count: number; potencial: number; color: string }
interface RecentLead { id: string; empresa: string; segmento: string; criado_em: string; potencial: number; score: number | null }
interface MonthBar { month: string; label: string; valor: number; honorarios: number }
interface ClientRank { id: string; empresa: string; compensado: number; saldo: number; identificado: number; honorarios: number }

/* ─── Shared font styles ─── */
const fontMono: React.CSSProperties = { fontFamily: "'DM Mono', monospace", fontVariantNumeric: "tabular-nums" };
const fontCondensed: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif" };
const fontBarlow: React.CSSProperties = { fontFamily: "'Barlow', sans-serif" };

export default function Dashboard() {
  const { profile, userRole } = useAuth();
  const navigate = useNavigate();
  const role = userRole ?? "comercial";

  const defaultTab = role === "comercial" ? "comercial" : role === "gestor_tributario" ? "operacional" : (localStorage.getItem("dash_tab") ?? "comercial");
  const [activeTab, setActiveTab] = useState(defaultTab);
  const switchTab = (t: string) => { setActiveTab(t); localStorage.setItem("dash_tab", t); };

  const [loading, setLoading] = useState(true);

  // Commercial state
  const [comLeads, setComLeads] = useState(0);
  const [comNewWeek, setComNewWeek] = useState(0);
  const [comNewPrevWeek, setComNewPrevWeek] = useState(0);
  const [comPotencial, setComPotencial] = useState(0);
  const [comContratos, setComContratos] = useState(0);
  const [comClientesAtivos, setComClientesAtivos] = useState(0);
  const [comTaxaConversao, setComTaxaConversao] = useState(0);
  const [funnelData, setFunnelData] = useState<FunnelRow[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [stalledLeads, setStalledLeads] = useState<{ empresa: string; days: number; id: string }[]>([]);
  const [segmentoData, setSegmentoData] = useState<{ segmento: string; count: number }[]>([]);
  const [origemData, setOrigemData] = useState<Record<string, number>>({});
  const [scoreDistribution, setScoreDistribution] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0 });
  const [motorDiagnosticos, setMotorDiagnosticos] = useState(0);
  const [motorTesesAtivas, setMotorTesesAtivas] = useState(0);

  // Operational state
  const [opClientes, setOpClientes] = useState(0);
  const [opTotalAtivos, setOpTotalAtivos] = useState(0);
  const [opCompensado, setOpCompensado] = useState(0);
  const [opHonorarios, setOpHonorarios] = useState(0);
  const [opSaldo, setOpSaldo] = useState(0);
  const [monthlyBars, setMonthlyBars] = useState<MonthBar[]>([]);
  const [topCompensado, setTopCompensado] = useState<ClientRank[]>([]);
  const [topSaldo, setTopSaldo] = useState<ClientRank[]>([]);

  const fetchData = useCallback(async () => {
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
    const d14 = new Date(now.getTime() - 14 * 86400000).toISOString();
    const d3 = new Date(now.getTime() - 3 * 86400000).toISOString();

    // ═══ COMMERCIAL TAB DATA ═══
    const [pipelineRes, newWeekRes, prevWeekRes, contratosRes, clientesAtivosRes] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }).not("status_funil", "in", "(perdido,nao_vai_fazer)"),
      supabase.from("leads").select("id", { count: "exact", head: true }).gte("criado_em", d7),
      supabase.from("leads").select("id", { count: "exact", head: true }).gte("criado_em", d14).lt("criado_em", d7),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status_funil", "contrato_emitido"),
      supabase.from("clientes").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    ]);
    setComLeads(pipelineRes.count ?? 0);
    setComNewWeek(newWeekRes.count ?? 0);
    setComNewPrevWeek(prevWeekRes.count ?? 0);
    setComContratos(contratosRes.count ?? 0);
    const clientesAtivos = clientesAtivosRes.count ?? 0;
    setComClientesAtivos(clientesAtivos);

    // Taxa conversão
    const totalNonLost = pipelineRes.count ?? 0;
    setComTaxaConversao(totalNonLost > 0 ? Math.round((clientesAtivos / totalNonLost) * 100) : 0);

    // All active leads for potencial + funnel + segmento + origem + score
    const { data: allLeads } = await supabase.from("leads").select("id, status_funil, segmento, origem, score_lead").not("status_funil", "in", "(perdido,nao_vai_fazer)");
    const activeLeads = allLeads ?? [];
    const activeIds = activeLeads.map(l => l.id);

    // Potencial total from relatorios
    let potTotal = 0;
    let potByLead: Record<string, number> = {};
    if (activeIds.length) {
      const { data: rels } = await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", activeIds);
      (rels ?? []).forEach(r => { potByLead[r.lead_id] = Math.max(potByLead[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });
      potTotal = Object.values(potByLead).reduce((s, v) => s + v, 0);
    }
    setComPotencial(potTotal);

    // Funnel data
    const fCounts: Record<string, { count: number; ids: string[] }> = {};
    FUNNEL_STAGES_COM.forEach(s => { fCounts[s.value] = { count: 0, ids: [] }; });
    activeLeads.forEach(l => {
      if (fCounts[l.status_funil]) {
        fCounts[l.status_funil].count++;
        fCounts[l.status_funil].ids.push(l.id);
      }
    });
    // cliente_ativo count from clientes table
    fCounts["cliente_ativo"] = { count: clientesAtivos, ids: [] };

    setFunnelData(FUNNEL_STAGES_COM.map(s => ({
      stage: s.value, label: s.label, color: s.color,
      count: fCounts[s.value]?.count ?? 0,
      potencial: (fCounts[s.value]?.ids ?? []).reduce((sum, id) => sum + (potByLead[id] ?? 0), 0),
    })));

    // Segmento distribution
    const segMap: Record<string, number> = {};
    activeLeads.forEach(l => { segMap[l.segmento] = (segMap[l.segmento] ?? 0) + 1; });
    setSegmentoData(Object.entries(segMap).sort((a, b) => b[1] - a[1]).map(([segmento, count]) => ({ segmento, count })));

    // Origem distribution
    const origMap: Record<string, number> = {};
    activeLeads.forEach(l => { origMap[l.origem] = (origMap[l.origem] ?? 0) + 1; });
    setOrigemData(origMap);

    // Score distribution
    const scoreDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    activeLeads.forEach(l => {
      const letter = getScoreLabel(l.score_lead);
      scoreDist[letter] = (scoreDist[letter] ?? 0) + 1;
    });
    setScoreDistribution(scoreDist);

    // Recent leads
    const { data: recent } = await supabase.from("leads").select("empresa, segmento, criado_em, id, score_lead")
      .not("status_funil", "in", "(perdido,nao_vai_fazer)").order("criado_em", { ascending: false }).limit(4);
    const recentIds = (recent ?? []).map(r => r.id);
    let rPotMap: Record<string, number> = {};
    if (recentIds.length) {
      const { data: rRels } = await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", recentIds);
      (rRels ?? []).forEach(r => { rPotMap[r.lead_id] = Math.max(rPotMap[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });
    }
    setRecentLeads((recent ?? []).map(r => ({ id: r.id, empresa: r.empresa, segmento: r.segmento, criado_em: r.criado_em, potencial: rPotMap[r.id] ?? 0, score: r.score_lead })));

    // Stalled leads (contrato_emitido > 3 days)
    const { data: stalled } = await supabase.from("leads").select("empresa, status_funil_atualizado_em, id")
      .eq("status_funil", "contrato_emitido").lt("status_funil_atualizado_em", d3);
    setStalledLeads((stalled ?? []).map(l => ({ empresa: l.empresa || "Sem empresa", days: daysSince(l.status_funil_atualizado_em!), id: l.id })).sort((a, b) => b.days - a.days));

    // Motor metrics
    const [diagRes, tesesRes] = await Promise.all([
      supabase.from("diagnosticos_leads").select("lead_id"),
      supabase.from("motor_teses_config").select("id", { count: "exact", head: true }).eq("ativo", true),
    ]);
    const uniqueDiagLeads = new Set((diagRes.data ?? []).map(d => d.lead_id));
    setMotorDiagnosticos(uniqueDiagLeads.size);
    setMotorTesesAtivas(tesesRes.count ?? 0);

    // ═══ OPERATIONAL TAB DATA ═══
    const [clientesRes, allCompRes, allProcRes, totalAtivosRes] = await Promise.all([
      supabase.from("clientes").select("id, empresa", { count: "exact" }).eq("compensando_fintax", true),
      supabase.from("compensacoes_mensais").select("valor_compensado, valor_nf_servico, mes_referencia, cliente_id"),
      supabase.from("processos_teses").select("id, cliente_id, valor_credito, percentual_honorario, valor_honorario"),
      supabase.from("clientes").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    ]);
    const clientes = clientesRes.data ?? [];
    const allComp = allCompRes.data ?? [];
    const allProc = allProcRes.data ?? [];
    setOpClientes(clientesRes.count ?? 0);
    setOpTotalAtivos(totalAtivosRes.count ?? 0);

    const totalCompensado = allComp.reduce((s, c) => s + Number(c.valor_compensado ?? 0), 0);
    setOpCompensado(totalCompensado);
    const totalHonorarios = allComp.reduce((s, c) => s + Number(c.valor_nf_servico ?? 0), 0);
    setOpHonorarios(totalHonorarios);
    const totalCredito = allProc.reduce((s, p) => s + Number(p.valor_credito ?? 0), 0);
    setOpSaldo(totalCredito - totalCompensado);

    // Monthly bars
    const monthMapComp: Record<string, number> = {};
    const monthMapHon: Record<string, number> = {};
    allComp.forEach(c => {
      const m = String(c.mes_referencia).slice(0, 7);
      monthMapComp[m] = (monthMapComp[m] ?? 0) + Number(c.valor_compensado ?? 0);
      monthMapHon[m] = (monthMapHon[m] ?? 0) + Number(c.valor_nf_servico ?? 0);
    });
    const sortedMonths = Object.keys(monthMapComp).sort().slice(-6);
    setMonthlyBars(sortedMonths.map(m => ({
      month: m,
      label: `${MONTH_ABBR[m.slice(5, 7)] ?? m.slice(5, 7)}/${m.slice(2, 4)}`,
      valor: monthMapComp[m],
      honorarios: monthMapHon[m] ?? 0,
    })));

    // Rankings
    const clienteMap = Object.fromEntries(clientes.map(c => [c.id, c.empresa]));
    const compByClient: Record<string, number> = {};
    const honByClient: Record<string, number> = {};
    allComp.forEach(c => {
      compByClient[c.cliente_id] = (compByClient[c.cliente_id] ?? 0) + Number(c.valor_compensado ?? 0);
      honByClient[c.cliente_id] = (honByClient[c.cliente_id] ?? 0) + Number(c.valor_nf_servico ?? 0);
    });
    const creditByClient: Record<string, number> = {};
    allProc.forEach(p => { creditByClient[p.cliente_id] = (creditByClient[p.cliente_id] ?? 0) + Number(p.valor_credito ?? 0); });
    const allClientIds = [...new Set([...Object.keys(compByClient), ...Object.keys(creditByClient)])];
    const rankings: ClientRank[] = allClientIds.map(id => ({
      id, empresa: clienteMap[id] ?? "—",
      compensado: compByClient[id] ?? 0, honorarios: honByClient[id] ?? 0,
      identificado: creditByClient[id] ?? 0, saldo: (creditByClient[id] ?? 0) - (compByClient[id] ?? 0),
    }));
    setTopCompensado([...rankings].sort((a, b) => b.compensado - a.compensado).slice(0, 8));
    setTopSaldo([...rankings].sort((a, b) => b.saldo - a.saldo).filter(r => r.saldo > 0).slice(0, 8));

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase.channel("dashboard-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "compensacoes_mensais" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const opEconomia = opCompensado - opHonorarios;
  const trendDiff = comNewWeek - comNewPrevWeek;

  // Funnel computed
  const maxFunnelCount = Math.max(...funnelData.map(f => f.count), 1);
  const totalFunnelCount = funnelData.reduce((s, f) => s + f.count, 0);
  const totalFunnelPotencial = funnelData.reduce((s, f) => s + f.potencial, 0);

  // Segmento max
  const maxSegCount = Math.max(...segmentoData.map(s => s.count), 1);

  return (
    <div style={{ background: "var(--dash-page)", fontFamily: "'Barlow', sans-serif", WebkitFontSmoothing: "antialiased" }} className="-m-4 min-h-[calc(100vh-64px)]">
      {/* ═══ Header ═══ */}
      <div style={{ background: "var(--dash-surface)", borderBottom: "1px solid var(--dash-border)", height: 52, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{greeting()}, {profile?.full_name?.split(" ")[0] || "usuário"}</span>
          <span style={{ fontSize: 12, color: "var(--ink-60)", marginLeft: 10 }}>{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ background: "var(--navy-10)", border: "1px solid var(--dash-border)", borderRadius: 6, padding: "3px 10px", ...fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--navy)" }}>{ROLE_LABELS[role] ?? role}</span>
          <span style={{ ...fontMono, fontSize: 12, color: "var(--ink-60)", marginLeft: 10 }}>{format(new Date(), "HH:mm")}</span>
        </div>
      </div>

      {/* ═══ Tab Switcher ═══ */}
      <div style={{ display: "flex", justifyContent: "center", background: "var(--dash-surface)", borderBottom: "1px solid var(--dash-border)" }}>
        {[{ key: "comercial", label: "Visão Comercial" }, { key: "operacional", label: "Visão Operacional" }].map(t => (
          <button key={t.key} onClick={() => switchTab(t.key)} style={{ padding: "14px 28px", fontSize: 13, fontWeight: activeTab === t.key ? 600 : 500, color: activeTab === t.key ? "var(--navy)" : "var(--ink-60)", cursor: "pointer", borderBottom: activeTab === t.key ? "2px solid var(--navy)" : "2px solid transparent", background: "none", border: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: activeTab === t.key ? "var(--navy)" : "transparent", ...fontBarlow }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "18px 28px 36px", maxWidth: 1400, margin: "0 auto" }}>
        {loading ? (
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 flex-1" />)}
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : activeTab === "comercial" ? (
          <CommercialTab
            comLeads={comLeads} comNewWeek={comNewWeek} trendDiff={trendDiff}
            comPotencial={comPotencial} comContratos={comContratos} comTaxaConversao={comTaxaConversao}
            comClientesAtivos={comClientesAtivos} stalledLeads={stalledLeads} funnelData={funnelData}
            maxFunnelCount={maxFunnelCount} totalFunnelCount={totalFunnelCount} totalFunnelPotencial={totalFunnelPotencial}
            segmentoData={segmentoData} maxSegCount={maxSegCount} origemData={origemData}
            recentLeads={recentLeads} scoreDistribution={scoreDistribution}
            motorDiagnosticos={motorDiagnosticos} motorTesesAtivas={motorTesesAtivas}
            navigate={navigate}
          />
        ) : (
          <OperationalTab
            opClientes={opClientes} opTotalAtivos={opTotalAtivos} opCompensado={opCompensado} opHonorarios={opHonorarios}
            opSaldo={opSaldo} opEconomia={opEconomia} monthlyBars={monthlyBars}
            topCompensado={topCompensado} topSaldo={topSaldo} navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 1 — VISÃO COMERCIAL
   ═══════════════════════════════════════════════════════ */
function CommercialTab({
  comLeads, comNewWeek, trendDiff, comPotencial, comContratos, comTaxaConversao,
  comClientesAtivos, stalledLeads, funnelData, maxFunnelCount, totalFunnelCount,
  totalFunnelPotencial, segmentoData, maxSegCount, origemData, recentLeads,
  scoreDistribution, motorDiagnosticos, motorTesesAtivas, navigate,
}: any) {
  const anim = (delay: number): React.CSSProperties => ({
    opacity: 0, transform: "translateY(10px)",
    animation: `fu 0.45s ease ${delay}ms both`,
  });

  return (
    <>
      {/* KPI STRIP */}
      <div style={{ ...anim(40), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(5,1fr)", marginBottom: 14, overflow: "hidden" }}>
        <KpiBox label="Leads no pipeline" value={String(comLeads)} sub="excluindo perdidos" />
        <KpiBox label="Novos esta semana" value={String(comNewWeek)} sub="leads captados (7d)" trend={trendDiff} />
        <KpiBox label="Potencial total" value={compactCurrency(comPotencial)} sub="soma do potencial máx." colorClass="red" />
        <KpiBox label="Contratos emitidos" value={String(comContratos)} sub="aguardando assinatura" colorClass="amber" />
        <KpiBox label="Taxa de conversão" value={`${comTaxaConversao}%`} sub="leads → clientes ativos" colorClass="green" last />
      </div>

      {/* ALERTAS */}
      {stalledLeads.length > 0 && (
        <div style={{ ...anim(90), background: "var(--dash-surface)", border: "1px solid rgba(180,83,9,0.2)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ padding: "10px 18px", background: "var(--dash-amber-bg)", borderBottom: "1px solid rgba(180,83,9,0.12)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--dash-amber)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--dash-amber)" }}>
              Requer atenção — {stalledLeads.length} lead{stalledLeads.length > 1 ? "s" : ""} sem movimentação
            </span>
          </div>
          {stalledLeads.slice(0, 5).map((l: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 18px", borderBottom: "1px solid rgba(0,0,0,0.04)", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", width: 220, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.empresa}</span>
              <span style={{ fontSize: 11, color: "var(--ink-60)", flex: 1 }}>Em Contrato Emitido sem atualização</span>
              <span style={{ ...fontMono, fontSize: 10, color: "var(--dash-amber)", fontWeight: 600, background: "var(--dash-amber-10)", padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>há {l.days} dias</span>
            </div>
          ))}
        </div>
      )}

      {/* MAIN GRID */}
      <div style={{ ...anim(140), display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, marginBottom: 14 }}>
        {/* LEFT — FUNIL CARD */}
        <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
          {/* Card header */}
          <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Funil comercial</div>
              <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 2 }}>clique em uma etapa para filtrar o pipeline</div>
            </div>
          </div>

          {/* Funnel rows */}
          {funnelData.map((f: FunnelRow) => {
            const isContrato = f.stage === "contrato_emitido" && f.count > 0;
            const isCliente = f.stage === "cliente_ativo";
            const rowBg = isContrato ? "var(--dash-amber-bg)" : "transparent";
            const nameColor = isContrato ? "var(--dash-amber)" : isCliente ? "var(--dash-green)" : "var(--ink)";
            const nameWeight = isContrato ? 700 : isCliente ? 600 : 500;
            const countColor = isContrato ? "var(--dash-amber)" : isCliente ? "var(--dash-green)" : "var(--navy)";
            const valColor = isContrato ? "var(--dash-amber)" : "var(--dash-green)";
            const suffix = isContrato ? " ⚠" : isCliente ? " ✓" : "";

            return (
              <div
                key={f.stage}
                onClick={() => navigate(f.stage === "cliente_ativo" ? "/clientes" : `/pipeline?etapa=${f.stage}`)}
                style={{ display: "flex", alignItems: "center", padding: "9px 18px", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", transition: "background 0.12s", background: rowBg, gap: 0, minWidth: 0 }}
                onMouseEnter={e => { if (!isContrato) (e.currentTarget as HTMLElement).style.background = "var(--ink-06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = rowBg; }}
              >
                <div style={{ width: 5, height: 26, borderRadius: 3, flexShrink: 0, marginRight: 12, background: f.color }} />
                <span style={{ fontSize: 12, fontWeight: nameWeight, color: nameColor, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{f.label}{suffix}</span>
                <span style={{ ...fontMono, fontSize: 14, fontWeight: 700, color: countColor, width: 32, textAlign: "right", flexShrink: 0 }}>{f.count}</span>
                <span style={{ ...fontMono, fontSize: 11, fontWeight: 600, color: valColor, width: 60, textAlign: "right", flexShrink: 0, padding: "0 8px" }}>{f.potencial > 0 ? compactCurrency(f.potencial) : "—"}</span>
                <div style={{ flexShrink: 0, width: 100 }}>
                  <div style={{ height: 5, background: "var(--ink-12)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: f.color, width: `${(f.count / maxFunnelCount) * 100}%` }} />
                  </div>
                </div>
                <span style={{ fontSize: 10, color: isContrato ? "var(--dash-amber)" : "var(--ink-35)", width: 14, textAlign: "right", flexShrink: 0, marginLeft: 8, fontWeight: isContrato ? 700 : 400 }}>
                  {isContrato ? "!" : "→"}
                </span>
              </div>
            );
          })}

          {/* Total row */}
          <div style={{ display: "flex", alignItems: "center", padding: "10px 18px", background: "var(--navy-06)", borderTop: "2px solid var(--dash-border)", gap: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--ink-35)", flex: 1, paddingLeft: 17 }}>Total do pipeline</span>
            <span style={{ ...fontCondensed, fontSize: 16, fontWeight: 700, color: "var(--navy)", width: 32, textAlign: "right", flexShrink: 0 }}>{totalFunnelCount}</span>
            <span style={{ ...fontCondensed, fontSize: 16, fontWeight: 700, color: "var(--dash-green)", width: 60, textAlign: "right", flexShrink: 0, padding: "0 8px" }}>{compactCurrency(totalFunnelPotencial)}</span>
            <div style={{ width: 100, flexShrink: 0 }} />
            <div style={{ width: 22 }} />
          </div>

          {/* SEGMENTO BREAKDOWN */}
          <div style={{ padding: "12px 18px 14px", borderTop: "1px solid var(--dash-border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-35)", marginBottom: 9 }}>Distribuição por segmento</div>
            {segmentoData.map((s: any) => (
              <div key={s.segmento} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "var(--ink-60)", width: 120, flexShrink: 0, fontWeight: 500 }}>{SEGMENTO_LABELS[s.segmento] ?? s.segmento}</span>
                <div style={{ flex: 1, height: 5, background: "var(--ink-12)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: SEGMENTO_BAR_COLOR[s.segmento] ?? "#6b7280", width: `${(s.count / maxSegCount) * 100}%` }} />
                </div>
                <span style={{ ...fontMono, fontSize: 10, color: "var(--navy)", fontWeight: 600, width: 24, textAlign: "right", flexShrink: 0 }}>{s.count}</span>
              </div>
            ))}
          </div>

          {/* ORIGEM DOS LEADS */}
          <div style={{ padding: "12px 18px 14px", borderTop: "1px solid var(--dash-border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-35)", marginBottom: 9 }}>Origem dos leads</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["formulario", "manual", "meta_ads"].map(key => (
                <div key={key} style={{ flex: 1, background: "var(--ink-06)", borderRadius: 8, padding: "9px 10px", textAlign: "center" }}>
                  <div style={{ ...fontCondensed, fontSize: 20, fontWeight: 700, color: key === "meta_ads" ? "var(--dash-red)" : "var(--navy)", lineHeight: 1 }}>{origemData[key] ?? 0}</div>
                  <div style={{ fontSize: 9, color: "var(--ink-35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 3 }}>{ORIGEM_LABELS[key] ?? key}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* LEADS RECENTES */}
          <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Leads recentes</div>
            </div>
            <div style={{ padding: "8px 14px" }}>
              {recentLeads.map((l: RecentLead) => {
                const initials = l.empresa.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
                const scoreLetter = getScoreLabel(l.score);
                const chipStyle = SEGMENTO_CHIP[l.segmento] ?? { bg: "#f3f4f6", color: "#6b7280" };
                const scoreChip = SCORE_CHIP[scoreLetter] ?? { bg: "#f3f4f6", color: "#9ca3af" };
                return (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--navy-10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--navy)", flexShrink: 0, ...fontCondensed }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.empresa}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "1px 5px", borderRadius: 3, fontSize: 9, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", lineHeight: 1.5, background: chipStyle.bg, color: chipStyle.color }}>{SEGMENTO_LABELS[l.segmento] ?? l.segmento}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, fontSize: 9, fontWeight: 700, ...fontCondensed, background: scoreChip.bg, color: scoreChip.color }}>{scoreLetter}</span>
                        <span style={{ fontSize: 10, color: "var(--ink-35)" }}>{timeAgo(l.criado_em)}</span>
                      </div>
                    </div>
                    {l.potencial > 0 && <span style={{ ...fontMono, fontSize: 12, fontWeight: 700, color: "var(--dash-green)", flexShrink: 0 }}>{compactCurrency(l.potencial)}</span>}
                  </div>
                );
              })}
              <a onClick={() => navigate("/pipeline")} style={{ fontSize: 11, color: "var(--navy)", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", marginTop: 8, cursor: "pointer" }}>Ver pipeline completo →</a>
            </div>
          </div>

          {/* QUALIDADE DA CARTEIRA */}
          <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Qualidade da carteira</div>
            </div>
            <div style={{ padding: "8px 14px" }}>
              {[
                { key: "A", emoji: "🔴", label: "Score A — alto potencial" },
                { key: "B", emoji: "🟠", label: "Score B — médio" },
                { key: "C", emoji: "🟡", label: "Score C — regular" },
                { key: "D", emoji: "⚪", label: "Score D — mínimo" },
              ].map(s => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-60)" }}>{s.emoji} {s.label}</span>
                  <span style={{ ...fontCondensed, fontSize: 18, fontWeight: 700, color: SCORE_VAL_COLOR[s.key] }}>{scoreDistribution[s.key] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MOTOR */}
          <div style={{ background: "var(--navy)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: 0.5, color: "#fff", marginBottom: 12 }}>Performance do motor</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
              {[
                { val: motorDiagnosticos, label: "Diagnósticos", highlight: false },
                { val: motorTesesAtivas, label: "Teses ativas", highlight: false },
                { val: 0, label: "Sem cobertura", highlight: true },
              ].map((m, i) => (
                <div key={i} style={{ padding: "0 10px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none", textAlign: "center" }}>
                  <div style={{ ...fontCondensed, fontSize: 24, fontWeight: 700, color: m.highlight ? "#fca5a5" : "#fff", lineHeight: 1 }}>{m.val}</div>
                  <div style={{ fontSize: 9, opacity: 0.5, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, color: "#fff" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STRIP */}
      <div style={{ ...anim(190), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, padding: "12px 24px", display: "flex", alignItems: "center", marginTop: 14 }}>
        {[
          { val: String(comLeads), label: "Leads no pipeline" },
          { val: String(comContratos), label: "Contratos emitidos", colorClass: "amber" },
          { val: String(comClientesAtivos), label: "Clientes ativos", colorClass: "green" },
          { val: compactCurrency(comPotencial), label: "Potencial total", colorClass: "red" },
          { val: `${comTaxaConversao}%`, label: "Taxa de conversão", colorClass: "green" },
        ].map((item, i) => {
          const colorMap: Record<string, string> = { red: "var(--dash-red)", green: "var(--dash-green)", amber: "var(--dash-amber)" };
          return (
            <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 4 ? "1px solid var(--dash-border)" : "none", padding: "0 12px" }}>
              <span style={{ ...fontCondensed, fontSize: 20, fontWeight: 700, color: item.colorClass ? colorMap[item.colorClass] : "var(--navy)", display: "block", lineHeight: 1.1 }}>{item.val}</span>
              <span style={{ fontSize: 9, color: "var(--ink-35)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 3, display: "block" }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   KPI BOX
   ═══════════════════════════════════════════════════════ */
function KpiBox({ label, value, sub, colorClass, trend, last }: { label: string; value: string; sub: string; colorClass?: string; trend?: number; last?: boolean }) {
  const colorMap: Record<string, string> = { red: "var(--dash-red)", green: "var(--dash-green)", amber: "var(--dash-amber)" };
  const valColor = colorClass ? colorMap[colorClass] : "var(--navy)";
  return (
    <div style={{ padding: "16px 20px", borderRight: last ? "none" : "1px solid var(--dash-border)", position: "relative" }}>
      {trend !== undefined && trend !== 0 && (
        <span style={{ position: "absolute", top: 14, right: 14, fontSize: 10, fontWeight: 600, ...fontMono, color: trend > 0 ? "var(--dash-green)" : "var(--dash-red)" }}>
          {trend > 0 ? "↑" : "↓"} {trend > 0 ? "+" : ""}{trend} vs sem. ant.
        </span>
      )}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: "var(--ink-35)", marginBottom: 7 }}>{label}</div>
      <div style={{ ...fontCondensed, fontSize: 26, fontWeight: 700, lineHeight: 1, color: valColor }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 2 — VISÃO OPERACIONAL (preserved)
   ═══════════════════════════════════════════════════════ */
function OperationalTab({ opClientes, opTotalAtivos, opCompensado, opHonorarios, opSaldo, opEconomia, monthlyBars, topCompensado, topSaldo, navigate }: any) {
  const anim = (delay: number): React.CSSProperties => ({
    opacity: 0, transform: "translateY(10px)",
    animation: `fu 0.45s ease ${delay}ms both`,
  });

  // Projections
  const numMonths = monthlyBars.length || 1;
  const avgMensal = opCompensado / numMonths;
  const projAnual = avgMensal * 12;
  const taxaHon = opCompensado > 0 ? opHonorarios / opCompensado : 0;
  const projHonAnual = projAnual * taxaHon;
  const prazoSaldo = avgMensal > 0 ? opSaldo / avgMensal : 0;
  const honFuturosSaldo = opSaldo * taxaHon;

  // Month period label
  const periodLabel = monthlyBars.length >= 2
    ? `${monthlyBars[0]?.label} — ${monthlyBars[monthlyBars.length - 1]?.label}`
    : monthlyBars[0]?.label ?? "—";

  // Trend (last vs prev month)
  const lastMonth = monthlyBars.length >= 1 ? monthlyBars[monthlyBars.length - 1]?.valor ?? 0 : 0;
  const prevMonth = monthlyBars.length >= 2 ? monthlyBars[monthlyBars.length - 2]?.valor ?? 0 : 0;
  const trendPct = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;

  // Insight: variation between last two months
  const insightVar = monthlyBars.length >= 2
    ? `${trendPct > 0 ? "+" : ""}${trendPct}%`
    : "—";
  const insightVarLabel = monthlyBars.length >= 2
    ? `Var. ${monthlyBars[monthlyBars.length - 2]?.label?.split("/")[0]?.toLowerCase()}→${monthlyBars[monthlyBars.length - 1]?.label?.split("/")[0]?.toLowerCase()}`
    : "Variação";

  // Saldo distribution from topSaldo (all rankings include saldo)
  const allRankings: ClientRank[] = [...topCompensado];
  // Merge topSaldo entries not in topCompensado
  topSaldo.forEach((s: ClientRank) => {
    if (!allRankings.find(r => r.id === s.id)) allRankings.push(s);
  });

  const saldoAbove1M = allRankings.filter(r => r.saldo >= 1000000);
  const saldo500kTo1M = allRankings.filter(r => r.saldo >= 500000 && r.saldo < 1000000);
  const saldoBelow500k = allRankings.filter(r => r.saldo > 0 && r.saldo < 500000);
  const saldoZero = allRankings.filter(r => r.saldo <= 0);

  const distBands = [
    { label: "Acima de R$1M", count: saldoAbove1M.length, total: saldoAbove1M.reduce((s, r) => s + r.saldo, 0), color: "var(--dash-red)", fontWeight: 700 },
    { label: "R$500k – R$1M", count: saldo500kTo1M.length, total: saldo500kTo1M.reduce((s, r) => s + r.saldo, 0), color: "var(--dash-amber)", fontWeight: 500 },
    { label: "Até R$500k", count: saldoBelow500k.length, total: saldoBelow500k.reduce((s, r) => s + r.saldo, 0), color: "var(--navy)", fontWeight: 500 },
    { label: "Saldo zerado", count: saldoZero.length, total: 0, color: "var(--ink-35)", fontWeight: 500 },
  ];
  const maxDistCount = Math.max(...distBands.map(d => d.count), 1);

  // Urgency: top 5 clients with saldo > 1M
  const urgencyClients = [...allRankings].filter(r => r.saldo >= 1000000).sort((a, b) => b.saldo - a.saldo).slice(0, 5);

  // Full ranking sorted by compensado
  const fullRanking = [...allRankings].sort((a, b) => b.compensado - a.compensado).slice(0, 8);

  // Projected bar for next month
  const nextMonthLabel = (() => {
    if (!monthlyBars.length) return "PROJ";
    const last = monthlyBars[monthlyBars.length - 1].month;
    const [y, m] = last.split("-").map(Number);
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    const mk = String(nm).padStart(2, "0");
    return `${(MONTH_ABBR[mk] ?? mk).toUpperCase()}/${String(ny).slice(2)} ≈`;
  })();

  return (
    <>
      {/* KPI STRIP */}
      <div style={{ ...anim(40), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(5,1fr)", marginBottom: 14, overflow: "hidden" }}>
        <KpiBox label="Clientes compensando" value={String(opClientes)} sub={`de ${opTotalAtivos} ativos`} />
        <KpiBox label="Total compensado" value={compactCurrency(opCompensado)} sub={periodLabel} colorClass="green" trend={trendPct !== 0 ? trendPct : undefined} />
        <KpiBox label="Honorários gerados" value={compactCurrency(opHonorarios)} sub={`taxa média ${(taxaHon * 100).toFixed(1)}%`} />
        <KpiBox label="Economia líquida clientes" value={compactCurrency(opEconomia)} sub="líquido de honorários" colorClass="green" />
        <KpiBox label="Saldo de créditos" value={compactCurrency(opSaldo)} sub="disponível para compensar" colorClass="red" last />
      </div>

      {/* PROJECTION BAND */}
      <div style={{ ...anim(90), background: "var(--navy)", borderRadius: 10, padding: "14px 24px", display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr 1px 1fr", gap: 0, marginBottom: 14, alignItems: "center" }}>
        {[
          { label: "Projeção anual", val: compactCurrency(projAnual), sub: "compensado se ritmo mantido", colorClass: "accent" },
          null,
          { label: "Honorários projetados / ano", val: compactCurrency(projHonAnual), sub: "receita estimada Focus FinTax", colorClass: "green-light" },
          null,
          { label: "Prazo do saldo atual", val: `${prazoSaldo.toFixed(1)} meses`, sub: "ao ritmo médio atual", colorClass: "amber-light" },
          null,
          { label: "Honorários futuros no saldo", val: compactCurrency(honFuturosSaldo), sub: `sobre os ${compactCurrency(opSaldo)} identificados`, colorClass: "green-light" },
          null,
          { label: "Média mensal realizada", val: compactCurrency(avgMensal), sub: periodLabel, colorClass: "white" },
        ].map((item, i) => {
          if (!item) return <div key={i} style={{ width: 1, background: "rgba(255,255,255,0.12)", alignSelf: "stretch" }} />;
          const colorMap: Record<string, string> = { accent: "#fca5a5", "green-light": "#6ee7b7", "amber-light": "#fcd34d", white: "#fff" };
          const isFirst = i === 0;
          const isLast = i === 8;
          return (
            <div key={i} style={{ padding: "0 20px", textAlign: isFirst ? "left" : isLast ? "right" : "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 5 }}>{item.label}</div>
              <div style={{ ...fontCondensed, fontSize: 22, fontWeight: 700, color: colorMap[item.colorClass] ?? "#fff", lineHeight: 1 }}>{item.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{item.sub}</div>
            </div>
          );
        })}
      </div>

      {/* CHART + DISTRIBUTION ROW */}
      <div style={{ ...anim(140), display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* LEFT — CHART */}
        <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Evolução mensal — compensações realizadas</div>
              <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 2 }}>receita da Focus FinTax vs economia bruta dos clientes</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", background: "var(--navy-10)", borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 600, color: "var(--navy)", ...fontMono }}>{periodLabel}</span>
          </div>

          {monthlyBars.length === 0 ? (
            <div style={{ padding: "40px 18px", textAlign: "center", fontSize: 12, color: "var(--ink-35)" }}>Nenhuma compensação registrada.</div>
          ) : (
            <>
              <div style={{ padding: "10px 18px 0", height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...monthlyBars, { month: "proj", label: nextMonthLabel, valor: avgMensal, honorarios: 0, isProjection: true }]} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-12)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--ink-35)", fontFamily: "'DM Mono', monospace", fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--ink-35)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => compactCurrency(v)} width={60} />
                    <RechartsTooltip formatter={(v: number) => fullCurrency(v)} />
                    <Bar dataKey="valor" name="Compensado" fill="var(--navy)" radius={[3, 3, 0, 0]} maxBarSize={36} label={{ position: "top", fontSize: 9, fill: "var(--ink-60)", fontFamily: "'DM Mono', monospace", formatter: (v: number) => compactCurrency(v) }} />
                    <Bar dataKey="honorarios" name="Honorários" fill="var(--dash-red)" radius={[3, 3, 0, 0]} maxBarSize={28} opacity={0.65} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div style={{ display: "flex", gap: 14, padding: "8px 18px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--ink-60)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--navy)" }} />Compensado
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--ink-60)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--dash-red)", opacity: 0.65 }} />Honorários Focus
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--ink-60)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, border: "2px dashed var(--navy)", background: "transparent" }} />Projeção
                </div>
              </div>
              {/* Insight strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--dash-border)" }}>
                <div style={{ padding: "10px 14px", borderRight: "1px solid var(--dash-border)", textAlign: "center" }}>
                  <div style={{ ...fontCondensed, fontSize: 18, fontWeight: 700, color: trendPct < 0 ? "var(--dash-red)" : trendPct > 0 ? "var(--dash-green)" : "var(--navy)", lineHeight: 1 }}>{insightVar}</div>
                  <div style={{ fontSize: 9, color: "var(--ink-35)", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>{insightVarLabel}</div>
                </div>
                <div style={{ padding: "10px 14px", borderRight: "1px solid var(--dash-border)", textAlign: "center" }}>
                  <div style={{ ...fontCondensed, fontSize: 18, fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{(taxaHon * 100).toFixed(1)}%</div>
                  <div style={{ fontSize: 9, color: "var(--ink-35)", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>Taxa hon. média</div>
                </div>
                <div style={{ padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ ...fontCondensed, fontSize: 18, fontWeight: 700, color: "var(--dash-green)", lineHeight: 1 }}>{compactCurrency(avgMensal)}</div>
                  <div style={{ fontSize: 9, color: "var(--ink-35)", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>Média mensal</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT — SALDO DISTRIBUTION */}
        <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Distribuição do saldo</div>
            <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 2 }}>{opClientes} clientes · por faixa de saldo restante</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px" }}>
            {distBands.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: d.fontWeight, color: d.color, width: 110, flexShrink: 0 }}>{d.label}</span>
                <div style={{ flex: 1, height: 6, background: "var(--ink-12)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: d.color, width: `${(d.count / maxDistCount) * 100}%` }} />
                </div>
                <span style={{ ...fontMono, fontSize: 11, fontWeight: 700, color: d.color, width: 20, textAlign: "right", flexShrink: 0 }}>{d.count}</span>
                <span style={{ ...fontMono, fontSize: 10, color: d.total > 0 ? d.color : "var(--ink-35)", width: 52, textAlign: "right", flexShrink: 0 }}>{d.total > 0 ? compactCurrency(d.total) : "—"}</span>
              </div>
            ))}
          </div>

          {/* Strategic callout */}
          {prazoSaldo > 0 && prazoSaldo < 9 && (
            <div style={{ margin: "0 14px 14px", background: "rgba(200,0,30,0.04)", border: "1px solid rgba(200,0,30,0.15)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--dash-red)", marginBottom: 4 }}>⚠ Atenção estratégica</div>
              <div style={{ fontSize: 11, color: "var(--ink-60)", lineHeight: 1.5 }}>
                Ao ritmo atual, o saldo identificado se esgota em <strong style={{ color: "var(--dash-red)" }}>{prazoSaldo.toFixed(1)} meses</strong>. Para manter a receita, é preciso onboardar novos clientes ou levantar novas teses para a carteira atual.
              </div>
            </div>
          )}

          {/* Honorários futuros */}
          <div style={{ borderTop: "1px solid var(--dash-border)", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--dash-green-10)", marginTop: "auto" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--dash-green)" }}>Honorários futuros estimados</div>
              <div style={{ fontSize: 10, color: "var(--ink-60)", marginTop: 2 }}>sobre o saldo restante · taxa {(taxaHon * 100).toFixed(1)}%</div>
            </div>
            <div style={{ ...fontCondensed, fontSize: 22, fontWeight: 700, color: "var(--dash-green)" }}>{compactCurrency(honFuturosSaldo)}</div>
          </div>
        </div>
      </div>

      {/* URGENCY CARD */}
      {urgencyClients.length > 0 && (
        <div style={{ ...anim(190), background: "rgba(200,0,30,0.04)", border: "1px solid rgba(200,0,30,0.18)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ padding: "10px 16px", background: "rgba(200,0,30,0.08)", borderBottom: "1px solid rgba(200,0,30,0.15)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12 }}>🎯</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--dash-red)" }}>
              Prioridade máxima — {urgencyClients.length} cliente{urgencyClients.length > 1 ? "s" : ""} com saldo acima de R$1M
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(urgencyClients.length, 5)},1fr)`, gap: 0 }}>
            {urgencyClients.map((c: ClientRank, i: number) => (
              <div key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} style={{ padding: "10px 14px", borderRight: i < urgencyClients.length - 1 ? "1px solid rgba(200,0,30,0.10)" : "none", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{c.empresa}</div>
                <div style={{ ...fontCondensed, fontSize: 17, fontWeight: 700, color: "var(--dash-red)", lineHeight: 1 }}>{compactCurrency(c.saldo)}</div>
                <div style={{ fontSize: 10, color: "var(--ink-35)", marginTop: 2 }}>hon. potencial {compactCurrency(c.saldo * taxaHon)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RANKING TABLE */}
      <div style={{ ...anim(240), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Ranking de compensações</div>
            <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 2 }}>economia bruta acumulada · {numMonths} meses · % do crédito identificado utilizado</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["#", "Empresa", "Total compensado", "Honorários", "Economia líquida", "% utilizado", "Progresso", "Saldo restante"].map((h, i) => (
                <th key={i} style={{ padding: "7px 12px", textAlign: i === 7 ? "right" : "left", fontSize: 9, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: "var(--ink-35)", borderBottom: "1px solid var(--dash-border)", background: "var(--ink-06)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fullRanking.map((c: ClientRank, i: number) => {
              const pctUsed = c.identificado > 0 ? Math.round((c.compensado / c.identificado) * 100) : 0;
              const econLiquida = c.compensado - c.honorarios;
              return (
                <tr key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} style={{ cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ink-06)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                  <td style={{ padding: "8px 12px", fontSize: 10, color: "var(--ink-35)", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono }}>{i + 1}</td>
                  <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink)", borderBottom: "1px solid rgba(0,0,0,0.04)", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.empresa}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono, fontWeight: 700, color: "var(--dash-green)", fontSize: 12 }}>{fullCurrency(c.compensado)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono, fontWeight: 400, color: "var(--ink-35)", fontSize: 10 }}>{fullCurrency(c.honorarios)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono, fontWeight: 600, color: "var(--navy)", fontSize: 11 }}>{fullCurrency(econLiquida)}</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", ...fontMono, fontWeight: 400, color: "var(--ink-35)", fontSize: 10 }}>{pctUsed}%</td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <span style={{ width: 50, height: 4, background: "var(--ink-12)", borderRadius: 2, overflow: "hidden", display: "inline-block" }}>
                      <span style={{ height: "100%", borderRadius: 2, background: "var(--dash-green)", display: "block", width: `${Math.min(pctUsed, 100)}%` }} />
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)", textAlign: "right", ...fontMono, fontWeight: 700, color: c.saldo > 500000 ? "var(--dash-red)" : "var(--ink-35)", fontSize: 12 }}>
                    {c.saldo > 0 ? compactCurrency(c.saldo) : fullCurrency(0)}
                  </td>
                </tr>
              );
            })}
            {fullRanking.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "var(--ink-35)" }}>Nenhuma compensação registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* BOTTOM STRIP */}
      <div style={{ ...anim(290), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, padding: "13px 24px", display: "flex", alignItems: "center" }}>
        {[
          { val: String(opClientes), label: "Clientes compensando" },
          { val: compactCurrency(opCompensado), label: `Compensado (${numMonths} meses)`, colorClass: "green" },
          { val: compactCurrency(opHonorarios), label: "Honorários gerados" },
          { val: compactCurrency(opEconomia), label: "Economia líquida", colorClass: "green" },
          { val: compactCurrency(opSaldo), label: "Saldo disponível", colorClass: "red" },
          { val: `${prazoSaldo.toFixed(1)} meses`, label: "Prazo do saldo atual", colorClass: "amber" },
          { val: compactCurrency(projHonAnual), label: "Projeção hon. anual", colorClass: "green" },
        ].map((item, i) => {
          const colorMap: Record<string, string> = { red: "var(--dash-red)", green: "var(--dash-green)", amber: "var(--dash-amber)" };
          return (
            <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 6 ? "1px solid var(--dash-border)" : "none", padding: "0 14px" }}>
              <span style={{ ...fontCondensed, fontSize: 20, fontWeight: 700, color: item.colorClass ? colorMap[item.colorClass] : "var(--navy)", display: "block", lineHeight: 1.1 }}>{item.val}</span>
              <span style={{ fontSize: 9, color: "var(--ink-35)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 3, display: "block" }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
