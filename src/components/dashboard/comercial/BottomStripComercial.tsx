import { anim, fontCondensed, compactCurrency } from "../dashboard-utils";

interface Props {
  comLeads: number;
  comContratos: number;
  comClientesAtivos: number;
  comPotencial: number;
  comTaxaConversao: number;
}

export function BottomStripComercial({ comLeads, comContratos, comClientesAtivos, comPotencial, comTaxaConversao }: Props) {
  const items = [
    { val: String(comLeads), label: "Leads no pipeline" },
    { val: String(comContratos), label: "Contratos emitidos", colorClass: "amber" },
    { val: String(comClientesAtivos), label: "Clientes ativos", colorClass: "green" },
    { val: compactCurrency(comPotencial), label: "Potencial total", colorClass: "red" },
    { val: `${comTaxaConversao}%`, label: "Taxa de conversão", colorClass: "green" },
  ];
  const colorMap: Record<string, string> = { red: "var(--dash-red)", green: "var(--dash-green)", amber: "var(--dash-amber)" };

  return (
    <div style={{ ...anim(190), background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, padding: "12px 24px", display: "flex", alignItems: "center", marginTop: 14 }}>
      {items.map((item, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 4 ? "1px solid var(--dash-border)" : "none", padding: "0 12px" }}>
          <span style={{ ...fontCondensed, fontSize: 20, fontWeight: 700, color: item.colorClass ? colorMap[item.colorClass] : "var(--navy)", display: "block", lineHeight: 1.1 }}>{item.val}</span>
          <span style={{ fontSize: 9, color: "var(--ink-35)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 3, display: "block" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
