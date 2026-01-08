export type ExportFormat = 'json' | 'csv'

export type ExportDataType =
  | 'profile'
  | 'goals'
  | 'daily_logs'
  | 'coaching_sessions'
  | 'streaks'

export interface ExportOptions {
  format: ExportFormat
  dataTypes: ExportDataType[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface ExportedProfile {
  display_name: string | null
  communication_style: string | null
  coaching_approach: string | null
  timezone: string | null
  onboarding_completed: boolean
  created_at: string
}

export interface ExportedGoal {
  pillar: string
  title: string
  description: string | null
  target_value: number | null
  current_value: number
  target_date: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface ExportedDailyLog {
  log_date: string
  mood_score: number | null
  energy_level: number | null
  sleep_hours: number | null
  exercise_minutes: number | null
  journal_entry: string | null
  pillar_scores: Record<string, number> | null
  created_at: string
}

export interface ExportedCoachingSession {
  summary: string | null
  pillar_focus: string | null
  emotional_valence: number | null
  action_items: string[] | null
  message_count: number
  created_at: string
}

export interface ExportedStreak {
  streak_type: string
  current_count: number
  longest_count: number
  last_activity_date: string | null
}

export interface ExportData {
  exported_at: string
  user_id: string
  profile?: ExportedProfile
  goals?: ExportedGoal[]
  daily_logs?: ExportedDailyLog[]
  coaching_sessions?: ExportedCoachingSession[]
  streaks?: ExportedStreak[]
}

export const DATA_TYPE_LABELS: Record<ExportDataType, string> = {
  profile: 'Profile Information',
  goals: 'Goals & Progress',
  daily_logs: 'Daily Logs (Mood, Journal, etc.)',
  coaching_sessions: 'Coaching Session Summaries',
  streaks: 'Activity Streaks',
}

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  json: 'JSON (Complete Data)',
  csv: 'CSV (Tabular Data)',
}
