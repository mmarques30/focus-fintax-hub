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
  "Até R$ 500 mil": "ate_500k",
  "R$ 500 mil – R$ 1M": "500k_2m",
  "R$ 500 mil – R$ 2M": "500k_2m",
  "R$ 1M – R$ 5M": "2m_5m",
  "R$ 2M – R$ 5M": "2m_5m",
  "R$ 5M – R$ 15M": "5m_15m",
  "R$ 5M – R$ 20M": "5m_15m",
  "Acima de R$ 15M": "acima_15m",
  "Acima de R$ 20M": "acima_15m",
};

const REGIME_MAP: Record<string, string> = {
  "Simples Nacional": "simples",
  "Lucro Presumido": "lucro_presumido",
  "Lucro Real": "lucro_real",
};

const FATURAMENTO_MIDPOINTS: Record<string, number> = {
  "ate_500k": 250_000,
  "500k_2m": 1_250_000,
  "2m_5m": 3_500_000,
  "5m_15m": 10_000_000,
  "acima_15m": 20_000_000,
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
    const faturamentoDb = FATURAMENTO_MAP[faturamento] || "ate_500k";
    const regimeDb = regime || "Simples Nacional";
    const regimeKey = REGIME_MAP[regimeDb] || "simples";

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

    // Fetch eligible teses from motor_teses_config
    const { data: motorTeses } = await supabase
      .from("motor_teses_config")
      .select("*")
      .eq("ativo", true)
      .contains("regimes_elegiveis", [regimeKey])
      .contains("segmentos_elegiveis", [segmentoDb])
      .order("ordem_exibicao", { ascending: true });

    const faturamentoMensal = FATURAMENTO_MIDPOINTS[faturamentoDb] || 1_000_000;

    const teses = (motorTeses || []).map((t: any) => ({
      tese_nome: t.nome_exibicao,
      descricao_comercial: t.descricao_comercial || "",
      ordem_exibicao: t.ordem_exibicao || 0,
      estimativa_minima: Math.round(faturamentoMensal * 60 * t.percentual_min),
      estimativa_maxima: Math.round(faturamentoMensal * 60 * t.percentual_max),
      percentual_minimo: Number(t.percentual_min),
      percentual_maximo: Number(t.percentual_max),
    }));

    const estimativa_total_minima = teses.reduce((s: number, t: any) => s + t.estimativa_minima, 0);
    const estimativa_total_maxima = teses.reduce((s: number, t: any) => s + t.estimativa_maxima, 0);
    const faturamentoAnual = faturamentoMensal * 12;
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
