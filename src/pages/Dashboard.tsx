import { Building2, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Empresas Ativas", value: "24", icon: Building2, trend: "+2 este mês" },
  { label: "Obrigações Pendentes", value: "18", icon: FileText, trend: "5 vencem esta semana", urgent: true },
  { label: "Alertas Fiscais", value: "7", icon: AlertTriangle, trend: "3 críticos", urgent: true },
  { label: "Concluídas no Mês", value: "42", icon: CheckCircle2, trend: "87% de conformidade" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-body-text text-sm mt-1">Visão geral do sistema tributário e comercial</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-body-text uppercase tracking-wider">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.urgent ? "text-secondary" : "text-primary"}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
              <p className={`text-xs mt-1 font-medium ${stat.urgent ? "text-secondary" : "text-body-text"}`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Obrigações Próximas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "DCTF - Empresa Alpha", date: "15/03/2026", status: "Pendente" },
              { name: "EFD ICMS - Beta LTDA", date: "17/03/2026", status: "Em andamento" },
              { name: "SPED Fiscal - Gamma SA", date: "20/03/2026", status: "Pendente" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-body-text">Vencimento: {item.date}</p>
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                  item.status === "Pendente"
                    ? "bg-secondary/10 text-secondary"
                    : "bg-primary/10 text-primary"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: "DARF emitido para Empresa Alpha", time: "Há 2 horas" },
              { action: "Nova empresa cadastrada: Delta Corp", time: "Há 5 horas" },
              { action: "Relatório fiscal gerado - Fevereiro/2026", time: "Ontem" },
            ].map((item) => (
              <div key={item.action} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <p className="text-sm text-foreground">{item.action}</p>
                <p className="text-xs text-body-text whitespace-nowrap ml-4">{item.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
