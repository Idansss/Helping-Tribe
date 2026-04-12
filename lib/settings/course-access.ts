import type { SupabaseClient } from '@supabase/supabase-js'

export const COURSE_ACCESS_SETTINGS_KEY = 'manual_unlocked_weeks'
export const COURSE_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export type CourseAccessSettings = {
  manualUnlockedWeeks: number[]
}

export function normalizeManualUnlockedWeeks(input: unknown) {
  if (!Array.isArray(input)) return []

  return Array.from(
    new Set(
      input
        .map((value) => Number(value))
        .filter((weekNumber) => Number.isInteger(weekNumber) && weekNumber >= 1 && weekNumber <= 9)
    )
  ).sort((left, right) => left - right)
}

export async function getCourseAccessSettings(
  admin: SupabaseClient
): Promise<CourseAccessSettings> {
  const { data } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', COURSE_ACCESS_SETTINGS_KEY)
    .maybeSingle()

  const weeks = normalizeManualUnlockedWeeks((data?.value as { weeks?: unknown } | null)?.weeks)

  return {
    manualUnlockedWeeks: weeks,
  }
}

export function serializeCourseAccessSettings(input: CourseAccessSettings) {
  return {
    weeks: normalizeManualUnlockedWeeks(input.manualUnlockedWeeks),
  }
}

export function isWeekManuallyUnlocked(weekNumber: number, manualUnlockedWeeks: number[]) {
  return normalizeManualUnlockedWeeks(manualUnlockedWeeks).includes(weekNumber)
}
