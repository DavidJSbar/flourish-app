export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          communication_style: string | null
          coaching_approach: string | null
          timezone: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          communication_style?: string | null
          coaching_approach?: string | null
          timezone?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          communication_style?: string | null
          coaching_approach?: string | null
          timezone?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          pillar: 'health' | 'mental' | 'wealth' | 'relationships' | 'purpose'
          title: string
          description: string | null
          target_value: number | null
          current_value: number
          target_date: string | null
          status: 'active' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pillar: 'health' | 'mental' | 'wealth' | 'relationships' | 'purpose'
          title: string
          description?: string | null
          target_value?: number | null
          current_value?: number
          target_date?: string | null
          status?: 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pillar?: 'health' | 'mental' | 'wealth' | 'relationships' | 'purpose'
          title?: string
          description?: string | null
          target_value?: number | null
          current_value?: number
          target_date?: string | null
          status?: 'active' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'goals_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          mood_score: number | null
          energy_level: number | null
          sleep_hours: number | null
          exercise_minutes: number | null
          journal_entry: string | null
          pillar_scores: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          mood_score?: number | null
          energy_level?: number | null
          sleep_hours?: number | null
          exercise_minutes?: number | null
          journal_entry?: string | null
          pillar_scores?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          mood_score?: number | null
          energy_level?: number | null
          sleep_hours?: number | null
          exercise_minutes?: number | null
          journal_entry?: string | null
          pillar_scores?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'daily_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      coaching_sessions: {
        Row: {
          id: string
          user_id: string
          messages: Json
          summary: string | null
          embedding: number[] | null
          pillar_focus: string | null
          emotional_valence: number | null
          action_items: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages: Json
          summary?: string | null
          embedding?: number[] | null
          pillar_focus?: string | null
          emotional_valence?: number | null
          action_items?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: Json
          summary?: string | null
          embedding?: number[] | null
          pillar_focus?: string | null
          emotional_valence?: number | null
          action_items?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'coaching_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      user_streaks: {
        Row: {
          id: string
          user_id: string
          streak_type: string
          current_count: number
          longest_count: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          streak_type: string
          current_count?: number
          longest_count?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          streak_type?: string
          current_count?: number
          longest_count?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_streaks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
      pillar_type: 'health' | 'mental' | 'wealth' | 'relationships' | 'purpose'
      goal_status: 'active' | 'completed' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table types
export type Profile = Tables<'profiles'>
export type Goal = Tables<'goals'>
export type DailyLog = Tables<'daily_logs'>
export type CoachingSession = Tables<'coaching_sessions'>
export type UserStreak = Tables<'user_streaks'>

export type InsertProfile = InsertTables<'profiles'>
export type InsertGoal = InsertTables<'goals'>
export type InsertDailyLog = InsertTables<'daily_logs'>
export type InsertCoachingSession = InsertTables<'coaching_sessions'>
export type InsertUserStreak = InsertTables<'user_streaks'>
