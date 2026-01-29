'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LearningJournal as LearningJournalType, Module } from '@/types'
import { getPromptsForModule, type JournalPrompt } from '@/lib/utils/journal-prompts'
import { VoiceNoteRecorder } from '@/components/lms/VoiceNoteRecorder'
import { useToast } from '@/hooks/use-toast'

const FALLBACK_WEEK_LABELS: Record<number, string> = {
  1: 'Helping Profession, Ethics, Cultural Competence',
  2: 'Exploration & Trauma-Informed Practice',
  3: 'Action Stage, Conflict Resolution',
  4: 'Self-Care & Supervision',
  5: 'Working with Special Populations',
  6: 'Crisis Intervention & Trauma Counselling',
  7: 'Group Counselling & Peer Support',
  8: 'Case Analysis & Feedback',
  9: 'Final Projects & Wrap-Up',
}

export function LearningJournal() {
  const { toast } = useToast()
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [resolvedModule, setResolvedModule] = useState<Module | null>(null)
  const [content, setContent] = useState('')
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [viewMode, setViewMode] = useState<'prompts' | 'freeform'>('prompts')
  const [loadingWeek, setLoadingWeek] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadModules() {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .order('week_number', { ascending: true })

        if (error) throw error
        if (data) {
          setModules(data as Module[])
          if (data.length > 0 && !selectedModuleId) {
            setSelectedModuleId(data[0].id)
          }
        }
      } catch (error) {
        console.error('Error loading modules:', error)
      }
    }

    loadModules()
  }, [supabase, selectedModuleId])

  useEffect(() => {
    async function loadJournal() {
      if (!selectedModuleId) return

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('learning_journals')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', selectedModuleId)
          .maybeSingle()

        if (error) throw error
        if (data) {
          const journal = data as LearningJournalType
          setContent(journal.content || '')
          setPromptAnswers(journal.prompts_answered || {})
        } else {
          setContent('')
          setPromptAnswers({})
        }
        setSaved(false)
      } catch (error) {
        console.error('Error loading journal:', error)
      }
    }

    loadJournal()
  }, [selectedModuleId, supabase])

  useEffect(() => {
    const module = modules.find(m => m.id === selectedModuleId)
    setSelectedModule(module || null)
  }, [selectedModuleId, modules])

  useEffect(() => {
    if (!selectedModuleId || modules.some(m => m.id === selectedModuleId)) {
      setResolvedModule(null)
      return
    }
  }, [selectedModuleId, modules])

  const displayModule = selectedModule || resolvedModule

  const handleSelectFallbackWeek = async (week: number) => {
    setLoadingWeek(week)
    setResolvedModule(null)
    setSelectedModuleId(null)
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('week_number', week)
        .order('week_number', { ascending: true })
        .limit(1)
        .single()

      if (error || !data) {
        toast({
          title: 'Module not found',
          description: `No module data for Week ${week} yet. Run the database seed or add modules in Admin.`,
          variant: 'destructive',
        })
        setLoadingWeek(null)
        return
      }
      const module = data as Module
      setResolvedModule(module)
      setSelectedModuleId(module.id)
    } catch (e) {
      console.error(e)
      toast({
        title: 'Could not load module',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      })
    } finally {
      setLoadingWeek(null)
    }
  }

  const handleSave = async () => {
    if (!selectedModuleId) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Combine prompt answers into content if in prompts mode
      let finalContent = content
      if (viewMode === 'prompts' && displayModule) {
        const prompts = getPromptsForModule(displayModule.week_number)
        if (prompts) {
          const answers = prompts.prompts
            .map(prompt => {
              const answer = promptAnswers[prompt.id] || ''
              return answer ? `**${prompt.question}**\n\n${answer}\n\n` : ''
            })
            .filter(Boolean)
            .join('---\n\n')
          
          if (answers) {
            finalContent = answers + (content ? `\n\n## Additional Notes\n\n${content}` : '')
          }
        }
      }

      const { error } = await supabase
        .from('learning_journals')
        .upsert(
          {
            user_id: user.id,
            module_id: selectedModuleId,
            content: finalContent ?? '',
            prompts_answered: viewMode === 'prompts' ? promptAnswers : undefined,
            reflection_type: 'module_reflection',
          },
          { onConflict: 'user_id,module_id' }
        )

      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      toast({ title: 'Saved', description: 'Your reflection has been saved.' })
    } catch (error: unknown) {
      console.error('Error saving journal:', error)
      const msg = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : error instanceof Error ? error.message : 'Could not save. Please try again.'
      const isMissingTable =
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('schema cache') ||
          msg.toLowerCase().includes('could not find') ||
          msg.toLowerCase().includes('learning_journals') ||
          msg.toLowerCase().includes('does not exist'))
      toast({
        title: isMissingTable ? 'Journal table missing' : 'Save failed',
        description: isMissingTable
          ? 'Run supabase/scripts/create_learning_journals_table.sql in Supabase Dashboard → SQL Editor, then try again.'
          : msg,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePromptAnswer = (promptId: string, answer: string) => {
    setPromptAnswers(prev => ({
      ...prev,
      [promptId]: answer
    }))
  }

  const modulePrompts = displayModule ? getPromptsForModule(displayModule.week_number) : null

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-1 sm:px-2">
      <div>
        <h1 className="text-4xl font-bold">Learning Journal</h1>
        <p className="text-muted-foreground mt-2">
          Document your reflections and insights throughout the course
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Selector */}
        <aside className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {modules.length > 0 ? (
                  modules.map((module) => (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => {
                        setResolvedModule(null)
                        setSelectedModuleId(module.id)
                      }}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        selectedModuleId === module.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        Week {module.week_number}
                      </p>
                      <p className="text-xs mt-1 opacity-80 truncate">
                        {module.title}
                      </p>
                    </button>
                  ))
                ) : (
                  Array.from({ length: 9 }, (_, i) => i + 1).map((week) => (
                    <button
                      key={week}
                      type="button"
                      onClick={() => handleSelectFallbackWeek(week)}
                      disabled={loadingWeek !== null}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        resolvedModule?.week_number === week
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      } disabled:opacity-50`}
                    >
                      <p className="text-sm font-medium">
                        Week {week}
                        {loadingWeek === week ? '…' : ''}
                      </p>
                      <p className="text-xs mt-1 opacity-80 truncate">
                        {FALLBACK_WEEK_LABELS[week]}
                      </p>
                    </button>
                  ))
                )}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Editor */}
        <main className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {displayModule
                      ? `Week ${displayModule.week_number}: ${displayModule.title}`
                      : 'Select a Module'}
                  </CardTitle>
                  <CardDescription>
                    {viewMode === 'prompts' 
                      ? 'Reflect on guided prompts for this module'
                      : 'Your private reflections and notes'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {displayModule && modulePrompts && (
                    <div className="flex gap-1 border rounded-md p-1">
                      <button
                        onClick={() => setViewMode('prompts')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          viewMode === 'prompts'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        Prompts
                      </button>
                      <button
                        onClick={() => setViewMode('freeform')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          viewMode === 'freeform'
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        Freeform
                      </button>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !selectedModuleId}
                    variant="default"
                    title={!selectedModuleId ? 'Select a module from the list to save' : undefined}
                    className="min-w-[100px] bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
                  >
                    {saved ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Voice Note Option */}
              {selectedModuleId && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-sm font-semibold text-[#4c1d95] mb-3">🎙️ Record Audio Reflection (Optional)</h3>
                  <VoiceNoteRecorder
                    moduleId={selectedModuleId}
                    reflectionType="module_reflection"
                  />
                </div>
              )}

              {viewMode === 'prompts' && modulePrompts ? (
                <div className="space-y-6">
                  {modulePrompts.prompts.map((prompt) => (
                    <div key={prompt.id} className="space-y-2">
                      <label className="text-sm font-semibold text-foreground block">
                        {prompt.question}
                      </label>
                      <textarea
                        value={promptAnswers[prompt.id] || ''}
                        onChange={(e) => handlePromptAnswer(prompt.id, e.target.value)}
                        placeholder={prompt.placeholder || 'Your reflection...'}
                        className="w-full min-h-[120px] p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {promptAnswers[prompt.id] && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Answered
                        </p>
                      )}
                    </div>
                  ))}
                  {modulePrompts.endOfCourse && (
                    <div className="mt-6 p-4 bg-primary/5 rounded-md border border-primary/20">
                      <p className="text-sm font-medium text-primary mb-2">
                        🎓 End of Course Reflection
                      </p>
                      <p className="text-xs text-muted-foreground">
                        These prompts help you reflect on your entire learning journey. Take your time to think deeply about your growth and future goals.
                      </p>
                    </div>
                  )}
                  <div className="mt-6 pt-6 border-t pl-2 pr-2 sm:pl-4 sm:pr-4">
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Any additional thoughts, insights, or notes..."
                      className="w-full min-h-[150px] p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your reflections, insights, and notes here..."
                  className="w-full min-h-[500px] p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
