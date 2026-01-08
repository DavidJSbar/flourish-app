import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type {
  ExportOptions,
  ExportData,
  ExportedProfile,
  ExportedGoal,
  ExportedDailyLog,
  ExportedCoachingSession,
  ExportedStreak,
  ExportDataType,
} from './types'

type SupabaseClientType = SupabaseClient<Database>

export async function fetchExportData(
  supabase: SupabaseClientType,
  userId: string,
  options: ExportOptions
): Promise<ExportData> {
  const exportData: ExportData = {
    exported_at: new Date().toISOString(),
    user_id: userId,
  }

  const fetchPromises: Promise<void>[] = []

  if (options.dataTypes.includes('profile')) {
    fetchPromises.push(
      fetchProfile(supabase, userId).then((profile) => {
        exportData.profile = profile
      })
    )
  }

  if (options.dataTypes.includes('goals')) {
    fetchPromises.push(
      fetchGoals(supabase, userId, options.dateRange).then((goals) => {
        exportData.goals = goals
      })
    )
  }

  if (options.dataTypes.includes('daily_logs')) {
    fetchPromises.push(
      fetchDailyLogs(supabase, userId, options.dateRange).then((logs) => {
        exportData.daily_logs = logs
      })
    )
  }

  if (options.dataTypes.includes('coaching_sessions')) {
    fetchPromises.push(
      fetchCoachingSessions(supabase, userId, options.dateRange).then((sessions) => {
        exportData.coaching_sessions = sessions
      })
    )
  }

  if (options.dataTypes.includes('streaks')) {
    fetchPromises.push(
      fetchStreaks(supabase, userId).then((streaks) => {
        exportData.streaks = streaks
      })
    )
  }

  await Promise.all(fetchPromises)

  return exportData
}

async function fetchProfile(
  supabase: SupabaseClientType,
  userId: string
): Promise<ExportedProfile | undefined> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, communication_style, coaching_approach, timezone, onboarding_completed, created_at')
    .eq('id', userId)
    .single()

  if (error || !data) return undefined

  return {
    display_name: data.display_name,
    communication_style: data.communication_style,
    coaching_approach: data.coaching_approach,
    timezone: data.timezone,
    onboarding_completed: data.onboarding_completed,
    created_at: data.created_at,
  }
}

async function fetchGoals(
  supabase: SupabaseClientType,
  userId: string,
  dateRange?: { start: string; end: string }
): Promise<ExportedGoal[]> {
  let query = supabase
    .from('goals')
    .select('pillar, title, description, target_value, current_value, target_date, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map((goal) => ({
    pillar: goal.pillar,
    title: goal.title,
    description: goal.description,
    target_value: goal.target_value,
    current_value: goal.current_value,
    target_date: goal.target_date,
    status: goal.status,
    created_at: goal.created_at,
    updated_at: goal.updated_at,
  }))
}

async function fetchDailyLogs(
  supabase: SupabaseClientType,
  userId: string,
  dateRange?: { start: string; end: string }
): Promise<ExportedDailyLog[]> {
  let query = supabase
    .from('daily_logs')
    .select('log_date, mood_score, energy_level, sleep_hours, exercise_minutes, journal_entry, pillar_scores, created_at')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })

  if (dateRange) {
    query = query
      .gte('log_date', dateRange.start)
      .lte('log_date', dateRange.end)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map((log) => ({
    log_date: log.log_date,
    mood_score: log.mood_score,
    energy_level: log.energy_level,
    sleep_hours: log.sleep_hours,
    exercise_minutes: log.exercise_minutes,
    journal_entry: log.journal_entry,
    pillar_scores: log.pillar_scores as Record<string, number> | null,
    created_at: log.created_at,
  }))
}

async function fetchCoachingSessions(
  supabase: SupabaseClientType,
  userId: string,
  dateRange?: { start: string; end: string }
): Promise<ExportedCoachingSession[]> {
  let query = supabase
    .from('coaching_sessions')
    .select('messages, summary, pillar_focus, emotional_valence, action_items, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map((session) => ({
    summary: session.summary,
    pillar_focus: session.pillar_focus,
    emotional_valence: session.emotional_valence,
    action_items: session.action_items as string[] | null,
    message_count: Array.isArray(session.messages) ? session.messages.length : 0,
    created_at: session.created_at,
  }))
}

