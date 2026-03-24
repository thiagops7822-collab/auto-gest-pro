export interface PecaOS {
  id: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  data: string;
  status: 'Solicitado' | 'Recebido' | 'Instalado';
}

export interface PagamentoOS {
  id: string;
  data: string;
  valor: number;
  forma: string;
  observacao?: string;
}

export interface OrdemServico {
  id: string;
  numero: number;
  dataEntrada: string;
  placa: string;
  modelo: string;
  ano: string;
  cor: string;
  cliente: string;
  telefone: string;
  tipoServico: string;
  descricao: string;
  valorOrcado: number;
  status: 'Em Andamento' | 'Aguardando Peça' | 'Pronto para Entrega' | 'Finalizado' | 'Cancelado';
  pecas: PecaOS[];
  pagamentos: PagamentoOS[];
}

export interface CustoFixo {
  id: string;
  nome: string;
  categoria: 'Fixo Mensal' | 'Fixo Anual' | 'Variável' | 'Imposto';
  valorPrevisto: number;
  diaVencimento: number;
  recorrencia: string;
  observacoes?: string;
  statusPagamento: 'Pago' | 'Pendente' | 'Vencido' | 'Isento';
  valorPago?: number;
  dataPagamento?: string;
  formaPagamento?: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  tipoContrato: 'CLT' | 'Autônomo' | 'Informal';
  salarioBase: number;
  dataAdmissao: string;
  status: 'Ativo' | 'Inativo' | 'Afastado';
}

export interface PagamentoFuncionario {
  id: string;
  funcionarioId: string;
  mesReferencia: string;
  salarioBase: number;
  adicionais: { descricao: string; valor: number }[];
  descontos: { descricao: string; valor: number }[];
  totalPagar: number;
  dataPagamento?: string;
  formaPagamento?: string;
  status: 'Pago' | 'Pendente' | 'Pago Parcial';
}

export interface CartaoCredito {
  id: string;
  nome: string;
  limiteTotal: number;
  diaFechamento: number;
  diaVencimento: number;
}

export interface DespesaCartao {
  id: string;
  cartaoId: string;
  descricao: string;
  categoria: string;
  valorTotal: number;
  parcelas: number;
  dataCompra: string;
  parcelasGeradas: { mes: string; valor: number; status: 'Aberta' | 'Paga' | 'Vencida' }[];
}

export interface Terceiro {
  id: string;
  nome: string;
  tipo: 'Fornecedor de Peças' | 'Prestador de Serviço' | 'Ambos';
  telefone: string;
  especialidade: string;
}

// Sample Data
export const ordensServico: OrdemServico[] = [
  {
    id: '1', numero: 1001, dataEntrada: '2025-03-01', placa: 'ABC-1234', modelo: 'Honda Civic', ano: '2022', cor: 'Prata',
    cliente: 'Carlos Silva', telefone: '(11) 99999-1234', tipoServico: 'Funilaria',
    descricao: 'Reparo no para-lama dianteiro direito com pintura', valorOrcado: 3500,
    status: 'Em Andamento',
    pecas: [
      { id: 'p1', descricao: 'Para-lama dianteiro direito', fornecedor: 'Auto Peças Central', valor: 450, data: '2025-03-02', status: 'Instalado' },
      { id: 'p2', descricao: 'Tinta prata metálico', fornecedor: 'Tintas Express', valor: 180, data: '2025-03-03', status: 'Recebido' },
    ],
    pagamentos: [
      { id: 'pg1', data: '2025-03-01', valor: 1500, forma: 'PIX', observacao: 'Entrada' },
    ],
  },
  {
    id: '2', numero: 1002, dataEntrada: '2025-03-05', placa: 'DEF-5678', modelo: 'Toyota Corolla', ano: '2021', cor: 'Branco',
    cliente: 'Ana Oliveira', telefone: '(11) 98888-5678', tipoServico: 'Pintura',
    descricao: 'Pintura completa capô e teto', valorOrcado: 4200,
    status: 'Pronto para Entrega',
    pecas: [
      { id: 'p3', descricao: 'Tinta branco perolizado', fornecedor: 'Tintas Express', valor: 320, data: '2025-03-06', status: 'Instalado' },
    ],
    pagamentos: [
      { id: 'pg2', data: '2025-03-05', valor: 2000, forma: 'Crédito' },
      { id: 'pg3', data: '2025-03-12', valor: 2200, forma: 'PIX' },
    ],
  },
  {
    id: '3', numero: 1003, dataEntrada: '2025-03-08', placa: 'GHI-9012', modelo: 'VW Gol', ano: '2019', cor: 'Preto',
    cliente: 'João Santos', telefone: '(11) 97777-9012', tipoServico: 'Estética',
    descricao: 'Polimento cristalizado + higienização interna completa', valorOrcado: 800,
    status: 'Finalizado',
    pecas: [],
    pagamentos: [
      { id: 'pg4', data: '2025-03-10', valor: 800, forma: 'Dinheiro' },
    ],
  },
  {
    id: '4', numero: 1004, dataEntrada: '2025-03-10', placa: 'JKL-3456', modelo: 'Fiat Argo', ano: '2023', cor: 'Vermelho',
    cliente: 'Maria Costa', telefone: '(11) 96666-3456', tipoServico: 'Combinado',
    descricao: 'Reparo lateral esquerda + pintura + polimento', valorOrcado: 5800,
    status: 'Aguardando Peça',
    pecas: [
      { id: 'p4', descricao: 'Porta traseira esquerda', fornecedor: 'Fiat Peças', valor: 1200, data: '2025-03-11', status: 'Solicitado' },
    ],
    pagamentos: [
      { id: 'pg5', data: '2025-03-10', valor: 2000, forma: 'PIX' },
    ],
  },
  {
    id: '5', numero: 1005, dataEntrada: '2025-03-14', placa: 'MNO-7890', modelo: 'Hyundai HB20', ano: '2020', cor: 'Azul',
    cliente: 'Pedro Almeida', telefone: '(11) 95555-7890', tipoServico: 'Funilaria',
    descricao: 'Desamassar porta dianteira e pintar', valorOrcado: 2200,
    status: 'Em Andamento',
    pecas: [
      { id: 'p5', descricao: 'Massa plástica', fornecedor: 'Auto Peças Central', valor: 45, data: '2025-03-14', status: 'Instalado' },
    ],
    pagamentos: [],
  },
];

