import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FATURAMENTO_VALORES: Record<string, number> = {
  "Até 500k": 500_000,
  "500k-1M": 1_000_000,
  "1M-5M": 5_000_000,
  "5M-20M": 20_000_000,
  "Acima de 20M": 50_000_000,
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

    // Update lead status to processando
    await supabase.from("leads").update({ status: "processando" }).eq("id", lead_id);

    // Fetch lead
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

    // Fetch matching benchmarks
    const { data: benchmarks } = await supabase
      .from("benchmarks_teses")
      .select("*")
      .eq("ativo", true)
      .eq("faturamento_faixa", lead.faturamento_faixa)
      .eq("segmento", lead.segmento);

    const faturamentoAnual = FATURAMENTO_VALORES[lead.faturamento_faixa] || 1_000_000;

    // Calculate estimates per thesis
    const teses = (benchmarks || []).map((b: any) => ({
      tese_nome: b.tese_nome,
      estimativa_minima: Math.round(faturamentoAnual * (b.percentual_minimo / 100)),
      estimativa_maxima: Math.round(faturamentoAnual * (b.percentual_maximo / 100)),
      percentual_minimo: b.percentual_minimo,
      percentual_maximo: b.percentual_maximo,
    }));

    const estimativa_total_minima = teses.reduce((s: number, t: any) => s + t.estimativa_minima, 0);
    const estimativa_total_maxima = teses.reduce((s: number, t: any) => s + t.estimativa_maxima, 0);

    // Score: ratio of max recovery to annual revenue, capped at 100
    const score = Math.min(100, Math.round((estimativa_total_maxima / faturamentoAnual) * 100));

    // Use AI to generate formatted HTML report
    let conteudoHtml = "";

    if (lovableApiKey && teses.length > 0) {
      const prompt = `Você é um analista tributário da Focus FinTax. Gere um relatório HTML formatado (apenas o body content, sem tags html/head/body) para o lead abaixo.

DADOS DO LEAD:
- Empresa: ${lead.empresa}
- CNPJ: ${lead.cnpj}
- Segmento: ${lead.segmento}
- Regime Tributário: ${lead.regime_tributario}
- Faturamento: ${lead.faturamento_faixa} (anual estimado: R$ ${faturamentoAnual.toLocaleString("pt-BR")})
- Pagou IRPJ últimos 5 anos: ${lead.pagou_irpj ? "Sim" : "Não"}

TESES IDENTIFICADAS:
${teses.map((t: any) => `- ${t.tese_nome}: R$ ${t.estimativa_minima.toLocaleString("pt-BR")} a R$ ${t.estimativa_maxima.toLocaleString("pt-BR")} (${t.percentual_minimo}% a ${t.percentual_maximo}%)`).join("\n")}

ESTIMATIVA TOTAL: R$ ${estimativa_total_minima.toLocaleString("pt-BR")} a R$ ${estimativa_total_maxima.toLocaleString("pt-BR")}
SCORE: ${score}/100

REGRAS:
1. Use HTML com classes inline para estilização (font-family: Montserrat; cores: #010f69 para títulos, #4a5280 para texto, #c73737 para destaques)
2. Inclua uma tabela com as teses e valores
3. NÃO inclua a tese "IPI embutido em compras" no relatório público
4. Inclua obrigatoriamente o disclaimer: "Valores estimados com base em histórico de clientes de perfil similar. A análise definitiva requer acesso aos dados fiscais do CNPJ via certificado digital."
5. Seja profissional e direto
6. Retorne APENAS o HTML, sem markdown ou explicações`;

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
          // Strip markdown code fences if present
          conteudoHtml = conteudoHtml.replace(/^```html\n?/i, "").replace(/\n?```$/i, "").trim();
        } else {
          console.error("AI error:", aiResponse.status, await aiResponse.text());
        }
      } catch (aiErr) {
        console.error("AI call failed:", aiErr);
      }
    }

    // Fallback: generate simple HTML if AI failed or no benchmarks
    if (!conteudoHtml) {
      conteudoHtml = `
        <div style="font-family: Montserrat, sans-serif; color: #4a5280;">
          <h2 style="color: #010f69;">Análise Preliminar de Teses Tributárias</h2>
          <p><strong>Empresa:</strong> ${lead.empresa} (CNPJ: ${lead.cnpj})</p>
          <p><strong>Segmento:</strong> ${lead.segmento} | <strong>Regime:</strong> ${lead.regime_tributario}</p>
          <p><strong>Faturamento Anual Estimado:</strong> R$ ${faturamentoAnual.toLocaleString("pt-BR")}</p>
          ${teses.length > 0 ? `
            <h3 style="color: #010f69; margin-top: 20px;">Teses Identificadas</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr style="background: #010f69; color: white;">
                <th style="padding: 8px; text-align: left;">Tese</th>
                <th style="padding: 8px; text-align: right;">Estimativa Mín.</th>
                <th style="padding: 8px; text-align: right;">Estimativa Máx.</th>
              </tr>
              ${teses.filter((t: any) => !t.tese_nome.toLowerCase().includes("ipi embutido")).map((t: any) => `
                <tr style="border-bottom: 1px solid #dde0f0;">
                  <td style="padding: 8px;">${t.tese_nome}</td>
                  <td style="padding: 8px; text-align: right;">R$ ${t.estimativa_minima.toLocaleString("pt-BR")}</td>
                  <td style="padding: 8px; text-align: right;">R$ ${t.estimativa_maxima.toLocaleString("pt-BR")}</td>
                </tr>
              `).join("")}
              <tr style="background: #f7f8fc; font-weight: bold;">
                <td style="padding: 8px;">TOTAL</td>
                <td style="padding: 8px; text-align: right; color: #c73737;">R$ ${estimativa_total_minima.toLocaleString("pt-BR")}</td>
                <td style="padding: 8px; text-align: right; color: #c73737;">R$ ${estimativa_total_maxima.toLocaleString("pt-BR")}</td>
              </tr>
            </table>
          ` : `<p>Nenhuma tese identificada para este perfil. Verifique os benchmarks cadastrados.</p>`}
          <p style="margin-top: 20px; font-size: 12px; color: #888; border-top: 1px solid #dde0f0; padding-top: 10px;">
            Valores estimados com base em histórico de clientes de perfil similar. A análise definitiva requer acesso aos dados fiscais do CNPJ via certificado digital.
          </p>
        </div>
      `;
    }

    // Save report
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

    // Update lead
    await supabase
      .from("leads")
      .update({ status: "relatorio_gerado", score_lead: score })
      .eq("id", lead_id);

    return new Response(
      JSON.stringify({ success: true, score, estimativa_total_minima, estimativa_total_maxima, teses_count: teses.length }),
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
