import { fontCondensed, SCORE_VAL_COLOR } from "../dashboard-utils";

interface Props {
  scoreDistribution: Record<string, number>;
}

export function QualidadeCarteira({ scoreDistribution }: Props) {
  return (
    <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Qualidade da carteira</div>
      </div>
      <div style={{ padding: "8px 14px" }}>
        {[
          { key: "A", emoji: "🔴", label: "Score A — alto potencial" },
          { key: "B", emoji: "🟠", label: "Score B — médio" },
          { key: "C", emoji: "🟡", label: "Score C — regular" },
          { key: "D", emoji: "⚪", label: "Score D — mínimo" },
        ].map(s => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-60)" }}>{s.emoji} {s.label}</span>
            <span style={{ ...fontCondensed, fontSize: 18, fontWeight: 700, color: SCORE_VAL_COLOR[s.key] }}>{scoreDistribution[s.key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
