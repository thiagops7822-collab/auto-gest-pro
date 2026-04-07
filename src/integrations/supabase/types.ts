export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cartoes_credito: {
        Row: {
          created_at: string
          dia_fechamento: number
          dia_vencimento: number
          id: string
          limite_total: number
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dia_fechamento?: number
          dia_vencimento?: number
          id?: string
          limite_total?: number
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dia_fechamento?: number
          dia_vencimento?: number
          id?: string
          limite_total?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          id?: string
          updated_at?: string
          valor?: string
        }
        Update: {
          chave?: string
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      custos_fixos: {
        Row: {
          categoria: string
          created_at: string
          data_pagamento: string | null
          dia_vencimento: number
          forma_pagamento: string | null
          id: string
          nome: string
          observacoes: string | null
          recorrencia: string
          status_pagamento: string
          updated_at: string
          valor_pago: number | null
          valor_previsto: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_pagamento?: string | null
          dia_vencimento?: number
          forma_pagamento?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          recorrencia?: string
          status_pagamento?: string
          updated_at?: string
          valor_pago?: number | null
          valor_previsto?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_pagamento?: string | null
          dia_vencimento?: number
          forma_pagamento?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          recorrencia?: string
          status_pagamento?: string
          updated_at?: string
          valor_pago?: number | null
          valor_previsto?: number
        }
        Relationships: []
      }
      despesas_cartao: {
        Row: {
          cartao_id: string
          categoria: string
          created_at: string
          data_compra: string
          descricao: string
          id: string
          os_vinculada_id: string | null
          parcelas: number
          updated_at: string
          valor_total: number
        }
        Insert: {
          cartao_id: string
          categoria?: string
          created_at?: string
          data_compra?: string
          descricao?: string
          id?: string
          os_vinculada_id?: string | null
          parcelas?: number
          updated_at?: string
          valor_total?: number
        }
        Update: {
          cartao_id?: string
          categoria?: string
          created_at?: string
          data_compra?: string
          descricao?: string
          id?: string
          os_vinculada_id?: string | null
          parcelas?: number
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_cartao_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes_credito"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_cartao_os_vinculada_id_fkey"
            columns: ["os_vinculada_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          cargo: string
          cpf: string
          created_at: string
          data_admissao: string
          dia_pagamento: number
          id: string
          nome: string
          salario_base: number
          status: string
          tipo_contrato: string
          updated_at: string
        }
        Insert: {
          cargo?: string
          cpf?: string
          created_at?: string
          data_admissao?: string
          dia_pagamento?: number
          id?: string
          nome: string
          salario_base?: number
          status?: string
          tipo_contrato: string
          updated_at?: string
        }
        Update: {
          cargo?: string
          cpf?: string
          created_at?: string
          data_admissao?: string
          dia_pagamento?: number
          id?: string
          nome?: string
          salario_base?: number
          status?: string
          tipo_contrato?: string
          updated_at?: string
        }
        Relationships: []
      }
      orcamento_itens: {
        Row: {
          created_at: string
          descricao: string
          id: string
          operacao: string
          orcamento_id: string
          qtde: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao?: string
          id?: string
          operacao?: string
          orcamento_id: string
          qtde?: number
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          operacao?: string
          orcamento_id?: string
          qtde?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          ano: string
          cliente: string
          cor: string
          created_at: string
          data_criacao: string
          id: string
          modelo: string
          numero: number
          observacoes: string
          orcamentista: string
          placa: string
          sinistro: string
          status: string
          telefone: string
          updated_at: string
          validade: string
        }
        Insert: {
          ano?: string
          cliente?: string
          cor?: string
          created_at?: string
          data_criacao?: string
          id?: string
          modelo?: string
          numero: number
          observacoes?: string
          orcamentista?: string
          placa?: string
          sinistro?: string
          status?: string
          telefone?: string
          updated_at?: string
          validade?: string
        }
        Update: {
          ano?: string
          cliente?: string
          cor?: string
          created_at?: string
          data_criacao?: string
          id?: string
          modelo?: string
          numero?: number
          observacoes?: string
          orcamentista?: string
          placa?: string
          sinistro?: string
          status?: string
          telefone?: string
          updated_at?: string
          validade?: string
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          ano: string
          cliente: string
          cor: string
          created_at: string
          data_entrada: string
          descricao: string
          id: string
          modelo: string
          numero: number
          placa: string
          status: string
          telefone: string
          tipo_servico: string
          updated_at: string
          valor_orcado: number
        }
        Insert: {
          ano?: string
          cliente?: string
          cor?: string
          created_at?: string
          data_entrada?: string
          descricao?: string
          id?: string
          modelo?: string
          numero: number
          placa?: string
          status?: string
          telefone?: string
          tipo_servico?: string
          updated_at?: string
          valor_orcado?: number
        }
        Update: {
          ano?: string
          cliente?: string
          cor?: string
          created_at?: string
          data_entrada?: string
          descricao?: string
          id?: string
          modelo?: string
          numero?: number
          placa?: string
          status?: string
          telefone?: string
          tipo_servico?: string
          updated_at?: string
          valor_orcado?: number
        }
        Relationships: []
      }
      pagamentos_os: {
        Row: {
          created_at: string
          data: string
          forma: string
          id: string
          observacao: string | null
          os_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string
          forma?: string
          id?: string
          observacao?: string | null
          os_id: string
          valor?: number
        }
        Update: {
          created_at?: string
          data?: string
          forma?: string
          id?: string
          observacao?: string | null
          os_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_os_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas_despesa: {
        Row: {
          created_at: string
          despesa_id: string
          id: string
          mes: string
          status: string
          valor: number
        }
        Insert: {
          created_at?: string
          despesa_id: string
          id?: string
          mes: string
          status?: string
          valor?: number
        }
        Update: {
          created_at?: string
          despesa_id?: string
          id?: string
          mes?: string
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_despesa_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas_cartao"
            referencedColumns: ["id"]
          },
        ]
      }
      pecas_os: {
        Row: {
          created_at: string
          data: string
          descricao: string
          fornecedor: string
          id: string
          os_id: string
          status: string
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string
          descricao?: string
          fornecedor?: string
          id?: string
          os_id: string
          status?: string
          valor?: number
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          fornecedor?: string
          id?: string
          os_id?: string
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pecas_os_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      saidas_nao_planejadas: {
        Row: {
          cartao_vinculado_id: string | null
          created_at: string
          custo_vinculado_id: string | null
          data: string
          descricao: string
          forma_pagamento: string
          funcionario_id: string | null
          id: string
          observacao: string | null
          os_vinculada_id: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          cartao_vinculado_id?: string | null
          created_at?: string
          custo_vinculado_id?: string | null
          data?: string
          descricao?: string
          forma_pagamento?: string
          funcionario_id?: string | null
          id?: string
          observacao?: string | null
          os_vinculada_id?: string | null
          tipo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          cartao_vinculado_id?: string | null
          created_at?: string
          custo_vinculado_id?: string | null
          data?: string
          descricao?: string
          forma_pagamento?: string
          funcionario_id?: string | null
          id?: string
          observacao?: string | null
          os_vinculada_id?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "saidas_nao_planejadas_cartao_vinculado_id_fkey"
            columns: ["cartao_vinculado_id"]
            isOneToOne: false
            referencedRelation: "cartoes_credito"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saidas_nao_planejadas_custo_vinculado_id_fkey"
            columns: ["custo_vinculado_id"]
            isOneToOne: false
            referencedRelation: "custos_fixos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saidas_nao_planejadas_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saidas_nao_planejadas_os_vinculada_id_fkey"
            columns: ["os_vinculada_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      terceiros: {
        Row: {
          created_at: string
          especialidade: string
          id: string
          nome: string
          telefone: string
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          especialidade?: string
          id?: string
          nome: string
          telefone?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          especialidade?: string
          id?: string
          nome?: string
          telefone?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
