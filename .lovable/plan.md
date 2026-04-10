

## Criar tabela `intimacoes` — Ajustes necessários

O SQL enviado precisa de 3 adaptações para funcionar corretamente neste projeto:

### 1. RLS policies usam função inexistente
O SQL usa `get_my_role()` que **não existe** no banco. O projeto usa `has_role(auth.uid(), 'role'::app_role)`. As policies serão reescritas com o padrão correto.

### 2. CHECK constraint → validation trigger
Conforme guidelines do projeto, CHECK constraints causam problemas com restauração de backups. O `CHECK (status IN (...))` será substituído por um trigger de validação.

### 3. Coluna gerada `prazo_vencimento`
A coluna `GENERATED ALWAYS AS (data_intimacao + prazo_dias) STORED` é válida no Postgres, mas precisa que ambas as colunas de entrada sejam NOT NULL para funcionar de forma útil. Vou manter como está (aceita nulos, retorna null quando inputs são null).

---

### Migration SQL final

```sql
-- Tabela intimacoes
CREATE TABLE IF NOT EXISTS public.intimacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  empresa_nome text NOT NULL,
  data_intimacao date,
  motivo text NOT NULL,
  prazo_dias int DEFAULT 75,
  prazo_vencimento date GENERATED ALWAYS AS (data_intimacao + prazo_dias) STORED,
  status text NOT NULL DEFAULT 'pendente',
  proximo_passo text,
  observacoes text,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger (substitui CHECK constraint)
CREATE OR REPLACE FUNCTION public.validate_intimacao_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pendente','informado_aline','retificacao_feita','em_andamento','concluido','cancelado') THEN
    RAISE EXCEPTION 'Status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_intimacao_status
  BEFORE INSERT OR UPDATE ON public.intimacoes
  FOR EACH ROW EXECUTE FUNCTION public.validate_intimacao_status();

-- updated_at trigger
CREATE TRIGGER trg_intimacoes_updated_at
  BEFORE UPDATE ON public.intimacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.intimacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intimacoes_admin_pmo_gestor" ON public.intimacoes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'pmo'::app_role) 
      OR has_role(auth.uid(), 'gestor_tributario'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) 
           OR has_role(auth.uid(), 'pmo'::app_role) 
           OR has_role(auth.uid(), 'gestor_tributario'::app_role));

CREATE POLICY "intimacoes_comercial_read" ON public.intimacoes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'comercial'::app_role));
```

### Após a migration

Nenhuma tela ou componente de UI será criado neste momento — apenas a estrutura do banco. Se quiser, posso criar a tela de gestão de intimações na sequência.

### Arquivos modificados
1. Nova migration SQL (via migration tool)

