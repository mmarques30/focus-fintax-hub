import { KpiBox, compactCurrency, animDelay } from "../dashboard-utils";

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
    <div className="animate-dash-in bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] grid grid-cols-5 mb-3.5 overflow-hidden" style={animDelay(40)}>
      <KpiBox label="Leads no pipeline" value={String(comLeads)} sub="excluindo perdidos" />
      <KpiBox label="Novos esta semana" value={String(comNewWeek)} sub="leads captados (7d)" trend={trendDiff} />
      <KpiBox label="Potencial total" value={compactCurrency(comPotencial)} sub="soma do potencial máx." colorClass="red" />
      <KpiBox label="Contratos emitidos" value={String(comContratos)} sub="aguardando assinatura" colorClass="amber" />
      <KpiBox label="Taxa de conversão" value={`${comTaxaConversao}%`} sub="leads → clientes ativos" colorClass="green" last />
    </div>
  );
}
