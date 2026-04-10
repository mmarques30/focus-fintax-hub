import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "informado_aline", label: "Informado Aline" },
  { value: "retificacao_feita", label: "Retificação Feita" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

const formSchema = z.object({
  empresa_nome: z.string().trim().min(1, "Empresa é obrigatória").max(200),
  data_intimacao: z.date().nullable().optional(),
  motivo: z.string().trim().min(1, "Motivo é obrigatório").max(500),
  prazo_dias: z.coerce.number().int().min(1).max(999).default(75),
  status: z.string().min(1),
  proximo_passo: z.string().max(500).nullable().optional(),
  observacoes: z.string().max(2000).nullable().optional(),
  cliente_id: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  intimacao?: any;
  onSuccess: () => void;
}

export function IntimacaoFormModal({ open, onOpenChange, intimacao, onSuccess }: Props) {
  const [clientes, setClientes] = useState<{ id: string; empresa: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const isEdit = !!intimacao;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa_nome: "",
      data_intimacao: null,
      motivo: "",
      prazo_dias: 75,
      status: "pendente",
      proximo_passo: "",
      observacoes: "",
      cliente_id: null,
    },
  });

  useEffect(() => {
    if (open) {
      supabase.from("clientes").select("id, empresa").order("empresa").then(({ data }) => {
        if (data) setClientes(data);
      });
      if (intimacao) {
        form.reset({
          empresa_nome: intimacao.empresa_nome,
          data_intimacao: intimacao.data_intimacao ? new Date(intimacao.data_intimacao) : null,
          motivo: intimacao.motivo,
          prazo_dias: intimacao.prazo_dias ?? 75,
          status: intimacao.status,
          proximo_passo: intimacao.proximo_passo ?? "",
          observacoes: intimacao.observacoes ?? "",
          cliente_id: intimacao.cliente_id ?? null,
        });
      } else {
        form.reset({ empresa_nome: "", data_intimacao: null, motivo: "", prazo_dias: 75, status: "pendente", proximo_passo: "", observacoes: "", cliente_id: null });
      }
    }
  }, [open, intimacao]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const payload = {
      empresa_nome: values.empresa_nome,
      data_intimacao: values.data_intimacao ? format(values.data_intimacao, "yyyy-MM-dd") : null,
      motivo: values.motivo,
      prazo_dias: values.prazo_dias,
      status: values.status,
      proximo_passo: values.proximo_passo || null,
      observacoes: values.observacoes || null,
      cliente_id: values.cliente_id || null,
    };

    const { error } = isEdit
      ? await supabase.from("intimacoes").update(payload).eq("id", intimacao.id)
      : await supabase.from("intimacoes").insert(payload);

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar intimação");
      return;
    }
    toast.success(isEdit ? "Intimação atualizada" : "Intimação criada");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Intimação" : "Nova Intimação"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="empresa_nome" render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="data_intimacao" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Intimação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="prazo_dias" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo (dias)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="motivo" render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo *</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="proximo_passo" render={({ field }) => (
              <FormItem>
                <FormLabel>Próximo Passo</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="cliente_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Vincular Cliente</FormLabel>
                <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.empresa}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="observacoes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl><Textarea rows={3} {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : isEdit ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
