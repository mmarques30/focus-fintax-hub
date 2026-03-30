import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEGMENTO_MAP: Record<string, string> = {
  "Supermercado": "supermercado",
  "Farmácia": "farmacia",
  "PET Shop": "pet",
  "Material de Construção": "materiais_construcao",
};

const FATURAMENTO_MAP: Record<string, string> = {
  "Até R$ 500 mil": "ate_2m",
  "R$ 500 mil – R$ 1M": "ate_2m",
  "R$ 1M – R$ 5M": "2m_15m",
  "R$ 5M – R$ 20M": "2m_15m",
  "Acima de R$ 20M": "acima_15m",
};

const FATURAMENTO_VALORES: Record<string, number> = {
  "ate_2m": 24_000_000,
  "2m_15m": 102_000_000,
  "acima_15m": 300_000_000,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { nome, empresa, cnpj, whatsapp, email, segmento, regime, faturamento } = body;

    if (!nome || !segmento || !faturamento) {
      return new Response(
        JSON.stringify({ error: "nome, segmento e faturamento são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const segmentoDb = SEGMENTO_MAP[segmento] || "outros";
    const faturamentoDb = FATURAMENTO_MAP[faturamento] || "ate_2m";
    const regimeDb = regime || "Simples Nacional";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert lead
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .insert({
        nome: (nome || "").slice(0, 255),
        empresa: (empresa || "").slice(0, 255),
        cnpj: (cnpj || "").replace(/\D/g, "").slice(0, 14),
        whatsapp: (whatsapp || "").replace(/\D/g, "").slice(0, 11),
        email: (email || "").slice(0, 255),
        segmento: segmentoDb,
        regime_tributario: regimeDb,
        faturamento_faixa: faturamentoDb,
        origem: "formulario_lp",
        status: "novo",
      })
      .select("id, token")
      .single();

    if (leadErr || !lead) {
      console.error("Lead insert error:", leadErr);
      return new Response(
        JSON.stringify({ error: "Falha ao salvar lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch benchmarks
    const { data: benchmarks } = await supabase
      .from("benchmarks_teses")
      .select("*")
      .eq("ativo", true)
      .eq("faturamento_faixa", faturamentoDb)
      .eq("segmento", segmentoDb);

    const faturamentoAnual = FATURAMENTO_VALORES[faturamentoDb] || 24_000_000;
    const baseMensal = faturamentoAnual / 12;

    const teses = (benchmarks || []).map((b: any) => ({
      tese_nome: b.tese_nome,
      estimativa_minima: Math.round(baseMensal * 60 * (b.percentual_minimo / 100)),
      estimativa_maxima: Math.round(baseMensal * 60 * (b.percentual_maximo / 100)),
      percentual_minimo: b.percentual_minimo,
      percentual_maximo: b.percentual_maximo,
    }));

    // Filter IPI from public totals (same logic as analyze-lead)
    const tesasPublicas = teses.filter((t: any) => !t.tese_nome.toLowerCase().includes("ipi embutido"));
    const estimativa_total_minima = tesasPublicas.reduce((s: number, t: any) => s + t.estimativa_minima, 0);
    const estimativa_total_maxima = tesasPublicas.reduce((s: number, t: any) => s + t.estimativa_maxima, 0);
    const score = Math.min(100, Math.round((estimativa_total_maxima / faturamentoAnual) * 100));

    // Insert report
    const { error: reportErr } = await supabase.from("relatorios_leads").insert({
      lead_id: lead.id,
      conteudo_html: "",
      teses_identificadas: teses,
      estimativa_total_minima,
      estimativa_total_maxima,
      score,
    });

    if (reportErr) {
      console.error("Report insert error:", reportErr);
    }

    // Update lead status
    await supabase
      .from("leads")
      .update({ status: "relatorio_gerado", score_lead: score })
      .eq("id", lead.id);

    return new Response(
      JSON.stringify({ success: true, token: lead.token }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("submit-lead-public error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
