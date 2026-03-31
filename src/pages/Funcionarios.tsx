import { useState } from "react";
import { Plus, User, Pencil, Trash2 } from "lucide-react";
import MonthFilter, { getCurrentMonth } from "@/components/MonthFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, type Funcionario } from "@/lib/mock-data";
import { useData } from "@/contexts/DataContext";

const statusColors: Record<string, string> = {
  'Ativo': 'badge-success',
  'Inativo': 'bg-muted text-muted-foreground border-border',
  'Afastado': 'badge-warning',
};

const pagamentoColors: Record<string, string> = {
  'Pago': 'badge-success',
  'Pendente': 'bg-destructive/10 text-destructive border-destructive/30',
  '-': 'bg-muted text-muted-foreground border-border',
};

const emptyForm = { nome: '', cpf: '', cargo: '', tipoContrato: '', salarioBase: '', dataAdmissao: '', status: 'Ativo', diaPagamento: '5' };

function getStatusPagamento(func: Funcionario, pagamentosMes: Record<string, boolean>, mesFiltro: string): string {
  if (func.status !== 'Ativo') return '-';
  const key = `${func.id}-${mesFiltro}`;

  if (pagamentosMes[key]) return 'Pago';

  const now = new Date();
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (mesFiltro === mesAtual) {
    const diaHoje = now.getDate();
    if (diaHoje >= func.diaPagamento) return 'Pendente';
  } else if (mesFiltro < mesAtual) {
    return 'Pendente';
  }

  return '-';
}

export default function Funcionarios() {
  const { funcList, setFuncList, pagamentosMes } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mesFiltro, setMesFiltro] = useState(getCurrentMonth());
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const ativos = funcList.filter(f => f.status === 'Ativo');
  const totalFolha = ativos.reduce((s, f) => s + f.salarioBase, 0);

  const openEdit = (f: Funcionario) => {
    setEditingId(f.id);
    setForm({ nome: f.nome, cpf: f.cpf, cargo: f.cargo, tipoContrato: f.tipoContrato, salarioBase: String(f.salarioBase), dataAdmissao: f.dataAdmissao, status: f.status, diaPagamento: String(f.diaPagamento) });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.cargo || !form.salarioBase) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome, cargo e salário.", variant: "destructive" });
      return;
    }
    if (editingId) {
      setFuncList(prev => prev.map(f => f.id === editingId ? {
        ...f,
        nome: form.nome.toUpperCase(),
        cpf: form.cpf,
        cargo: form.cargo.toUpperCase(),
        tipoContrato: (form.tipoContrato || 'Informal') as Funcionario['tipoContrato'],
        salarioBase: parseFloat(form.salarioBase) || 0,
        dataAdmissao: form.dataAdmissao || f.dataAdmissao,
        status: form.status as Funcionario['status'],
        diaPagamento: parseInt(form.diaPagamento) || 5,
      } : f));
      toast({ title: "Funcionário atualizado!", description: `${form.nome.toUpperCase()} editado.` });
    } else {
      const novo: Funcionario = {
        id: crypto.randomUUID(),
        nome: form.nome.toUpperCase(),
        cpf: form.cpf,
        cargo: form.cargo.toUpperCase(),
        tipoContrato: (form.tipoContrato || 'Informal') as Funcionario['tipoContrato'],
        salarioBase: parseFloat(form.salarioBase) || 0,
        dataAdmissao: form.dataAdmissao || new Date().toISOString().split('T')[0],
        status: 'Ativo',
        diaPagamento: parseInt(form.diaPagamento) || 5,
      };
      setFuncList(prev => [novo, ...prev]);
      toast({ title: "Funcionário cadastrado!", description: `${novo.nome} adicionado.` });
    }
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const item = funcList.find(f => f.id === deleteId);
    setFuncList(prev => prev.filter(f => f.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Funcionário excluído!", description: `${item?.nome} removido.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground text-sm">{funcList.length} funcionários cadastrados</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthFilter value={mesFiltro} onChange={setMesFiltro} />
        <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { setEditingId(null); setForm(emptyForm); } setDialogOpen(o); }}>
          <DialogTrigger asChild><Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Novo Funcionário</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="sm:col-span-2"><Label>Nome Completo *</Label><Input placeholder="Nome" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} /></div>
              <div><Label>CPF</Label><Input placeholder="000.000.000-00" value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))} /></div>
              <div><Label>Cargo *</Label><Input placeholder="Ex: Funileiro" value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))} /></div>
              <div>
                <Label>Tipo de Contrato</Label>
                <Select value={form.tipoContrato} onValueChange={v => setForm(p => ({ ...p, tipoContrato: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="Autônomo">Autônomo</SelectItem>
                    <SelectItem value="Informal">Informal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Salário Base (R$) *</Label><Input type="number" placeholder="0,00" value={form.salarioBase} onChange={e => setForm(p => ({ ...p, salarioBase: e.target.value }))} /></div>
              <div><Label>Dia de Pagamento *</Label><Input type="number" min="1" max="31" placeholder="5" value={form.diaPagamento} onChange={e => setForm(p => ({ ...p, diaPagamento: e.target.value }))} /></div>
              <div><Label>Data de Admissão</Label><Input type="date" value={form.dataAdmissao} onChange={e => setForm(p => ({ ...p, dataAdmissao: e.target.value }))} /></div>
              {editingId && (
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                      <SelectItem value="Afastado">Afastado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleSave}>{editingId ? 'Salvar Alterações' : 'Cadastrar'}</Button>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="stat-card"><p className="text-xs text-muted-foreground">Total da Folha</p><p className="text-xl font-bold text-primary mt-1">{formatCurrency(totalFolha)}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Funcionários Ativos</p><p className="text-xl font-bold text-success mt-1">{ativos.length}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Média Salarial</p><p className="text-xl font-bold text-info mt-1">{formatCurrency(ativos.length > 0 ? totalFolha / ativos.length : 0)}</p></div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead className="text-right">Salário Base</TableHead>
                <TableHead className="text-center">Dia Pgto</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Pagamento</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcList.map(f => {
                const statusPgto = getStatusPagamento(f, pagamentosMes, mesFiltro);
                return (
                  <TableRow key={f.id} className="border-border">
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"><User className="w-3.5 h-3.5 text-muted-foreground" /></div>
                      {f.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{f.cpf}</TableCell>
                    <TableCell>{f.cargo}</TableCell>
                    <TableCell className="text-muted-foreground">{f.tipoContrato}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(f.salarioBase)}</TableCell>
                    <TableCell className="text-center text-muted-foreground">Dia {f.diaPagamento}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(f.dataAdmissao)}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[f.status]}>{f.status}</Badge></TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={pagamentoColors[statusPgto]}>{statusPgto === '-' ? 'Aguardando' : statusPgto}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(f)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(f.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.</AlertDialogDescription>
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