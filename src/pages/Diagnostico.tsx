import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Tese {
  tese_nome: string;
  estimativa_minima: number;
  estimativa_maxima: number;
  percentual_minimo: number;
  percentual_maximo: number;
}

interface DiagnosticoData {
  lead: {
    empresa: string;
    nome: string;
    segmento: string;
    faturamento_faixa: string;
    regime_tributario: string;
    whatsapp: string;
    criado_em: string;
  };
  relatorio: {
    teses_identificadas: Tese[];
    estimativa_total_minima: number;
    estimativa_total_maxima: number;
    score: number;
    criado_em: string;
  } | null;
}

const SEGMENTO_LABELS: Record<string, string> = {
  supermercado: "Supermercado",
  pet: "PET",
  materiais_construcao: "Materiais de Construção",
  farmacia: "Farmácia",
  outros: "Outros",
};

const FATURAMENTO_LABELS: Record<string, string> = {
  ate_2m: "Até R$ 2 milhões/mês",
  "2m_15m": "De R$ 2M a R$ 15 milhões/mês",
  acima_15m: "Acima de R$ 15 milhões/mês",
};

const TESE_DESCRICOES: Record<string, string> = {
  "PIS/COFINS Monofásico": "Produtos com tributação concentrada na indústria — o varejo pode ter direito à restituição.",
  "ICMS-ST": "Substituição tributária paga a maior pode gerar créditos a recuperar.",
  "IPI Embutido": "Base de cálculo do PIS/COFINS pode estar indevidamente inflada pelo IPI.",
  "ICMS Energia Elétrica": "Cobrança indevida de ICMS sobre demanda contratada de energia.",
  "Exclusão ICMS da Base PIS/COFINS": "O ICMS não compõe a base de cálculo do PIS e da COFINS, conforme decisão do STF.",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Diagnostico() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<DiagnosticoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase
      .rpc("get_diagnostico_by_token", { _token: token })
      .then(({ data: result, error: err }) => {
        if (err || !result || !(result as any).lead) {
          setError(true);
        } else {
          setData(result as unknown as DiagnosticoData);
        }
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-muted-foreground">Carregando diagnóstico...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h1 className="text-xl font-bold text-foreground">Diagnóstico não encontrado</h1>
          <p className="text-muted-foreground text-sm">O link pode estar incorreto ou o diagnóstico ainda não foi gerado.</p>
        </div>
      </div>
    );
  }

  const { lead, relatorio } = data;
  const teses = (relatorio?.teses_identificadas || []).filter(
    (t) => t.estimativa_maxima > 0 && !t.tese_nome.toLowerCase().includes("ipi embutido")
  );
  const minTotal = relatorio?.estimativa_total_minima || 0;
  const maxTotal = relatorio?.estimativa_total_maxima || 0;
  const dataGeracao = relatorio?.criado_em
    ? format(new Date(relatorio.criado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const whatsappMsg = encodeURIComponent(
    `Olá! Sou da empresa ${lead.empresa} e vi no diagnóstico Focus FinTax que temos um potencial de recuperação tributária de ${formatCurrency(minTotal)} a ${formatCurrency(maxTotal)}. Gostaria de agendar uma análise completa.`
  );
  const whatsappUrl = `https://wa.me/5511999999999?text=${whatsappMsg}`;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 print:py-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Focus <span className="text-destructive">FinTax</span>
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-1">Diagnóstico Tributário</p>
            </div>
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80 text-xs">
              Análise estimada · Dados declarados
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Company info */}
        <div>
          <h2 className="text-xl font-bold text-primary">
            Diagnóstico Focus FinTax — {lead.empresa}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerado em {dataGeracao} · {SEGMENTO_LABELS[lead.segmento] || lead.segmento} · {FATURAMENTO_LABELS[lead.faturamento_faixa] || lead.faturamento_faixa} · {lead.regime_tributario}
          </p>
        </div>

        {/* Highlight card */}
        {maxTotal > 0 && (
          <Card className="border-l-4 border-l-destructive bg-white shadow-md">
            <CardContent className="py-6">
              <p className="text-sm font-medium text-muted-foreground mb-1">Potencial estimado de recuperação</p>
              <p className="text-3xl font-bold text-destructive">
                {formatCurrency(minTotal)} a {formatCurrency(maxTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">em créditos tributários identificados para o seu perfil</p>
            </CardContent>
          </Card>
        )}

        {/* Teses table */}
        {teses.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Oportunidades identificadas</h3>
              <div className="divide-y">
                {teses.map((t, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{t.tese_nome}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {TESE_DESCRICOES[t.tese_nome] || "Tese tributária com potencial de recuperação de créditos para o seu segmento."}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-destructive text-sm">
                          {formatCurrency(t.estimativa_minima)} – {formatCurrency(t.estimativa_maxima)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground leading-relaxed">
          <strong>Importante:</strong> Os valores apresentados são estimativas baseadas nas informações declaradas e em dados históricos de empresas do mesmo segmento. A análise completa requer acesso às declarações fiscais. Agende uma reunião para obter sua análise detalhada gratuita.
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <Button asChild size="lg" className="flex-1 bg-[#25d366] hover:bg-[#1da851] text-white">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Quero minha análise completa
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-5 w-5" />
            Baixar diagnóstico em PDF
          </Button>
        </div>
      </main>

      {/* Print footer */}
      <footer className="hidden print:block text-center text-xs text-muted-foreground py-4 border-t mt-8">
        Focus FinTax · focusfintax.lovable.app · Diagnóstico gerado automaticamente
      </footer>
    </div>
  );
}
