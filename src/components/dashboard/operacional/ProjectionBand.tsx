import { anim, fontCondensed, compactCurrency } from "../dashboard-utils";

interface Props {
  projAnual: number;
  projHonAnual: number;
  prazoSaldo: number;
  honFuturosSaldo: number;
  avgMensal: number;
  opSaldo: number;
  periodLabel: string;
}

export function ProjectionBand({ projAnual, projHonAnual, prazoSaldo, honFuturosSaldo, avgMensal, opSaldo, periodLabel }: Props) {
  const items = [
    { label: "Projeção anual", val: compactCurrency(projAnual), sub: "compensado se ritmo mantido", colorClass: "accent" },
    null,
    { label: "Honorários projetados / ano", val: compactCurrency(projHonAnual), sub: "receita estimada Focus FinTax", colorClass: "green-light" },
    null,
    { label: "Prazo do saldo atual", val: `${prazoSaldo.toFixed(1)} meses`, sub: "ao ritmo médio atual", colorClass: "amber-light" },
    null,
    { label: "Honorários futuros no saldo", val: compactCurrency(honFuturosSaldo), sub: `sobre os ${compactCurrency(opSaldo)} identificados`, colorClass: "green-light" },
    null,
    { label: "Média mensal realizada", val: compactCurrency(avgMensal), sub: periodLabel, colorClass: "white" },
  ];

  const colorMap: Record<string, string> = { accent: "#fca5a5", "green-light": "#6ee7b7", "amber-light": "#fcd34d", white: "#fff" };

  return (
    <div style={{ ...anim(90), background: "var(--navy)", borderRadius: 10, padding: "14px 24px", display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr 1px 1fr", gap: 0, marginBottom: 14, alignItems: "center" }}>
      {items.map((item, i) => {
        if (!item) return <div key={i} style={{ width: 1, background: "rgba(255,255,255,0.12)", alignSelf: "stretch" }} />;
        const isFirst = i === 0;
        const isLast = i === 8;
        return (
          <div key={i} style={{ padding: "0 20px", textAlign: isFirst ? "left" : isLast ? "right" : "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 5 }}>{item.label}</div>
            <div style={{ ...fontCondensed, fontSize: 22, fontWeight: 700, color: colorMap[item.colorClass] ?? "#fff", lineHeight: 1 }}>{item.val}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{item.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
