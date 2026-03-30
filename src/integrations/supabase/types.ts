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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      benchmarks_teses: {
        Row: {
          ativo: boolean
          atualizado_em: string
          faturamento_faixa: string
          id: string
          percentual_maximo: number
          percentual_minimo: number
          segmento: string
          tese_nome: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          faturamento_faixa?: string
          id?: string
          percentual_maximo?: number
          percentual_minimo?: number
          segmento?: string
          tese_nome?: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          faturamento_faixa?: string
          id?: string
          percentual_maximo?: number
          percentual_minimo?: number
          segmento?: string
          tese_nome?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          atualizado_em: string | null
          cnpj: string
          compensacao_outro_escritorio: string | null
          compensando_fintax: boolean | null
          criado_em: string | null
          email: string | null
          empresa: string
          faturamento_faixa: string | null
          id: string
          lead_id: string | null
          nome_contato: string | null
          regime_tributario: string | null
          segmento: string | null
          status: string | null
          whatsapp: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cnpj?: string
          compensacao_outro_escritorio?: string | null
          compensando_fintax?: boolean | null
          criado_em?: string | null
          email?: string | null
          empresa: string
          faturamento_faixa?: string | null
          id?: string
          lead_id?: string | null
          nome_contato?: string | null
          regime_tributario?: string | null
          segmento?: string | null
          status?: string | null
          whatsapp?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cnpj?: string
          compensacao_outro_escritorio?: string | null
          compensando_fintax?: boolean | null
          criado_em?: string | null
          email?: string | null
          empresa?: string
          faturamento_faixa?: string | null
          id?: string
          lead_id?: string | null
          nome_contato?: string | null
          regime_tributario?: string | null
          segmento?: string | null
          status?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      compensacoes_mensais: {
        Row: {
          cliente_id: string
          criado_em: string | null
          id: string
          mes_referencia: string
          observacao: string | null
          processo_tese_id: string
          status_pagamento: string | null
          valor_compensado: number | null
          valor_nf_servico: number | null
        }
        Insert: {
          cliente_id: string
          criado_em?: string | null
          id?: string
          mes_referencia: string
          observacao?: string | null
          processo_tese_id: string
          status_pagamento?: string | null
          valor_compensado?: number | null
          valor_nf_servico?: number | null
        }
        Update: {
          cliente_id?: string
          criado_em?: string | null
          id?: string
          mes_referencia?: string
          observacao?: string | null
          processo_tese_id?: string
          status_pagamento?: string | null
          valor_compensado?: number | null
          valor_nf_servico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compensacoes_mensais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensacoes_mensais_processo_tese_id_fkey"
            columns: ["processo_tese_id"]
            isOneToOne: false
            referencedRelation: "processos_teses"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_historico: {
        Row: {
          anotacao: string | null
          criado_em: string | null
          criado_por: string | null
          de_etapa: string | null
          id: string
          lead_id: string
          para_etapa: string
        }
        Insert: {
          anotacao?: string | null
          criado_em?: string | null
          criado_por?: string | null
          de_etapa?: string | null
          id?: string
          lead_id: string
          para_etapa: string
        }
        Update: {
          anotacao?: string | null
          criado_em?: string | null
          criado_por?: string | null
          de_etapa?: string | null
          id?: string
          lead_id?: string
          para_etapa?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_historico_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cnpj: string
          created_by: string | null
          criado_em: string
          email: string
          empresa: string
          faturamento_faixa: string
          id: string
          nome: string
          observacoes: string | null
          origem: string
          regime_tributario: string
          score_lead: number | null
          segmento: string
          status: string
          status_funil: string
          status_funil_atualizado_em: string | null
          token: string
          whatsapp: string
        }
        Insert: {
          cnpj?: string
          created_by?: string | null
          criado_em?: string
          email?: string
          empresa?: string
          faturamento_faixa?: string
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string
          regime_tributario?: string
          score_lead?: number | null
          segmento?: string
          status?: string
          status_funil?: string
          status_funil_atualizado_em?: string | null
          token?: string
          whatsapp?: string
        }
        Update: {
          cnpj?: string
          created_by?: string | null
          criado_em?: string
          email?: string
          empresa?: string
          faturamento_faixa?: string
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string
          regime_tributario?: string
          score_lead?: number | null
          segmento?: string
          status?: string
          status_funil?: string
          status_funil_atualizado_em?: string | null
          token?: string
          whatsapp?: string
        }
        Relationships: []
      }
      motor_teses_config: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          descricao_comercial: string | null
          id: string
          nome_exibicao: string
          ordem_exibicao: number | null
          percentual_max: number
          percentual_min: number
          regimes_elegiveis: string[]
          segmentos_elegiveis: string[]
          tese: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          descricao_comercial?: string | null
          id?: string
          nome_exibicao: string
          ordem_exibicao?: number | null
          percentual_max: number
          percentual_min: number
          regimes_elegiveis?: string[]
          segmentos_elegiveis?: string[]
          tese: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          descricao_comercial?: string | null
          id?: string
          nome_exibicao?: string
          ordem_exibicao?: number | null
          percentual_max?: number
          percentual_min?: number
          regimes_elegiveis?: string[]
          segmentos_elegiveis?: string[]
          tese?: string
        }
        Relationships: []
      }
      processos_teses: {
        Row: {
          atualizado_em: string | null
          cliente_id: string
          criado_em: string | null
          id: string
          nome_exibicao: string
          observacao: string | null
          percentual_honorario: number | null
          status_contrato: string | null
          status_processo: string | null
          tese: string
          valor_credito: number | null
          valor_honorario: number | null
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id: string
          criado_em?: string | null
          id?: string
          nome_exibicao: string
          observacao?: string | null
          percentual_honorario?: number | null
          status_contrato?: string | null
          status_processo?: string | null
          tese: string
          valor_credito?: number | null
          valor_honorario?: number | null
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: string
          criado_em?: string | null
          id?: string
          nome_exibicao?: string
          observacao?: string | null
          percentual_honorario?: number | null
          status_contrato?: string | null
          status_processo?: string | null
          tese?: string
          valor_credito?: number | null
          valor_honorario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_teses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cargo: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          cargo?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          cargo?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relatorios_leads: {
        Row: {
          conteudo_html: string
          criado_em: string
          enviado_em: string | null
          enviado_whatsapp: boolean
          estimativa_total_maxima: number
          estimativa_total_minima: number
          id: string
          lead_id: string
          score: number
          teses_identificadas: Json
        }
        Insert: {
          conteudo_html?: string
          criado_em?: string
          enviado_em?: string | null
          enviado_whatsapp?: boolean
          estimativa_total_maxima?: number
          estimativa_total_minima?: number
          id?: string
          lead_id: string
          score?: number
          teses_identificadas?: Json
        }
        Update: {
          conteudo_html?: string
          criado_em?: string
          enviado_em?: string | null
          enviado_whatsapp?: boolean
          estimativa_total_maxima?: number
          estimativa_total_minima?: number
          id?: string
          lead_id?: string
          score?: number
          teses_identificadas?: Json
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_diagnostico_by_token: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "pmo" | "gestor_tributario" | "comercial" | "cliente"
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
    Enums: {
      app_role: ["admin", "pmo", "gestor_tributario", "comercial", "cliente"],
    },
  },
} as const
