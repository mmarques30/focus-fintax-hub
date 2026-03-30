import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { greeting, ROLE_LABELS, fontMono, fontBarlow } from "./dashboard-utils";

interface Props {
  profileName: string;
  role: string;
  canComercial: boolean;
  canOperacional: boolean;
  activeTab: string;
  switchTab: (t: string) => void;
}

export function DashboardHeader({ profileName, role, canComercial, canOperacional, activeTab, switchTab }: Props) {
  return (
    <div style={{ background: "var(--dash-surface)", borderBottom: "1px solid var(--dash-border)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ height: 52, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{greeting()}, {profileName}</span>
          <span style={{ fontSize: 12, color: "var(--ink-60)", marginLeft: 10 }}>{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ background: "var(--navy-10)", border: "1px solid var(--dash-border)", borderRadius: 6, padding: "3px 10px", ...fontMono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--navy)" }}>{ROLE_LABELS[role] ?? role}</span>
          <span style={{ ...fontMono, fontSize: 12, color: "var(--ink-60)", marginLeft: 10 }}>{format(new Date(), "HH:mm")}</span>
        </div>
      </div>
      {canComercial && canOperacional && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {[{ key: "comercial", label: "Visão Comercial" }, { key: "operacional", label: "Visão Operacional" }].map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)} style={{ padding: "12px 32px", fontSize: 13, fontWeight: activeTab === t.key ? 600 : 500, color: activeTab === t.key ? "var(--navy)" : "var(--ink-60)", cursor: "pointer", background: "none", border: "none", borderBottom: activeTab === t.key ? "2px solid var(--navy)" : "2px solid transparent", ...fontBarlow }}>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