async function fetchStreaks(
  supabase: SupabaseClientType,
  userId: string
): Promise<ExportedStreak[]> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('streak_type, current_count, longest_count, last_activity_date')
    .eq('user_id', userId)

  if (error || !data) return []

  return data.map((streak) => ({
    streak_type: streak.streak_type,
    current_count: streak.current_count,
    longest_count: streak.longest_count,
    last_activity_date: streak.last_activity_date,
  }))
}

export function generateJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

export function generateCSV(data: ExportData): string {
  const sections: string[] = []

  // Profile section
  if (data.profile) {
    sections.push('# Profile')
    sections.push('display_name,communication_style,coaching_approach,timezone,onboarding_completed,created_at')
    sections.push(csvRow([
      data.profile.display_name || '',
      data.profile.communication_style || '',
      data.profile.coaching_approach || '',
      data.profile.timezone || '',
      String(data.profile.onboarding_completed),
      data.profile.created_at,
    ]))
  }

  // Goals section
  if (data.goals && data.goals.length > 0) {
    sections.push('')
    sections.push('# Goals')
    sections.push('pillar,title,description,target_value,current_value,target_date,status,created_at,updated_at')
    data.goals.forEach((goal) => {
      sections.push(csvRow([
        goal.pillar,
        goal.title,
        goal.description || '',
        goal.target_value?.toString() || '',
        goal.current_value.toString(),
        goal.target_date || '',
        goal.status,
        goal.created_at,
        goal.updated_at,
      ]))
    })
  }

  // Daily logs section
  if (data.daily_logs && data.daily_logs.length > 0) {
    sections.push('')
    sections.push('# Daily Logs')
    sections.push('log_date,mood_score,energy_level,sleep_hours,exercise_minutes,journal_entry,created_at')
    data.daily_logs.forEach((log) => {
      sections.push(csvRow([
        log.log_date,
        log.mood_score?.toString() || '',
        log.energy_level?.toString() || '',
        log.sleep_hours?.toString() || '',
        log.exercise_minutes?.toString() || '',
        log.journal_entry || '',
        log.created_at,
      ]))
    })
  }

  // Coaching sessions section
  if (data.coaching_sessions && data.coaching_sessions.length > 0) {
    sections.push('')
    sections.push('# Coaching Sessions')
    sections.push('summary,pillar_focus,emotional_valence,message_count,created_at')
    data.coaching_sessions.forEach((session) => {
      sections.push(csvRow([
        session.summary || '',
        session.pillar_focus || '',
        session.emotional_valence?.toString() || '',
        session.message_count.toString(),
        session.created_at,
      ]))
    })
  }

  // Streaks section
  if (data.streaks && data.streaks.length > 0) {
    sections.push('')
    sections.push('# Streaks')
    sections.push('streak_type,current_count,longest_count,last_activity_date')
    data.streaks.forEach((streak) => {
      sections.push(csvRow([
        streak.streak_type,
        streak.current_count.toString(),
        streak.longest_count.toString(),
        streak.last_activity_date || '',
      ]))
    })
  }

  return sections.join('\n')
}

function csvRow(values: string[]): string {
  return values.map((v) => {
    const escaped = v.replace(/"/g, '""')
    return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
      ? `"${escaped}"`
      : escaped
  }).join(',')
}

export function getExportFilename(format: 'json' | 'csv'): string {
  const date = new Date().toISOString().split('T')[0]
  return `flourish-export-${date}.${format}`
}

export function getExportMimeType(format: 'json' | 'csv'): string {
  return format === 'json' ? 'application/json' : 'text/csv'
}

export function getAllDataTypes(): ExportDataType[] {
  return ['profile', 'goals', 'daily_logs', 'coaching_sessions', 'streaks']
}
