import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Tese {
  tese_nome: string;
  estimativa_minima: number;
  estimativa_maxima: number;
  percentual_minimo: number;
  percentual_maximo: number;
  descricao_comercial?: string;
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

const FATURAMENTO_MIDPOINTS: Record<string, number> = {
  ate_2m: 1_000_000,
  "2m_15m": 8_500_000,
  acima_15m: 20_000_000,
};

const TESE_DESCRICOES_FALLBACK: Record<string, string> = {
  "PIS/COFINS Insumos": "Produtos com tributação concentrada na indústria — o varejo pode ter direito à restituição de valores pagos indevidamente na cadeia.",
  "Exclusão ICMS da Base PIS/COFINS": "Decisão histórica do STF (RE 574.706 — Tema 69): o ICMS não compõe o faturamento para fins de PIS/COFINS. Risco baixíssimo — jurisprudência consolidada.",
  "Subvenção ICMS (IRPJ/CSLL)": "Incentivos fiscais de ICMS podem ser excluídos da base de IRPJ e CSLL, gerando economia tributária relevante.",
  "Reporto / PIS-COFINS Acumulado": "Regime tributário para modernização e créditos acumulados de PIS/COFINS passíveis de compensação administrativa.",
  "Exclusão ICMS-ST": "O ICMS retido por substituição tributária não representa receita — logo, não deve compor a base de PIS/COFINS.",
};

function formatValue(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (v >= 1_000) return `R$ ${Math.round(v / 1_000)} mil`;
  return `R$ ${v}`;
}

function formatHeroNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",");
  if (n >= 1_000) return Math.round(n / 1_000).toLocaleString("pt-BR");
  return n.toString();
}

function heroSuffix(n: number): string {
  if (n >= 1_000_000) return " mi";
  if (n >= 1_000) return " mil";
  return "";
}

// Animated counter hook
function useAnimatedCounter(target: number, duration = 1800, startDelay = 600) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (target <= 0) return;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // out-quart
        setValue(Math.round(ease * target));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, startDelay]);

  return value;
}

