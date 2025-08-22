export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      indicators: {
        Row: {
          slug: string
          name: string
          description: string | null
          category: string | null
          unit: string | null
          frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular' | null
          decimals: number
          chart_config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          slug: string
          name: string
          description?: string | null
          category?: string | null
          unit?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular' | null
          decimals?: number
          chart_config?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          description?: string | null
          category?: string | null
          unit?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular' | null
          decimals?: number
          chart_config?: any
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      indicator_series: {
        Row: {
          id: number
          indicator_slug: string
          period_date: string
          value: number
          period_label: string | null
          source_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          indicator_slug: string
          period_date: string
          value: number
          period_label?: string | null
          source_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          indicator_slug?: string
          period_date?: string
          value?: number
          period_label?: string | null
          source_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      indicator_events: {
        Row: {
          id: number
          indicator_slug: string
          date: string
          description: string
          impact: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          indicator_slug: string
          date: string
          description: string
          impact?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          indicator_slug?: string
          date?: string
          description?: string
          impact?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      indicator_insights: {
        Row: {
          id: number
          indicator_slug: string
          content: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          indicator_slug: string
          content: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          indicator_slug?: string
          content?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      indicator_comparisons: {
        Row: {
          id: number
          indicator_slug: string
          compare_indicator_slug: string
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          indicator_slug: string
          compare_indicator_slug: string
          display_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          indicator_slug?: string
          compare_indicator_slug?: string
          display_name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          id: number
          name: string
          url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      repo_rate_data: {
        Row: {
          id: number
          date: string
          rate: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          date: string
          rate: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          date?: string
          rate?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repo_rate_events: {
        Row: {
          id: number
          date: string
          description: string
          impact: 'low' | 'medium' | 'high'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          date: string
          description: string
          impact?: 'low' | 'medium' | 'high'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          date?: string
          description?: string
          impact?: 'low' | 'medium' | 'high'
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repo_rate_insights: {
        Row: {
          id: number
          content: string
          order_index: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          content: string
          order_index?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          content?: string
          order_index?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repo_rate_comparisons: {
        Row: {
          id: number
          indicator_id: string
          name: string
          category: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          indicator_id: string
          name: string
          category: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          indicator_id?: string
          name?: string
          category?: string
          created_at?: string | null
          updated_at?: string | null
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
