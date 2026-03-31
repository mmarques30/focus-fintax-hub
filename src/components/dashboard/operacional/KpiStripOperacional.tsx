import { compactCurrency } from "../dashboard-utils";
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
  const animClientes = useCountUp(opClientes);
  const animCompensado = useCountUp(opCompensado);
  const animHonorarios = useCountUp(opHonorarios);
  const animEconomia = useCountUp(opEconomia);
  const animSaldo = useCountUp(opSaldo);

  const kpis = [
    { label: "Clientes compensando", value: String(animClientes), sub: `de ${opTotalAtivos} ativos`, colorClass: "text-navy" },
    { label: "Total compensado", value: compactCurrency(animCompensado), sub: periodLabel, colorClass: "text-dash-green", trend: trendPct !== 0 ? trendPct : undefined },
    { label: "Honorários gerados", value: compactCurrency(animHonorarios), sub: `taxa média ${(taxaHon * 100).toFixed(1)}%`, colorClass: "text-navy" },
    { label: "Economia líquida clientes", value: compactCurrency(animEconomia), sub: "líquido de honorários", colorClass: "text-dash-green" },
    { label: "Saldo de créditos", value: compactCurrency(animSaldo), sub: "disponível para compensar", colorClass: "text-dash-red" },
  ];

  return (
    <div className="animate-slide-up delay-1 grid grid-cols-5 gap-3 mb-4">
      {kpis.map((kpi, i) => (
        <div key={i} className="card-base p-4 relative">
          {kpi.trend !== undefined && kpi.trend !== 0 && (
            <span className={`absolute top-3 right-3 text-[10px] font-semibold font-mono-dm tabular-nums ${kpi.trend > 0 ? "text-dash-green" : "text-dash-red"}`}>
              {kpi.trend > 0 ? "↑" : "↓"} {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
            </span>
          )}
          <p className="text-[9px] font-bold uppercase tracking-[1.4px] text-ink-35 mb-2">{kpi.label}</p>
          <p className={`font-display text-[28px] font-bold leading-none ${kpi.colorClass}`}>{kpi.value}</p>
          <p className="text-[11px] text-ink-35 mt-1">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
}
