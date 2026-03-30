import type { NavigateFunction } from "react-router-dom";
import { animDelay, compactCurrency, fullCurrency, type ClientRank } from "../dashboard-utils";

interface Props {
  fullRanking: ClientRank[];
  numMonths: number;
  navigate: NavigateFunction;
}

export function RankingTable({ fullRanking, numMonths, navigate }: Props) {
  return (
    <div className="animate-dash-in bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] overflow-hidden mb-3.5" style={animDelay(240)}>
      <div className="px-[18px] pt-3 pb-2.5 border-b border-[rgba(10,21,100,0.10)] flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-navy">Ranking de compensações</div>
          <div className="text-[11px] text-ink-35 mt-0.5">economia bruta acumulada · {numMonths} meses · % do crédito identificado utilizado</div>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["#", "Empresa", "Total compensado", "Honorários", "Economia líquida", "% utilizado", "Progresso", "Saldo restante"].map((h, i) => (
              <th key={i} className={`px-3 py-[7px] text-[9px] font-bold tracking-[1.4px] uppercase text-ink-35 border-b border-[rgba(10,21,100,0.10)] bg-[rgba(15,17,23,0.05)] ${i === 7 ? "text-right" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fullRanking.map((c, i) => {
            const pctUsed = c.identificado > 0 ? Math.round((c.compensado / c.identificado) * 100) : 0;
            const econLiquida = c.compensado - c.honorarios;
            return (
              <tr key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} className="cursor-pointer hover:bg-[rgba(15,17,23,0.05)]">
                <td className="px-3 py-2 text-[10px] text-ink-35 border-b border-[rgba(0,0,0,0.04)] font-mono-dm tabular-nums">{i + 1}</td>
                <td className="px-3 py-2 text-xs font-semibold text-ink border-b border-[rgba(0,0,0,0.04)] max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap">{c.empresa}</td>
                <td className="px-3 py-2 border-b border-[rgba(0,0,0,0.04)] font-mono-dm tabular-nums font-bold text-dash-green text-xs">{fullCurrency(c.compensado)}</td>
                <td className="px-3 py-2 border-b border-[rgba(0,0,0,0.04)] font-mono-dm tabular-nums font-normal text-ink-35 text-[10px]">{fullCurrency(c.honorarios)}</td>
                <td className="px-3 py-2 border-b border-[rgba(0,0,0,0.04)] font-mono-dm tabular-nums font-semibold text-navy text-[11px]">{fullCurrency(econLiquida)}</td>
                <td className="px-3 py-2 border-b border-[rgba(0,0,0,0.04)] font-mono-dm tabular-nums font-normal text-ink-35 text-[10px]">{pctUsed}%</td>
                <td className="px-3 py-2 border-b border-[rgba(0,0,0,0.04)]">
                  <span className="w-[50px] h-1 bg-ink-12 rounded-sm overflow-hidden inline-block">
                    <span className="h-full rounded-sm bg-dash-green block" style={{ width: `${Math.min(pctUsed, 100)}%` }} />
                  </span>
                </td>
                <td className={`px-3 py-2 border-b border-[rgba(0,0,0,0.04)] text-right font-mono-dm tabular-nums font-bold text-xs ${c.saldo > 500000 ? "text-dash-red" : "text-ink-35"}`}>
                  {c.saldo > 0 ? compactCurrency(c.saldo) : fullCurrency(0)}
                </td>
              </tr>
            );
          })}
          {fullRanking.length === 0 && (
            <tr><td colSpan={8} className="p-5 text-center text-xs text-ink-35">Nenhuma compensação registrada.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
