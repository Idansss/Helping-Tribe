import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Basic platform-wide stats similar to AnalyticsPage
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: activeStudents } = await supabase
      .from('user_activity')
      .select('user_id', { count: 'exact', head: true })
      .eq('activity_type', 'login')
      .gte('created_at', sevenDaysAgo.toISOString())

    const { data: progressData } = await supabase
      .from('module_progress')
      .select('completion_percentage')

    const averageProgress =
      progressData && progressData.length > 0
        ? Math.round(
            progressData.reduce(
              (sum, p) => sum + (p.completion_percentage || 0),
              0
            ) / progressData.length
          )
        : 0

    const { data: completedModules } = await supabase
      .from('module_progress')
      .select('*')
      .eq('completion_percentage', 100)

    const completionRate =
      progressData && progressData.length > 0
        ? Math.round(
            ((completedModules?.length || 0) / progressData.length) *
              100
          )
        : 0

    const { data: quizScores } = await supabase
      .from('module_progress')
      .select('quiz_score')
      .not('quiz_score', 'is', null)

    const averageQuizScore =
      quizScores && quizScores.length > 0
        ? Math.round(
            quizScores.reduce(
              (sum, q) => sum + (q.quiz_score || 0),
              0
            ) / quizScores.length
          )
        : 0

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      totalStudents: totalStudents ?? 0,
      activeStudents: activeStudents ?? 0,
      averageProgress,
      completionRate,
      averageQuizScore,
    })
  } catch (error) {
    console.error('Error generating weekly report payload', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

