import { anim, fontMono } from "../dashboard-utils";

interface StalledLead {
  empresa: string;
  days: number;
  id: string;
}

interface Props {
  stalledLeads: StalledLead[];
}

export function AlertasBanner({ stalledLeads }: Props) {
  if (stalledLeads.length === 0) return null;

  return (
    <div style={{ ...anim(90), background: "var(--dash-surface)", border: "1px solid rgba(180,83,9,0.2)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ padding: "10px 18px", background: "var(--dash-amber-bg)", borderBottom: "1px solid rgba(180,83,9,0.12)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--dash-amber)", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--dash-amber)" }}>
          Requer atenção — {stalledLeads.length} lead{stalledLeads.length > 1 ? "s" : ""} sem movimentação
        </span>
      </div>
      {stalledLeads.slice(0, 5).map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 18px", borderBottom: "1px solid rgba(0,0,0,0.04)", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", width: 220, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.empresa}</span>
          <span style={{ fontSize: 11, color: "var(--ink-60)", flex: 1 }}>Em Contrato Emitido sem atualização</span>
          <span style={{ ...fontMono, fontSize: 10, color: "var(--dash-amber)", fontWeight: 600, background: "var(--dash-amber-10)", padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>há {l.days} dias</span>
        </div>
      ))}
    </div>
  );
}
