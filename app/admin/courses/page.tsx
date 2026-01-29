'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { BookOpen, PlusCircle, Loader2, Pencil, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface SimpleModule {
  id: string
  title: string
  week: number
}

const MODULE_NOTES_BUCKET = 'final-exams'

export default function AdminCoursesPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [modules, setModules] = React.useState<SimpleModule[]>([])
  const [loading, setLoading] = React.useState(true)
  const [adding, setAdding] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [week, setWeek] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [editModuleId, setEditModuleId] = React.useState<string | null>(null)
  const [editTitle, setEditTitle] = React.useState('')
  const [editDescription, setEditDescription] = React.useState('')
  const [editContent, setEditContent] = React.useState('')
  const [editContentUrl, setEditContentUrl] = React.useState<string | null>(null)
  const [notesFile, setNotesFile] = React.useState<File | null>(null)
  const [editLoading, setEditLoading] = React.useState(false)
  const [editSaving, setEditSaving] = React.useState(false)

  const loadModules = React.useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('id, title, week_number')
        .order('week_number', { ascending: true })

      if (error) throw error
      setModules(
        (data || []).map((row: { id: string; title: string; week_number: number }) => ({
          id: row.id,
          title: row.title,
          week: row.week_number,
        }))
      )
    } catch (err) {
      const msg =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : 'Check the database and try again.'
      const isMissingTable =
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('schema cache') ||
          msg.toLowerCase().includes('could not find') ||
          msg.toLowerCase().includes('does not exist'))
      const isRls =
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('row-level security') ||
          msg.toLowerCase().includes('policy') ||
          msg.toLowerCase().includes('permission denied') ||
          msg.toLowerCase().includes('violates'))
      setLoadError(msg)
      toast({
        title: isMissingTable ? 'Modules table missing' : isRls ? 'Database policy required' : 'Could not load modules',
        description: isMissingTable
          ? 'Run supabase/scripts/create_modules_table.sql in Supabase Dashboard → SQL Editor, then refresh.'
          : isRls
            ? 'Run supabase/migrations/029_modules_admin_policies.sql (or create_modules_table.sql) in Supabase → SQL Editor.'
            : msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  React.useEffect(() => {
    loadModules()
  }, [loadModules])

  React.useEffect(() => {
    if (!editModuleId) return
    let cancelled = false
    setEditLoading(true)
    setNotesFile(null)
    supabase
      .from('modules')
      .select('id, title, week_number, description, content, content_url')
      .eq('id', editModuleId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        setEditLoading(false)
        if (error) {
          toast({ title: 'Could not load module', description: error.message, variant: 'destructive' })
          setEditModuleId(null)
          return
        }
        const row = data as { title: string; description: string | null; content: string | null; content_url: string | null }
        setEditTitle(row.title)
        setEditDescription(row.description ?? '')
        setEditContent(row.content ?? '')
        setEditContentUrl(row.content_url ?? null)
      })
    return () => { cancelled = true }
  }, [editModuleId, supabase, toast])

  const handleCloseEdit = () => {
    setEditModuleId(null)
    setNotesFile(null)
  }

  const handleSaveModuleContent = async () => {
    if (!editModuleId) return
    setEditSaving(true)
    let contentUrl: string | null = editContentUrl
    let fileUploadFailed = false
    try {
      if (notesFile) {
        const ext = (notesFile.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '')
        const safeExt = ext || 'pdf'
        const storagePath = `module-notes/${editModuleId}/${Date.now()}.${safeExt}`
        const { error: uploadError } = await supabase.storage
          .from(MODULE_NOTES_BUCKET)
          .upload(storagePath, notesFile, {
            upsert: true,
            contentType: notesFile.type || 'application/pdf',
          })
        if (uploadError) {
          fileUploadFailed = true
          console.warn('Module notes upload failed:', uploadError)
        } else {
          const { data: urlData } = supabase.storage.from(MODULE_NOTES_BUCKET).getPublicUrl(storagePath)
          contentUrl = urlData.publicUrl
        }
      }
      const { error } = await supabase
        .from('modules')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          content: editContent.trim() || null,
          content_url: contentUrl,
        })
        .eq('id', editModuleId)
      if (error) throw error
      setModules(prev =>
        prev.map(m => (m.id === editModuleId ? { ...m, title: editTitle.trim() } : m))
      )
      if (fileUploadFailed) {
        toast({
          title: 'Content saved; file upload failed',
          description: 'Create bucket "final-exams" in Supabase → Storage (public), then run supabase/scripts/storage_final_exams_bucket.sql in SQL Editor.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Module updated', description: 'Content and notes are visible to learners.' })
      }
      handleCloseEdit()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update module.'
      toast({ title: 'Could not update module', description: msg, variant: 'destructive' })
    } finally {
      setEditSaving(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const weekNumber = Number(week)
    if (!title.trim() || Number.isNaN(weekNumber) || weekNumber < 1 || weekNumber > 9) {
      toast({
        title: 'Invalid input',
        description: 'Title is required and week must be 1–9.',
        variant: 'destructive',
      })
      return
    }

    setAdding(true)
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert({
          title: title.trim(),
          week_number: weekNumber,
          description: description.trim() || null,
          is_locked: false,
        })
        .select('id, title, week_number')
        .single()

      if (error) throw error
      setModules(prev => [
        ...prev,
        { id: (data as { id: string }).id, title: (data as { title: string }).title, week: (data as { week_number: number }).week_number },
      ])
      setTitle('')
      setWeek('')
      setDescription('')
      toast({ title: 'Module added', description: `Week ${weekNumber} is now available to learners.` })
    } catch (err: unknown) {
      console.error(err)
      const msg =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : 'Failed to add module.'
      const isConflict = typeof msg === 'string' && (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate'))
      const isRls =
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('row-level security') ||
          msg.toLowerCase().includes('policy') ||
          msg.toLowerCase().includes('permission denied') ||
          msg.toLowerCase().includes('violates'))
      const isMissingTable =
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('schema cache') || msg.toLowerCase().includes("could not find") || msg.toLowerCase().includes('does not exist'))
      toast({
        title: isConflict ? 'Week already exists' : isMissingTable ? 'Modules table missing' : isRls ? 'Database policy required' : 'Could not add module',
        description: isConflict
          ? `Week ${weekNumber} already has a module. Edit it or choose another week.`
          : isMissingTable
            ? 'Run supabase/scripts/create_modules_table.sql in Supabase Dashboard → SQL Editor, then try again.'
            : isRls
              ? 'Run supabase/migrations/029_modules_admin_policies.sql in Supabase Dashboard → SQL Editor, then try again.'
              : msg,
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[var(--talent-primary-dark)]">
            Courses &amp; learning structure
          </h1>
          <p className="text-sm text-muted-foreground">
            Lightweight course builder for the 9‑week counseling program.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Program modules (course list)
            </h2>
            <Badge variant="outline">{modules.length} modules</Badge>
          </div>

          {loadError && (
            <Card className="p-4 mb-4 border-amber-200 bg-amber-50 text-amber-900">
              <p className="text-sm font-medium mb-1">Could not load modules</p>
              <p className="text-xs text-amber-800 mb-2">
                {loadError.toLowerCase().includes('schema cache') || loadError.toLowerCase().includes('could not find') || loadError.toLowerCase().includes('does not exist')
                  ? 'The modules table is missing. Run the script below in Supabase Dashboard → SQL Editor, then click Refresh.'
                  : 'Check the database and fix the issue, then click Refresh.'}
              </p>
              <p className="text-xs font-mono bg-amber-100/80 px-2 py-1.5 rounded break-all mb-3">
                supabase/scripts/create_modules_table.sql
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadModules()}
                className="border-amber-300 text-amber-900 hover:bg-amber-100"
              >
                Refresh
              </Button>
            </Card>
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading modules…
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {loadError
                ? 'Fix the database using the script above, then refresh this page to load modules.'
                : 'No modules yet. Use the form on the right to add a module (e.g. Week 1). Learners will then see it in My Course and the Learning Journal.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="px-3 py-2 text-left font-medium">Course</th>
                    <th className="px-3 py-2 text-left font-medium">Code</th>
                    <th className="px-3 py-2 text-left font-medium">Week</th>
                    <th className="px-3 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modules
                    .slice()
                    .sort((a, b) => a.week - b.week)
                    .map((m) => (
                      <tr
                        key={m.id}
                        className="border-b last:border-0 hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-2 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                              <BookOpen className="h-3.5 w-3.5 text-[var(--talent-primary-dark)]" />
                            </div>
                            <div className="font-semibold text-slate-900">
                              {m.title}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 align-middle text-slate-600">
                          HF-{m.week.toString().padStart(2, '0')}
                        </td>
                        <td className="px-3 py-2 align-middle text-slate-500">
                          Week {m.week}
                        </td>
                        <td className="px-3 py-2 align-middle text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[var(--talent-primary-dark)]"
                            onClick={() => setEditModuleId(m.id)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit content
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Add new module
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Modules are saved to the database so learners see them in My Course and the Learning Journal.
          </p>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <Label htmlFor="week">Week number (1–9)</Label>
              <Input
                id="week"
                type="number"
                min={1}
                max={9}
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="title">Course / module title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Helping Profession, Ethics, Cultural Competence"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description for this week"
              />
            </div>
            <Button
              type="submit"
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Add module
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground mt-2">
              If you see &quot;schema cache&quot; or &quot;table not found&quot;, run <code className="bg-muted px-1 rounded">supabase/scripts/create_modules_table.sql</code> in Supabase → SQL Editor.
            </p>
          </form>
        </Card>
      </div>

      <Dialog open={!!editModuleId} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit module content</DialogTitle>
            <DialogDescription>
              Type notes and instructions for students, or upload a notes file (PDF, etc.). Students will see this when they open the module.
            </DialogDescription>
          </DialogHeader>
          {editLoading ? (
            <div className="flex items-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading module…
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="edit-title">Module title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Ethics"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Short description (optional)</Label>
                <Input
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Brief description for this week"
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content / notes for students</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Type instructions, readings, or notes here. Students will see this when they open the module."
                  className="min-h-[160px] resize-y"
                />
              </div>
              <div>
                <Label>Upload notes file (PDF, etc.)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Optional. Replaces any existing notes file. Students can open or download it.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setNotesFile(e.target.files?.[0] ?? null)}
                    className="max-w-xs"
                  />
                  {notesFile && (
                    <span className="text-xs text-muted-foreground">{notesFile.name}</span>
                  )}
                </div>
                {editContentUrl && !notesFile && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Current file: <a href={editContentUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--talent-primary)] underline">Open link</a>
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveModuleContent}
              disabled={editLoading || editSaving}
              className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
            >
              {editSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                'Save content'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

