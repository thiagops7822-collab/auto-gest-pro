
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===================== TERCEIROS =====================
CREATE TABLE public.terceiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Fornecedor de Peças', 'Prestador de Serviço', 'Ambos')),
  telefone TEXT NOT NULL DEFAULT '',
  especialidade TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.terceiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to terceiros" ON public.terceiros FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_terceiros_updated_at BEFORE UPDATE ON public.terceiros FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== FUNCIONARIOS =====================
CREATE TABLE public.funcionarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL DEFAULT '',
  cargo TEXT NOT NULL DEFAULT '',
  tipo_contrato TEXT NOT NULL CHECK (tipo_contrato IN ('CLT', 'Autônomo', 'Informal')),
  salario_base NUMERIC NOT NULL DEFAULT 0,
  data_admissao DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Afastado')),
  dia_pagamento INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to funcionarios" ON public.funcionarios FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON public.funcionarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== CUSTOS FIXOS =====================
CREATE TABLE public.custos_fixos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Fixo Mensal', 'Fixo Anual', 'Variável', 'Imposto')),
  valor_previsto NUMERIC NOT NULL DEFAULT 0,
  dia_vencimento INTEGER NOT NULL DEFAULT 1,
  recorrencia TEXT NOT NULL DEFAULT 'Mensal',
  observacoes TEXT,
  status_pagamento TEXT NOT NULL DEFAULT 'Pendente' CHECK (status_pagamento IN ('Pago', 'Pendente', 'Vencido', 'Isento')),
  valor_pago NUMERIC,
  data_pagamento DATE,
  forma_pagamento TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.custos_fixos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to custos_fixos" ON public.custos_fixos FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_custos_fixos_updated_at BEFORE UPDATE ON public.custos_fixos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== CARTOES CREDITO =====================
CREATE TABLE public.cartoes_credito (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  limite_total NUMERIC NOT NULL DEFAULT 0,
  dia_fechamento INTEGER NOT NULL DEFAULT 1,
  dia_vencimento INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cartoes_credito ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to cartoes_credito" ON public.cartoes_credito FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_cartoes_credito_updated_at BEFORE UPDATE ON public.cartoes_credito FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== ORDENS DE SERVICO =====================
CREATE TABLE public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  placa TEXT NOT NULL DEFAULT '',
  modelo TEXT NOT NULL DEFAULT '',
  ano TEXT NOT NULL DEFAULT '',
  cor TEXT NOT NULL DEFAULT '',
  cliente TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  tipo_servico TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  valor_orcado NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Em Andamento' CHECK (status IN ('Em Andamento', 'Aguardando Peça', 'Pronto para Entrega', 'Finalizado', 'Cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to ordens_servico" ON public.ordens_servico FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== PECAS OS =====================
CREATE TABLE public.pecas_os (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL DEFAULT '',
  fornecedor TEXT NOT NULL DEFAULT '',
  valor NUMERIC NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Solicitado' CHECK (status IN ('Solicitado', 'Recebido', 'Instalado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pecas_os ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to pecas_os" ON public.pecas_os FOR ALL USING (true) WITH CHECK (true);

-- ===================== PAGAMENTOS OS =====================
CREATE TABLE public.pagamentos_os (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  valor NUMERIC NOT NULL DEFAULT 0,
  forma TEXT NOT NULL DEFAULT '',
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pagamentos_os ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to pagamentos_os" ON public.pagamentos_os FOR ALL USING (true) WITH CHECK (true);

-- ===================== DESPESAS CARTAO =====================
CREATE TABLE public.despesas_cartao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cartao_id UUID NOT NULL REFERENCES public.cartoes_credito(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL DEFAULT '',
  valor_total NUMERIC NOT NULL DEFAULT 0,
  parcelas INTEGER NOT NULL DEFAULT 1,
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  os_vinculada_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.despesas_cartao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to despesas_cartao" ON public.despesas_cartao FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_despesas_cartao_updated_at BEFORE UPDATE ON public.despesas_cartao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== PARCELAS DESPESA =====================
CREATE TABLE public.parcelas_despesa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  despesa_id UUID NOT NULL REFERENCES public.despesas_cartao(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Paga', 'Vencida')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parcelas_despesa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to parcelas_despesa" ON public.parcelas_despesa FOR ALL USING (true) WITH CHECK (true);

-- ===================== SAIDAS NAO PLANEJADAS =====================
CREATE TABLE public.saidas_nao_planejadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL DEFAULT '',
  valor NUMERIC NOT NULL DEFAULT 0,
  forma_pagamento TEXT NOT NULL DEFAULT '',
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('Peça', 'Terceiro', 'Outros', 'Folha de pagamento', 'Despesas operacionais', 'Cartão de crédito')),
  os_vinculada_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  custo_vinculado_id UUID REFERENCES public.custos_fixos(id) ON DELETE SET NULL,
  cartao_vinculado_id UUID REFERENCES public.cartoes_credito(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saidas_nao_planejadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to saidas_nao_planejadas" ON public.saidas_nao_planejadas FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_saidas_updated_at BEFORE UPDATE ON public.saidas_nao_planejadas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== ORCAMENTOS =====================
CREATE TABLE public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
  validade DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  placa TEXT NOT NULL DEFAULT '',
  modelo TEXT NOT NULL DEFAULT '',
  ano TEXT NOT NULL DEFAULT '',
  cor TEXT NOT NULL DEFAULT '',
  cliente TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  sinistro TEXT NOT NULL DEFAULT 'Não',
  orcamentista TEXT NOT NULL DEFAULT '',
  observacoes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Recusado', 'Convertido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to orcamentos" ON public.orcamentos FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== ORCAMENTO ITENS =====================
CREATE TABLE public.orcamento_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  operacao TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  qtde INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to orcamento_itens" ON public.orcamento_itens FOR ALL USING (true) WITH CHECK (true);

-- ===================== CONFIGURACOES =====================
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to configuracoes" ON public.configuracoes FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
