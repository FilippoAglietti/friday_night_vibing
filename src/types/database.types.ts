// ============================================================
// SUPABASE DATABASE TYPES - AUTO-GENERATED
// Progetto: syllabi-ai (gmxseuttpurnxbluvcwx)
// Generato il: 2026-04-07
// NON modificare manualmente — rigenera con: supabase gen types
// ============================================================

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
      courses: {
        Row: {
          audience: string
          content_type: Database["public"]["Enums"]["content_type"]
          course_abstract: string | null
          created_at: string
          curriculum: Json | null
          description: string | null
          embedding: string | null
          error_message: string | null
          generation_completed_modules: number | null
          generation_errors: Json
          generation_progress: string | null
          generation_total_modules: number | null
          has_attachments: boolean | null
          id: string
          include_quizzes: boolean | null
          is_public: boolean | null
          is_published: boolean | null
          language: string | null
          learner_profile: string | null
          length: string
          level: Database["public"]["Enums"]["course_level"] | null
          niche: string | null
          output_structure: string | null
          status: Database["public"]["Enums"]["generation_status"]
          teaching_style: string | null
          thumbnail_url: string | null
          title: string | null
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          audience: string
          content_type?: Database["public"]["Enums"]["content_type"]
          course_abstract?: string | null
          created_at?: string
          curriculum?: Json | null
          description?: string | null
          embedding?: string | null
          error_message?: string | null
          generation_completed_modules?: number | null
          generation_errors?: Json
          generation_progress?: string | null
          generation_total_modules?: number | null
          has_attachments?: boolean | null
          id?: string
          include_quizzes?: boolean | null
          is_public?: boolean | null
          is_published?: boolean | null
          language?: string | null
          learner_profile?: string | null
          length: string
          level?: Database["public"]["Enums"]["course_level"] | null
          niche?: string | null
          output_structure?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          teaching_style?: string | null
          thumbnail_url?: string | null
          title?: string | null
          topic: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          course_abstract?: string | null
          created_at?: string
          curriculum?: Json | null
          description?: string | null
          embedding?: string | null
          error_message?: string | null
          generation_completed_modules?: number | null
          generation_errors?: Json
          generation_progress?: string | null
          generation_total_modules?: number | null
          has_attachments?: boolean | null
          id?: string
          include_quizzes?: boolean | null
          is_public?: boolean | null
          is_published?: boolean | null
          language?: string | null
          learner_profile?: string | null
          length?: string
          level?: Database["public"]["Enums"]["course_level"] | null
          niche?: string | null
          output_structure?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          teaching_style?: string | null
          thumbnail_url?: string | null
          title?: string | null
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          course_id: string
          created_at: string
          duration_sec: number | null
          file_size_kb: number | null
          id: string
          metadata: Json | null
          status: string
          storage_path: string | null
          type: string
          url: string
          user_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_sec?: number | null
          file_size_kb?: number | null
          id?: string
          metadata?: Json | null
          status?: string
          storage_path?: string | null
          type: string
          url: string
          user_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_sec?: number | null
          file_size_kb?: number | null
          id?: string
          metadata?: Json | null
          status?: string
          storage_path?: string | null
          type?: string
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          generations_limit: number
          generations_used: number
          id: string
          is_admin: boolean
          onboarding_completed: boolean | null
          plan: Database["public"]["Enums"]["plan_type"]
          preferred_language: string | null
          stripe_customer_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          generations_limit?: number
          generations_used?: number
          id: string
          is_admin?: boolean
          onboarding_completed?: boolean | null
          plan?: Database["public"]["Enums"]["plan_type"]
          preferred_language?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          generations_limit?: number
          generations_used?: number
          id?: string
          is_admin?: boolean
          onboarding_completed?: boolean | null
          plan?: Database["public"]["Enums"]["plan_type"]
          preferred_language?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id: string | null
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string | null
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          course_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          converted: boolean | null
          created_at: string
          email: string
          id: string
          source: string | null
          utm_params: Json | null
        }
        Insert: {
          converted?: boolean | null
          created_at?: string
          email: string
          id?: string
          source?: string | null
          utm_params?: Json | null
        }
        Update: {
          converted?: boolean | null
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          utm_params?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      hypopg_hidden_indexes: {
        Row: {
          am_name: unknown
          index_name: unknown
          indexrelid: unknown
          is_hypo: boolean | null
          schema_name: unknown
          table_name: unknown
        }
        Relationships: []
      }
      hypopg_list_indexes: {
        Row: {
          am_name: unknown
          index_name: string | null
          indexrelid: unknown
          schema_name: unknown
          table_name: unknown
        }
        Relationships: []
      }
    }
    Functions: {
      check_username_available: {
        Args: { p_username: string }
        Returns: boolean
      }
      hypopg: { Args: never; Returns: Record<string, unknown>[] }
      hypopg_create_index: {
        Args: { sql_order: string }
        Returns: Record<string, unknown>[]
      }
      hypopg_drop_index: { Args: { indexid: unknown }; Returns: boolean }
      hypopg_get_indexdef: { Args: { indexid: unknown }; Returns: string }
      hypopg_hidden_indexes: {
        Args: never
        Returns: {
          indexid: unknown
        }[]
      }
      hypopg_hide_index: { Args: { indexid: unknown }; Returns: boolean }
      hypopg_relation_size: { Args: { indexid: unknown }; Returns: number }
      hypopg_reset: { Args: never; Returns: undefined }
      hypopg_reset_index: { Args: never; Returns: undefined }
      hypopg_unhide_all_indexes: { Args: never; Returns: undefined }
      hypopg_unhide_index: { Args: { indexid: unknown }; Returns: boolean }
      increment_generation_usage: {
        Args: { p_course_id: string; p_event_type: string; p_user_id: string }
        Returns: undefined
      }
      increment_generations_used: {
        Args: { user_id: string }
        Returns: undefined
      }
      index_advisor: {
        Args: { query: string }
        Returns: {
          errors: string[]
          index_statements: string[]
          startup_cost_after: Json
          startup_cost_before: Json
          total_cost_after: Json
          total_cost_before: Json
        }[]
      }
      search_similar_courses: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          id: string
          similarity: number
          title: string
          topic: string
          user_id: string
        }[]
      }
      set_username: {
        Args: { p_user_id: string; p_username: string }
        Returns: undefined
      }
      validate_curriculum_schema: {
        Args: { curriculum: Json }
        Returns: boolean
      }
    }
    Enums: {
      content_type: "text" | "audio" | "video" | "mixed"
      course_level: "beginner" | "intermediate" | "advanced"
      generation_status: "pending" | "generating" | "ready" | "failed"
      plan_type: "free" | "pro" | "team"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
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
      content_type: ["text", "audio", "video", "mixed"],
      course_level: ["beginner", "intermediate", "advanced"],
      generation_status: ["pending", "generating", "ready", "failed"],
      plan_type: ["free", "pro", "team"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "incomplete",
      ],
    },
  },
} as const
