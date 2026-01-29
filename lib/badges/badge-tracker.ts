/**
 * Badge Tracking System
 * 
 * This module tracks user activities and awards badges automatically
 */

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function trackActivity(
  activityType: 'login' | 'comment' | 'quiz_complete' | 'assignment_submit' | 'voice_note' | 'ai_session' | 'journal_entry',
  activityData?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Record activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData || {},
      })

    // Check for badge eligibility
    await checkBadgeEligibility(user.id, activityType, activityData)
  } catch (error) {
    console.error('Error tracking activity:', error)
  }
}

async function checkBadgeEligibility(
  userId: string,
  activityType: string,
  activityData?: Record<string, any>
) {
  try {
    // Get all badges
    const { data: badges } = await supabase
      .from('badges')
      .select('*')

    if (!badges) return

    // Get user's earned badges
    const { data: earned } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)

    const earnedBadgeIds = new Set(earned?.map(e => e.badge_id) || [])

    // Check each badge
    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue

      const criteria = badge.criteria as any
      let eligible = false

      switch (criteria.type) {
        case 'forum_comments':
          const { count: commentCount } = await supabase
            .from('user_activity')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('activity_type', 'comment')
          eligible = (commentCount || 0) >= criteria.count
          break

        case 'consecutive_logins':
          eligible = await checkConsecutiveLogins(userId, criteria.days)
          break

        case 'perfect_quiz':
          if (activityType === 'quiz_complete' && activityData?.score === 100) {
            eligible = true
          }
          break

        case 'helpful_responses':
          // This would need custom logic based on upvotes/helpful marks
          break

        case 'journal_entries':
          const { count: journalCount } = await supabase
            .from('learning_journals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
          eligible = (journalCount || 0) >= criteria.count
          break

        case 'voice_notes':
          const { count: voiceCount } = await supabase
            .from('voice_notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
          eligible = (voiceCount || 0) >= criteria.count
          break

        case 'ai_sessions':
          const { count: sessionCount } = await supabase
            .from('ai_client_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
          eligible = (sessionCount || 0) >= criteria.count
          break

        case 'modules_completed':
          const { count: completedCount } = await supabase
            .from('module_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_completed', true)
          eligible = (completedCount || 0) >= criteria.count
          break
      }

      if (eligible) {
        // Award badge
        await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
          })
      }
    }
  } catch (error) {
    console.error('Error checking badge eligibility:', error)
  }
}

async function checkConsecutiveLogins(userId: string, requiredDays: number): Promise<boolean> {
  const { data: logins } = await supabase
    .from('user_activity')
    .select('created_at')
    .eq('user_id', userId)
    .eq('activity_type', 'login')
    .order('created_at', { ascending: false })
    .limit(requiredDays)

  if (!logins || logins.length < requiredDays) return false

  // Check if logins are consecutive days
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < requiredDays; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    expectedDate.setHours(0, 0, 0, 0)

    const loginDate = new Date(logins[i].created_at)
    loginDate.setHours(0, 0, 0, 0)

    if (loginDate.getTime() !== expectedDate.getTime()) {
      return false
    }
  }

  return true
}
