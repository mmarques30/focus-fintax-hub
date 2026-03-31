import { KpiBox, compactCurrency } from "../dashboard-utils";
import { useCountUp } from "@/hooks/useCountUp";

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
  const animCompensado = useCountUp(opCompensado);
  const animHonorarios = useCountUp(opHonorarios);
  const animEconomia = useCountUp(opEconomia);
  const animSaldo = useCountUp(opSaldo);
  return (
    <div className="animate-slide-up delay-1 bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] grid grid-cols-5 mb-3.5 overflow-hidden">
      <KpiBox label="Clientes compensando" value={String(opClientes)} sub={`de ${opTotalAtivos} ativos`} rawValue={opClientes} />
      <KpiBox label="Total compensado" value={compactCurrency(animCompensado)} sub={periodLabel} colorClass="green" trend={trendPct !== 0 ? trendPct : undefined} />
      <KpiBox label="Honorários gerados" value={compactCurrency(animHonorarios)} sub={`taxa média ${(taxaHon * 100).toFixed(1)}%`} />
      <KpiBox label="Economia líquida clientes" value={compactCurrency(animEconomia)} sub="líquido de honorários" colorClass="green" />
      <KpiBox label="Saldo de créditos" value={compactCurrency(animSaldo)} sub="disponível para compensar" colorClass="red" last />
    </div>
  );
}
