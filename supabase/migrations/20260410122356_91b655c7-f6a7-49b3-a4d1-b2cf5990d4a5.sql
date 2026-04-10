-- Add FK for cliente_historico.cliente_id -> clientes.id
ALTER TABLE public.cliente_historico
  ADD CONSTRAINT fk_cliente_historico_cliente
  FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;

-- Add FK for cliente_historico.usuario_id -> auth.users(id)
ALTER TABLE public.cliente_historico
  ADD CONSTRAINT fk_cliente_historico_usuario
  FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add FK for lead_historico.lead_id -> leads.id
ALTER TABLE public.lead_historico
  ADD CONSTRAINT fk_lead_historico_lead
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

-- Add FK for lead_historico.criado_por -> auth.users(id)
ALTER TABLE public.lead_historico
  ADD CONSTRAINT fk_lead_historico_usuario
  FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE SET NULL;