import { useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, FileDown, ArrowRightLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, type OrdemServico } from "@/lib/mock-data";
import { useData, type Orcamento } from "@/contexts/DataContext";
import { exportOrcamentoPDF } from "@/lib/pdf-orcamento";

const statusColors: Record<string, string> = {
  'Pendente': 'badge-warning',
  'Aprovado': 'badge-success',
  'Recusado': 'badge-danger',
  'Convertido': 'bg-muted text-muted-foreground border-border',
};

const emptyForm = {
  placa: '', modelo: '', ano: '', cor: '', cliente: '', telefone: '',
  tipoServico: '', descricao: '', valorServico: '', valorPecas: '',
  valorTerceiros: '', observacoes: '', validade: '',
};

export default function Orcamentos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedOrc, setSelectedOrc] = useState<Orcamento | null>(null);
  const { orcamentosList, setOrcamentosList, osList, setOsList } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingOrc, setEditingOrc] = useState<Orcamento | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleteOrc, setDeleteOrc] = useState<Orcamento | null>(null);
  const [convertOrc, setConvertOrc] = useState<Orcamento | null>(null);
  const { toast } = useToast();

  const filtered = orcamentosList.filter(orc => {
    const matchSearch = orc.placa.toLowerCase().includes(search.toLowerCase()) ||
      orc.cliente.toLowerCase().includes(search.toLowerCase()) ||
      orc.numero.toString().includes(search);
    const matchStatus = statusFilter === "todos" || orc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: field === 'tipoServico' ? value : value.toUpperCase() }));

  const handleEditChange = (field: string, value: string) =>
    setEditForm(prev => ({ ...prev, [field]: field === 'tipoServico' ? value : value.toUpperCase() }));

  const getValorTotal = (f: typeof form) => {
    return (parseFloat(f.valorServico) || 0) + (parseFloat(f.valorPecas) || 0) + (parseFloat(f.valorTerceiros) || 0);
  };

  const getDefaultValidade = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const handleCreate = () => {
    if (!form.modelo || !form.valorServico) {
      toast({ title: "Campos obrigatórios", description: "Preencha modelo e valor do serviço.", variant: "destructive" });
      return;
    }
    const nextNumero = Math.max(...orcamentosList.map(o => o.numero), 0) + 1;
    const newOrc: Orcamento = {
      id: crypto.randomUUID(),
      numero: nextNumero,
      dataCriacao: new Date().toISOString().split('T')[0],
      validade: form.validade || getDefaultValidade(),
      placa: form.placa,
      modelo: form.modelo,
      ano: form.ano,
      cor: form.cor,
      cliente: form.cliente,
      telefone: form.telefone,
      tipoServico: form.tipoServico || 'Reparo Geral',
      descricao: form.descricao,
      valorServico: parseFloat(form.valorServico) || 0,
      valorPecas: parseFloat(form.valorPecas) || 0,
      valorTerceiros: parseFloat(form.valorTerceiros) || 0,
      observacoes: form.observacoes,
      status: 'Pendente',
    };
    setOrcamentosList(prev => [newOrc, ...prev]);
    setForm(emptyForm);
    setDialogOpen(false);
    toast({ title: "Orçamento criado!", description: `Orçamento #${nextNumero} cadastrado.` });
  };

  const handleStartEdit = (orc: Orcamento) => {
    setEditingOrc(orc);
    setEditForm({
      placa: orc.placa, modelo: orc.modelo, ano: orc.ano, cor: orc.cor,
      cliente: orc.cliente, telefone: orc.telefone, tipoServico: orc.tipoServico,
      descricao: orc.descricao, valorServico: orc.valorServico.toString(),
      valorPecas: orc.valorPecas > 0 ? orc.valorPecas.toString() : '',
      valorTerceiros: orc.valorTerceiros > 0 ? orc.valorTerceiros.toString() : '',
      observacoes: orc.observacoes, validade: orc.validade,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingOrc || !editForm.modelo || !editForm.valorServico) {
      toast({ title: "Campos obrigatórios", description: "Preencha modelo e valor do serviço.", variant: "destructive" });
      return;
    }
    setOrcamentosList(prev => prev.map(orc => orc.id === editingOrc.id ? {
      ...orc, placa: editForm.placa, modelo: editForm.modelo, ano: editForm.ano,
      cor: editForm.cor, cliente: editForm.cliente, telefone: editForm.telefone,
      tipoServico: editForm.tipoServico, descricao: editForm.descricao,
      valorServico: parseFloat(editForm.valorServico) || 0,
      valorPecas: parseFloat(editForm.valorPecas) || 0,
      valorTerceiros: parseFloat(editForm.valorTerceiros) || 0,
      observacoes: editForm.observacoes,
      validade: editForm.validade || orc.validade,
    } : orc));
    setEditDialogOpen(false);
    setEditingOrc(null);
    toast({ title: "Orçamento atualizado!" });
  };

  const handleDelete = () => {
    if (!deleteOrc) return;
    setOrcamentosList(prev => prev.filter(o => o.id !== deleteOrc.id));
    setDeleteOrc(null);
    toast({ title: "Orçamento excluído." });
  };

  const handleConvertToOS = () => {
    if (!convertOrc) return;
    const nextNumero = Math.max(...osList.map(o => o.numero), 1000) + 1;
    const newOS: OrdemServico = {
      id: crypto.randomUUID(),
      numero: nextNumero,
      dataEntrada: new Date().toISOString().split('T')[0],
      placa: convertOrc.placa,
      modelo: convertOrc.modelo,
      ano: convertOrc.ano,
      cor: convertOrc.cor,
      cliente: convertOrc.cliente,
      telefone: convertOrc.telefone,
      tipoServico: convertOrc.tipoServico,
      descricao: convertOrc.descricao,
      valorOrcado: convertOrc.valorServico,
      status: 'Em Andamento',
      pecas: [],
      pagamentos: [],
    };
    if (convertOrc.valorPecas > 0) {
      newOS.pecas.push({ id: crypto.randomUUID(), descricao: 'PEÇAS (ORÇAMENTO)', fornecedor: 'DIVERSOS', valor: convertOrc.valorPecas, data: new Date().toISOString().split('T')[0], status: 'Solicitado' });
    }
    if (convertOrc.valorTerceiros > 0) {
      newOS.pecas.push({ id: crypto.randomUUID(), descricao: 'SERVIÇOS DE TERCEIROS (ORÇAMENTO)', fornecedor: 'TERCEIROS', valor: convertOrc.valorTerceiros, data: new Date().toISOString().split('T')[0], status: 'Solicitado' });
    }
    setOsList(prev => [newOS, ...prev]);
    setOrcamentosList(prev => prev.map(o => o.id === convertOrc.id ? { ...o, status: 'Convertido' as const } : o));
    setConvertOrc(null);
    toast({ title: "Orçamento convertido em OS!", description: `Ordem de Serviço #${nextNumero} criada com sucesso.` });
  };

  const handleStatusChange = (id: string, newStatus: Orcamento['status']) => {
    setOrcamentosList(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    toast({ title: `Status alterado para "${newStatus}"` });
  };

  const tipoServicoOptions = ['Martelinho de Ouro', 'Higienização', 'Polimento', 'Reparo Geral', 'Funilaria', 'Pintura', 'Estética', 'Combinado'];

  const renderFormFields = (f: typeof form, onChange: (field: string, value: string) => void, isEdit = false) => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Placa</Label><Input value={f.placa} onChange={e => onChange('placa', e.target.value)} placeholder="ABC-1234" /></div>
        <div><Label>Modelo *</Label><Input value={f.modelo} onChange={e => onChange('modelo', e.target.value)} placeholder="Ex: Honda Civic" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Ano</Label><Input value={f.ano} onChange={e => onChange('ano', e.target.value)} placeholder="2023" /></div>
        <div><Label>Cor</Label><Input value={f.cor} onChange={e => onChange('cor', e.target.value)} placeholder="Prata" /></div>
        <div>
          <Label>Tipo de Serviço</Label>
          <Select value={f.tipoServico} onValueChange={v => onChange('tipoServico', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{tipoServicoOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Cliente</Label><Input value={f.cliente} onChange={e => onChange('cliente', e.target.value)} placeholder="Nome do cliente" /></div>
        <div><Label>Telefone</Label><Input value={f.telefone} onChange={e => onChange('telefone', e.target.value)} placeholder="(11) 99999-9999" /></div>
      </div>
      <div><Label>Descrição do Serviço</Label><Textarea value={f.descricao} onChange={e => onChange('descricao', e.target.value)} placeholder="Descreva o serviço" /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Valor Serviço *</Label><Input type="number" value={f.valorServico} onChange={e => onChange('valorServico', e.target.value)} placeholder="0,00" /></div>
        <div><Label>Valor Peças</Label><Input type="number" value={f.valorPecas} onChange={e => onChange('valorPecas', e.target.value)} placeholder="0,00" /></div>
        <div><Label>Valor Terceiros</Label><Input type="number" value={f.valorTerceiros} onChange={e => onChange('valorTerceiros', e.target.value)} placeholder="0,00" /></div>
      </div>
      <div className="text-right text-sm font-semibold text-foreground">
        Valor Total: {formatCurrency(getValorTotal(f))}
      </div>
      <div><Label>Validade</Label><Input type="date" value={f.validade} onChange={e => onChange('validade', e.target.value)} /></div>
      <div><Label>Observações</Label><Textarea value={f.observacoes} onChange={e => onChange('observacoes', e.target.value)} placeholder="Observações adicionais" /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Orçamentos</h2>
          <p className="text-muted-foreground">Gerencie seus orçamentos e converta em OS</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(emptyForm)}><Plus className="mr-2 h-4 w-4" />Novo Orçamento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Novo Orçamento</DialogTitle></DialogHeader>
            {renderFormFields(form, handleChange)}
            <Button onClick={handleCreate} className="w-full">Criar Orçamento</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por placa, cliente ou número..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Aprovado">Aprovado</SelectItem>
            <SelectItem value="Recusado">Recusado</SelectItem>
            <SelectItem value="Convertido">Convertido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum orçamento encontrado</TableCell></TableRow>
            ) : filtered.map(orc => {
              const valorTotal = orc.valorServico + orc.valorPecas + orc.valorTerceiros;
              return (
                <TableRow key={orc.id}>
                  <TableCell className="font-mono font-bold">{orc.numero}</TableCell>
                  <TableCell>
                    <div className="font-medium">{orc.cliente || '—'}</div>
                    <div className="text-xs text-muted-foreground">{orc.telefone}</div>
                  </TableCell>
                  <TableCell>
                    <div>{orc.modelo}</div>
                    <div className="text-xs text-muted-foreground">{orc.placa} • {orc.cor}</div>
                  </TableCell>
                  <TableCell>{orc.tipoServico}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(valorTotal)}</TableCell>
                  <TableCell>
                    {orc.status === 'Convertido' ? (
                      <Badge className={statusColors[orc.status]}>{orc.status}</Badge>
                    ) : (
                      <Select value={orc.status} onValueChange={(v) => handleStatusChange(orc.id, v as Orcamento['status'])}>
                        <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Aprovado">Aprovado</SelectItem>
                          <SelectItem value="Recusado">Recusado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(orc.dataCriacao)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrc(orc)} title="Detalhes"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => exportOrcamentoPDF(orc)} title="Exportar PDF"><FileDown className="h-4 w-4" /></Button>
                      {orc.status !== 'Convertido' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConvertOrc(orc)} title="Converter em OS"><ArrowRightLeft className="h-4 w-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(orc)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteOrc(orc)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrc} onOpenChange={() => setSelectedOrc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Orçamento #{selectedOrc?.numero}</DialogTitle></DialogHeader>
          {selectedOrc && (() => {
            const valorTotal = selectedOrc.valorServico + selectedOrc.valorPecas + selectedOrc.valorTerceiros;
            return (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">Cliente:</span> {selectedOrc.cliente || '—'}</div>
                  <div><span className="font-semibold">Telefone:</span> {selectedOrc.telefone || '—'}</div>
                  <div><span className="font-semibold">Veículo:</span> {selectedOrc.modelo}</div>
                  <div><span className="font-semibold">Placa:</span> {selectedOrc.placa || '—'}</div>
                  <div><span className="font-semibold">Ano:</span> {selectedOrc.ano || '—'}</div>
                  <div><span className="font-semibold">Cor:</span> {selectedOrc.cor || '—'}</div>
                  <div><span className="font-semibold">Tipo:</span> {selectedOrc.tipoServico}</div>
                  <div><span className="font-semibold">Status:</span> <Badge className={statusColors[selectedOrc.status]}>{selectedOrc.status}</Badge></div>
                  <div><span className="font-semibold">Data:</span> {formatDate(selectedOrc.dataCriacao)}</div>
                  <div><span className="font-semibold">Validade:</span> {formatDate(selectedOrc.validade)}</div>
                </div>
                {selectedOrc.descricao && (
                  <div><span className="font-semibold text-sm">Descrição:</span><p className="text-sm text-muted-foreground mt-1">{selectedOrc.descricao}</p></div>
                )}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span>Serviço:</span><span>{formatCurrency(selectedOrc.valorServico)}</span></div>
                  <div className="flex justify-between text-sm"><span>Peças:</span><span>{formatCurrency(selectedOrc.valorPecas)}</span></div>
                  <div className="flex justify-between text-sm"><span>Terceiros:</span><span>{formatCurrency(selectedOrc.valorTerceiros)}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold"><span>Total:</span><span>{formatCurrency(valorTotal)}</span></div>
                </div>
                {selectedOrc.observacoes && (
                  <div><span className="font-semibold text-sm">Observações:</span><p className="text-sm text-muted-foreground mt-1">{selectedOrc.observacoes}</p></div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => exportOrcamentoPDF(selectedOrc)}><FileDown className="mr-2 h-4 w-4" />Exportar PDF</Button>
                  {selectedOrc.status !== 'Convertido' && (
                    <Button variant="secondary" className="flex-1" onClick={() => { setSelectedOrc(null); setConvertOrc(selectedOrc); }}>
                      <ArrowRightLeft className="mr-2 h-4 w-4" />Converter em OS
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar Orçamento #{editingOrc?.numero}</DialogTitle></DialogHeader>
          {renderFormFields(editForm, handleEditChange, true)}
          <Button onClick={handleSaveEdit} className="w-full">Salvar Alterações</Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteOrc} onOpenChange={() => setDeleteOrc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Orçamento #{deleteOrc?.numero}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert Confirm */}
      <AlertDialog open={!!convertOrc} onOpenChange={() => setConvertOrc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter Orçamento #{convertOrc?.numero} em OS?</AlertDialogTitle>
            <AlertDialogDescription>
              Será criada uma nova Ordem de Serviço com os dados deste orçamento. O orçamento será marcado como "Convertido".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToOS}>Converter em OS</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
