// ============================================================
// SUPABASE DATABASE TYPES - AUTO-GENERATED
// Progetto: syllabi-ai (gmxseuttpurnxbluvcwx)
// Generato il: 2026-03-31
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
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          audience: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          curriculum: Json | null
          description: string | null
          error_message: string | null
          id: string
          is_public: boolean | null
          is_published: boolean | null
          language: string | null
          length: string
          level: Database["public"]["Enums"]["course_level"] | null
          niche: string | null
          status: Database["public"]["Enums"]["generation_status"]
          thumbnail_url: string | null
          title: string | null
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          audience: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          curriculum?: Json | null
          description?: string | null
          error_message?: string | null
          id?: string
          is_public?: boolean | null
          is_published?: boolean | null
          language?: string | null
          length: string
          level?: Database["public"]["Enums"]["course_level"] | null
          niche?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          thumbnail_url?: string | null
          title?: string | null
          topic: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          curriculum?: Json | null
          description?: string | null
          error_message?: string | null
          id?: string
          is_public?: boolean | null
          is_published?: boolean | null
          language?: string | null
          length?: string
          level?: Database["public"]["Enums"]["course_level"] | null
          niche?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
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
          onboarding_completed: boolean | null
          plan: Database["public"]["Enums"]["plan_type"]
          preferred_language: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          generations_limit?: number
          generations_used?: number
          id: string
          onboarding_completed?: boolean | null
          plan?: Database["public"]["Enums"]["plan_type"]
          preferred_language?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          generations_limit?: number
          generations_used?: number
          id?: string
          onboarding_completed?: boolean | null
          plan?: Database["public"]["Enums"]["plan_type"]
          preferred_language?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
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
      [_ in never]: never
    }
    Functions: {
      increment_generation_usage: {
        Args: { p_course_id: string; p_event_type: string; p_user_id: string }
        Returns: undefined
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

// ── Utility types ────────────────────────────────────────────
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]

export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]

// ── Shorthand types (usali nel codice) ───────────────────────
export type Profile     = Tables<"profiles">
export type Course      = Tables<"courses">
export type MediaAsset  = Tables<"media_assets">
export type Subscription = Tables<"subscriptions">
export type UsageEvent  = Tables<"usage_events">
export type Waitlist    = Tables<"waitlist">

export type PlanType          = Enums<"plan_type">
export type GenerationStatus  = Enums<"generation_status">
export type ContentType       = Enums<"content_type">
export type CourseLevel       = Enums<"course_level">
export type SubscriptionStatus = Enums<"subscription_status">

export const Constants = {
  public: {
    Enums: {
      content_type: ["text", "audio", "video", "mixed"] as const,
      course_level: ["beginner", "intermediate", "advanced"] as const,
      generation_status: ["pending", "generating", "ready", "failed"] as const,
      plan_type: ["free", "pro", "team"] as const,
      subscription_status: ["active", "canceled", "past_due", "trialing", "incomplete"] as const,
    },
  },
} as const
