import type { NavigateFunction } from "react-router-dom";
import { anim, fontCondensed, compactCurrency, type ClientRank } from "../dashboard-utils";

interface Props {
  urgencyClients: ClientRank[];
  taxaHon: number;
  navigate: NavigateFunction;
}

export function UrgencyClients({ urgencyClients, taxaHon, navigate }: Props) {
  if (urgencyClients.length === 0) return null;

  return (
    <div style={{ ...anim(190), background: "rgba(200,0,30,0.04)", border: "1px solid rgba(200,0,30,0.18)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ padding: "10px 16px", background: "rgba(200,0,30,0.08)", borderBottom: "1px solid rgba(200,0,30,0.15)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12 }}>🎯</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--dash-red)" }}>
          Prioridade máxima — {urgencyClients.length} cliente{urgencyClients.length > 1 ? "s" : ""} com saldo acima de R$1M
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(urgencyClients.length, 5)},1fr)`, gap: 0 }}>
        {urgencyClients.map((c, i) => (
          <div key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} style={{ padding: "10px 14px", borderRight: i < urgencyClients.length - 1 ? "1px solid rgba(200,0,30,0.10)" : "none", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{c.empresa}</div>
            <div style={{ ...fontCondensed, fontSize: 17, fontWeight: 700, color: "var(--dash-red)", lineHeight: 1 }}>{compactCurrency(c.saldo)}</div>
            <div style={{ fontSize: 10, color: "var(--ink-35)", marginTop: 2 }}>hon. potencial {compactCurrency(c.saldo * taxaHon)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
