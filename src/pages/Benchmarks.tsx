import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Shield, Database } from "lucide-react";
import { FATURAMENTO_FAIXAS, SEGMENTOS } from "@/lib/lead-constants";

interface Benchmark {
  id: string;
  tese_nome: string;
  faturamento_faixa: string;
  segmento: string;
  percentual_minimo: number;
  percentual_maximo: number;
  ativo: boolean;
  atualizado_em: string;
}

export default function Benchmarks() {
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const [items, setItems] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Benchmark | null>(null);

  const [formTese, setFormTese] = useState("");
  const [formFaixa, setFormFaixa] = useState("");
  const [formSegmento, setFormSegmento] = useState("");
  const [formMin, setFormMin] = useState("");
  const [formMax, setFormMax] = useState("");
  const [formAtivo, setFormAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("benchmarks_teses")
      .select("*")
      .order("tese_nome");
    if (error) toast.error("Erro ao carregar benchmarks");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => {
    setEditItem(null);
    setFormTese("");
    setFormFaixa("");
    setFormSegmento("");
    setFormMin("");
    setFormMax("");
    setFormAtivo(true);
    setDialogOpen(true);
  };

  const openEdit = (b: Benchmark) => {
    setEditItem(b);
    setFormTese(b.tese_nome);
    setFormFaixa(b.faturamento_faixa);
    setFormSegmento(b.segmento);
    setFormMin(String(b.percentual_minimo));
    setFormMax(String(b.percentual_maximo));
    setFormAtivo(b.ativo);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTese || !formFaixa || !formSegmento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const min = parseFloat(formMin);
    const max = parseFloat(formMax);
    if (isNaN(min) || isNaN(max) || min < 0 || max < 0 || max < min) {
      toast.error("Percentuais inválidos");
      return;
    }

    setSaving(true);
    const payload = {
      tese_nome: formTese.trim(),
      faturamento_faixa: formFaixa,
      segmento: formSegmento,
      percentual_minimo: min,
      percentual_maximo: max,
      ativo: formAtivo,
      atualizado_em: new Date().toISOString(),
    };

    if (editItem) {
      const { error } = await supabase.from("benchmarks_teses").update(payload).eq("id", editItem.id);
      if (error) toast.error("Erro ao atualizar");
      else toast.success("Benchmark atualizado!");
    } else {
      const { error } = await supabase.from("benchmarks_teses").insert(payload);
      if (error) toast.error("Erro ao criar");
      else toast.success("Benchmark criado!");
    }

    setSaving(false);
    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("benchmarks_teses").delete().eq("id", id);
    toast.success("Benchmark removido");
    fetchItems();
  };

  const handleToggle = async (b: Benchmark) => {
    await supabase.from("benchmarks_teses").update({ ativo: !b.ativo, atualizado_em: new Date().toISOString() }).eq("id", b.id);
    fetchItems();
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-xl font-bold text-navy">Benchmarks de Teses</h1>
        <Card className="border-card-border">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium text-muted-foreground">Apenas administradores podem gerenciar benchmarks.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-navy">Benchmarks de Teses</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">percentuais históricos para estimativas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Novo Benchmark
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {editItem ? "Editar Benchmark" : "Novo Benchmark"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="font-semibold">Nome da Tese *</Label>
                <Input value={formTese} onChange={(e) => setFormTese(e.target.value)} placeholder="Ex: Subvenção ICMS" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Faixa de Faturamento *</Label>
                <Select value={formFaixa} onValueChange={setFormFaixa}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {FATURAMENTO_FAIXAS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Segmento *</Label>
                <Select value={formSegmento} onValueChange={setFormSegmento}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {SEGMENTOS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">% Mínimo</Label>
                  <Input type="number" step="0.01" value={formMin} onChange={(e) => setFormMin(e.target.value)} placeholder="0.5" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">% Máximo</Label>
                  <Input type="number" step="0.01" value={formMax} onChange={(e) => setFormMax(e.target.value)} placeholder="2.0" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formAtivo} onCheckedChange={setFormAtivo} />
                <Label className="font-semibold">Ativo</Label>
              </div>
              <Button onClick={handleSave} className="w-full font-bold" disabled={saving}>
                {saving ? "Salvando..." : editItem ? "Salvar alterações" : "Criar benchmark"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Base de Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Tese</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Faixa</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Segmento</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">% Mín</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">% Máx</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs">Ativo</TableHead>
                  <TableHead className="font-semibold uppercase tracking-wider text-xs text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum benchmark cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-semibold text-foreground">{b.tese_nome}</TableCell>
                      <TableCell className="text-muted-foreground">{b.faturamento_faixa}</TableCell>
                      <TableCell className="text-muted-foreground">{b.segmento}</TableCell>
                      <TableCell className="text-muted-foreground">{b.percentual_minimo}%</TableCell>
                      <TableCell className="text-muted-foreground">{b.percentual_maximo}%</TableCell>
                      <TableCell>
                        <Switch checked={b.ativo} onCheckedChange={() => handleToggle(b)} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                          <Trash2 className="h-4 w-4 text-secondary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
