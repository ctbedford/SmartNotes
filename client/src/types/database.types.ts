export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      actions: {
        Row: {
          id: string
          user_id: string
          title: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      captures: {
        Row: {
          id: string
          user_id: string
          kind: string
          body: string | null
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kind?: string
          body?: string | null
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          kind?: string
          body?: string | null
          url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "captures_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      resonate: {
        Row: {
          id: string
          user_id: string
          capture_id: string
          value_id: string
          reflection: string | null
          xp_granted: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          capture_id: string
          value_id: string
          reflection?: string | null
          xp_granted?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          capture_id?: string
          value_id?: string
          reflection?: string | null
          xp_granted?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resonate_capture_id_fkey"
            columns: ["capture_id"]
            referencedRelation: "captures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resonate_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resonate_value_id_fkey"
            columns: ["value_id"]
            referencedRelation: "values"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
        }
        Relationships: []
      }
      values: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "values_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      xp_ledger: {
        Row: {
          id: string
          user_id: string
          delta: number
          source_description: string | null
          source_action_id: string | null
          source_resonate_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          delta: number
          source_description?: string | null
          source_action_id?: string | null
          source_resonate_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          delta?: number
          source_description?: string | null
          source_action_id?: string | null
          source_resonate_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_ledger_source_action_id_fkey"
            columns: ["source_action_id"]
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_ledger_source_resonate_id_fkey"
            columns: ["source_resonate_id"]
            referencedRelation: "resonate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_ledger_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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