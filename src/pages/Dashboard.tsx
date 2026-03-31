import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getScoreLabel, daysSince } from "@/lib/pipeline-constants";
import { FUNNEL_STAGES_COM, type FunnelRow, type RecentLead, type MonthBar, type ClientRank, MONTH_ABBR } from "@/components/dashboard/dashboard-utils";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CommercialView } from "@/components/dashboard/comercial/CommercialView";
import { OperationalView } from "@/components/dashboard/operacional/OperationalView";

export default function Dashboard() {
  const { profile, userRole, permissions } = useAuth();
  const navigate = useNavigate();
  const role = userRole ?? "comercial";

  const canTab = (tabKey: string) => {
    const perm = permissions.find((p) => p.screen_key === tabKey);
    if (!perm) return true;
    return perm.can_access;
  };
  const canComercial = canTab("dashboard.comercial");
  const canOperacional = canTab("dashboard.operacional");

  const resolveDefault = () => {
    if (canComercial && canOperacional) {
      if (role === "gestor_tributario") return "operacional";
      return localStorage.getItem("dash_tab") ?? "comercial";
    }
    if (canComercial) return "comercial";
    if (canOperacional) return "operacional";
    return "comercial";
  };
  const [activeTab, setActiveTab] = useState(resolveDefault);
  const switchTab = (t: string) => { setActiveTab(t); localStorage.setItem("dash_tab", t); };

  const [kpiLoading, setKpiLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

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
    setKpiLoading(false);
    setComLeads(pipelineRes.count ?? 0);
    setComNewWeek(newWeekRes.count ?? 0);
    setComNewPrevWeek(prevWeekRes.count ?? 0);
    setComContratos(contratosRes.count ?? 0);
    const clientesAtivos = clientesAtivosRes.count ?? 0;
    setComClientesAtivos(clientesAtivos);

    const totalNonLost = pipelineRes.count ?? 0;
    setComTaxaConversao(totalNonLost > 0 ? Math.round((clientesAtivos / totalNonLost) * 100) : 0);

    const { data: allLeads } = await supabase.from("leads").select("id, status_funil, segmento, origem, score_lead").not("status_funil", "in", "(perdido,nao_vai_fazer)");
    const activeLeads = allLeads ?? [];
    const activeIds = activeLeads.map(l => l.id);

    let potTotal = 0;
    let potByLead: Record<string, number> = {};
    if (activeIds.length) {
      const { data: rels } = await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", activeIds);
      (rels ?? []).forEach(r => { potByLead[r.lead_id] = Math.max(potByLead[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });
      potTotal = Object.values(potByLead).reduce((s, v) => s + v, 0);
    }
    setComPotencial(potTotal);

    const fCounts: Record<string, { count: number; ids: string[] }> = {};
    FUNNEL_STAGES_COM.forEach(s => { fCounts[s.value] = { count: 0, ids: [] }; });
    activeLeads.forEach(l => {
      if (fCounts[l.status_funil]) {
        fCounts[l.status_funil].count++;
        fCounts[l.status_funil].ids.push(l.id);
      }
    });
    fCounts["cliente_ativo"] = { count: clientesAtivos, ids: [] };

    setFunnelData(FUNNEL_STAGES_COM.map(s => ({
      stage: s.value, label: s.label, color: s.color,
      count: fCounts[s.value]?.count ?? 0,
      potencial: (fCounts[s.value]?.ids ?? []).reduce((sum, id) => sum + (potByLead[id] ?? 0), 0),
    })));

    const segMap: Record<string, number> = {};
    activeLeads.forEach(l => { segMap[l.segmento] = (segMap[l.segmento] ?? 0) + 1; });
    setSegmentoData(Object.entries(segMap).sort((a, b) => b[1] - a[1]).map(([segmento, count]) => ({ segmento, count })));

    const origMap: Record<string, number> = {};
    activeLeads.forEach(l => { origMap[l.origem] = (origMap[l.origem] ?? 0) + 1; });
    setOrigemData(origMap);

    const scoreDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    activeLeads.forEach(l => {
      const letter = getScoreLabel(l.score_lead);
      scoreDist[letter] = (scoreDist[letter] ?? 0) + 1;
    });
    setScoreDistribution(scoreDist);

    const { data: recent } = await supabase.from("leads").select("empresa, segmento, criado_em, id, score_lead")
      .not("status_funil", "in", "(perdido,nao_vai_fazer)").order("criado_em", { ascending: false }).limit(4);
    const recentIds = (recent ?? []).map(r => r.id);
    let rPotMap: Record<string, number> = {};
    if (recentIds.length) {
      const { data: rRels } = await supabase.from("relatorios_leads").select("lead_id, estimativa_total_maxima").in("lead_id", recentIds);
      (rRels ?? []).forEach(r => { rPotMap[r.lead_id] = Math.max(rPotMap[r.lead_id] ?? 0, Number(r.estimativa_total_maxima)); });
    }
    setRecentLeads((recent ?? []).map(r => ({ id: r.id, empresa: r.empresa, segmento: r.segmento, criado_em: r.criado_em, potencial: rPotMap[r.id] ?? 0, score: r.score_lead })));

    const { data: stalled } = await supabase.from("leads").select("empresa, status_funil_atualizado_em, id")
      .eq("status_funil", "contrato_emitido").lt("status_funil_atualizado_em", d3);
    setStalledLeads((stalled ?? []).map(l => ({ empresa: l.empresa || "Sem empresa", days: daysSince(l.status_funil_atualizado_em!), id: l.id })).sort((a, b) => b.days - a.days));

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

    setChartLoading(false);
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
  const maxFunnelCount = Math.max(...funnelData.map(f => f.count), 1);
  const totalFunnelCount = funnelData.reduce((s, f) => s + f.count, 0);
  const totalFunnelPotencial = funnelData.reduce((s, f) => s + f.potencial, 0);
  const maxSegCount = Math.max(...segmentoData.map(s => s.count), 1);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f2f3f7] font-sans antialiased">
      <DashboardHeader
        profileName={profile?.full_name?.split(" ")[0] || "usuário"}
        role={role}
        canComercial={canComercial}
        canOperacional={canOperacional}
        activeTab={activeTab}
        switchTab={switchTab}
      />

      <div className="px-7 pt-[18px] pb-9 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 flex-1" />)}
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : activeTab === "comercial" ? (
          <CommercialView
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
          <OperationalView
            opClientes={opClientes} opTotalAtivos={opTotalAtivos} opCompensado={opCompensado} opHonorarios={opHonorarios}
            opSaldo={opSaldo} opEconomia={opEconomia} monthlyBars={monthlyBars}
            topCompensado={topCompensado} topSaldo={topSaldo} navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}
