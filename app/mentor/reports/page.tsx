'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  FileText,
  Search,
  Download,
  Filter,
  Clock,
  Plus,
  BookOpen,
  Users,
  TrendingUp,
  Timer,
  Heart,
  Shield,
  UsersRound,
  FileDown,
  RefreshCw,
  ArrowUpRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

type LearnerRow = {
  id: string
  full_name: string
  quizAttempts: number
  quizCompleted: number
  avgScorePct: number | null
  journalCount: number
}

export default function MentorReportsPage() {
  const { toast } = useToast()
  const supabase = createClient()

  const formatDateForInput = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }

  const [dateFrom, setDateFrom] = useState(formatDateForInput('28/12/2025'))
  const [dateTo, setDateTo] = useState(formatDateForInput('28/01/2026'))
  const [eventFilter, setEventFilter] = useState('not-specified')
  const [courseFilter, setCourseFilter] = useState('not-specified')
  const [isExporting, setIsExporting] = useState(false)
  const [globalExportFormat, setGlobalExportFormat] = useState('excel')
  const [matrixExportFormat, setMatrixExportFormat] = useState('excel')
  const [reportLoading, setReportLoading] = useState(true)
  const [learners, setLearners] = useState<LearnerRow[]>([])
  const [modulesCount, setModulesCount] = useState(0)
  const [quizAttemptsAll, setQuizAttemptsAll] = useState<{ id: string; user_id: string; quiz_id: string; completed_at: string | null; quiz_title?: string }[]>([])
  const [attemptScores, setAttemptScores] = useState<Record<string, { correct: number; total: number }>>({})
  const [journalCountByUser, setJournalCountByUser] = useState<Record<string, number>>({})
  const [scheduledSessionsCount, setScheduledSessionsCount] = useState(0)
  const [timelineEvents, setTimelineEvents] = useState<{ id: string; action: string; course: string; time: string; type: string }[]>([])
  const [matrixSearch, setMatrixSearch] = useState('')
  const matrixFiltered = useMemo(() => {
    if (!matrixSearch.trim()) return learners
    const q = matrixSearch.trim().toLowerCase()
    return learners.filter((l) => l.full_name.toLowerCase().includes(q))
  }, [learners, matrixSearch])

  useEffect(() => {
    async function loadReportsData() {
      setReportLoading(true)
      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'student')
        const learnerProfiles = (profilesData ?? []) as { id: string; full_name: string | null }[]

        const { data: modulesData } = await supabase.from('modules').select('id').limit(100)
        setModulesCount(modulesData?.length ?? 0)

        const { data: attemptsData } = await supabase
          .from('quiz_attempts')
          .select('id, user_id, quiz_id, completed_at')
        const attempts = (attemptsData ?? []) as { id: string; user_id: string; quiz_id: string; completed_at: string | null }[]
        setQuizAttemptsAll(attempts)

        const quizIds = [...new Set(attempts.map((a) => a.quiz_id))]
        const quizTitles: Record<string, string> = {}
        if (quizIds.length) {
          const { data: quizzesData } = await supabase.from('quizzes').select('id, title').in('id', quizIds)
          ;(quizzesData ?? []).forEach((q: { id: string; title: string }) => { quizTitles[q.id] = q.title })
        }
        setQuizAttemptsAll(attempts.map((a) => ({ ...a, quiz_title: quizTitles[a.quiz_id] || 'Quiz' })))

        const attemptIds = attempts.map((a) => a.id)
        const scoresByAttempt: Record<string, { correct: number; total: number }> = {}
        if (attemptIds.length) {
          const { data: respData } = await supabase
            .from('quiz_question_responses')
            .select('attempt_id, is_correct')
            .in('attempt_id', attemptIds)
          const responses = (respData ?? []) as { attempt_id: string; is_correct: boolean }[]
          responses.forEach((r) => {
            if (!scoresByAttempt[r.attempt_id]) scoresByAttempt[r.attempt_id] = { correct: 0, total: 0 }
            scoresByAttempt[r.attempt_id].total += 1
            if (r.is_correct) scoresByAttempt[r.attempt_id].correct += 1
          })
          setAttemptScores(scoresByAttempt)
        }

        const { data: journalData } = await supabase
          .from('learning_journals')
          .select('user_id')
        const jCount: Record<string, number> = {}
        ;(journalData ?? []).forEach((j: { user_id: string }) => {
          jCount[j.user_id] = (jCount[j.user_id] ?? 0) + 1
        })
        setJournalCountByUser(jCount)

        const { count: eventsCount } = await supabase
          .from('weekly_events')
          .select('*', { count: 'exact', head: true })
        setScheduledSessionsCount(eventsCount ?? 0)

        const completedAttempts = attempts.filter((a) => a.completed_at)
        const timeline: { id: string; action: string; course: string; time: string; type: string }[] = []
        completedAttempts
          .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
          .slice(0, 20)
          .forEach((a, i) => {
            const title = quizTitles[a.quiz_id] || 'Quiz'
            const userName = learnerProfiles.find((p) => p.id === a.user_id)?.full_name || 'Learner'
            timeline.push({
              id: a.id,
              action: `completed quiz: ${title}`,
              course: userName,
              time: formatDistance(a.completed_at!),
              type: 'quiz',
            })
          })
        setTimelineEvents(timeline)

        const rows: LearnerRow[] = learnerProfiles.map((p) => {
          const userAttempts = attempts.filter((a) => a.user_id === p.id)
          const completed = userAttempts.filter((a) => a.completed_at)
          let avgScorePct: number | null = null
          if (completed.length) {
            let sum = 0
            let denom = 0
            completed.forEach((a) => {
              const s = scoresByAttempt[a.id]
              if (s?.total) {
                sum += (s.correct / s.total) * 100
                denom += 1
              }
            })
            if (denom) avgScorePct = Math.round(sum / denom)
          }
          return {
            id: p.id,
            full_name: p.full_name || 'Learner',
            quizAttempts: userAttempts.length,
            quizCompleted: completed.length,
            avgScorePct,
            journalCount: jCount[p.id] ?? 0,
          }
        })
        setLearners(rows)
      } catch (e) {
        console.error('Error loading reports:', e)
      } finally {
        setReportLoading(false)
      }
    }
    loadReportsData()
  }, [supabase])

  function formatDistance(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffM = Math.floor(diffMs / 60000)
    const diffH = Math.floor(diffM / 60)
    const diffD = Math.floor(diffH / 24)
    if (diffD > 0) return `${diffD} day${diffD !== 1 ? 's' : ''} ago`
    if (diffH > 0) return `${diffH} hour${diffH !== 1 ? 's' : ''} ago`
    if (diffM > 0) return `${diffM} min ago`
    return 'Just now'
  }

  const metrics = useMemo(() => {
    const assignedLearners = learners.length
    const withQuiz = learners.filter((l) => l.quizCompleted > 0).length
    const completionRate = assignedLearners ? (withQuiz / assignedLearners) * 100 : 0
    const totalQuizzes = learners.reduce((s, l) => s + l.quizCompleted, 0)
    const estMinutes = totalQuizzes * 5
    return {
      courses: modulesCount || 1,
      assignedLearners,
      completionRate,
      trainingTime: { hours: Math.floor(estMinutes / 60), minutes: estMinutes % 60 },
    }
  }, [learners, modulesCount])

  const quizCompletionByQuiz = useMemo(() => {
    const byQuiz: Record<string, number> = {}
    quizAttemptsAll.forEach((a) => {
      if (a.completed_at) {
        const key = a.quiz_title || a.quiz_id
        byQuiz[key] = (byQuiz[key] ?? 0) + 1
      }
    })
    return Object.entries(byQuiz).map(([name, value]) => ({ name: name.slice(0, 20), value }))
  }, [quizAttemptsAll])

  const ethicsData = useMemo(() => {
    const completed = quizAttemptsAll.filter((a) => a.completed_at).length
    const inProgress = quizAttemptsAll.filter((a) => !a.completed_at).length
    const totalLearners = learners.length
    const started = new Set(quizAttemptsAll.map((a) => a.user_id)).size
    const notStarted = Math.max(0, totalLearners - started)
    return [
      { name: 'Completed', value: completed, fill: '#8b5cf6' },
      { name: 'In Progress', value: inProgress, fill: '#a78bfa' },
      { name: 'Not Started', value: notStarted, fill: '#e9d5ff' },
    ]
  }, [quizAttemptsAll, learners.length])

  const journalEngagementData = useMemo(() => {
    const counts = Object.values(journalCountByUser)
    if (counts.length === 0) return [{ name: '0 entries', count: 0 }, { name: '1+', count: 0 }]
    const zero = learners.filter((l) => (journalCountByUser[l.id] ?? 0) === 0).length
    const onePlus = learners.length - zero
    return [
      { name: '0 entries', count: zero, fill: '#e9d5ff' },
      { name: '1+ entries', count: onePlus, fill: '#8b5cf6' },
    ]
  }, [journalCountByUser, learners])

  // Export utility functions
  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: 'No data available',
        description: 'There is no data to export.',
        variant: 'destructive',
      })
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] ?? ''
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Export successful',
      description: `${filename} has been downloaded as CSV.`,
    })
  }

  const downloadPDF = async (reportName: string, format: string) => {
    setIsExporting(true)
    try {
      // In a real application, this would call your backend API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock PDF download - in production, this would be a real PDF blob from your API
      toast({
        title: 'PDF export initiated',
        description: `${reportName} PDF is being generated. You will be notified when it's ready.`,
      })
      
      // In production, you would do something like:
      // const response = await fetch(`/api/reports/${reportName}?format=pdf`)
      // const blob = await response.blob()
      // const url = URL.createObjectURL(blob)
      // const link = document.createElement('a')
      // link.href = url
      // link.download = `${reportName}_${new Date().toISOString().split('T')[0]}.pdf`
      // link.click()
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error generating the PDF. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const downloadExcel = async (reportName: string) => {
    setIsExporting(true)
    try {
      // In a real application, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Excel export initiated',
        description: `${reportName} Excel file is being generated. You will be notified when it's ready.`,
      })
      
      // In production, you would do something like:
      // const response = await fetch(`/api/reports/${reportName}?format=xlsx`)
      // const blob = await response.blob()
      // const url = URL.createObjectURL(blob)
      // const link = document.createElement('a')
      // link.href = url
      // link.download = `${reportName}_${new Date().toISOString().split('T')[0]}.xlsx`
      // link.click()
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error generating the Excel file. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportReport = (report: typeof exportableReports[0]) => {
    if (report.format === 'CSV') {
      const csvData = learners.map((l) => ({
        'Learner Name': l.full_name,
        'Quizzes Completed': l.quizCompleted,
        'Avg Score %': l.avgScorePct ?? '—',
        'Journal Entries': l.journalCount,
      }))
      downloadCSV(csvData.length ? csvData : [{ 'Learner Name': '—', 'Quizzes Completed': 0, 'Avg Score %': '—', 'Journal Entries': 0 }], report.name.toLowerCase().replace(/\s+/g, '_'))
    } else if (report.format === 'PDF') {
      downloadPDF(report.name, 'pdf')
    }
  }

  const handleExportAll = () => {
    setIsExporting(true)
    Promise.all(
      exportableReports.map((report) => {
        if (report.format === 'CSV') {
          const csvData = learners.map((l) => ({
            Report: report.name,
            Learner: l.full_name,
            'Quizzes Completed': l.quizCompleted,
            'Journal Entries': l.journalCount,
            Date: new Date().toISOString().split('T')[0],
          }))
          downloadCSV(csvData.length ? csvData : [{ Report: report.name, Learner: '—', 'Quizzes Completed': 0, 'Journal Entries': 0, Date: new Date().toISOString().split('T')[0] }], report.name.toLowerCase().replace(/\s+/g, '_'))
          return Promise.resolve(null)
        }
        return downloadPDF(report.name, 'pdf')
      })
    ).finally(() => {
      setIsExporting(false)
      toast({ title: 'All reports exported', description: 'All available reports have been exported.' })
    })
  }

  const handleGlobalExport = (format: string) => {
    if (format === 'csv') {
      const csvData = [
        { Metric: 'Courses', Value: metrics.courses },
        { Metric: 'Assigned Learners', Value: metrics.assignedLearners },
        { Metric: 'Completion Rate %', Value: metrics.completionRate.toFixed(2) },
        { Metric: 'Training Time (est)', Value: `${metrics.trainingTime.hours}h ${metrics.trainingTime.minutes}m` },
        { Metric: 'Scheduled Sessions', Value: scheduledSessionsCount },
      ]
      downloadCSV(csvData, 'mentor_reports_overview')
    } else if (format === 'excel') {
      downloadExcel('Mentor Reports Overview')
    } else if (format === 'pdf') {
      downloadPDF('Mentor Reports Overview', 'pdf')
    }
  }

  const handleMatrixExport = (format: string) => {
    if (format === 'csv') {
      const csvData = learners.map((l) => ({
        Learner: l.full_name,
        'Quizzes Completed': l.quizCompleted,
        'Avg Score %': l.avgScorePct ?? '—',
        'Journal Entries': l.journalCount,
        Progress: l.quizCompleted > 0 ? `${l.avgScorePct ?? 0}%` : 'Not started',
      }))
      downloadCSV(csvData.length ? csvData : [{ Learner: '—', 'Quizzes Completed': 0, 'Avg Score %': '—', 'Journal Entries': 0, Progress: '—' }], 'training_matrix')
    } else if (format === 'excel') {
      downloadExcel('Training Matrix')
    } else if (format === 'pdf') {
      downloadPDF('Training Matrix', 'pdf')
    }
  }

  // Exportable reports list
  const exportableReports = [
    { id: 1, name: 'Grading Summary', description: 'Comprehensive report of all learner grades', format: 'PDF', icon: FileText },
    { id: 2, name: 'Attendance Report', description: 'Detailed attendance tracking for all courses', format: 'CSV', icon: Users },
    { id: 3, name: 'Supervision Hours', description: 'Total supervision hours logged by learners', format: 'PDF', icon: Clock },
    { id: 4, name: 'Self-Care Adherence', description: 'Self-care compliance and wellness metrics', format: 'CSV', icon: Heart },
  ]

  return (
    <>
      <Toaster />
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Mentor view of counseling‑specific metrics for your learners and
              groups.
            </p>
          </div>
          <Select 
            value={globalExportFormat} 
            onValueChange={(value) => {
              setGlobalExportFormat(value)
              handleGlobalExport(value)
            }}
          >
            <SelectTrigger className="h-9 w-40 text-xs border-[#e2e8f0] bg-purple-600 text-white hover:bg-purple-700">
              <Download className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">Export in Excel</SelectItem>
              <SelectItem value="csv">Export to CSV</SelectItem>
              <SelectItem value="pdf">Export as PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matrix">Training matrix</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {reportLoading ? (
              <p className="text-sm text-slate-500 py-4">Loading report data…</p>
            ) : null}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <Card className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  {metrics.courses > 0 && (
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Courses
                  </span>
                  <span className="text-3xl font-bold text-slate-900">{metrics.courses}</span>
                  <span className="text-xs text-slate-500">
                    Active courses you are mentoring
                  </span>
                </div>
              </Card>

              <Card className={`p-5 flex flex-col gap-3 hover:shadow-md transition-shadow border-l-4 ${metrics.assignedLearners > 0 ? 'border-l-blue-500' : 'border-l-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metrics.assignedLearners > 0 ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    <Users className={`h-5 w-5 ${metrics.assignedLearners > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assigned learners
                  </span>
                  <span className="text-3xl font-bold text-slate-900">{metrics.assignedLearners}</span>
                  {metrics.assignedLearners === 0 ? (
                    <div className="flex items-start gap-1.5 mt-1">
                      <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-amber-600">
                        No learners assigned yet. Assign learners to courses to see metrics.
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Learners linked to your courses
                    </span>
                  )}
                </div>
              </Card>

              <Card className={`p-5 flex flex-col gap-3 hover:shadow-md transition-shadow border-l-4 ${metrics.completionRate > 0 ? 'border-l-green-500' : 'border-l-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metrics.completionRate > 0 ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <TrendingUp className={`h-5 w-5 ${metrics.completionRate > 0 ? 'text-green-600' : 'text-slate-400'}`} />
                  </div>
                  {metrics.completionRate > 0 && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      From data
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Completion rate
                  </span>
                  <span className="text-3xl font-bold text-slate-900">
                    {metrics.completionRate.toFixed(2)}%
                  </span>
                  {metrics.completionRate === 0 ? (
                    <div className="flex items-start gap-1.5 mt-1">
                      <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-amber-600">
                        Start tracking progress once learners begin courses.
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Average across your courses
                    </span>
                  )}
                </div>
              </Card>

              <Card className={`p-5 flex flex-col gap-3 hover:shadow-md transition-shadow border-l-4 ${metrics.trainingTime.hours > 0 || metrics.trainingTime.minutes > 0 ? 'border-l-indigo-500' : 'border-l-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metrics.trainingTime.hours > 0 || metrics.trainingTime.minutes > 0 ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                    <Timer className={`h-5 w-5 ${metrics.trainingTime.hours > 0 || metrics.trainingTime.minutes > 0 ? 'text-indigo-600' : 'text-slate-400'}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Training time
                  </span>
                  <span className="text-3xl font-bold text-slate-900">
                    {metrics.trainingTime.hours}h {metrics.trainingTime.minutes}m
                  </span>
                  {metrics.trainingTime.hours === 0 && metrics.trainingTime.minutes === 0 ? (
                    <div className="flex items-start gap-1.5 mt-1">
                      <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-amber-600">
                        Time will be tracked as learners engage with content.
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Estimated time spent by your learners
                    </span>
                  )}
                </div>
              </Card>

              <Card className={`p-5 flex flex-col gap-3 hover:shadow-md transition-shadow border-l-4 ${scheduledSessionsCount > 0 ? 'border-l-teal-500' : 'border-l-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${scheduledSessionsCount > 0 ? 'bg-teal-100' : 'bg-slate-100'}`}>
                    <Clock className={`h-5 w-5 ${scheduledSessionsCount > 0 ? 'text-teal-600' : 'text-slate-400'}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Scheduled sessions
                  </span>
                  <span className="text-3xl font-bold text-slate-900">{scheduledSessionsCount}</span>
                  <span className="text-xs text-slate-500">
                    Weekly events (calendar)
                  </span>
                </div>
              </Card>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-slate-900">
                        Counseling outcomes snapshot
                      </h2>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-600">
                      Empathy development, ethics compliance, case study performance and peer support metrics.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>

                {(metrics.assignedLearners > 0 || quizCompletionByQuiz.length > 0 || Object.keys(journalCountByUser).length > 0) ? (
                  <div className="space-y-6">
                    {quizCompletionByQuiz.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-500" />
                          Quiz completions by quiz
                        </h3>
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart data={quizCompletionByQuiz} layout="vertical" margin={{ left: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} stroke="#64748b" />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Completed" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        Quiz attempt status
                      </h3>
                      <ResponsiveContainer width="100%" height={150}>
                        <RechartsPieChart>
                          <Pie
                            data={ethicsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={50}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {ethicsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {journalEngagementData.some((d) => d.count > 0) && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                          <UsersRound className="h-4 w-4 text-blue-500" />
                          Journal entries (learners)
                        </h3>
                        <ResponsiveContainer width="100%" height={150}>
                          <RechartsPieChart>
                            <Pie
                              data={journalEngagementData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, count }) => `${name}: ${count}`}
                              outerRadius={50}
                              dataKey="count"
                            >
                              {journalEngagementData.map((entry, index) => (
                                <Cell key={`j-${index}`} fill={(entry as { fill?: string }).fill ?? '#6366f1'} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <BarChart3 className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1">No data available</p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Charts will appear here once learners are assigned and start engaging with your courses.
                    </p>
                  </div>
                )}
              </Card>

              <Card className="p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="font-semibold text-slate-900 mb-1">
                      Exportable reports
                    </h2>
                    <p className="text-xs text-slate-600">
                      Generate and download comprehensive reports for grading, attendance, supervision hours and self-care adherence.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                    <FileDown className="h-6 w-6 text-slate-700" />
                  </div>
                </div>

                <div className="space-y-3">
                  {exportableReports.map((report) => {
                    const IconComponent = report.icon
                    return (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border border-[#e2e8f0] rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => handleExportReport(report)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <IconComponent className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-slate-900">{report.name}</h3>
                              <Badge variant="outline" className="text-xs border-slate-300">
                                {report.format}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500">{report.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportReport(report)
                          }}
                          disabled={isExporting}
                        >
                          <Download className="h-4 w-4 text-slate-600" />
                        </Button>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-3 border-t border-[#e2e8f0]">
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={handleExportAll}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export All Reports'}
                  </Button>
                </div>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-4">
            <Card className="p-4 border-[#e2e8f0]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="relative flex-1 max-w-md min-w-0">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search learners"
                    className="pl-8 h-9 text-sm border-[#e2e8f0]"
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={matrixExportFormat}
                    onValueChange={(value) => {
                      setMatrixExportFormat(value)
                      handleMatrixExport(value)
                    }}
                  >
                    <SelectTrigger className="h-9 w-36 text-xs border-[#e2e8f0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Export in Excel</SelectItem>
                      <SelectItem value="csv">Export as CSV</SelectItem>
                      <SelectItem value="pdf">Export as PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {reportLoading ? (
                <p className="text-sm text-slate-500 py-6">Loading…</p>
              ) : matrixFiltered.length === 0 ? (
                <div className="text-xs text-slate-600 p-8 text-center">
                  <p className="mb-2">No learners to show. Data comes from quiz attempts, scores, and journal entries in Supabase.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-600">
                        <th className="pb-2 pr-4 font-medium">Learner</th>
                        <th className="pb-2 pr-4 font-medium w-28">Quizzes completed</th>
                        <th className="pb-2 pr-4 font-medium w-24">Avg score %</th>
                        <th className="pb-2 pr-4 font-medium w-28">Journal entries</th>
                        <th className="pb-2 pr-4 font-medium w-24">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrixFiltered.map((l) => (
                        <tr key={l.id} className="border-b border-slate-100">
                          <td className="py-3 pr-4 font-medium text-slate-900">{l.full_name}</td>
                          <td className="py-3 pr-4 text-slate-700">{l.quizCompleted} / {l.quizAttempts}</td>
                          <td className="py-3 pr-4 text-slate-700">{l.avgScorePct != null ? `${l.avgScorePct}%` : '—'}</td>
                          <td className="py-3 pr-4 text-slate-700">{l.journalCount}</td>
                          <td className="py-3 pr-4">
                            {l.quizCompleted > 0 ? (
                              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                {l.avgScorePct != null ? `${l.avgScorePct}%` : 'Done'}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">Not started</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card className="p-4 border-[#e2e8f0]">
              <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700 whitespace-nowrap">From</span>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-8 w-36 text-xs border-[#e2e8f0]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700 whitespace-nowrap">To</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-8 w-36 text-xs border-[#e2e8f0]"
                  />
                </div>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="h-8 w-40 text-xs border-[#e2e8f0]">
                    <SelectValue placeholder="Event type">
                      {eventFilter === 'not-specified' ? 'Not specified' : 
                       eventFilter === 'course-created' ? 'Course created' :
                       eventFilter === 'user-enrolled' ? 'User enrolled' :
                       eventFilter === 'assignment-submitted' ? 'Assignment submitted' : 'Not specified'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-specified">Not specified</SelectItem>
                    <SelectItem value="course-created">Course created</SelectItem>
                    <SelectItem value="user-enrolled">User enrolled</SelectItem>
                    <SelectItem value="assignment-submitted">Assignment submitted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="h-8 w-40 text-xs border-[#e2e8f0]">
                    <SelectValue placeholder="Course">
                      {courseFilter === 'not-specified' ? 'Not specified' :
                       courseFilter === 'course-001' ? 'Guide for Learners (001)' :
                       courseFilter === 'course-002' ? 'Introduction to Ethical Practice (002)' : 'Not specified'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-specified">Not specified</SelectItem>
                    <SelectItem value="course-001">Guide for Learners (001)</SelectItem>
                    <SelectItem value="course-002">Introduction to Ethical Practice (002)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-[#e2e8f0]"
                  onClick={() => {
                    setDateFrom(formatDateForInput('28/12/2025'))
                    setDateTo(formatDateForInput('28/01/2026'))
                    setEventFilter('not-specified')
                    setCourseFilter('not-specified')
                  }}
                >
                  Reset
                </Button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Events</h3>
                {timelineEvents.length > 0 ? (
                  <div className="space-y-2">
                    {timelineEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 border border-[#e2e8f0] rounded-md hover:bg-slate-50">
                        <div className="mt-0.5">
                          {event.type === 'quiz' ? (
                            <FileText className="h-4 w-4 text-purple-600" />
                          ) : (
                            <Plus className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">
                            <span className="font-medium">{event.course}</span> {event.action}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{event.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No events found for the selected filters.
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

