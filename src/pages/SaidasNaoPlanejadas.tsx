import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/mock-data";
import { useData, type SaidaNaoPlanejada } from "@/contexts/DataContext";

type TipoSaida = 'Peça' | 'Terceiro' | 'Outros' | 'Folha de pagamento';
const emptyForm = { descricao: '', valor: '', formaPagamento: 'PIX', data: '', observacao: '', tipo: 'Outros' as TipoSaida, osVinculadaId: '', funcionarioId: '' };

export default function SaidasNaoPlanejadas() {
  const { saidasList, setSaidasList, osList } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const total = saidasList.reduce((s, item) => s + item.valor, 0);
  const needsOS = form.tipo === 'Peça' || form.tipo === 'Terceiro';

  const openEdit = (s: SaidaNaoPlanejada) => {
    setEditingId(s.id);
    setForm({ descricao: s.descricao, valor: String(s.valor), formaPagamento: s.formaPagamento, data: s.data, observacao: s.observacao || '', tipo: s.tipo, osVinculadaId: s.osVinculadaId || '' });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.descricao || !form.valor) {
      toast({ title: "Campos obrigatórios", description: "Preencha descrição e valor.", variant: "destructive" });
      return;
    }
    if (needsOS && !form.osVinculadaId) {
      toast({ title: "Veículo obrigatório", description: "Selecione o veículo/OS vinculado.", variant: "destructive" });
      return;
    }
    if (editingId) {
      setSaidasList(prev => prev.map(s => s.id === editingId ? {
        ...s,
        descricao: form.descricao.toUpperCase(),
        valor: parseFloat(form.valor) || 0,
        formaPagamento: form.formaPagamento,
        data: form.data || s.data,
        observacao: form.observacao || undefined,
        tipo: form.tipo as SaidaNaoPlanejada['tipo'],
        osVinculadaId: needsOS ? form.osVinculadaId : undefined,
      } : s));
      toast({ title: "Saída atualizada!", description: `${form.descricao.toUpperCase()} editada.` });
    } else {
      const nova: SaidaNaoPlanejada = {
        id: crypto.randomUUID(),
        descricao: form.descricao.toUpperCase(),
        valor: parseFloat(form.valor) || 0,
        formaPagamento: form.formaPagamento,
        data: form.data || new Date().toISOString().split('T')[0],
        observacao: form.observacao || undefined,
        tipo: form.tipo as SaidaNaoPlanejada['tipo'],
        osVinculadaId: needsOS ? form.osVinculadaId : undefined,
      };
      setSaidasList(prev => [nova, ...prev]);
      toast({ title: "Saída registrada!", description: `${nova.descricao} — ${formatCurrency(nova.valor)}` });
    }
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const item = saidasList.find(s => s.id === deleteId);
    setSaidasList(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Saída excluída!", description: `${item?.descricao} removida.` });
  };

  const getOSLabel = (osId: string) => {
    const os = osList.find(o => o.id === osId);
    return os ? `OS #${os.numero} — ${os.placa || 'S/ placa'} | ${os.modelo} ${os.ano} ${os.cor} ${os.cliente ? `| ${os.cliente}` : ''} | ${os.tipoServico}` : '—';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saídas Não Planejadas</h1>
          <p className="text-muted-foreground text-sm">Despesas avulsas e emergenciais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { setEditingId(null); setForm(emptyForm); } setDialogOpen(o); }}>
          <DialogTrigger asChild><Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Nova Saída</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Editar Saída' : 'Registrar Saída Não Planejada'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 mt-4">
              <div><Label>Descrição *</Label><Input placeholder="Ex: Compra emergencial de peça" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} /></div>
              <div><Label>Valor (R$) *</Label><Input type="number" placeholder="0,00" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} /></div>
              <div>
                <Label>Tipo de Saída *</Label>
                <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v as SaidaNaoPlanejada['tipo'], osVinculadaId: '' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Peça">Peça</SelectItem>
                    <SelectItem value="Terceiro">Terceiro</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {needsOS && (
                <div>
                  <Label>Veículo / OS vinculada *</Label>
                  <Select value={form.osVinculadaId} onValueChange={v => setForm(p => ({ ...p, osVinculadaId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione a OS" /></SelectTrigger>
                    <SelectContent>
                      {osList.map(os => (
                        <SelectItem key={os.id} value={os.id}>
                          OS #{os.numero} — {os.placa || 'S/ placa'} | {os.modelo} {os.ano} {os.cor} {os.cliente ? `| ${os.cliente}` : ''} | {os.tipoServico}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={form.formaPagamento} onValueChange={v => setForm(p => ({ ...p, formaPagamento: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Data</Label><Input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} /></div>
              <div><Label>Observação</Label><Textarea placeholder="Detalhes adicionais..." value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))} /></div>
            </div>
            <Button className="w-full mt-4" onClick={handleSave}>{editingId ? 'Salvar Alterações' : 'Registrar Saída'}</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="stat-card"><p className="text-xs text-muted-foreground">Total de Saídas</p><p className="text-xl font-bold text-destructive mt-1">{formatCurrency(total)}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Peças + Terceiros</p><p className="text-xl font-bold text-foreground mt-1">{formatCurrency(saidasList.filter(s => s.tipo === 'Peça' || s.tipo === 'Terceiro').reduce((a, b) => a + b.valor, 0))}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Registros</p><p className="text-xl font-bold text-foreground mt-1">{saidasList.length}</p></div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Veículo/OS</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saidasList.map(s => (
                <TableRow key={s.id} className="border-border">
                  <TableCell className="text-muted-foreground text-sm">{formatDate(s.data)}</TableCell>
                  <TableCell className="font-medium">{s.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={s.tipo === 'Peça' ? 'default' : s.tipo === 'Terceiro' ? 'secondary' : 'outline'}>{s.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{s.osVinculadaId ? getOSLabel(s.osVinculadaId) : '—'}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">{formatCurrency(s.valor)}</TableCell>
                  <TableCell><Badge variant="outline">{s.formaPagamento}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.observacao || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir esta saída? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
