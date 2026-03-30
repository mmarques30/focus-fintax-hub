import { anim, fontCondensed, compactCurrency } from "../dashboard-utils";

interface Props {
  opClientes: number;
  opCompensado: number;
  opHonorarios: number;
  opEconomia: number;
  opSaldo: number;
  numMonths: number;
  prazoSaldo: number;
  projHonAnual: number;
}

export function BottomStripOperacional({ opClientes, opCompensado, opHonorarios, opEconomia, opSaldo, numMonths, prazoSaldo, projHonAnual }: Props) {
  const items = [
    { val: String(opClientes), label: "Clientes compensando" },
    { val: compactCurrency(opCompensado), label: `Compensado (${numMonths} meses)`, colorClass: "green" },
    { val: compactCurrency(opHonorarios), label: "Honorários gerados" },
    { val: compactCurrency(opEconomia), label: "Economia líquida", colorClass: "green" },
    { val: compactCurrency(opSaldo), label: "Saldo disponível", colorClass: "red" },
    { val: `${prazoSaldo.toFixed(1)} meses`, label: "Prazo do saldo atual", colorClass: "amber" },
    { val: compactCurrency(projHonAnual), label: "Projeção hon. anual", colorClass: "green" },
  ];
  const colorMap: Record<string, string> = { red: "var(--dash-red)", green: "var(--dash-green)", amber: "var(--dash-amber)" };

  return (
    <div style={{ ...anim(290), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, padding: "13px 24px", display: "flex", alignItems: "center" }}>
      {items.map((item, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < items.length - 1 ? "1px solid var(--dash-border)" : "none", padding: "0 8px" }}>
          <span style={{ ...fontCondensed, fontSize: 17, fontWeight: 700, color: item.colorClass ? colorMap[item.colorClass] : "var(--navy)", display: "block", lineHeight: 1.1 }}>{item.val}</span>
          <span style={{ fontSize: 8, color: "var(--ink-35)", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginTop: 2, display: "block" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
