import React, { createContext, useContext, useState, type ReactNode } from "react";
import {
  ordensServico as initialOS,
  custosFixos as initialCustos,
  funcionarios as initialFunc,
  cartoes as initialCartoes,
  despesasCartao as initialDespesas,
  terceiros as initialTerceiros,
  type OrdemServico,
  type CustoFixo,
  type Funcionario,
  type CartaoCredito,
  type DespesaCartao,
  type Terceiro,
} from "@/lib/mock-data";

export interface SaidaNaoPlanejada {
  id: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  data: string;
  observacao?: string;
  tipo: 'Peça' | 'Terceiro' | 'Outros';
  osVinculadaId?: string;
}

export interface OrcamentoItem {
  id: string;
  operacao: string;
  descricao: string;
  qtde: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Orcamento {
  id: string;
  numero: number;
  dataCriacao: string;
  validade: string;
  placa: string;
  modelo: string;
  ano: string;
  cor: string;
  cliente: string;
  telefone: string;
  sinistro: string;
  endereco: string;
  cpfCnpj: string;
  orcamentista: string;
  itens: OrcamentoItem[];
  observacoes: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado' | 'Convertido';
}

const initialSaidas: SaidaNaoPlanejada[] = [
  { id: 's1', descricao: 'Compra emergencial de lixa', valor: 85, formaPagamento: 'PIX', data: '2025-03-12', tipo: 'Peça' },
  { id: 's2', descricao: 'Pagamento avulso eletricista', valor: 350, formaPagamento: 'Dinheiro', data: '2025-03-15', observacao: 'Reparo urgente na fiação', tipo: 'Terceiro' },
];

const initialOrcamentos: Orcamento[] = [
  {
    id: 'orc1', numero: 1, dataCriacao: '2025-03-20', validade: '2025-04-20',
    placa: 'XYZ-9876', modelo: 'VOLKSWAGEN POLO', ano: '2023', cor: 'BRANCO',
    cliente: 'FERNANDA SOUZA', telefone: '(11) 94444-1234', tipoServico: 'Funilaria',
    descricao: 'REPARO NO PARA-CHOQUE DIANTEIRO COM PINTURA', valorServico: 2800,
    valorPecas: 450, valorTerceiros: 0, observacoes: '', status: 'Pendente',
  },
];

interface DataContextType {
  osList: OrdemServico[];
  setOsList: React.Dispatch<React.SetStateAction<OrdemServico[]>>;
  custosList: CustoFixo[];
  setCustosList: React.Dispatch<React.SetStateAction<CustoFixo[]>>;
  funcList: Funcionario[];
  setFuncList: React.Dispatch<React.SetStateAction<Funcionario[]>>;
  cartoesList: CartaoCredito[];
  setCartoesList: React.Dispatch<React.SetStateAction<CartaoCredito[]>>;
  despesasList: DespesaCartao[];
  setDespesasList: React.Dispatch<React.SetStateAction<DespesaCartao[]>>;
  terceirosList: Terceiro[];
  setTerceirosList: React.Dispatch<React.SetStateAction<Terceiro[]>>;
  saidasList: SaidaNaoPlanejada[];
  setSaidasList: React.Dispatch<React.SetStateAction<SaidaNaoPlanejada[]>>;
  orcamentosList: Orcamento[];
  setOrcamentosList: React.Dispatch<React.SetStateAction<Orcamento[]>>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [osList, setOsList] = useState<OrdemServico[]>(initialOS);
  const [custosList, setCustosList] = useState<CustoFixo[]>(initialCustos);
  const [funcList, setFuncList] = useState<Funcionario[]>(initialFunc);
  const [cartoesList, setCartoesList] = useState<CartaoCredito[]>(initialCartoes);
  const [despesasList, setDespesasList] = useState<DespesaCartao[]>(initialDespesas);
  const [terceirosList, setTerceirosList] = useState<Terceiro[]>(initialTerceiros);
  const [saidasList, setSaidasList] = useState<SaidaNaoPlanejada[]>(initialSaidas);
  const [orcamentosList, setOrcamentosList] = useState<Orcamento[]>(initialOrcamentos);

  return (
    <DataContext.Provider value={{
      osList, setOsList,
      custosList, setCustosList,
      funcList, setFuncList,
      cartoesList, setCartoesList,
      despesasList, setDespesasList,
      terceirosList, setTerceirosList,
      saidasList, setSaidasList,
      orcamentosList, setOrcamentosList,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
