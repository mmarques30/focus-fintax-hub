import { fontMono, fontCondensed, compactCurrency } from "../dashboard-utils";

interface DistBand {
  label: string;
  count: number;
  total: number;
  color: string;
  fontWeight: number;
}

interface Props {
  opClientes: number;
  distBands: DistBand[];
  maxDistCount: number;
  prazoSaldo: number;
  honFuturosSaldo: number;
  opSaldo: number;
  taxaHon: number;
}

export function DistribuicaoSaldo({ opClientes, distBands, maxDistCount, prazoSaldo, honFuturosSaldo, opSaldo, taxaHon }: Props) {
  return (
    <div style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 18px 10px", borderBottom: "1px solid var(--dash-border)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--navy)" }}>Distribuição do saldo</div>
        <div style={{ fontSize: 11, color: "var(--ink-35)", marginTop: 2 }}>{opClientes} clientes · por faixa de saldo restante</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px" }}>
        {distBands.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: d.fontWeight, color: d.color, width: 110, flexShrink: 0 }}>{d.label}</span>
            <div style={{ flex: 1, height: 6, background: "var(--ink-12)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 3, background: d.color, width: `${(d.count / maxDistCount) * 100}%` }} />
            </div>
            <span style={{ ...fontMono, fontSize: 11, fontWeight: 700, color: d.color, width: 20, textAlign: "right", flexShrink: 0 }}>{d.count}</span>
            <span style={{ ...fontMono, fontSize: 10, color: d.total > 0 ? d.color : "var(--ink-35)", width: 52, textAlign: "right", flexShrink: 0 }}>{d.total > 0 ? compactCurrency(d.total) : "—"}</span>
          </div>
        ))}
      </div>

      {/* Strategic callout */}
      {prazoSaldo > 0 && prazoSaldo < 9 && (
        <div style={{ margin: "0 14px 14px", background: "rgba(200,0,30,0.04)", border: "1px solid rgba(200,0,30,0.15)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--dash-red)", marginBottom: 4 }}>⚠ Atenção estratégica</div>
          <div style={{ fontSize: 11, color: "var(--ink-60)", lineHeight: 1.5 }}>
            Ao ritmo atual, o saldo identificado se esgota em <strong style={{ color: "var(--dash-red)" }}>{prazoSaldo.toFixed(1)} meses</strong>. Para manter a receita, é preciso onboardar novos clientes ou levantar novas teses para a carteira atual.
          </div>
        </div>
      )}

      {/* Honorários futuros */}
      <div style={{ borderTop: "1px solid var(--dash-border)", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--dash-green-10)", marginTop: "auto" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--dash-green)" }}>Honorários futuros estimados</div>
          <div style={{ fontSize: 10, color: "var(--ink-60)", marginTop: 2 }}>sobre o saldo restante · taxa {(taxaHon * 100).toFixed(1)}%</div>
        </div>
        <div style={{ ...fontCondensed, fontSize: 22, fontWeight: 700, color: "var(--dash-green)" }}>{compactCurrency(honFuturosSaldo)}</div>
      </div>
    </div>
  );
}
