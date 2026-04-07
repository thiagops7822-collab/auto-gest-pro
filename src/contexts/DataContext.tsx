import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  mapOS, mapCusto, mapFuncionario, mapCartao, mapDespesa, mapTerceiro, mapSaida, mapOrcamento,
} from "@/lib/supabase-mappers";
import {
  upsertOS, deleteOS as dbDeleteOS,
  upsertCusto, deleteCusto as dbDeleteCusto,
  upsertFuncionario, deleteFuncionario as dbDeleteFuncionario,
  upsertCartao, deleteCartao as dbDeleteCartao,
  upsertDespesa, deleteDespesa as dbDeleteDespesa,
  upsertTerceiro, deleteTerceiro as dbDeleteTerceiro,
  upsertSaida, deleteSaida as dbDeleteSaida,
  upsertOrcamento, deleteOrcamento as dbDeleteOrcamento,
  saveSaldoAnterior,
} from "@/lib/supabase-actions";
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

// Helper: creates a syncing setter that detects adds, updates and deletes
function useSyncedList<T extends { id: string }>(
  initial: T[],
  syncUpsert: (item: T) => Promise<void>,
  syncDelete: (id: string) => Promise<void>,
) {
  const [list, setListRaw] = useState<T[]>(initial);
  const prevRef = useRef<T[]>(initial);

  const setList: React.Dispatch<React.SetStateAction<T[]>> = useCallback((action) => {
    setListRaw(prev => {
      const next = typeof action === 'function' ? (action as (p: T[]) => T[])(prev) : action;
      // Detect changes and sync in background
      const prevIds = new Set(prev.map(i => i.id));
      const nextIds = new Set(next.map(i => i.id));

      // Upsert new or changed items
      for (const item of next) {
        const old = prev.find(o => o.id === item.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(item)) {
          syncUpsert(item).catch(e => console.error('Sync upsert error:', e));
        }
      }

      // Delete removed items
      for (const item of prev) {
        if (!nextIds.has(item.id)) {
          syncDelete(item.id).catch(e => console.error('Sync delete error:', e));
        }
      }

      prevRef.current = next;
      return next;
    });
  }, [syncUpsert, syncDelete]);

  return [list, setList, setListRaw] as const;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [osList, setOsListWrapped, setOsListRaw] = useSyncedList<OrdemServico>([], upsertOS, dbDeleteOS);
  const [custosList, setCustosListWrapped, setCustosListRaw] = useSyncedList<CustoFixo>([], upsertCusto, dbDeleteCusto);
  const [funcList, setFuncListWrapped, setFuncListRaw] = useSyncedList<Funcionario>([], upsertFuncionario, dbDeleteFuncionario);
  const [cartoesList, setCartoesListWrapped, setCartoesListRaw] = useSyncedList<CartaoCredito>([], upsertCartao, dbDeleteCartao);
  const [despesasList, setDespesasListWrapped, setDespesasListRaw] = useSyncedList<DespesaCartao>([], upsertDespesa, dbDeleteDespesa);
  const [terceirosList, setTerceirosListWrapped, setTerceirosListRaw] = useSyncedList<Terceiro>([], upsertTerceiro, dbDeleteTerceiro);
  const [saidasList, setSaidasListWrapped, setSaidasListRaw] = useSyncedList<SaidaNaoPlanejada>([], upsertSaida, dbDeleteSaida);
  const [orcamentosList, setOrcamentosListWrapped, setOrcamentosListRaw] = useSyncedList<Orcamento>([], upsertOrcamento, dbDeleteOrcamento);

  const [saldoAnterior, setSaldoAnteriorRaw] = useState<number>(0);
  const [pagamentosMes, setPagamentosMes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const setSaldoAnterior: React.Dispatch<React.SetStateAction<number>> = useCallback((action) => {
    setSaldoAnteriorRaw(prev => {
      const next = typeof action === 'function' ? (action as (p: number) => number)(prev) : action;
      saveSaldoAnterior(next).catch(e => console.error('Sync saldo error:', e));
      return next;
    });
  }, []);

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

      // Use raw setters to avoid triggering sync on initial load
      if (osData && pecasData && pagData) {
        setOsListRaw(osData.map(os => mapOS(os, pecasData, pagData)));
      }
      if (custosData) setCustosListRaw(custosData.map(mapCusto));
      if (funcData) setFuncListRaw(funcData.map(mapFuncionario));
      if (cartoesData) setCartoesListRaw(cartoesData.map(mapCartao));
      if (despData && parcData) setDespesasListRaw(despData.map(d => mapDespesa(d, parcData)));
      if (tercData) setTerceirosListRaw(tercData.map(mapTerceiro));
      if (saidasData) setSaidasListRaw(saidasData.map(mapSaida));
      if (orcData && orcItensData) setOrcamentosListRaw(orcData.map(o => mapOrcamento(o, orcItensData)));

      const saldoConfig = configData?.find(c => c.chave === 'saldo_anterior');
      if (saldoConfig) setSaldoAnteriorRaw(Number(saldoConfig.valor) || 0);
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
      osList, setOsList: setOsListWrapped,
      custosList, setCustosList: setCustosListWrapped,
      funcList, setFuncList: setFuncListWrapped,
      cartoesList, setCartoesList: setCartoesListWrapped,
      despesasList, setDespesasList: setDespesasListWrapped,
      terceirosList, setTerceirosList: setTerceirosListWrapped,
      saidasList, setSaidasList: setSaidasListWrapped,
      orcamentosList, setOrcamentosList: setOrcamentosListWrapped,
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