// Inject fonts
function useFonts() {
  useEffect(() => {
    const id = "diagnostico-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;900&family=Barlow+Condensed:wght@600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);
}

// Inject styles
function useStyles() {
  useEffect(() => {
    const id = "diagnostico-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes diag-fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes diag-blink {
        0%,100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      .diag-fadeUp {
        animation: diag-fadeUp 0.6s ease both;
      }
      @media print {
        .diag-page { background: #fff !important; color: #000 !important; }
        .diag-page::before { display: none !important; }
        .diag-header { background: #0a1564 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .diag-cta-section { display: none !important; }
        .diag-btn { display: none !important; }
        .diag-hero, .diag-tese-card, .diag-disclaimer {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { /* keep styles for print */ };
  }, []);
}

const LogoSVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M20 6C20 6 13 10 11 18C10 22 11 26 14 28C16 29.5 18 30 20 30C22 30 24 29.5 26 28C29 26 30 22 29 18C27 10 20 6 20 6Z" fill="#c8001e"/>
    <path d="M16 18C16 18 17 20 20 20C23 20 24 18 24 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 22C17 22 18.5 23.5 20 23.5C21.5 23.5 23 22 23 22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="17" cy="16" r="1.5" fill="white"/>
    <circle cx="23" cy="16" r="1.5" fill="white"/>
  </svg>
);

const WhatsAppSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Diagnostico() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<DiagnosticoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);

  useFonts();
  useStyles();

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

  // Trigger bars after mount
  useEffect(() => {
    if (data) {
      const t = setTimeout(() => setBarsVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [data]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060e4a", fontFamily: "'Barlow', sans-serif" }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Carregando diagnóstico...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060e4a", fontFamily: "'Barlow', sans-serif", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48, opacity: 0.3 }}>📄</div>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Diagnóstico não encontrado</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>O link pode estar incorreto ou o diagnóstico ainda não foi gerado.</p>
        <a href="/" style={{ color: "#c8001e", fontSize: 13, textDecoration: "underline" }}>Voltar à página inicial</a>
      </div>
    );
  }

  const { lead, relatorio } = data;
  const teses = (relatorio?.teses_identificadas || []).filter((t) => t.estimativa_maxima > 0);
  const minTotal = relatorio?.estimativa_total_minima || 0;
  const maxTotal = relatorio?.estimativa_total_maxima || 0;
  const maxTese = Math.max(...teses.map((t) => t.estimativa_maxima), 1);
  const midpoint = FATURAMENTO_MIDPOINTS[lead.faturamento_faixa] || 1_000_000;
  const multiplier = midpoint > 0 ? (maxTotal / midpoint).toFixed(1).replace(".", ",") : "0";

  return <DiagnosticoContent
    lead={lead}
    teses={teses}
    minTotal={minTotal}
    maxTotal={maxTotal}
    maxTese={maxTese}
    multiplier={multiplier}
    barsVisible={barsVisible}
  />;
}

interface ContentProps {
  lead: DiagnosticoData["lead"];
  teses: Tese[];
  minTotal: number;
  maxTotal: number;
  maxTese: number;
  multiplier: string;
  barsVisible: boolean;
}

function DiagnosticoContent({ lead, teses, minTotal, maxTotal, maxTese, multiplier, barsVisible }: ContentProps) {
  const animMin = useAnimatedCounter(minTotal);
  const animMax = useAnimatedCounter(maxTotal);

  const whatsappMsg = encodeURIComponent(
    `Olá! Acabei de receber o diagnóstico tributário da Focus FinTax para ${lead.empresa}. O potencial estimado de recuperação é de ${formatValue(minTotal)} a ${formatValue(maxTotal)}. Gostaria de agendar a análise completa.`
  );
  const whatsappUrl = `https://wa.me/5521999999999?text=${whatsappMsg}`;

  const segLabel = SEGMENTO_LABELS[lead.segmento] || lead.segmento;

  return (
    <div className="diag-page" style={{
      minHeight: "100vh",
      background: "#060e4a",
      color: "#fff",
      fontFamily: "'Barlow', sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>
      {/* BG texture */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(13,30,122,0.9) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 90% 20%, rgba(200,0,30,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 30% 30% at 10% 80%, rgba(200,0,30,0.08) 0%, transparent 60%)
        `,
      }} />

      {/* Header */}
      <header className="diag-header diag-fadeUp" style={{
        position: "relative", zIndex: 10,
        padding: "20px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(6,14,74,0.6)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoSVG />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>FOCUS</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#e8001e", letterSpacing: 3, textTransform: "uppercase" as const }}>FinTax</span>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 100, padding: "6px 16px",
          fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const,
          color: "rgba(255,255,255,0.7)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#00e676",
            animation: "diag-blink 1.8s ease-in-out infinite", display: "inline-block",
          }} />
          Diagnóstico Gerado
        </div>
      </header>

      {/* Wrapper */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Intro */}
        <div className="diag-fadeUp" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: 4,
            textTransform: "uppercase" as const, color: "#e8001e",
            background: "rgba(200,0,30,0.12)", border: "1px solid rgba(200,0,30,0.3)",
            borderRadius: 4, padding: "4px 14px", marginBottom: 12,
          }}>
            Diagnóstico Tributário · Estimativa Preliminar
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(26px, 5vw, 38px)",
            fontWeight: 700, lineHeight: 1.2, marginBottom: 8,
          }}>
            {lead.empresa}<br />
            identificamos <span style={{ color: "#f5c842" }}>oportunidades reais</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            Análise baseada no faturamento declarado · {lead.regime_tributario} · Período de 60 meses
          </p>
        </div>

        {/* Hero total */}
        {maxTotal > 0 && (
          <div className="diag-hero diag-fadeUp" style={{
            background: "linear-gradient(135deg, rgba(200,0,30,0.18) 0%, rgba(13,30,122,0.4) 100%)",
            border: "1px solid rgba(200,0,30,0.4)", borderRadius: 20,
            padding: "40px 48px", textAlign: "center", marginBottom: 32,
            position: "relative", overflow: "hidden", animationDelay: "0.1s",
          }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,0,30,0.2) 0%, transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,0,30,0.1) 0%, transparent 70%)" }} />

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" as const, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
              Potencial total de recuperação tributária estimado
            </div>

            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 8vw, 72px)", lineHeight: 1, marginBottom: 10, position: "relative", zIndex: 1 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.45em", fontWeight: 700, verticalAlign: "top", marginTop: "0.2em", display: "inline-block", color: "#e8001e" }}>R$</span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{formatHeroNumber(animMin)}{heroSuffix(minTotal)}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6em", margin: "0 8px" }}>→</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.45em", fontWeight: 700, verticalAlign: "top", marginTop: "0.2em", display: "inline-block", color: "#e8001e" }}>R$</span>
              <span style={{ color: "#fff" }}>{formatHeroNumber(animMax)}{heroSuffix(maxTotal)}</span>
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 20, position: "relative", zIndex: 1 }}>
              Estimativa conservadora a agressiva — {teses.length} teses identificadas para o seu perfil
            </p>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.35)",
              borderRadius: 8, padding: "10px 20px", position: "relative", zIndex: 1,
            }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#f5c842" }}>{multiplier}×</span>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "left" as const, lineHeight: 1.3 }}>
                <strong style={{ display: "block", color: "#f5c842", fontWeight: 700 }}>faturamentos mensais</strong>
                média recuperada por {segLabel.toLowerCase()}s similares ao seu
              </div>
            </div>
          </div>
        )}

        {/* Section label */}
        {teses.length > 0 && (
          <div className="diag-fadeUp" style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16, animationDelay: "0.2s",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" as const }}>
              {teses.length} teses identificadas
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" as const, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" as const }}>
              {lead.regime_tributario} · {segLabel}
            </span>
          </div>
        )}

        {/* Tese cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {teses.map((t, i) => {
            const barWidth = Math.round((t.estimativa_maxima / maxTese) * 100);
            const desc = t.descricao_comercial || TESE_DESCRICOES_FALLBACK[t.tese_nome] || "Tese tributária com potencial de recuperação de créditos para o seu segmento.";
            return (
              <div key={i} className="diag-tese-card diag-fadeUp" style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14, padding: "22px 28px",
                display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center",
                transition: "border-color 0.3s, background 0.3s",
                animationDelay: `${0.25 + i * 0.07}s`,
                cursor: "default",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(200,0,30,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: 3,
                    color: "#e8001e", marginBottom: 4, display: "flex", alignItems: "center", gap: 8,
                  }}>
                    TESE {String(i + 1).padStart(2, "0")}
                    <span style={{ display: "block", width: 24, height: 1, background: "rgba(200,0,30,0.5)" }} />
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
                    {t.tese_nome}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, maxWidth: 520 }}>
                    {desc}
                  </div>
                  <div style={{ marginTop: 12, height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #c8001e 0%, #e8001e 100%)",
                      borderRadius: 2,
                      width: barsVisible ? `${barWidth}%` : "0%",
                      transition: `width 1.4s cubic-bezier(0.16,1,0.3,1)`,
                      transitionDelay: `${0.3 + i * 0.12}s`,
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                    Estimativa 5 anos
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, lineHeight: 1.1 }}>
                    <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)" }}>{formatValue(t.estimativa_minima)}</div>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", margin: "1px 0" }}>até</span>
                    <div style={{ fontSize: 20, color: "#fff" }}>{formatValue(t.estimativa_maxima)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="diag-disclaimer diag-fadeUp" style={{
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          borderLeft: "3px solid rgba(245,200,66,0.5)", borderRadius: 10,
          padding: "16px 20px", marginBottom: 36,
          display: "flex", gap: 14, alignItems: "flex-start",
          animationDelay: "0.6s",
        }}>
          <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠</div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.65 }}>
            <strong style={{ color: "#f5c842", fontWeight: 600 }}>Análise Estimada · Dados Declarados</strong><br />
            Os valores acima são projeções preliminares com base no faturamento e regime informados, calculadas a partir de médias históricas de empresas do mesmo segmento. A análise completa e definitiva requer acesso às declarações fiscais, Speds e balancetes contábeis. Prazo legal para recuperação: <strong style={{ color: "#f5c842", fontWeight: 600 }}>5 anos retroativos</strong>. Cada mês sem análise reduz o período recuperável.
          </p>
        </div>

        {/* CTA Section */}
        <div className="diag-cta-section diag-fadeUp" style={{ textAlign: "center", animationDelay: "0.7s" }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            Transforme esse potencial em caixa real.
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>
            Avaliamos seus documentos em 48h. Se não recuperarmos, você não paga nada.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="diag-btn" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 28px", borderRadius: 10,
              fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 14,
              background: "#c8001e", color: "#fff",
              boxShadow: "0 4px 24px rgba(200,0,30,0.4)",
              textDecoration: "none", border: "none", cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(200,0,30,0.6)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(200,0,30,0.4)"; }}
            >
              <WhatsAppSVG />
              Quero minha análise completa
            </a>
            <button className="diag-btn" onClick={() => window.print()} style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 28px", borderRadius: 10,
              fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 14,
              background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
              transition: "transform 0.2s, background 0.2s, color 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Baixar diagnóstico
            </button>
          </div>
        </div>

        {/* Stamps */}
        <div className="diag-fadeUp" style={{
          display: "flex", justifyContent: "center", gap: 32, marginTop: 36, flexWrap: "wrap" as const,
          animationDelay: "0.8s",
        }}>
          {["Processos amparados pelo STF", "Sem custo inicial · Só no sucesso", "Prazo legal: 5 anos retroativos", "Confidencialidade total"].map((text) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: 0.5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(200,0,30,0.6)" }} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 5, textAlign: "center", padding: 24,
        borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 11,
        color: "rgba(255,255,255,0.4)", letterSpacing: 0.5,
      }}>
        Focus FinTax LTDA · Grupo Focus · A Contabilidade do Supermercado
      </footer>
    </div>
  );
}
