import { anim, KpiBox, compactCurrency } from "../dashboard-utils";

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
    <div style={{ ...anim(40), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(5,1fr)", marginBottom: 14, overflow: "hidden" }}>
      <KpiBox label="Clientes compensando" value={String(opClientes)} sub={`de ${opTotalAtivos} ativos`} />
      <KpiBox label="Total compensado" value={compactCurrency(opCompensado)} sub={periodLabel} colorClass="green" trend={trendPct !== 0 ? trendPct : undefined} />
      <KpiBox label="Honorários gerados" value={compactCurrency(opHonorarios)} sub={`taxa média ${(taxaHon * 100).toFixed(1)}%`} />
      <KpiBox label="Economia líquida clientes" value={compactCurrency(opEconomia)} sub="líquido de honorários" colorClass="green" />
      <KpiBox label="Saldo de créditos" value={compactCurrency(opSaldo)} sub="disponível para compensar" colorClass="red" last />
    </div>
  );
}