export const custosFixos: CustoFixo[] = [
  { id: 'c1', nome: 'Aluguel do galpão', categoria: 'Fixo Mensal', valorPrevisto: 4500, diaVencimento: 10, recorrencia: 'Mensal', statusPagamento: 'Pago', valorPago: 4500, dataPagamento: '2025-03-10', formaPagamento: 'Boleto' },
  { id: 'c2', nome: 'Conta de Luz', categoria: 'Fixo Mensal', valorPrevisto: 1200, diaVencimento: 15, recorrencia: 'Mensal', statusPagamento: 'Pendente' },
  { id: 'c3', nome: 'Conta de Água', categoria: 'Fixo Mensal', valorPrevisto: 350, diaVencimento: 20, recorrencia: 'Mensal', statusPagamento: 'Pendente' },
  { id: 'c4', nome: 'Internet', categoria: 'Fixo Mensal', valorPrevisto: 250, diaVencimento: 5, recorrencia: 'Mensal', statusPagamento: 'Pago', valorPago: 250, dataPagamento: '2025-03-05', formaPagamento: 'PIX' },
  { id: 'c5', nome: 'Contador', categoria: 'Fixo Mensal', valorPrevisto: 800, diaVencimento: 10, recorrencia: 'Mensal', statusPagamento: 'Pago', valorPago: 800, dataPagamento: '2025-03-10', formaPagamento: 'Transferência' },
  { id: 'c6', nome: 'IPTU', categoria: 'Imposto', valorPrevisto: 3600, diaVencimento: 15, recorrencia: 'Anual', statusPagamento: 'Pago', valorPago: 3600, dataPagamento: '2025-01-15', formaPagamento: 'Boleto' },
  { id: 'c7', nome: 'Material de limpeza', categoria: 'Variável', valorPrevisto: 400, diaVencimento: 25, recorrencia: 'Mensal', statusPagamento: 'Pendente' },
  { id: 'c8', nome: 'Seguro do galpão', categoria: 'Fixo Anual', valorPrevisto: 2400, diaVencimento: 1, recorrencia: 'Anual', statusPagamento: 'Pago', valorPago: 2400, dataPagamento: '2025-02-01', formaPagamento: 'Boleto' },
];

export const funcionarios: Funcionario[] = [
  { id: 'f1', nome: 'Roberto Ferreira', cpf: '123.456.789-00', cargo: 'Funileiro', tipoContrato: 'CLT', salarioBase: 3500, dataAdmissao: '2022-03-15', status: 'Ativo' },
  { id: 'f2', nome: 'Marcos Lima', cpf: '234.567.890-11', cargo: 'Pintor', tipoContrato: 'CLT', salarioBase: 3800, dataAdmissao: '2021-08-01', status: 'Ativo' },
  { id: 'f3', nome: 'Lucas Souza', cpf: '345.678.901-22', cargo: 'Polidor', tipoContrato: 'Autônomo', salarioBase: 2500, dataAdmissao: '2023-01-10', status: 'Ativo' },
  { id: 'f4', nome: 'Ana Paula Dias', cpf: '456.789.012-33', cargo: 'Administrativo', tipoContrato: 'CLT', salarioBase: 2800, dataAdmissao: '2023-06-01', status: 'Ativo' },
  { id: 'f5', nome: 'José Carlos', cpf: '567.890.123-44', cargo: 'Auxiliar', tipoContrato: 'Informal', salarioBase: 1800, dataAdmissao: '2024-02-01', status: 'Ativo' },
];

