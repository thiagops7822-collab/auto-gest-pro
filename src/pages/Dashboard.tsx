import { Car, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ordensServico, custosFixos, funcionarios, formatCurrency, getTotalRecebido, getSaldoPendente, getTotalPecas } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const revenueExpenseData = [
  { mes: 'Out', receitas: 14200, despesas: 9800 },
  { mes: 'Nov', receitas: 16800, despesas: 10500 },
  { mes: 'Dez', receitas: 18500, despesas: 11200 },
  { mes: 'Jan', receitas: 15300, despesas: 10800 },
  { mes: 'Fev', receitas: 17600, despesas: 11000 },
  { mes: 'Mar', receitas: 16500, despesas: 10300 },
];

const expenseCategoryData = [
  { name: 'Fixos', value: 7100, color: 'hsl(24, 95%, 53%)' },
  { name: 'Variáveis', value: 400, color: 'hsl(38, 92%, 50%)' },
  { name: 'Pessoal', value: 14400, color: 'hsl(210, 80%, 55%)' },
  { name: 'Terceiros', value: 2195, color: 'hsl(142, 71%, 45%)' },
  { name: 'Cartão', value: 1080, color: 'hsl(280, 65%, 55%)' },
];

const profitData = [
  { mes: 'Out', lucro: 4400 },
  { mes: 'Nov', lucro: 6300 },
  { mes: 'Dez', lucro: 7300 },
  { mes: 'Jan', lucro: 4500 },
  { mes: 'Fev', lucro: 6600 },
  { mes: 'Mar', lucro: 6200 },
];

const osStatusData = [
  { status: 'Em Andamento', total: 2, color: 'hsl(210, 80%, 55%)' },
  { status: 'Ag. Peça', total: 1, color: 'hsl(38, 92%, 50%)' },
  { status: 'Pronto', total: 1, color: 'hsl(142, 71%, 45%)' },
  { status: 'Finalizado', total: 1, color: 'hsl(215, 15%, 55%)' },
];

export default function Dashboard() {
  const veiculosAtivos = ordensServico.filter(os => os.status !== 'Finalizado' && os.status !== 'Cancelado').length;
  const faturamentoBruto = ordensServico.reduce((sum, os) => sum + os.valorOrcado, 0);
  const totalRecebido = ordensServico.reduce((sum, os) => sum + getTotalRecebido(os), 0);
  const totalPendente = ordensServico.reduce((sum, os) => sum + Math.max(0, getSaldoPendente(os)), 0);
  const totalCustos = custosFixos.reduce((sum, c) => sum + c.valorPrevisto, 0) + funcionarios.reduce((sum, f) => sum + f.salarioBase, 0);
  const lucroEstimado = totalRecebido - totalCustos - ordensServico.reduce((sum, os) => sum + getTotalPecas(os), 0);

  const alerts = [
    { type: 'warning' as const, text: 'Conta de Luz vence em 2 dias (R$ 1.200,00)', icon: AlertTriangle },
    { type: 'danger' as const, text: 'OS #1005 sem pagamento há 5 dias', icon: Clock },
    { type: 'warning' as const, text: 'Conta de Água vence em 7 dias (R$ 350,00)', icon: AlertTriangle },
    { type: 'info' as const, text: 'Parcela cartão Nubank vence dia 10 (R$ 600,00)', icon: Clock },
  ];

  const stats = [
    { label: 'Veículos em Atendimento', value: veiculosAtivos, icon: Car, color: 'text-info' },
    { label: 'Faturamento Bruto', value: formatCurrency(faturamentoBruto), icon: DollarSign, color: 'text-primary' },
    { label: 'Total Recebido', value: formatCurrency(totalRecebido), icon: TrendingUp, color: 'text-success' },
    { label: 'Total Pendente', value: formatCurrency(totalPendente), icon: Clock, color: 'text-warning' },
    { label: 'Lucro Estimado', value: formatCurrency(lucroEstimado), icon: TrendingUp, color: lucroEstimado > 0 ? 'text-success' : 'text-destructive' },
    { label: 'Total Despesas', value: formatCurrency(totalCustos), icon: TrendingDown, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do seu negócio</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-40`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue vs Expenses */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Receitas x Despesas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
              <XAxis dataKey="mes" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 15%, 13%)', border: '1px solid hsl(220, 13%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Bar dataKey="receitas" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Receitas" />
              <Bar dataKey="despesas" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={expenseCategoryData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" paddingAngle={3}>
                {expenseCategoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(220, 15%, 13%)', border: '1px solid hsl(220, 13%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {expenseCategoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>

        {/* Profit Evolution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Evolução do Lucro Líquido</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
              <XAxis dataKey="mes" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 15%, 13%)', border: '1px solid hsl(220, 13%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="lucro" stroke="hsl(24, 95%, 53%)" strokeWidth={2.5} dot={{ fill: 'hsl(24, 95%, 53%)', r: 4 }} name="Lucro" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* OS by Status */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">OS por Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={osStatusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
              <XAxis type="number" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
              <YAxis dataKey="status" type="category" width={100} tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(220, 15%, 13%)', border: '1px solid hsl(220, 13%, 20%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Quantidade">
                {osStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">⚠️ Alertas e Vencimentos</h3>
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
              alert.type === 'danger' ? 'badge-danger' : alert.type === 'warning' ? 'badge-warning' : 'badge-info'
            }`}>
              <alert.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{alert.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
