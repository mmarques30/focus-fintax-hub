

## Editar e Excluir Clientes

### Problema
Atualmente não há como editar dados de um cliente existente nem excluí-lo. A tabela `clientes` também não tem RLS policy para DELETE.

### Mudanças

**1. Migration SQL — Adicionar RLS policy de DELETE**
```sql
CREATE POLICY "Admin gestor pmo delete clientes"
ON public.clientes FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor_tributario') OR has_role(auth.uid(), 'pmo'));
```

**2. `src/components/clientes/ClienteFormModal.tsx` — Suportar modo edição**
- Aceitar prop opcional `cliente` (dados existentes) para preencher o form
- Se `cliente` fornecido: título "Editar Cliente", botão "Salvar", usar `supabase.update()` ao invés de `insert()`
- Se não fornecido: comportamento atual de criação

**3. `src/pages/ClientesList.tsx` — Botões de ação na tabela**
- Adicionar coluna "Ações" na tabela com botões Editar (ícone Pencil) e Excluir (ícone Trash2)
- Editar: abre `ClienteFormModal` com os dados do cliente preenchidos
- Excluir: abre `AlertDialog` de confirmação → executa `supabase.from("clientes").delete().eq("id", id)` → recarrega lista
- Apenas roles não-comercial veem os botões de ação
- Ao excluir, também deletar `processos_teses` e `compensacoes_mensais` associados (cascade manual, já que não há FK)

**4. `src/pages/ClienteDetail.tsx` — Botões editar/excluir no header da sidebar**
- Adicionar botão Editar (abre modal com dados) e Excluir (confirmação → delete → navega para `/clientes`)

### Arquivos alterados
1. Migration SQL (nova RLS policy DELETE)
2. `src/components/clientes/ClienteFormModal.tsx`
3. `src/pages/ClientesList.tsx`
4. `src/pages/ClienteDetail.tsx`

