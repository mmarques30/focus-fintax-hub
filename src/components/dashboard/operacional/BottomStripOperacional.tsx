import { compactCurrency } from "../dashboard-utils";

interface Props {
  opClientes: number;
  opCompensado: number;
  opHonorarios: number;
  opEconomia: number;
  opSaldo: number;
  numMonths: number;
  prazoSaldo: number;
  projHonAnual: number;
}

export function BottomStripOperacional({ opClientes, opCompensado, opHonorarios, opEconomia, opSaldo, numMonths, prazoSaldo, projHonAnual }: Props) {
  const items = [
    { val: String(opClientes), label: "Clientes compensando", colorClass: "" },
    { val: compactCurrency(opCompensado), label: `Compensado (${numMonths} meses)`, colorClass: "text-dash-green" },
    { val: compactCurrency(opHonorarios), label: "Honorários gerados", colorClass: "" },
    { val: compactCurrency(opEconomia), label: "Economia líquida", colorClass: "text-dash-green" },
    { val: compactCurrency(opSaldo), label: "Saldo disponível", colorClass: "text-dash-red" },
    { val: `${prazoSaldo.toFixed(1)} meses`, label: "Prazo do saldo atual", colorClass: "text-dash-amber" },
    { val: compactCurrency(projHonAnual), label: "Projeção hon. anual", colorClass: "text-dash-green" },
  ];

  return (
    <div className="animate-slide-up delay-5 bg-white border border-[rgba(10,21,100,0.10)] rounded-[10px] px-6 py-[13px] flex items-center">
      {items.map((item, i) => (
        <div key={i} className={`flex-1 text-center px-2 ${i < items.length - 1 ? "border-r border-[rgba(10,21,100,0.10)]" : ""}`}>
          <span className={`font-display text-[17px] font-bold block leading-[1.1] ${item.colorClass || "text-navy"}`}>{item.val}</span>
          <span className="text-[8px] text-ink-35 font-semibold tracking-[0.8px] uppercase mt-0.5 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