export const cartoes: CartaoCredito[] = [
  { id: 'cc1', nome: 'Nubank PJ', limiteTotal: 15000, diaFechamento: 3, diaVencimento: 10 },
  { id: 'cc2', nome: 'Itaú Empresarial', limiteTotal: 25000, diaFechamento: 15, diaVencimento: 22 },
];

export const despesasCartao: DespesaCartao[] = [
  {
    id: 'd1', cartaoId: 'cc1', descricao: 'Compressor de ar', categoria: 'Ferramentas', valorTotal: 3600, parcelas: 6, dataCompra: '2025-01-15',
    parcelasGeradas: [
      { mes: '2025-02', valor: 600, status: 'Paga' },
      { mes: '2025-03', valor: 600, status: 'Aberta' },
      { mes: '2025-04', valor: 600, status: 'Aberta' },
      { mes: '2025-05', valor: 600, status: 'Aberta' },
      { mes: '2025-06', valor: 600, status: 'Aberta' },
      { mes: '2025-07', valor: 600, status: 'Aberta' },
    ],
  },
  {
    id: 'd2', cartaoId: 'cc1', descricao: 'Lixas e abrasivos', categoria: 'Material', valorTotal: 450, parcelas: 1, dataCompra: '2025-03-05',
    parcelasGeradas: [{ mes: '2025-04', valor: 450, status: 'Aberta' }],
  },
  {
    id: 'd3', cartaoId: 'cc2', descricao: 'Combustível frota', categoria: 'Combustível', valorTotal: 800, parcelas: 1, dataCompra: '2025-03-10',
    parcelasGeradas: [{ mes: '2025-04', valor: 800, status: 'Aberta' }],
  },
  {
    id: 'd4', cartaoId: 'cc2', descricao: 'Pistola de pintura profissional', categoria: 'Ferramentas', valorTotal: 4800, parcelas: 10, dataCompra: '2025-02-01',
    parcelasGeradas: [
      { mes: '2025-03', valor: 480, status: 'Aberta' },
      { mes: '2025-04', valor: 480, status: 'Aberta' },
      { mes: '2025-05', valor: 480, status: 'Aberta' },
      { mes: '2025-06', valor: 480, status: 'Aberta' },
      { mes: '2025-07', valor: 480, status: 'Aberta' },
      { mes: '2025-08', valor: 480, status: 'Aberta' },
      { mes: '2025-09', valor: 480, status: 'Aberta' },
      { mes: '2025-10', valor: 480, status: 'Aberta' },
      { mes: '2025-11', valor: 480, status: 'Aberta' },
      { mes: '2025-12', valor: 480, status: 'Aberta' },
    ],
  },
];

export const terceiros: Terceiro[] = [
  { id: 't1', nome: 'Auto Peças Central', tipo: 'Fornecedor de Peças', telefone: '(11) 3333-1111', especialidade: 'Peças de funilaria e acessórios' },
  { id: 't2', nome: 'Tintas Express', tipo: 'Fornecedor de Peças', telefone: '(11) 3333-2222', especialidade: 'Tintas automotivas e vernizes' },
  { id: 't3', nome: 'Vidraçaria Auto Glass', tipo: 'Prestador de Serviço', telefone: '(11) 3333-3333', especialidade: 'Vidros automotivos' },
  { id: 't4', nome: 'Eletromecânica Santos', tipo: 'Prestador de Serviço', telefone: '(11) 3333-4444', especialidade: 'Elétrica e mecânica geral' },
  { id: 't5', nome: 'Fiat Peças', tipo: 'Fornecedor de Peças', telefone: '(11) 3333-5555', especialidade: 'Peças genuínas Fiat' },
];

// Helper functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const getTotalRecebido = (os: OrdemServico): number => {
  return os.pagamentos.reduce((sum, p) => sum + p.valor, 0);
};

export const getValorTotalOS = (os: OrdemServico): number => {
  return os.valorOrcado + getTotalPecas(os);
};

export const getSaldoPendente = (os: OrdemServico): number => {
  return getValorTotalOS(os) - getTotalRecebido(os);
};

export const getTotalPecas = (os: OrdemServico): number => {
  return os.pecas.reduce((sum, p) => sum + p.valor, 0);
};

export const getStatusPagamento = (os: OrdemServico): string => {
  const recebido = getTotalRecebido(os);
  if (recebido >= os.valorOrcado) return 'Pago';
  if (recebido > 0) return 'Pago Parcial';
  return 'Pendente';
};
