export const FATURAMENTO_FAIXAS = [
  "Até 500k",
  "500k-1M",
  "1M-5M",
  "5M-20M",
  "Acima de 20M",
] as const;

export const REGIMES = [
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
] as const;

export const SEGMENTOS = [
  "Supermercado",
  "Atacado",
  "Varejo Alimentar",
  "Outro",
] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  processando: "Processando",
  relatorio_gerado: "Relatório Gerado",
  enviado: "Enviado",
  contatado: "Contatado",
  qualificado: "Qualificado",
  convertido: "Convertido",
  perdido: "Perdido",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  novo: "bg-muted text-muted-foreground",
  processando: "bg-primary/10 text-primary border-primary/20",
  relatorio_gerado: "bg-accent text-accent-foreground",
  enviado: "bg-green-100 text-green-800 border-green-200",
  contatado: "bg-blue-100 text-blue-800 border-blue-200",
  qualificado: "bg-amber-100 text-amber-800 border-amber-200",
  convertido: "bg-green-200 text-green-900 border-green-300",
  perdido: "bg-secondary/10 text-secondary border-secondary/20",
};

// Map faixa to approximate annual revenue for calculation
export const FATURAMENTO_VALORES: Record<string, number> = {
  "Até 500k": 500_000,
  "500k-1M": 1_000_000,
  "1M-5M": 5_000_000,
  "5M-20M": 20_000_000,
  "Acima de 20M": 50_000_000,
};
