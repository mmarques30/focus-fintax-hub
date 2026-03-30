import { anim, KpiBox, compactCurrency } from "../dashboard-utils";

interface Props {
  comLeads: number;
  comNewWeek: number;
  trendDiff: number;
  comPotencial: number;
  comContratos: number;
  comTaxaConversao: number;
}

export function KpiStripComercial({ comLeads, comNewWeek, trendDiff, comPotencial, comContratos, comTaxaConversao }: Props) {
  return (
    <div style={{ ...anim(40), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(5,1fr)", marginBottom: 14, overflow: "hidden" }}>
      <KpiBox label="Leads no pipeline" value={String(comLeads)} sub="excluindo perdidos" />
      <KpiBox label="Novos esta semana" value={String(comNewWeek)} sub="leads captados (7d)" trend={trendDiff} />
      <KpiBox label="Potencial total" value={compactCurrency(comPotencial)} sub="soma do potencial máx." colorClass="red" />
      <KpiBox label="Contratos emitidos" value={String(comContratos)} sub="aguardando assinatura" colorClass="amber" />
      <KpiBox label="Taxa de conversão" value={`${comTaxaConversao}%`} sub="leads → clientes ativos" colorClass="green" last />
    </div>
  );
}
