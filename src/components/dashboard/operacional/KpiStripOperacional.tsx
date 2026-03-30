import { animDelay, KpiBox, compactCurrency } from "../dashboard-utils";

interface Props {
  opClientes: number;
  opTotalAtivos: number;
  opCompensado: number;
  opHonorarios: number;
  opEconomia: number;
  opSaldo: number;
  periodLabel: string;
  trendPct: number;
  taxaHon: number;
}

export function KpiStripOperacional({ opClientes, opTotalAtivos, opCompensado, opHonorarios, opEconomia, opSaldo, periodLabel, trendPct, taxaHon }: Props) {
  return (
    <div className="animate-dash-in bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] grid grid-cols-5 mb-3.5 overflow-hidden" style={animDelay(40)}>
      <KpiBox label="Clientes compensando" value={String(opClientes)} sub={`de ${opTotalAtivos} ativos`} />
      <KpiBox label="Total compensado" value={compactCurrency(opCompensado)} sub={periodLabel} colorClass="green" trend={trendPct !== 0 ? trendPct : undefined} />
      <KpiBox label="Honorários gerados" value={compactCurrency(opHonorarios)} sub={`taxa média ${(taxaHon * 100).toFixed(1)}%`} />
      <KpiBox label="Economia líquida clientes" value={compactCurrency(opEconomia)} sub="líquido de honorários" colorClass="green" />
      <KpiBox label="Saldo de créditos" value={compactCurrency(opSaldo)} sub="disponível para compensar" colorClass="red" last />
    </div>
  );
}
