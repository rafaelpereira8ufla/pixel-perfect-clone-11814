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
      consultas: {
        Row: {
          cancelado_em: string | null
          cancelado_por: string | null
          created_at: string
          data_consulta: string
          horario_id: string | null
          id: string
          link_telemedicina: string | null
          medico_id: string
          modalidade: Database["public"]["Enums"]["consulta_modalidade"]
          motivo_cancelamento: string | null
          paciente_id: string
          status: Database["public"]["Enums"]["consulta_status"]
        }
        Insert: {
          cancelado_em?: string | null
          cancelado_por?: string | null
          created_at?: string
          data_consulta: string
          horario_id?: string | null
          id?: string
          link_telemedicina?: string | null
          medico_id: string
          modalidade: Database["public"]["Enums"]["consulta_modalidade"]
          motivo_cancelamento?: string | null
          paciente_id: string
          status?: Database["public"]["Enums"]["consulta_status"]
        }
        Update: {
          cancelado_em?: string | null
          cancelado_por?: string | null
          created_at?: string
          data_consulta?: string
          horario_id?: string | null
          id?: string
          link_telemedicina?: string | null
          medico_id?: string
          modalidade?: Database["public"]["Enums"]["consulta_modalidade"]
          motivo_cancelamento?: string | null
          paciente_id?: string
          status?: Database["public"]["Enums"]["consulta_status"]
        }
        Relationships: [
          {
            foreignKeyName: "consultas_horario_id_fkey"
            columns: ["horario_id"]
            isOneToOne: false
            referencedRelation: "horarios_disponiveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_disponiveis: {
        Row: {
          created_at: string
          data: string
          disponivel: boolean
          hora_fim: string
          hora_inicio: string
          id: string
          medico_id: string
        }
        Insert: {
          created_at?: string
          data: string
          disponivel?: boolean
          hora_fim: string
          hora_inicio: string
          id?: string
          medico_id: string
        }
        Update: {
          created_at?: string
          data?: string
          disponivel?: boolean
          hora_fim?: string
          hora_inicio?: string
          id?: string
          medico_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_disponiveis_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      medicos: {
        Row: {
          created_at: string
          crm: string
          email: string | null
          especialidade: string
          id: string
          nome: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          crm: string
          email?: string | null
          especialidade: string
          id?: string
          nome: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          crm?: string
          email?: string | null
          especialidade?: string
          id?: string
          nome?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          consulta_id: string
          created_at: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          nota_fiscal_gerada: boolean
          valor: number
        }
        Insert: {
          consulta_id: string
          created_at?: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          nota_fiscal_gerada?: boolean
          valor: number
        }
        Update: {
          consulta_id?: string
          created_at?: string
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          nota_fiscal_gerada?: boolean
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      resultados_consulta: {
        Row: {
          consulta_id: string
          descricao: string
          id: string
          medico_id: string
          publicado_em: string
        }
        Insert: {
          consulta_id: string
          descricao: string
          id?: string
          medico_id: string
          publicado_em?: string
        }
        Update: {
          consulta_id?: string
          descricao?: string
          id?: string
          medico_id?: string
          publicado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "resultados_consulta_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultados_consulta_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "paciente" | "recepcionista" | "medico" | "gestor"
      consulta_modalidade: "presencial" | "telemedicina"
      consulta_status:
        | "agendado"
        | "confirmado"
        | "realizado"
        | "cancelado"
        | "link_enviado"
      forma_pagamento: "dinheiro" | "cartao" | "convenio"
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
      app_role: ["paciente", "recepcionista", "medico", "gestor"],
      consulta_modalidade: ["presencial", "telemedicina"],
      consulta_status: [
        "agendado",
        "confirmado",
        "realizado",
        "cancelado",
        "link_enviado",
      ],
      forma_pagamento: ["dinheiro", "cartao", "convenio"],
    },
  },
} as const
