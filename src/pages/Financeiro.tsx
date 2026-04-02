import { useState } from "react";
import { Plus, Pencil, Trash2, DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import MonthFilter, { getCurrentMonth, filterByMonth } from "@/components/MonthFilter";
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
import { getMonthLabel } from "@/components/MonthFilter";

type TipoSaida = SaidaNaoPlanejada['tipo'];

const emptyForm = {
  descricao: '', valor: '', formaPagamento: 'PIX', data: '',
  observacao: '', tipo: 'Outros' as TipoSaida, osVinculadaId: '', funcionarioId: '',
  custoVinculadoId: '', cartaoVinculadoId: '',
};

export default function Financeiro() {
  const {
    saidasList, setSaidasList, osList,
    funcList, saldoAnterior, setSaldoAnterior,
    pagamentosMes, setPagamentosMes,
    custosList, setCustosList,
    cartoesList, despesasList, setDespesasList,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mesFiltro, setMesFiltro] = useState(getCurrentMonth());
  const [saldoDialogOpen, setSaldoDialogOpen] = useState(false);
  const [saldoInput, setSaldoInput] = useState(String(saldoAnterior));
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const saidasFiltradas = filterByMonth(saidasList, 'data', mesFiltro);
  const totalSaidas = saidasFiltradas.reduce((s, item) => s + item.valor, 0);
  const totalCustos = custosList.reduce((s, c) => s + c.valorPrevisto, 0);
  const totalDespesas = totalSaidas + totalCustos;
  const saldoAtual = saldoAnterior - totalSaidas;

  const needsOS = form.tipo === 'Peça' || form.tipo === 'Terceiro';
  const isFolha = form.tipo === 'Folha de pagamento';
  const isDespOp = form.tipo === 'Despesas operacionais';
  const mesAtual = mesFiltro;
  const ativosNaoPagos = funcList.filter(f => f.status === 'Ativo' && !pagamentosMes[`${f.id}-${mesAtual}`]);

  const isCartao = form.tipo === 'Cartão de crédito';

  const openEdit = (s: SaidaNaoPlanejada) => {
    setEditingId(s.id);
    setForm({
      descricao: s.descricao, valor: String(s.valor), formaPagamento: s.formaPagamento,
      data: s.data, observacao: s.observacao || '', tipo: s.tipo,
      osVinculadaId: s.osVinculadaId || '', funcionarioId: s.funcionarioId || '',
      custoVinculadoId: s.custoVinculadoId || '', cartaoVinculadoId: s.cartaoVinculadoId || '',
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSaveSaldo = () => {
    setSaldoAnterior(parseFloat(saldoInput) || 0);
    setSaldoDialogOpen(false);
    toast({ title: "Saldo atualizado!", description: `Saldo anterior definido como ${formatCurrency(parseFloat(saldoInput) || 0)}` });
  };

  const handleCustoSelect = (custoId: string) => {
    const custo = custosList.find(c => c.id === custoId);
    if (!custo) return;

    const isFixo = custo.categoria === 'Fixo Mensal' || custo.categoria === 'Fixo Anual';
    setForm(p => ({
      ...p,
      custoVinculadoId: custoId,
      descricao: custo.nome,
      valor: isFixo ? String(custo.valorPrevisto) : '',
    }));
  };

  const handleCartaoSelect = (cartaoId: string) => {
    const cartao = cartoesList.find(c => c.id === cartaoId);
    if (!cartao) return;
    const despesas = despesasList.filter(d => d.cartaoId === cartaoId);
    const faturaMes = despesas.flatMap(d => d.parcelasGeradas.filter(p => p.mes === mesAtual && p.status !== 'Paga')).reduce((s, p) => s + p.valor, 0);
    setForm(p => ({
      ...p,
      cartaoVinculadoId: cartaoId,
      descricao: `FATURA ${getMonthLabel(mesAtual).toUpperCase()} - ${cartao.nome}`,
      valor: String(faturaMes),
    }));
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
    if (isFolha && !form.funcionarioId) {
      toast({ title: "Colaborador obrigatório", description: "Selecione o colaborador.", variant: "destructive" });
      return;
    }
    if (isDespOp && !form.custoVinculadoId) {
      toast({ title: "Custo obrigatório", description: "Selecione o custo vinculado.", variant: "destructive" });
      return;
    }
    if (isCartao && !form.cartaoVinculadoId) {
      toast({ title: "Cartão obrigatório", description: "Selecione o cartão.", variant: "destructive" });
      return;
    }

    const valorNum = parseFloat(form.valor) || 0;

    if (editingId) {
      setSaidasList(prev => prev.map(s => s.id === editingId ? {
        ...s,
        descricao: form.descricao.toUpperCase(),
        valor: valorNum,
        formaPagamento: form.formaPagamento,
        data: form.data || s.data,
        observacao: form.observacao || undefined,
        tipo: form.tipo,
        osVinculadaId: needsOS ? form.osVinculadaId : undefined,
        funcionarioId: isFolha ? form.funcionarioId : undefined,
        custoVinculadoId: isDespOp ? form.custoVinculadoId : undefined,
        cartaoVinculadoId: isCartao ? form.cartaoVinculadoId : undefined,
      } : s));
      toast({ title: "Saída atualizada!", description: `${form.descricao.toUpperCase()} editada.` });
    } else {
      const nova: SaidaNaoPlanejada = {
        id: crypto.randomUUID(),
        descricao: form.descricao.toUpperCase(),
        valor: valorNum,
        formaPagamento: form.formaPagamento,
        data: form.data || new Date().toISOString().split('T')[0],
        observacao: form.observacao || undefined,
        tipo: form.tipo,
        osVinculadaId: needsOS ? form.osVinculadaId : undefined,
        funcionarioId: isFolha ? form.funcionarioId : undefined,
        custoVinculadoId: isDespOp ? form.custoVinculadoId : undefined,
        cartaoVinculadoId: isCartao ? form.cartaoVinculadoId : undefined,
      };
      setSaidasList(prev => [nova, ...prev]);

      // Mark employee as paid this month
      if (isFolha && form.funcionarioId) {
        const mes = (form.data || new Date().toISOString().split('T')[0]).slice(0, 7);
        setPagamentosMes(prev => ({ ...prev, [`${form.funcionarioId}-${mes}`]: true }));
      }

      // Update custo and mark as paid for Despesas operacionais
      if (isDespOp && form.custoVinculadoId) {
        const custo = custosList.find(c => c.id === form.custoVinculadoId);
        if (custo) {
          const isVariavel = custo.categoria === 'Variável';
          setCustosList(prev => prev.map(c => c.id === form.custoVinculadoId ? {
            ...c,
            statusPagamento: 'Pago' as const,
            valorPago: valorNum,
            dataPagamento: form.data || new Date().toISOString().split('T')[0],
            formaPagamento: form.formaPagamento,
            ...(isVariavel ? { valorPrevisto: valorNum } : {}),
          } : c));
        }
      }

      // Mark card parcels as paid
      if (isCartao && form.cartaoVinculadoId) {
        setDespesasList(prev => prev.map(d => {
          if (d.cartaoId !== form.cartaoVinculadoId) return d;
          return {
            ...d,
            parcelasGeradas: d.parcelasGeradas.map(p =>
              p.mes === mesAtual && p.status !== 'Paga' ? { ...p, status: 'Paga' as const } : p
            ),
          };
        }));
      }

      toast({ title: "Saída registrada!", description: `${nova.descricao} — ${formatCurrency(nova.valor)}` });
    }
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const item = saidasList.find(s => s.id === deleteId);
    // If it was a payroll entry, unmark the employee
    if (item?.tipo === 'Folha de pagamento' && item.funcionarioId) {
      const mes = item.data.slice(0, 7);
      setPagamentosMes(prev => {
        const next = { ...prev };
        delete next[`${item.funcionarioId}-${mes}`];
        return next;
      });
    }
    setSaidasList(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Saída excluída!", description: `${item?.descricao} removida.` });
  };

  const getOSLabel = (osId: string) => {
    const os = osList.find(o => o.id === osId);
    return os ? `OS #${os.numero} — ${os.placa || 'S/ placa'} | ${os.modelo}` : '—';
  };

  const getFuncLabel = (funcId: string) => {
    const f = funcList.find(fn => fn.id === funcId);
    return f ? f.nome : '—';
  };

  const getCustoLabel = (custoId: string) => {
    const c = custosList.find(ct => ct.id === custoId);
    return c ? c.nome : '—';
  };

  const handleFuncionarioSelect = (funcId: string) => {
    const func = funcList.find(f => f.id === funcId);
    setForm(p => ({
      ...p,
      funcionarioId: funcId,
      descricao: func ? `PAGAMENTO - ${func.nome}` : p.descricao,
      valor: func ? String(func.salarioBase) : p.valor,
    }));
  };

  const tipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'Peça': return 'default';
      case 'Terceiro': return 'secondary';
      case 'Folha de pagamento': return 'destructive' as const;
      case 'Cartão de crédito': return 'default';
      case 'Despesas operacionais': return 'outline';
      default: return 'outline';
    }
  };

  const getVinculoLabel = (s: SaidaNaoPlanejada) => {
    if (s.tipo === 'Folha de pagamento' && s.funcionarioId) return getFuncLabel(s.funcionarioId);
    if (s.tipo === 'Despesas operacionais' && s.custoVinculadoId) return getCustoLabel(s.custoVinculadoId);
    if (s.osVinculadaId) return getOSLabel(s.osVinculadaId);
    return '—';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
           <p className="text-muted-foreground text-sm">Controle de saldo, saídas e folha de pagamento</p>
         </div>
         <div className="flex items-center gap-2 flex-wrap">
           <MonthFilter value={mesFiltro} onChange={setMesFiltro} />
          <Dialog open={saldoDialogOpen} onOpenChange={setSaldoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2" onClick={() => setSaldoInput(String(saldoAnterior))}>
                <Wallet className="w-4 h-4" /> Saldo Anterior
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Definir Saldo Anterior</DialogTitle></DialogHeader>
              <div className="grid gap-4 mt-4">
                <div>
                  <Label>Saldo do mês passado (R$)</Label>
                  <Input
                    type="number" placeholder="0,00" value={saldoInput}
                    onChange={e => setSaldoInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Insira o saldo que será usado como base para o cálculo do mês atual.</p>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleSaveSaldo}>Salvar Saldo</Button>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { setEditingId(null); setForm(emptyForm); } setDialogOpen(o); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Nova Saída</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? 'Editar Saída' : 'Registrar Saída'}</DialogTitle></DialogHeader>
              <div className="grid gap-4 mt-4">
                <div>
                  <Label>Tipo de Saída *</Label>
                  <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v as TipoSaida, osVinculadaId: '', funcionarioId: '', custoVinculadoId: '', descricao: '', valor: '' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Peça">Peças</SelectItem>
                      <SelectItem value="Terceiro">Terceiros</SelectItem>
                      <SelectItem value="Despesas operacionais">Despesas Operacionais</SelectItem>
                      <SelectItem value="Folha de pagamento">Folha de Pagamento</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isDespOp && (
                  <div>
                    <Label>Selecionar Custo *</Label>
                    <Select value={form.custoVinculadoId} onValueChange={handleCustoSelect}>
                      <SelectTrigger><SelectValue placeholder="Selecione o custo" /></SelectTrigger>
                      <SelectContent>
                        {custosList.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome} — {c.categoria} — {formatCurrency(c.valorPrevisto)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.custoVinculadoId && (() => {
                      const custo = custosList.find(c => c.id === form.custoVinculadoId);
                      if (!custo) return null;
                      const isVariavel = custo.categoria === 'Variável';
                      return (
                        <p className="text-xs text-muted-foreground mt-1">
                          {isVariavel ? '⚠️ Custo variável — informe o valor manualmente.' : '✅ Valor preenchido automaticamente (editável).'}
                        </p>
                      );
                    })()}
                  </div>
                )}

                {isFolha && (
                  <div>
                    <Label>Selecionar Colaborador *</Label>
                    <Select value={form.funcionarioId} onValueChange={handleFuncionarioSelect}>
                      <SelectTrigger><SelectValue placeholder="Selecione o colaborador" /></SelectTrigger>
                      <SelectContent>
                        {ativosNaoPagos.map(f => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.nome} — {f.cargo} — {formatCurrency(f.salarioBase)}
                          </SelectItem>
                        ))}
                        {ativosNaoPagos.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Todos os colaboradores já foram pagos neste mês.</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {needsOS && (
                  <div>
                    <Label>Veículo / OS vinculada *</Label>
                    <Select value={form.osVinculadaId} onValueChange={v => setForm(p => ({ ...p, osVinculadaId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione a OS" /></SelectTrigger>
                      <SelectContent>
                        {osList.map(os => (
                          <SelectItem key={os.id} value={os.id}>
                            OS #{os.numero} — {os.placa || 'S/ placa'} | {os.modelo} {os.ano} {os.cor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Saldo Anterior</p>
          </div>
          <p className="text-xl font-bold text-primary mt-1">{formatCurrency(saldoAnterior)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <p className="text-xs text-muted-foreground">Total Saídas</p>
          </div>
          <p className="text-xl font-bold text-destructive mt-1">{formatCurrency(totalSaidas)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Folha do Mês</p>
          </div>
          <p className="text-xl font-bold text-foreground mt-1">
             {formatCurrency(saidasFiltradas.filter(s => s.tipo === 'Folha de pagamento').reduce((a, b) => a + b.valor, 0))}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Saldo Atual</p>
          </div>
          <p className={`text-xl font-bold mt-1 ${saldoAtual >= 0 ? 'text-green-500' : 'text-destructive'}`}>{formatCurrency(saldoAtual)}</p>
        </div>
      </div>

      {/* Status da folha */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Status da Folha de Pagamento</h3>
        <div className="flex flex-wrap gap-2">
          {funcList.filter(f => f.status === 'Ativo').map(f => (
            <Badge
              key={f.id}
              variant={pagamentosMes[f.id] ? 'default' : 'outline'}
              className={pagamentosMes[f.id] ? 'bg-green-600 hover:bg-green-700' : 'border-amber-500 text-amber-500'}
            >
              {f.nome} — {pagamentosMes[f.id] ? 'Pago' : 'Pendente'}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabela de saídas */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saidasFiltradas.map(s => (
                 <TableRow key={s.id} className="border-border">
                  <TableCell className="text-muted-foreground text-sm">{formatDate(s.data)}</TableCell>
                  <TableCell className="font-medium">{s.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={tipoBadgeVariant(s.tipo)}>{s.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{getVinculoLabel(s)}</TableCell>
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
