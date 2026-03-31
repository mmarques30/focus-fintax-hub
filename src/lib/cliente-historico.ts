import { supabase } from "@/integrations/supabase/client";

export async function logClienteHistorico(
  clienteId: string,
  tipo: string,
  descricao: string,
  valorAnterior?: any,
  valorNovo?: any
) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("cliente_historico" as any).insert({
    cliente_id: clienteId,
    tipo,
    descricao,
    valor_anterior: valorAnterior ?? null,
    valor_novo: valorNovo ?? null,
    usuario_id: user?.id ?? null,
  });
}
