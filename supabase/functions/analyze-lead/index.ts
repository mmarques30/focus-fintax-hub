import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FATURAMENTO_VALORES: Record<string, number> = {
  "ate_2m": 24_000_000,
  "2m_15m": 102_000_000,
  "acima_15m": 300_000_000,
};

const FATURAMENTO_LABELS: Record<string, string> = {
  "ate_2m": "Até R$ 2 milhões/mês (Pequeno)",
  "2m_15m": "De R$ 2M a R$ 15 milhões/mês (Médio)",
  "acima_15m": "Acima de R$ 15 milhões/mês (Grande)",
};

const SEGMENTO_LABELS: Record<string, string> = {
  "supermercado": "Supermercado",
  "pet": "PET",
  "materiais_construcao": "Materiais de Construção",
  "farmacia": "Farmácia",
  "outros": "Outros",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { lead_id } = await req.json();
    if (!lead_id) {
      return new Response(JSON.stringify({ error: "lead_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("leads").update({ status: "processando" }).eq("id", lead_id);

    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadErr || !lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: benchmarks } = await supabase
      .from("benchmarks_teses")
      .select("*")
      .eq("ativo", true)
      .eq("faturamento_faixa", lead.faturamento_faixa)
      .eq("segmento", lead.segmento);

    const faturamentoAnual = FATURAMENTO_VALORES[lead.faturamento_faixa] || 24_000_000;

    const teses = (benchmarks || []).map((b: any) => ({
      tese_nome: b.tese_nome,
      estimativa_minima: Math.round(faturamentoAnual * (b.percentual_minimo / 100)),
      estimativa_maxima: Math.round(faturamentoAnual * (b.percentual_maximo / 100)),
      percentual_minimo: b.percentual_minimo,
      percentual_maximo: b.percentual_maximo,
    }));

    // Filter IPI from public totals
    const tesasPublicas = teses.filter((t: any) => !t.tese_nome.toLowerCase().includes("ipi embutido"));
    const estimativa_total_minima = tesasPublicas.reduce((s: number, t: any) => s + t.estimativa_minima, 0);
    const estimativa_total_maxima = tesasPublicas.reduce((s: number, t: any) => s + t.estimativa_maxima, 0);

    const score = Math.min(100, Math.round((estimativa_total_maxima / faturamentoAnual) * 100));

    const segmentoLabel = SEGMENTO_LABELS[lead.segmento] || lead.segmento;
    const faturamentoLabel = FATURAMENTO_LABELS[lead.faturamento_faixa] || lead.faturamento_faixa;

    let conteudoHtml = "";

    if (lovableApiKey && tesasPublicas.length > 0) {
      const prompt = `Você é um consultor tributário da Focus FinTax. Gere um relatório HTML formatado (apenas o body content, sem tags html/head/body) com DOIS BLOCOS distintos.

BLOCO 1 — CONTEXTO EDUCATIVO (fixo, independe do lead):
- Título chamativo tipo "Você pode estar pagando mais imposto do que deveria"
- Explicação em linguagem simples do que são teses tributárias — sem juridiquês
- Como funciona a recuperação tributária na prática para empresas do varejo
- Embasamento legal resumido: mencionar que existem leis e decisões judiciais que permitem a recuperação, sem citar artigos específicos
- Use um tom acessível — o leitor é dono de empresa, não advogado

BLOCO 2 — DIAGNÓSTICO PERSONALIZADO (dinâmico):
- Saudação: "Olá, ${lead.empresa}!"
- Dados da empresa: segmento ${segmentoLabel}, porte ${faturamentoLabel}, regime ${lead.regime_tributario}
- Frase de dor: "Empresas do seu perfil costumam pagar impostos a mais sem saber — e isso pode ser recuperado."
- Potencial estimado: "Seu potencial estimado de recuperação tributária é de R$ ${estimativa_total_minima.toLocaleString("pt-BR")} a R$ ${estimativa_total_maxima.toLocaleString("pt-BR")}."
- NÃO cite os nomes das teses específicas. Apenas apresente o valor total.
- Disclaimer OBRIGATÓRIO: "Este valor é uma estimativa baseada em médias históricas de empresas do mesmo segmento e porte. O valor exato será confirmado em uma análise detalhada com os seus dados reais."
- Call to action: "Nosso time entrará em contato em até 24 horas para apresentar a análise completa."

REGRAS VISUAIS E DE CONTEÚDO:
1. Use HTML com estilos inline (font-family: Montserrat, sans-serif)
2. Cores: #010f69 para títulos e destaques principais, #4a5280 para texto corpo, #c73737 para valores financeiros e CTAs
3. Linguagem simples e direta — o leitor é dono de supermercado, farmácia ou loja, não contador
4. Tom profissional mas acessível, sem exagero de formalidade
5. Layout one-page, compacto e visualmente limpo
6. NÃO mencione nomes de teses tributárias específicas em hipótese alguma
7. NÃO mencione ferramentas internas, sistemas ou softwares
8. NÃO inclua tabelas com teses individuais — apenas o valor total agregado
9. Retorne APENAS o HTML, sem markdown, sem explicações, sem code fences`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          conteudoHtml = aiData.choices?.[0]?.message?.content || "";
          conteudoHtml = conteudoHtml.replace(/^```html\n?/i, "").replace(/\n?```$/i, "").trim();
        } else {
          console.error("AI error:", aiResponse.status, await aiResponse.text());
        }
      } catch (aiErr) {
        console.error("AI call failed:", aiErr);
      }
    }

    // Fallback HTML
    if (!conteudoHtml) {
      conteudoHtml = `
        <div style="font-family: Montserrat, sans-serif; color: #4a5280; max-width: 640px; margin: 0 auto;">
          <div style="margin-bottom: 32px;">
            <h2 style="color: #010f69; font-size: 24px; margin-bottom: 12px;">Você pode estar pagando mais imposto do que deveria</h2>
            <p>Muitas empresas do varejo pagam tributos acima do necessário sem saber. Existem mecanismos legais — chamados de teses tributárias — que permitem recuperar valores pagos indevidamente nos últimos anos.</p>
            <p>Esse processo é 100% legal, respaldado por decisões judiciais e pela legislação vigente. Na prática, a empresa recebe de volta valores que foram cobrados a mais pelo governo.</p>
          </div>
          <div style="border-top: 2px solid #010f69; padding-top: 24px;">
            <h3 style="color: #010f69; font-size: 20px;">Olá, ${lead.empresa}!</h3>
            <p><strong>Segmento:</strong> ${segmentoLabel} | <strong>Porte:</strong> ${faturamentoLabel} | <strong>Regime:</strong> ${lead.regime_tributario}</p>
            <p style="margin-top: 16px;">Empresas do seu perfil costumam pagar impostos a mais sem saber — e isso pode ser recuperado.</p>
            ${estimativa_total_maxima > 0 ? `
              <div style="background: #f7f8fc; border-left: 4px solid #c73737; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 18px; font-weight: bold; color: #010f69; margin: 0;">Potencial estimado de recuperação:</p>
                <p style="font-size: 24px; font-weight: bold; color: #c73737; margin: 8px 0 0 0;">R$ ${estimativa_total_minima.toLocaleString("pt-BR")} a R$ ${estimativa_total_maxima.toLocaleString("pt-BR")}</p>
              </div>
            ` : `<p>Não foram identificadas estimativas para este perfil no momento. Verifique os benchmarks cadastrados.</p>`}
            <p style="margin-top: 16px; font-size: 13px; color: #888; border-top: 1px solid #dde0f0; padding-top: 12px;">
              Este valor é uma estimativa baseada em médias históricas de empresas do mesmo segmento e porte. O valor exato será confirmado em uma análise detalhada com os seus dados reais.
            </p>
            <p style="margin-top: 12px; font-weight: bold; color: #010f69;">Nosso time entrará em contato em até 24 horas para apresentar a análise completa.</p>
          </div>
        </div>
      `;
    }

    const { error: reportErr } = await supabase.from("relatorios_leads").insert({
      lead_id,
      conteudo_html: conteudoHtml,
      teses_identificadas: teses,
      estimativa_total_minima,
      estimativa_total_maxima,
      score,
    });

    if (reportErr) {
      console.error("Report insert error:", reportErr);
      return new Response(JSON.stringify({ error: "Failed to save report" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("leads")
      .update({ status: "relatorio_gerado", score_lead: score })
      .eq("id", lead_id);

    return new Response(
      JSON.stringify({ success: true, score, estimativa_total_minima, estimativa_total_maxima, teses_count: teses.length, token: lead.token }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("analyze-lead error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
