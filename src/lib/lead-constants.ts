export const FATURAMENTO_FAIXAS = [
  { value: "ate_500k", label: "Até R$ 500 mil" },
  { value: "500k_2m", label: "R$ 500 mil – R$ 2 milhões" },
  { value: "2m_5m", label: "R$ 2 milhões – R$ 5 milhões" },
  { value: "5m_15m", label: "R$ 5 milhões – R$ 15 milhões" },
  { value: "acima_15m", label: "Acima de R$ 15 milhões" },
] as const;

export const REGIMES = [
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
] as const;

export const SEGMENTOS = [
  { value: "supermercado", label: "Supermercado" },
  { value: "pet", label: "PET" },
  { value: "materiais_construcao", label: "Materiais de Construção" },
  { value: "farmacia", label: "Farmácia" },
  { value: "outros", label: "Outros" },
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
  "ate_2m": 24_000_000,
  "2m_15m": 102_000_000,
  "acima_15m": 300_000_000,
};
