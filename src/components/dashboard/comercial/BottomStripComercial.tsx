import { compactCurrency } from "../dashboard-utils";

interface Props {
  comLeads: number;
  comContratos: number;
  comClientesAtivos: number;
  comPotencial: number;
  comTaxaConversao: number;
}

export function BottomStripComercial({ comLeads, comContratos, comClientesAtivos, comPotencial, comTaxaConversao }: Props) {
  const items = [
    { val: String(comLeads), label: "Leads no pipeline", colorClass: "" },
    { val: String(comContratos), label: "Contratos emitidos", colorClass: "text-dash-amber" },
    { val: String(comClientesAtivos), label: "Clientes ativos", colorClass: "text-dash-green" },
    { val: compactCurrency(comPotencial), label: "Potencial total", colorClass: "text-dash-red" },
    { val: `${comTaxaConversao}%`, label: "Taxa de conversão", colorClass: "text-dash-green" },
  ];

  return (
    <div className="animate-slide-up delay-4 card-base px-6 py-3 flex items-center mt-3.5">
      {items.map((item, i) => (
        <div key={i} className="flex-1 text-center px-3">
          <span className={`font-display text-xl font-bold block leading-[1.1] ${item.colorClass || "text-navy"}`}>{item.val}</span>
          <span className="text-[9px] text-ink-35 font-semibold tracking-[1px] uppercase mt-[3px] block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
