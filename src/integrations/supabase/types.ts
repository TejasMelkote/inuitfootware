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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          conversation_id: string | null
          created_at: string
          event: string
          id: string
          payload: Json
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          event: string
          id?: string
          payload?: Json
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          event?: string
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          delivery_draft: Json
          id: string
          message_count: number
          preferences: Json
          selected_color: string | null
          selected_product_id: string | null
          selected_size: string | null
          session_id: string
          state: string
          updated_at: string
          viewed_videos: string[]
        }
        Insert: {
          created_at?: string
          delivery_draft?: Json
          id?: string
          message_count?: number
          preferences?: Json
          selected_color?: string | null
          selected_product_id?: string | null
          selected_size?: string | null
          session_id: string
          state?: string
          updated_at?: string
          viewed_videos?: string[]
        }
        Update: {
          created_at?: string
          delivery_draft?: Json
          id?: string
          message_count?: number
          preferences?: Json
          selected_color?: string | null
          selected_product_id?: string | null
          selected_size?: string | null
          session_id?: string
          state?: string
          updated_at?: string
          viewed_videos?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "conversations_selected_product_id_fkey"
            columns: ["selected_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          message_type: string
          metadata: Json
          sender: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          metadata?: Json
          sender: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          metadata?: Json
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          conversation_id: string | null
          created_at: string
          customer: Json
          delivery_address: Json
          id: string
          items: Json
          order_number: string
          status: string
          subtotal: number
          updated_at: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          customer: Json
          delivery_address: Json
          id?: string
          items: Json
          order_number: string
          status?: string
          subtotal: number
          updated_at?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          customer?: Json
          delivery_address?: Json
          id?: string
          items?: Json
          order_number?: string
          status?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category: string
          colors: string[]
          created_at: string
          currency: string
          description: string
          featured: boolean
          id: string
          images: string[]
          inventory: number
          materials: string[]
          name: string
          occasions: string[]
          price: number
          short_description: string
          sizes: string[]
          slug: string
          styles: string[]
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category: string
          colors?: string[]
          created_at?: string
          currency?: string
          description: string
          featured?: boolean
          id?: string
          images?: string[]
          inventory?: number
          materials?: string[]
          name: string
          occasions?: string[]
          price: number
          short_description: string
          sizes?: string[]
          slug: string
          styles?: string[]
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category?: string
          colors?: string[]
          created_at?: string
          currency?: string
          description?: string
          featured?: boolean
          id?: string
          images?: string[]
          inventory?: number
          materials?: string[]
          name?: string
          occasions?: string[]
          price?: number
          short_description?: string
          sizes?: string[]
          slug?: string
          styles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          active: boolean
          created_at: string
          description: string
          display_order: number
          duration: string
          id: string
          thumbnail_url: string
          title: string
          video_url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          display_order: number
          duration: string
          id?: string
          thumbnail_url: string
          title: string
          video_url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          display_order?: number
          duration?: string
          id?: string
          thumbnail_url?: string
          title?: string
          video_url?: string
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
