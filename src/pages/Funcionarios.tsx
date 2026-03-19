import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { funcionarios, formatCurrency, formatDate } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  'Ativo': 'badge-success',
  'Inativo': 'bg-muted text-muted-foreground border-border',
  'Afastado': 'badge-warning',
};

export default function Funcionarios() {
  const totalFolha = funcionarios.filter(f => f.status === 'Ativo').reduce((s, f) => s + f.salarioBase, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground text-sm">{funcionarios.length} funcionários cadastrados</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Novo Funcionário</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Funcionário</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="sm:col-span-2"><Label>Nome Completo</Label><Input placeholder="Nome" /></div>
              <div><Label>CPF</Label><Input placeholder="000.000.000-00" /></div>
              <div><Label>Cargo</Label><Input placeholder="Ex: Funileiro" /></div>
              <div>
                <Label>Tipo de Contrato</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="Autônomo">Autônomo</SelectItem>
                    <SelectItem value="Informal">Informal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Salário Base (R$)</Label><Input type="number" placeholder="0,00" /></div>
              <div><Label>Data de Admissão</Label><Input type="date" /></div>
            </div>
            <Button className="w-full mt-4">Cadastrar</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="stat-card"><p className="text-xs text-muted-foreground">Total da Folha</p><p className="text-xl font-bold text-primary mt-1">{formatCurrency(totalFolha)}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Funcionários Ativos</p><p className="text-xl font-bold text-success mt-1">{funcionarios.filter(f => f.status === 'Ativo').length}</p></div>
        <div className="stat-card"><p className="text-xs text-muted-foreground">Média Salarial</p><p className="text-xl font-bold text-info mt-1">{formatCurrency(totalFolha / funcionarios.filter(f => f.status === 'Ativo').length)}</p></div>
      </div>

      {/* Table */}
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
                <TableHead>Admissão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarios.map(f => (
                <TableRow key={f.id} className="border-border">
                  <TableCell className="font-medium flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"><User className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    {f.nome}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{f.cpf}</TableCell>
                  <TableCell>{f.cargo}</TableCell>
                  <TableCell className="text-muted-foreground">{f.tipoContrato}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(f.salarioBase)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(f.dataAdmissao)}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[f.status]}>{f.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
