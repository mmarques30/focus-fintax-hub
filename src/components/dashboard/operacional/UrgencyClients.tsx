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
    <div className="animate-slide-up delay-4 bg-[rgba(200,0,30,0.04)] border border-[rgba(200,0,30,0.18)] rounded-2xl overflow-hidden mb-3.5">
      <div className="px-4 py-2.5 bg-[rgba(200,0,30,0.08)] border-b border-[rgba(200,0,30,0.15)] flex items-center gap-2">
        <span className="text-xs">🎯</span>
        <span className="text-[11px] font-bold tracking-[0.8px] uppercase text-dash-red">
          Prioridade máxima — {urgencyClients.length} cliente{urgencyClients.length > 1 ? "s" : ""} com saldo acima de R$1M
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 px-4 py-3">
        {urgencyClients.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(`/clientes/${c.id}`)}
            className="flex-shrink-0 w-48 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(200,0,30,0.06) 0%, rgba(200,0,30,0.03) 100%)',
              border: '1px solid rgba(200,0,30,0.15)',
              boxShadow: '0 2px 8px rgba(200,0,30,0.08)',
            }}
          >
            <p className="text-xs font-bold text-ink truncate">{c.empresa}</p>
            <p className="font-display text-xl font-bold text-dash-red mt-1">{compactCurrency(c.saldo)}</p>
            <p className="text-[10px] text-ink-35 mt-0.5">hon. potencial {compactCurrency(c.saldo * taxaHon)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
