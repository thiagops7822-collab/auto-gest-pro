import { useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cartoes, despesasCartao, formatCurrency } from "@/lib/mock-data";

export default function Cartoes() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cartões de Crédito</h1>
          <p className="text-muted-foreground text-sm">Controle de faturas e parcelas</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Novo Cartão</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar Cartão</DialogTitle></DialogHeader>
              <div className="grid gap-4 mt-4">
                <div><Label>Nome do Cartão</Label><Input placeholder="Ex: Nubank PJ" /></div>
                <div><Label>Limite Total (R$)</Label><Input type="number" placeholder="0,00" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Dia Fechamento</Label><Input type="number" placeholder="3" /></div>
                  <div><Label>Dia Vencimento</Label><Input type="number" placeholder="10" /></div>
                </div>
              </div>
              <Button className="w-full mt-4">Cadastrar</Button>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Nova Despesa</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Lançar Despesa no Cartão</DialogTitle></DialogHeader>
              <div className="grid gap-4 mt-4">
                <div>
                  <Label>Cartão</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {cartoes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Descrição</Label><Input placeholder="Ex: Compressor de ar" /></div>
                <div>
                  <Label>Categoria</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {['Peças','Ferramentas','Combustível','Alimentação','Material de escritório','Outros'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor Total (R$)</Label><Input type="number" placeholder="0,00" /></div>
                  <div><Label>Parcelas</Label><Input type="number" placeholder="1" /></div>
                </div>
                <div><Label>Data da Compra</Label><Input type="date" /></div>
              </div>
              <Button className="w-full mt-4">Lançar</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Card panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cartoes.map(cartao => {
          const despesas = despesasCartao.filter(d => d.cartaoId === cartao.id);
          const parcelasMes = despesas.flatMap(d => d.parcelasGeradas.filter(p => p.mes === '2025-03'));
          const faturaMes = parcelasMes.reduce((s, p) => s + p.valor, 0);
          const totalFuturo = despesas.flatMap(d => d.parcelasGeradas.filter(p => p.status === 'Aberta')).reduce((s, p) => s + p.valor, 0);
          const usado = totalFuturo;
          const pctUsado = Math.min((usado / cartao.limiteTotal) * 100, 100);

          return (
            <div key={cartao.id} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{cartao.nome}</h3>
                  <p className="text-xs text-muted-foreground">Fecha dia {cartao.diaFechamento} • Vence dia {cartao.diaVencimento}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Limite utilizado</span>
                    <span className="font-medium">{pctUsado.toFixed(0)}%</span>
                  </div>
                  <Progress value={pctUsado} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Usado: {formatCurrency(usado)}</span>
                    <span>Limite: {formatCurrency(cartao.limiteTotal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Fatura Mar/25</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(faturaMes)}</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Dívida Total</p>
                    <p className="text-lg font-bold text-warning">{formatCurrency(totalFuturo)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expenses table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Despesas Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Descrição</TableHead>
                <TableHead>Cartão</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Valor Parcela</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesasCartao.map(d => {
                const cartao = cartoes.find(c => c.id === d.cartaoId);
                return (
                  <TableRow key={d.id} className="border-border">
                    <TableCell className="font-medium">{d.descricao}</TableCell>
                    <TableCell className="text-muted-foreground">{cartao?.nome}</TableCell>
                    <TableCell><Badge variant="outline">{d.categoria}</Badge></TableCell>
                    <TableCell className="text-right">{formatCurrency(d.valorTotal)}</TableCell>
                    <TableCell>{d.parcelas}x</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.valorTotal / d.parcelas)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
