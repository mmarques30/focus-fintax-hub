import { compactCurrency } from "../dashboard-utils";
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
  const animLeads = useCountUp(comLeads);
  const animNew = useCountUp(comNewWeek);
  const animPotencial = useCountUp(comPotencial);
  const animContratos = useCountUp(comContratos);
  const animConversao = useCountUp(comTaxaConversao);

  const kpis = [
    { label: "Leads no pipeline", value: String(animLeads), sub: "excluindo perdidos", colorClass: "text-navy" },
    { label: "Novos esta semana", value: String(animNew), sub: "leads captados (7d)", colorClass: "text-navy", trend: trendDiff },
    { label: "Potencial total", value: compactCurrency(animPotencial), sub: "soma do potencial máx.", colorClass: "text-dash-red" },
    { label: "Contratos emitidos", value: String(animContratos), sub: "aguardando assinatura", colorClass: "text-dash-amber" },
    { label: "Taxa de conversão", value: `${animConversao}%`, sub: "leads → clientes ativos", colorClass: "text-dash-green" },
  ];

  return (
    <div className="animate-slide-up delay-1 grid grid-cols-5 gap-3 mb-4">
      {kpis.map((kpi, i) => (
        <div key={i} className="card-base p-4 relative">
          {kpi.trend !== undefined && kpi.trend !== 0 && (
            <span className={`absolute top-3 right-3 text-[10px] font-semibold font-mono-dm tabular-nums ${kpi.trend > 0 ? "text-dash-green" : "text-dash-red"}`}>
              {kpi.trend > 0 ? "↑" : "↓"} {kpi.trend > 0 ? "+" : ""}{kpi.trend} vs sem. ant.
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
