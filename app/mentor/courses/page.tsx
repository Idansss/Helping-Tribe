'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen,
  Clock,
  Search,
  MoreVertical,
  Plus,
  Filter,
  Upload,
  FileText,
  Users,
  Copy,
  Trash2,
  ArrowUpDown,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ModuleRow {
  id: string
  title: string
  week_number: number
  completion_rate: number
  code?: string
  description?: string
  importFileName?: string
  importRaw?: string
  createdAt?: string
  updatedAt?: string
  category?: 'Foundations' | 'Ethics' | 'Practicum' | 'General'
}

const COURSES_STORAGE_KEY = 'ht-mentor-courses'

export default function MentorCoursesPage() {
  const supabase = createClient()
  const [modules, setModules] = useState<ModuleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterWeek, setFilterWeek] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'week' | 'title' | 'updated'>('week')
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [showLearnersDialog, setShowLearnersDialog] = useState(false)
  
  // Form states for create course
  const [courseTitle, setCourseTitle] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [courseWeek, setCourseWeek] = useState('1')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    loadModules()
  }, [])

  // Persist courses to localStorage whenever modules change
  useEffect(() => {
    if (modules.length > 0) {
      try {
        localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(modules))
      } catch {
        // ignore
      }
    }
  }, [modules])

  async function loadModules() {
    setLoading(true)
    try {
      // Load from Supabase
      const { data: moduleRows } = await supabase
        .from('modules')
        .select('id, title, week_number')
        .order('week_number', { ascending: true })

      const { data: progress } = await supabase
        .from('module_progress')
        .select('module_id, is_completed')

      const completionByModule: Record<string, number> = {}
      if (progress && progress.length > 0) {
        const grouped: Record<string, { done: number; total: number }> = {}
        for (const row of progress as any[]) {
          const mid = row.module_id
          if (!grouped[mid]) grouped[mid] = { done: 0, total: 0 }
          grouped[mid].total += 1
          if (row.is_completed) grouped[mid].done += 1
        }
        for (const [mid, g] of Object.entries(grouped)) {
          completionByModule[mid] =
            g.total > 0 ? Math.round((g.done / g.total) * 100) : 0
        }
      }

      const supabaseModules = (moduleRows || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        week_number: m.week_number,
        completion_rate: completionByModule[m.id] ?? 0,
        updatedAt: new Date().toISOString(),
      }))

      // Load from localStorage
      let localCourses: ModuleRow[] = []
      try {
        const stored = localStorage.getItem(COURSES_STORAGE_KEY)
        if (stored) {
          localCourses = JSON.parse(stored)
        }
      } catch {
        // ignore
      }

      // Merge and deduplicate (localStorage takes precedence for manually created courses)
      const allModules = [...supabaseModules]
      const existingIds = new Set(supabaseModules.map(m => m.id))
      
      for (const localCourse of localCourses) {
        if (!existingIds.has(localCourse.id)) {
          allModules.push(localCourse)
        }
      }

      // Sort by week number
      allModules.sort((a, b) => a.week_number - b.week_number)

      setModules(allModules)
    } finally {
      setLoading(false)
    }
  }

  function addCourse(course: Omit<ModuleRow, 'completion_rate'>) {
    const now = new Date().toISOString()
    const newCourse: ModuleRow = {
      ...course,
      completion_rate: 0,
      createdAt: course.createdAt ?? now,
      updatedAt: now,
      category:
        course.category ??
        (course.week_number >= 7
          ? 'Practicum'
          : course.week_number >= 3
            ? 'Ethics'
            : 'Foundations'),
    }
    setModules(prev => [...prev, newCourse])
  }

  function deleteCourse(courseId: string) {
    if (!confirm('Delete this course?')) return
    setModules((prev) => prev.filter((m) => m.id !== courseId))
    setSelectedIds((prev) => {
      const next = { ...prev }
      delete next[courseId]
      return next
    })
    if (selectedCourseId === courseId) setSelectedCourseId(null)
  }

  function duplicateCourse(course: ModuleRow) {
    const now = new Date().toISOString()
    const copy: ModuleRow = {
      ...course,
      id: `course-dup-${Date.now()}`,
      title: `${course.title} (Copy)`,
      completion_rate: 0,
      createdAt: now,
      updatedAt: now,
    }
    setModules((prev) => [...prev, copy])
  }

  function bulkDelete() {
    const ids = Object.entries(selectedIds)
      .filter(([, v]) => v)
      .map(([k]) => k)
    if (ids.length === 0) return
    if (!confirm(`Delete ${ids.length} selected course(s)?`)) return
    setModules((prev) => prev.filter((m) => !ids.includes(m.id)))
    setSelectedIds({})
  }

  function toggleSelectAll(currentIds: string[], checked: boolean) {
    const next: Record<string, boolean> = { ...selectedIds }
    for (const id of currentIds) next[id] = checked
    setSelectedIds(next)
  }

  function downloadTextFile(filename: string, contents: string) {
    try {
      const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }

  const selectedCourse =
    selectedCourseId ? modules.find((m) => m.id === selectedCourseId) : null

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds]
  )

  function openCourse(course: ModuleRow) {
    setSelectedCourseId(course.id)
    setShowDetailsDialog(true)
    setShowEditDialog(false)
    setShowLearnersDialog(false)
  }

  function startEditCourse(course: ModuleRow) {
    setSelectedCourseId(course.id)
    setCourseTitle(course.title ?? '')
    setCourseCode(course.code ?? '')
    setCourseDescription(course.description ?? '')
    setCourseWeek(String(course.week_number ?? 1))
    setShowEditDialog(true)
    setShowDetailsDialog(false)
    setShowLearnersDialog(false)
  }

  function saveCourseEdits() {
    if (!selectedCourseId) return
    const nextTitle = courseTitle.trim()
    if (!nextTitle) return

    setModules((prev) =>
      prev.map((m) =>
        m.id === selectedCourseId
          ? {
              ...m,
              title: nextTitle,
              code: courseCode.trim(),
              description: courseDescription.trim(),
              week_number: Math.max(1, Math.min(9, Number(courseWeek) || 1)),
              updatedAt: new Date().toISOString(),
              category:
                Number(courseWeek) >= 7
                  ? 'Practicum'
                  : Number(courseWeek) >= 3
                    ? 'Ethics'
                    : 'Foundations',
            }
          : m
      )
    )
    setShowEditDialog(false)
    setShowDetailsDialog(true)
  }

  // Filter and search courses
  const filteredModules = useMemo(() => {
    const base = modules.filter((module) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          module.title.toLowerCase().includes(query) ||
          module.code?.toLowerCase().includes(query) ||
          module.description?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      if (filterWeek !== 'all') {
        if (module.week_number !== parseInt(filterWeek)) return false
      }

      if (filterCategory !== 'all') {
        if (filterCategory === 'foundations' && module.week_number > 3) return false
        if (filterCategory === 'ethics' && (module.week_number < 3 || module.week_number > 5)) return false
        if (filterCategory === 'practicum' && module.week_number < 7) return false
      }

      return true
    })

    const sorted = [...base]
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'updated') {
      sorted.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    } else {
      sorted.sort((a, b) => a.week_number - b.week_number)
    }
    return sorted
  }, [modules, searchQuery, filterWeek, filterCategory, sortBy])

  const visibleIds = useMemo(() => filteredModules.map((m) => m.id), [filteredModules])

  const allVisibleSelected = useMemo(() => {
    if (visibleIds.length === 0) return false
    return visibleIds.every((id) => Boolean(selectedIds[id]))
  }, [visibleIds, selectedIds])

  const someVisibleSelected = useMemo(() => {
    return visibleIds.some((id) => Boolean(selectedIds[id])) && !allVisibleSelected
  }, [visibleIds, selectedIds, allVisibleSelected])

  const totalCourses = modules.length
  const avgCompletion = useMemo(() => {
    if (modules.length === 0) return 0
    const sum = modules.reduce((acc, m) => acc + (m.completion_rate ?? 0), 0)
    return Math.round(sum / modules.length)
  }, [modules])

  const activeWeeks = useMemo(() => {
    const set = new Set(modules.map((m) => m.week_number))
    return set.size
  }, [modules])

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
            <p className="text-sm text-slate-600">
              Manage your courses and track learner progress through each module.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add course
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create new course
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import course
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTemplateDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Create from template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create New Course Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl w-full">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to your mentoring portfolio.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const newCourse = {
                    id: `course-${Date.now()}`,
                    title: courseTitle,
                    week_number: parseInt(courseWeek),
                    code: courseCode,
                    description: courseDescription,
                  }
                  addCourse(newCourse)
                  setCourseTitle('')
                  setCourseCode('')
                  setCourseDescription('')
                  setCourseWeek('1')
                  setShowCreateDialog(false)
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="course-title">Course Title</Label>
                  <Input
                    id="course-title"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="Enter course title (e.g., Introduction to Ethical Practice)"
                    className="w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-code">Course Code</Label>
                    <Input
                      id="course-code"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="Enter course code (e.g., 002)"
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-week">Week Number</Label>
                    <Select value={courseWeek} onValueChange={setCourseWeek}>
                      <SelectTrigger id="course-week" aria-label="Select week number">
                        <SelectValue placeholder="Select week" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 9 }, (_, i) => i + 1).map((week) => (
                          <SelectItem key={week} value={week.toString()}>
                            Week {week}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-description">Description</Label>
                  <Textarea
                    id="course-description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Enter course description"
                    rows={4}
                    className="min-w-full resize-y"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false)
                      setCourseTitle('')
                      setCourseCode('')
                      setCourseDescription('')
                      setCourseWeek('1')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Create Course
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Import Course Dialog */}
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Course</DialogTitle>
                <DialogDescription>
                  Upload a course file to import into your portal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="course-file-input"
                    accept=".csv,.json,.zip,.scorm"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSelectedFile(file)
                        setFileName(file.name)
                      }
                    }}
                  />
                  <label htmlFor="course-file-input" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-sm text-slate-600 mb-2">
                      Drag and drop a course file here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      Supported formats: CSV, JSON, SCORM
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="text-xs" 
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById('course-file-input')?.click()
                      }}
                    >
                      Choose File
                    </Button>
                  </label>
                  {fileName && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm text-slate-700 font-medium">
                        Selected file: {fileName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(selectedFile?.size || 0) / 1024} KB
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowImportDialog(false)
                      setSelectedFile(null)
                      setFileName('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!selectedFile}
                    onClick={() => {
                      if (selectedFile) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          const content = (e.target?.result as string) ?? ''
                          try {
                            // Try to parse as JSON
                            const parsed = JSON.parse(content)
                            if (parsed.title || parsed.name) {
                              const importedCourse = {
                                id: `course-import-${Date.now()}`,
                                title: parsed.title || parsed.name || fileName.replace(/\.[^/.]+$/, ''),
                                week_number: parsed.week_number || parsed.week || 1,
                                code: parsed.code || parsed.id || '',
                                description: parsed.description || parsed.desc || '',
                                importFileName: fileName,
                                importRaw: content,
                              }
                              addCourse(importedCourse)
                              alert(`Course "${importedCourse.title}" imported successfully!`)
                            } else {
                              // CSV or other format - create a basic course
                              const importedCourse = {
                                id: `course-import-${Date.now()}`,
                                title: fileName.replace(/\.[^/.]+$/, ''),
                                week_number: 1,
                                code: '',
                                description: 'Imported course',
                                importFileName: fileName,
                                importRaw: content,
                              }
                              addCourse(importedCourse)
                              alert(`Course "${importedCourse.title}" imported successfully!`)
                            }
                          } catch {
                            // If not JSON, create a basic course from filename
                            const importedCourse = {
                              id: `course-import-${Date.now()}`,
                              title: fileName.replace(/\.[^/.]+$/, ''),
                              week_number: 1,
                              code: '',
                              description: 'Imported course',
                              importFileName: fileName,
                              importRaw: content,
                            }
                            addCourse(importedCourse)
                            alert(`Course "${importedCourse.title}" imported successfully!`)
                          }
                          setShowImportDialog(false)
                          setSelectedFile(null)
                          setFileName('')
                        }
                        // Some formats like zip/scorm can't be reliably previewed as text
                        const lower = (fileName || selectedFile.name || '').toLowerCase()
                        if (lower.endsWith('.zip') || lower.endsWith('.scorm')) {
                          // Store only file name (no preview)
                          const importedCourse = {
                            id: `course-import-${Date.now()}`,
                            title: fileName.replace(/\.[^/.]+$/, '') || 'Imported course',
                            week_number: 1,
                            code: '',
                            description: 'Imported package (preview not available)',
                            importFileName: fileName || selectedFile.name,
                            importRaw: '',
                          }
                          addCourse(importedCourse)
                          alert(`Course "${importedCourse.title}" imported successfully!`)
                          setShowImportDialog(false)
                          setSelectedFile(null)
                          setFileName('')
                          return
                        }

                        reader.readAsText(selectedFile)
                      }
                    }}
                  >
                    Import
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create from Template Dialog */}
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Course from Template</DialogTitle>
                <DialogDescription>
                  Select a template to quickly create a new course.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className="p-4 border-2 border-slate-200 hover:border-purple-400 cursor-pointer transition-colors"
                    onClick={() => {
                      const templateCourse = {
                        id: `course-template-${Date.now()}`,
                        title: 'Ethics & Boundaries',
                        week_number: 3,
                        code: 'ETH-001',
                        description: 'Standard template for ethics training modules',
                      }
                      addCourse(templateCourse)
                      setShowTemplateDialog(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          Ethics & Boundaries
                        </h3>
                        <p className="text-xs text-slate-600">
                          Standard template for ethics training modules
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card
                    className="p-4 border-2 border-slate-200 hover:border-purple-400 cursor-pointer transition-colors"
                    onClick={() => {
                      alert('Creating course from "Foundations" template...')
                      setShowTemplateDialog(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          Foundations
                        </h3>
                        <p className="text-xs text-slate-600">
                          Basic counseling foundations template
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card
                    className="p-4 border-2 border-slate-200 hover:border-purple-400 cursor-pointer transition-colors"
                    onClick={() => {
                      const templateCourse = {
                        id: `course-template-${Date.now()}`,
                        title: 'Case Studies',
                        week_number: 5,
                        code: 'CASE-001',
                        description: 'Template for case study analysis courses',
                      }
                      addCourse(templateCourse)
                      setShowTemplateDialog(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          Case Studies
                        </h3>
                        <p className="text-xs text-slate-600">
                          Template for case study analysis courses
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card
                    className="p-4 border-2 border-slate-200 hover:border-purple-400 cursor-pointer transition-colors"
                    onClick={() => {
                      const templateCourse = {
                        id: `course-template-${Date.now()}`,
                        title: 'Practicum',
                        week_number: 7,
                        code: 'PRAC-001',
                        description: 'Template for supervised practice modules',
                      }
                      addCourse(templateCourse)
                      setShowTemplateDialog(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          Practicum
                        </h3>
                        <p className="text-xs text-slate-600">
                          Template for supervised practice modules
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTemplateDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Course Details Dialog */}
          <Dialog
            open={showDetailsDialog}
            onOpenChange={(open) => {
              setShowDetailsDialog(open)
              if (!open) setSelectedCourseId(null)
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Course details</DialogTitle>
                <DialogDescription>
                  View course info and update it when needed.
                </DialogDescription>
              </DialogHeader>

              {selectedCourse ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="p-3 border-[#e2e8f0]">
                      <p className="text-[11px] text-slate-500">Title</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedCourse.title}
                      </p>
                    </Card>
                    <Card className="p-3 border-[#e2e8f0]">
                      <p className="text-[11px] text-slate-500">Code</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedCourse.code || `WEEK-${String(selectedCourse.week_number).padStart(2, '0')}`}
                      </p>
                    </Card>
                    <Card className="p-3 border-[#e2e8f0]">
                      <p className="text-[11px] text-slate-500">Week</p>
                      <p className="text-sm font-semibold text-slate-900">
                        Week {selectedCourse.week_number}
                      </p>
                    </Card>
                    <Card className="p-3 border-[#e2e8f0]">
                      <p className="text-[11px] text-slate-500">Completion</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedCourse.completion_rate ?? 0}%
                      </p>
                    </Card>
                  </div>

                  <div className="rounded-md border border-[#e2e8f0] bg-white p-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Description
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedCourse.description?.trim().length
                        ? selectedCourse.description
                        : 'No description yet.'}
                    </p>
                  </div>

                  <div className="rounded-md border border-[#e2e8f0] bg-white p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="text-[11px] text-slate-500">Imported file</p>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedCourse.importFileName?.trim().length
                            ? selectedCourse.importFileName
                            : '—'}
                        </p>
                      </div>
                      {selectedCourse.importFileName &&
                        selectedCourse.importRaw &&
                        selectedCourse.importRaw.trim().length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            className="text-xs"
                            onClick={() =>
                              downloadTextFile(
                                selectedCourse.importFileName || 'import.txt',
                                selectedCourse.importRaw || ''
                              )
                            }
                          >
                            Download
                          </Button>
                        )}
                    </div>

                    {selectedCourse.importFileName ? (
                      selectedCourse.importRaw && selectedCourse.importRaw.trim().length > 0 ? (
                        <Textarea
                          value={
                            selectedCourse.importRaw.length > 2000
                              ? `${selectedCourse.importRaw.slice(0, 2000)}\n\n…(preview truncated)`
                              : selectedCourse.importRaw
                          }
                          readOnly
                          rows={8}
                          className="text-xs font-mono bg-slate-50"
                        />
                      ) : (
                        <p className="text-xs text-slate-500">
                          Preview not available for this file type.
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-slate-500">
                        This course was not imported from a file.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => startEditCourse(selectedCourse)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDetailsDialog(false)
                        setShowLearnersDialog(true)
                      }}
                    >
                      View learners
                    </Button>
                    <Button
                      type="button"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => setShowDetailsDialog(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">No course selected.</div>
              )}
            </DialogContent>
          </Dialog>

          {/* Learners Dialog (mock) */}
          <Dialog open={showLearnersDialog} onOpenChange={setShowLearnersDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Course learners</DialogTitle>
                <DialogDescription>
                  Learners currently assigned to this course (demo data).
                </DialogDescription>
              </DialogHeader>
              {selectedCourse ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedCourse.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Week {selectedCourse.week_number} •{' '}
                        {selectedCourse.category ?? 'General'}
                      </p>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                      0 assigned (demo)
                    </Badge>
                  </div>
                  <div className="rounded-md border border-[#e2e8f0] bg-white p-4 text-center">
                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-700 font-medium">
                      No learners assigned yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      In production, this will show enrolled learners and allow
                      assigning cohorts.
                    </p>
                    <div className="mt-3 flex justify-center">
                      <Button
                        type="button"
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                        onClick={() => alert('Assign learners (demo placeholder)')}
                      >
                        Assign learners
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLearnersDialog(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">No course selected.</div>
              )}
            </DialogContent>
          </Dialog>

          {/* Course Edit Dialog */}
          <Dialog
            open={showEditDialog}
            onOpenChange={(open) => {
              setShowEditDialog(open)
              if (!open) {
                // don't clear selectedCourseId so we can return to details view
              }
            }}
          >
            <DialogContent className="max-w-2xl w-full">
              <DialogHeader>
                <DialogTitle>Edit course</DialogTitle>
                <DialogDescription>
                  Update the course name, code, week and description.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  saveCourseEdits()
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="edit-course-title">Course Title</Label>
                  <Input
                    id="edit-course-title"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="Enter course title"
                    className="w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-course-code">Course Code</Label>
                    <Input
                      id="edit-course-code"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="Enter course code"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-course-week">Week Number</Label>
                    <Select value={courseWeek} onValueChange={setCourseWeek}>
                      <SelectTrigger
                        id="edit-course-week"
                        aria-label="Select week number"
                      >
                        <SelectValue placeholder="Select week" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 9 }, (_, i) => i + 1).map((week) => (
                          <SelectItem key={week} value={String(week)}>
                            Week {week}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course-description">Description</Label>
                  <Textarea
                    id="edit-course-description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Enter course description"
                    rows={5}
                    className="min-w-full resize-y"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false)
                      setShowDetailsDialog(true)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500">Total courses</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {totalCourses}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500">Average completion</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {avgCompletion}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500">Weeks covered</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {activeWeeks}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                <ArrowUpDown className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 border-[#e2e8f0]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md min-w-0">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm border-[#e2e8f0]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="h-9 w-44 text-xs border-[#e2e8f0]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Sort: Week</SelectItem>
                  <SelectItem value="title">Sort: Title</SelectItem>
                  <SelectItem value="updated">Sort: Recently updated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="h-9 w-32 text-xs border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid view</SelectItem>
                  <SelectItem value="table">Table view</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-[#e2e8f0]"
                onClick={() => setShowFilterDialog(true)}
              >
                <Filter className="h-3 w-3 mr-1" />
                Filter
                {(filterWeek !== 'all' || filterCategory !== 'all') && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-purple-600" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              Showing{' '}
              <span className="font-medium text-slate-700">
                {filteredModules.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-slate-700">{modules.length}</span>{' '}
              courses
            </p>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">
                  {selectedCount} selected
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs border-[#e2e8f0] text-red-600"
                  onClick={bulkDelete}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Courses</DialogTitle>
              <DialogDescription>
                Filter courses by week number or category.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filter-week">Week Number</Label>
                <Select value={filterWeek} onValueChange={setFilterWeek}>
                  <SelectTrigger id="filter-week">
                    <SelectValue placeholder="All weeks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All weeks</SelectItem>
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-category">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="filter-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="foundations">Foundations (Weeks 1-3)</SelectItem>
                    <SelectItem value="ethics">Ethics (Weeks 3-5)</SelectItem>
                    <SelectItem value="practicum">Practicum (Weeks 7-9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFilterWeek('all')
                    setFilterCategory('all')
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  type="button"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setShowFilterDialog(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading && (
              <Card className="p-6 flex items-center justify-center text-sm text-slate-500">
                Loading modules…
              </Card>
            )}

            {!loading && filteredModules.length === 0 && (
              <Card className="p-6 flex items-center justify-center text-sm text-slate-500">
                {modules.length === 0 
                  ? 'No modules found yet.' 
                  : 'No courses match your filters.'}
              </Card>
            )}

            {!loading &&
              filteredModules.map((m) => (
                <Card
                  key={m.id}
                  className="p-5 space-y-3 border-[#e2e8f0] cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => openCourse(m)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openCourse(m)
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge className="mb-2 bg-purple-50 text-purple-700 hover:bg-purple-50 border border-purple-100">
                        Week {m.week_number}
                      </Badge>
                      <h2 className="font-semibold text-slate-900">
                        {m.title}
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {m.category ?? 'General'} •{' '}
                        {m.code
                          ? m.code
                          : `WEEK-${String(m.week_number).padStart(2, '0')}`}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">
                        Completion
                      </span>
                      <span className="font-semibold text-slate-900">
                        {m.completion_rate}%
                      </span>
                    </div>
                    <Progress value={m.completion_rate} />
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Use this to spot weeks where learners are getting stuck.
                  </p>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="border-[#e2e8f0]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left p-3 font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        className="rounded border-[#e2e8f0]"
                        aria-label="Select all courses"
                        checked={allVisibleSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someVisibleSelected
                        }}
                        onChange={(e) => toggleSelectAll(visibleIds, e.target.checked)}
                      />
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700">Course</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Code</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Category</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Last updated on</th>
                    <th className="text-left p-3 font-semibold text-slate-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        Loading courses…
                      </td>
                    </tr>
                  ) : filteredModules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        {modules.length === 0 
                          ? 'No courses found yet.' 
                          : 'No courses match your filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredModules.map((m) => (
                      <tr key={m.id} className="border-b border-[#e2e8f0] hover:bg-slate-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="rounded border-[#e2e8f0]"
                            aria-label={`Select course ${m.title}`}
                            checked={Boolean(selectedIds[m.id])}
                            onChange={(e) =>
                              setSelectedIds((prev) => ({
                                ...prev,
                                [m.id]: e.target.checked,
                              }))
                            }
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{m.title}</div>
                          <div className="text-xs text-slate-500">Week {m.week_number}</div>
                        </td>
                        <td className="p-3 text-slate-600">{m.code || `WEEK-${m.week_number.toString().padStart(2, '0')}`}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {m.category ?? 'General'}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-500 text-xs">
                          {m.updatedAt
                            ? new Date(m.updatedAt).toLocaleDateString('en-GB')
                            : new Date().toLocaleDateString('en-GB')}
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-slate-100 rounded" aria-label={`More options for ${m.title}`}>
                                <MoreVertical className="h-4 w-4 text-slate-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEditCourse(m)}>
                                Edit course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openCourse(m)}>
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCourseId(m.id)
                                  setShowLearnersDialog(true)
                                }}
                              >
                                View learners
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateCourse(m)}>
                                <Copy className="h-3.5 w-3.5 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteCourse(m.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
    </div>
  )
}

