import { fontCondensed } from "../dashboard-utils";

interface Props {
  motorDiagnosticos: number;
  motorTesesAtivas: number;
}

export function MotorPerformance({ motorDiagnosticos, motorTesesAtivas }: Props) {
  return (
    <div style={{ background: "var(--navy)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: 0.5, color: "#fff", marginBottom: 12 }}>Performance do motor</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { val: motorDiagnosticos, label: "Diagnósticos", highlight: false },
          { val: motorTesesAtivas, label: "Teses ativas", highlight: false },
          { val: 0, label: "Sem cobertura", highlight: true },
        ].map((m, i) => (
          <div key={i} style={{ padding: "0 10px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none", textAlign: "center" }}>
            <div style={{ ...fontCondensed, fontSize: 24, fontWeight: 700, color: m.highlight ? "#fca5a5" : "#fff", lineHeight: 1 }}>{m.val}</div>
            <div style={{ fontSize: 9, opacity: 0.5, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, color: "#fff" }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
