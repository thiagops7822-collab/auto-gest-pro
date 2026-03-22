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
}

const initialSaidas: SaidaNaoPlanejada[] = [
  { id: 's1', descricao: 'Compra emergencial de lixa', valor: 85, formaPagamento: 'PIX', data: '2025-03-12' },
  { id: 's2', descricao: 'Pagamento avulso eletricista', valor: 350, formaPagamento: 'Dinheiro', data: '2025-03-15', observacao: 'Reparo urgente na fiação' },
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

  return (
    <DataContext.Provider value={{
      osList, setOsList,
      custosList, setCustosList,
      funcList, setFuncList,
      cartoesList, setCartoesList,
      despesasList, setDespesasList,
      terceirosList, setTerceirosList,
      saidasList, setSaidasList,
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
