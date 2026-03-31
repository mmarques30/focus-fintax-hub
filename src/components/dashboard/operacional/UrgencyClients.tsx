import type { NavigateFunction } from "react-router-dom";
import { compactCurrency, type ClientRank } from "../dashboard-utils";

interface Props {
  urgencyClients: ClientRank[];
  taxaHon: number;
  navigate: NavigateFunction;
}

export function UrgencyClients({ urgencyClients, taxaHon, navigate }: Props) {
  if (urgencyClients.length === 0) return null;

  return (
    <div className="animate-slide-up delay-4 bg-[rgba(200,0,30,0.04)] border border-[rgba(200,0,30,0.18)] rounded-[10px] overflow-hidden mb-3.5">
      <div className="px-4 py-2.5 bg-[rgba(200,0,30,0.08)] border-b border-[rgba(200,0,30,0.15)] flex items-center gap-2">
        <span className="text-xs">🎯</span>
        <span className="text-[11px] font-bold tracking-[0.8px] uppercase text-dash-red">
          Prioridade máxima — {urgencyClients.length} cliente{urgencyClients.length > 1 ? "s" : ""} com saldo acima de R$1M
        </span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(urgencyClients.length, 5)},1fr)` }}>
        {urgencyClients.map((c, i) => (
          <div key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} className={`px-3.5 py-2.5 text-center cursor-pointer ${i < urgencyClients.length - 1 ? "border-r border-[rgba(200,0,30,0.10)]" : ""}`}>
            <div className="text-[11px] font-bold text-ink overflow-hidden text-ellipsis whitespace-nowrap mb-[3px]">{c.empresa}</div>
            <div className="font-display text-[17px] font-bold text-dash-red leading-none">{compactCurrency(c.saldo)}</div>
            <div className="text-[10px] text-ink-35 mt-0.5">hon. potencial {compactCurrency(c.saldo * taxaHon)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
