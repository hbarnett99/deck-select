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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      claims: {
        Row: {
          commander_id: string
          created_at: string
          deck_value_usd: number | null
          id: string
          lobby_id: string
          moxfield_url: string | null
          result: string | null
          user_id: string
        }
        Insert: {
          commander_id: string
          created_at?: string
          deck_value_usd?: number | null
          id?: string
          lobby_id: string
          moxfield_url?: string | null
          result?: string | null
          user_id: string
        }
        Update: {
          commander_id?: string
          created_at?: string
          deck_value_usd?: number | null
          id?: string
          lobby_id?: string
          moxfield_url?: string | null
          result?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "commander_stats"
            referencedColumns: ["commander_id"]
          },
          {
            foreignKeyName: "claims_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "commanders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      commanders: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      lobbies: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          name: string
          pool_id: string
          practice_mode: boolean
          status: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          name: string
          pool_id: string
          practice_mode?: boolean
          status?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          name?: string
          pool_id?: string
          practice_mode?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobbies_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_players: {
        Row: {
          commander_id: string | null
          id: string
          is_ready: boolean
          joined_at: string
          lobby_id: string
          user_id: string
        }
        Insert: {
          commander_id?: string | null
          id?: string
          is_ready?: boolean
          joined_at?: string
          lobby_id: string
          user_id: string
        }
        Update: {
          commander_id?: string | null
          id?: string
          is_ready?: boolean
          joined_at?: string
          lobby_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_players_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "commander_stats"
            referencedColumns: ["commander_id"]
          },
          {
            foreignKeyName: "lobby_players_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "commanders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lobby_players_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      ping: {
        Row: {
          created_at: string
          id: number
          last_pinged_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          last_pinged_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          last_pinged_at?: string
        }
        Relationships: []
      }
      pool_commanders: {
        Row: {
          added_at: string
          added_by: string
          commander_id: string
          pool_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          commander_id: string
          pool_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          commander_id?: string
          pool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_commanders_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "commander_stats"
            referencedColumns: ["commander_id"]
          },
          {
            foreignKeyName: "pool_commanders_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "commanders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_commanders_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      whitelisted_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      commander_stats: {
        Row: {
          avg_deck_value_usd: number | null
          commander_id: string | null
          commander_name: string | null
          draws: number | null
          losses: number | null
          times_claimed: number | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_whitelisted: { Args: never; Returns: boolean }
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
