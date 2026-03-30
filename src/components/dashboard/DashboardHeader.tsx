import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { greeting, ROLE_LABELS } from "./dashboard-utils";

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
    <div className="bg-white border-b border-[rgba(10,21,100,0.10)] sticky top-0 z-[100]">
      <div className="h-[52px] px-7 flex items-center justify-between">
        <div className="flex items-baseline">
          <span className="text-base font-bold text-navy">{greeting()}, {profileName}</span>
          <span className="text-xs text-ink-60 ml-2.5">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
        </div>
        <div className="flex items-center">
          <span className="bg-[rgba(10,21,100,0.08)] border border-[rgba(10,21,100,0.10)] rounded-md px-2.5 py-[3px] font-mono-dm text-[10px] tracking-[1.5px] uppercase text-navy">{ROLE_LABELS[role] ?? role}</span>
          <span className="font-mono-dm text-xs text-ink-60 ml-2.5">{format(new Date(), "HH:mm")}</span>
        </div>
      </div>
      {canComercial && canOperacional && (
        <div className="flex justify-center gap-2">
          {[{ key: "comercial", label: "Visão Comercial" }, { key: "operacional", label: "Visão Operacional" }].map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)} className={`px-8 py-3 text-[13px] cursor-pointer bg-transparent border-none font-sans ${activeTab === t.key ? "font-semibold text-navy border-b-2 border-b-navy" : "font-medium text-ink-60 border-b-2 border-b-transparent"}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
