import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  mapOS, mapCusto, mapFuncionario, mapCartao, mapDespesa, mapTerceiro, mapSaida, mapOrcamento,
} from "@/lib/supabase-mappers";
import type { OrdemServico, CustoFixo, Funcionario, CartaoCredito, DespesaCartao, Terceiro } from "@/lib/mock-data";

export interface SaidaNaoPlanejada {
  id: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  data: string;
  observacao?: string;
  tipo: 'Peça' | 'Terceiro' | 'Outros' | 'Folha de pagamento' | 'Despesas operacionais' | 'Cartão de crédito';
  osVinculadaId?: string;
  funcionarioId?: string;
  custoVinculadoId?: string;
  cartaoVinculadoId?: string;
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
  orcamentista: string;
  itens: OrcamentoItem[];
  observacoes: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado' | 'Convertido';
}

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
  saldoAnterior: number;
  setSaldoAnterior: React.Dispatch<React.SetStateAction<number>>;
  pagamentosMes: Record<string, boolean>;
  setPagamentosMes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const noopSetter = <T,>(_value: React.SetStateAction<T>) => undefined;

const defaultDataContext: DataContextType = {
  osList: [], setOsList: noopSetter<OrdemServico[]>,
  custosList: [], setCustosList: noopSetter<CustoFixo[]>,
  funcList: [], setFuncList: noopSetter<Funcionario[]>,
  cartoesList: [], setCartoesList: noopSetter<CartaoCredito[]>,
  despesasList: [], setDespesasList: noopSetter<DespesaCartao[]>,
  terceirosList: [], setTerceirosList: noopSetter<Terceiro[]>,
  saidasList: [], setSaidasList: noopSetter<SaidaNaoPlanejada[]>,
  orcamentosList: [], setOrcamentosList: noopSetter<Orcamento[]>,
  saldoAnterior: 0, setSaldoAnterior: noopSetter<number>,
  pagamentosMes: {}, setPagamentosMes: noopSetter<Record<string, boolean>>,
  loading: true,
  refreshData: async () => {},
};

const DataContext = createContext<DataContextType>(defaultDataContext);

export function DataProvider({ children }: { children: ReactNode }) {
  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [custosList, setCustosList] = useState<CustoFixo[]>([]);
  const [funcList, setFuncList] = useState<Funcionario[]>([]);
  const [cartoesList, setCartoesList] = useState<CartaoCredito[]>([]);
  const [despesasList, setDespesasList] = useState<DespesaCartao[]>([]);
  const [terceirosList, setTerceirosList] = useState<Terceiro[]>([]);
  const [saidasList, setSaidasList] = useState<SaidaNaoPlanejada[]>([]);
  const [orcamentosList, setOrcamentosList] = useState<Orcamento[]>([]);
  const [saldoAnterior, setSaldoAnterior] = useState<number>(0);
  const [pagamentosMes, setPagamentosMes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [
        { data: osData },
        { data: pecasData },
        { data: pagData },
        { data: custosData },
        { data: funcData },
        { data: cartoesData },
        { data: despData },
        { data: parcData },
        { data: tercData },
        { data: saidasData },
        { data: orcData },
        { data: orcItensData },
        { data: configData },
      ] = await Promise.all([
        supabase.from('ordens_servico').select('*').order('numero', { ascending: false }),
        supabase.from('pecas_os').select('*'),
        supabase.from('pagamentos_os').select('*'),
        supabase.from('custos_fixos').select('*').order('nome'),
        supabase.from('funcionarios').select('*').order('nome'),
        supabase.from('cartoes_credito').select('*').order('nome'),
        supabase.from('despesas_cartao').select('*').order('data_compra', { ascending: false }),
        supabase.from('parcelas_despesa').select('*'),
        supabase.from('terceiros').select('*').order('nome'),
        supabase.from('saidas_nao_planejadas').select('*').order('data', { ascending: false }),
        supabase.from('orcamentos').select('*').order('numero', { ascending: false }),
        supabase.from('orcamento_itens').select('*'),
        supabase.from('configuracoes').select('*'),
      ]);

      if (osData && pecasData && pagData) {
        setOsList(osData.map(os => mapOS(os, pecasData, pagData)));
      }
      if (custosData) setCustosList(custosData.map(mapCusto));
      if (funcData) setFuncList(funcData.map(mapFuncionario));
      if (cartoesData) setCartoesList(cartoesData.map(mapCartao));
      if (despData && parcData) setDespesasList(despData.map(d => mapDespesa(d, parcData)));
      if (tercData) setTerceirosList(tercData.map(mapTerceiro));
      if (saidasData) setSaidasList(saidasData.map(mapSaida));
      if (orcData && orcItensData) setOrcamentosList(orcData.map(o => mapOrcamento(o, orcItensData)));

      const saldoConfig = configData?.find(c => c.chave === 'saldo_anterior');
      if (saldoConfig) setSaldoAnterior(Number(saldoConfig.valor) || 0);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
      saldoAnterior, setSaldoAnterior,
      pagamentosMes, setPagamentosMes,
      loading, refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
