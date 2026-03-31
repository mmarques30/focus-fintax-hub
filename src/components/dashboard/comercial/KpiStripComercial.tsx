import { KpiBox, compactCurrency } from "../dashboard-utils";
import { useCountUp } from "@/hooks/useCountUp";

interface Props {
  comLeads: number;
  comNewWeek: number;
  trendDiff: number;
  comPotencial: number;
  comContratos: number;
  comTaxaConversao: number;
}

export function KpiStripComercial({ comLeads, comNewWeek, trendDiff, comPotencial, comContratos, comTaxaConversao }: Props) {
  const animPotencial = useCountUp(comPotencial);
  const animConversao = useCountUp(comTaxaConversao);
  return (
    <div className="animate-slide-up delay-1 bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] grid grid-cols-5 mb-3.5 overflow-hidden">
      <KpiBox label="Leads no pipeline" value={String(comLeads)} sub="excluindo perdidos" rawValue={comLeads} />
      <KpiBox label="Novos esta semana" value={String(comNewWeek)} sub="leads captados (7d)" trend={trendDiff} rawValue={comNewWeek} />
      <KpiBox label="Potencial total" value={compactCurrency(animPotencial)} sub="soma do potencial máx." colorClass="red" />
      <KpiBox label="Contratos emitidos" value={String(comContratos)} sub="aguardando assinatura" colorClass="amber" rawValue={comContratos} />
      <KpiBox label="Taxa de conversão" value={`${animConversao}%`} sub="leads → clientes ativos" colorClass="green" last />
    </div>
  );
}
