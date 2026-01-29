'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Lock, CheckCircle2, Play, Volume2, FileText } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Module, Lesson, UserProgress } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface CoursePlayerProps {
  moduleId: string
}

const worksheetSchema = z.object({
  reflection: z.string().min(10, 'Reflection must be at least 10 characters'),
  keyTakeaways: z.string().min(5, 'Key takeaways are required'),
})

type WorksheetFormData = z.infer<typeof worksheetSchema>

export function CoursePlayer({ moduleId }: CoursePlayerProps) {
  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WorksheetFormData>({
    resolver: zodResolver(worksheetSchema),
  })

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load module
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('*')
          .eq('id', moduleId)
          .single()

        if (moduleError) throw moduleError
        setModule(moduleData as Module)

        // Load lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', moduleId)
          .order('lesson_number', { ascending: true })

        if (lessonsError) throw lessonsError
        if (lessonsData) {
          setLessons(lessonsData as Lesson[])
        }

        // Load user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('lesson_id', lessonsData?.map(l => l.id) || [])

        if (progressError) throw progressError
        if (progressData) {
          setUserProgress(progressData as UserProgress[])
        }
      } catch (error) {
        console.error('Error loading course data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [moduleId, supabase])

  const currentLesson = lessons[currentLessonIndex]
  const currentProgress = currentLesson
    ? userProgress.find(up => up.lesson_id === currentLesson.id)
    : null
  const isCompleted = currentProgress?.is_completed ?? false

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      reset()
    }
  }

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
      reset()
    }
  }

  const onSubmit = async (data: WorksheetFormData) => {
    if (!currentLesson || !module) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Save worksheet submission
      const worksheetData = {
        reflection: data.reflection,
        keyTakeaways: data.keyTakeaways,
        submittedAt: new Date().toISOString(),
      }

      // Update or create progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: currentLesson.id,
          module_id: module.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          worksheet_submission: worksheetData,
        })

      if (progressError) throw progressError

      // Refresh progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', currentLesson.id)
        .single()

      if (progressData) {
        setUserProgress(prev => {
          const filtered = prev.filter(up => up.lesson_id !== currentLesson.id)
          return [...filtered, progressData as UserProgress]
        })
      }

      reset()
    } catch (error) {
      console.error('Error submitting worksheet:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading course content...</p>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Module not found</p>
      </div>
    )
  }

  // Module exists but no lessons: show module content and notes only
  if (lessons.length === 0) {
    const hasContent = (module.content && module.content.trim()) || module.content_url
    return (
      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              Week {module.week_number}: {module.title}
            </CardTitle>
            {module.description && (
              <p className="text-sm text-muted-foreground">{module.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {module.content && module.content.trim() ? (
              <div className="rounded-lg border bg-slate-50/50 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes &amp; content</h3>
                <div
                  className="prose prose-slate max-w-none text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: module.content.replace(/\n/g, '<br />'),
                  }}
                />
              </div>
            ) : !hasContent ? (
              <p className="text-sm text-muted-foreground">
                No content for this module yet. Your facilitator may add notes and readings here soon.
              </p>
            ) : null}
            {module.content_url && (
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                <a
                  href={module.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--talent-primary)] hover:underline"
                >
                  Open / download notes file
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedLessons = lessons.filter(lesson => {
    const progress = userProgress.find(up => up.lesson_id === lesson.id)
    return progress?.is_completed ?? false
  }).length

  const progressPercentage = lessons.length > 0
    ? Math.round((completedLessons / lessons.length) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Module Navigation */}
      <aside className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Week {module.week_number}</CardTitle>
            <p className="text-sm text-muted-foreground">{module.title}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} />
              </div>
              <nav className="space-y-1">
                {lessons.map((lesson, index) => {
                  const lessonProgress = userProgress.find(up => up.lesson_id === lesson.id)
                  const isLessonCompleted = lessonProgress?.is_completed ?? false
                  const isActive = index === currentLessonIndex

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Lesson {lesson.lesson_number}
                        </span>
                        {isLessonCompleted && (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </div>
                      <p className="text-xs mt-1 opacity-80 truncate">
                        {lesson.title}
                      </p>
                    </button>
                  )
                })}
              </nav>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-3 space-y-6">
        {/* Module notes (when admin added content or file) */}
        {((module.content && module.content.trim()) || module.content_url) && (
          <Card className="border-teal-100 bg-teal-50/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" />
                Module notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {module.content && module.content.trim() && (
                <div
                  className="prose prose-slate max-w-none text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: module.content.replace(/\n/g, '<br />'),
                  }}
                />
              )}
              {module.content_url && (
                <a
                  href={module.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--talent-primary)] hover:underline inline-flex items-center gap-1"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Open / download notes file
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lesson Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Lesson {currentLesson.lesson_number}: {currentLesson.title}
                </CardTitle>
                {isCompleted && (
                  <Badge className="mt-2 bg-green-500">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Video Player */}
        {currentLesson.video_url && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Video Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  Video Player Placeholder
                  <br />
                  <span className="text-sm">URL: {currentLesson.video_url}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Player */}
        {currentLesson.audio_url && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Role Play Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Audio Player Placeholder
                  <br />
                  <span className="text-sm">URL: {currentLesson.audio_url}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        {currentLesson.content_html && (
          <Card>
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: currentLesson.content_html }}
              />
            </CardContent>
          </Card>
        )}

        {/* Worksheet */}
        <Card>
          <CardHeader>
            <CardTitle>Worksheet</CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete this worksheet to mark the lesson as complete
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Reflection
                </label>
                <textarea
                  {...register('reflection')}
                  className="w-full min-h-[150px] p-3 border rounded-md"
                  placeholder="Share your thoughts and reflections on this lesson..."
                  disabled={isCompleted || submitting}
                />
                {errors.reflection && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.reflection.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Key Takeaways
                </label>
                <textarea
                  {...register('keyTakeaways')}
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  placeholder="What are the main points you learned?"
                  disabled={isCompleted || submitting}
                />
                {errors.keyTakeaways && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.keyTakeaways.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isCompleted || submitting}
                >
                  {submitting ? 'Submitting...' : isCompleted ? 'Completed' : 'Mark as Complete'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentLessonIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentLessonIndex === lessons.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
