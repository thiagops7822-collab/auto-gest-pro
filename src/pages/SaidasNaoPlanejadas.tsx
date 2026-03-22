import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/mock-data";
import { useData, type SaidaNaoPlanejada } from "@/contexts/DataContext";

const emptyForm = { descricao: '', valor: '', formaPagamento: 'PIX', data: '', observacao: '' };

export default function SaidasNaoPlanejadas() {
  const { saidasList, setSaidasList } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const total = saidasList.reduce((s, item) => s + item.valor, 0);

  const handleCreate = () => {
    if (!form.descricao || !form.valor) {
      toast({ title: "Campos obrigatórios", description: "Preencha descrição e valor.", variant: "destructive" });
      return;
    }
    const nova: SaidaNaoPlanejada = {
      id: crypto.randomUUID(),
      descricao: form.descricao.toUpperCase(),
      valor: parseFloat(form.valor) || 0,
      formaPagamento: form.formaPagamento,
      data: form.data || new Date().toISOString().split('T')[0],
      observacao: form.observacao || undefined,
    };
    setSaidasList(prev => [nova, ...prev]);
    setForm(emptyForm);
    setDialogOpen(false);
    toast({ title: "Saída registrada!", description: `${nova.descricao} — ${formatCurrency(nova.valor)}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saídas Não Planejadas</h1>
          <p className="text-muted-foreground text-sm">Despesas avulsas e emergenciais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Nova Saída</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Saída Não Planejada</DialogTitle></DialogHeader>
            <div className="grid gap-4 mt-4">
              <div><Label>Descrição *</Label><Input placeholder="Ex: Compra emergencial de peça" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} /></div>
              <div><Label>Valor (R$) *</Label><Input type="number" placeholder="0,00" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} /></div>
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={form.formaPagamento} onValueChange={v => setForm(p => ({ ...p, formaPagamento: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Data</Label><Input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} /></div>
              <div><Label>Observação</Label><Textarea placeholder="Detalhes adicionais..." value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))} /></div>
            </div>
            <Button className="w-full mt-4" onClick={handleCreate}>Registrar Saída</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Total de Saídas</p>
          <p className="text-xl font-bold text-destructive mt-1">{formatCurrency(total)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground">Quantidade de Registros</p>
          <p className="text-xl font-bold text-foreground mt-1">{saidasList.length}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saidasList.map(s => (
                <TableRow key={s.id} className="border-border">
                  <TableCell className="text-muted-foreground text-sm">{formatDate(s.data)}</TableCell>
                  <TableCell className="font-medium">{s.descricao}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">{formatCurrency(s.valor)}</TableCell>
                  <TableCell><Badge variant="outline">{s.formaPagamento}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.observacao || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
