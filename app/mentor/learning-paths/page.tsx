'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/admin/EmptyState'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Layers3 } from 'lucide-react'

type LearningPath = {
  id: string
  title: string
  summary: string
  courses: number
  createdAt: string
}

const STORAGE_KEY = 'ht-mentor-learning-paths'

export default function MentorLearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as LearningPath[]
      if (Array.isArray(parsed)) setPaths(parsed)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paths))
    } catch {
      // ignore
    }
  }, [paths])

  const openForm = () => setShowForm(true)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const now = new Date().toISOString()
    const newPath: LearningPath = {
      id: `lp-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim() || 'Curated counseling journey',
      courses: 3,
      createdAt: now,
    }
    setPaths((prev) => [newPath, ...prev])
    setTitle('')
    setSummary('')
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Learning paths
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Guide learners through curated sequences of courses to achieve
              specific counseling milestones.
            </p>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-800 text-white text-xs"
            onClick={openForm}
          >
            Add learning path
          </Button>
        </div>

        {paths.length === 0 ? (
          <Card className="p-6 border-[#e2e8f0]">
            <EmptyState
              title="There are no learning paths yet!"
              description="Guide learners through curated sequences of courses. Learning paths help users achieve specific goals, step by step."
              actionLabel="Add learning path"
              icon={<Layers3 className="h-4 w-4" />}
              onActionClick={openForm}
            />
          </Card>
        ) : (
          <Card className="p-4 border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Existing learning paths
                </h2>
                <p className="text-xs text-slate-500">
                  Use these to guide learners step-by-step through the curriculum.
                </p>
              </div>
              <Badge variant="outline" className="text-[11px]">
                {paths.length} paths
              </Badge>
            </div>
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-3 py-2 text-left font-medium">Path</th>
                    <th className="px-3 py-2 text-left font-medium">Summary</th>
                    <th className="px-3 py-2 text-left font-medium">Courses</th>
                    <th className="px-3 py-2 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paths.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-slate-100 hover:bg-slate-50/70"
                    >
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {p.title}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{p.summary}</td>
                      <td className="px-3 py-2 text-slate-600">{p.courses}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(p.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {showForm && (
          <Card className="p-4 border-[#e2e8f0] space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              New learning path
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="mlp-title" className="text-xs text-slate-700">
                  Path name
                </Label>
                <Input
                  id="mlp-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Foundations + Ethics + Practicum"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mlp-summary" className="text-xs text-slate-700">
                  Short summary
                </Label>
                <Input
                  id="mlp-summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief description shown to learners"
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-800 text-white text-xs"
                >
                  Create learning path
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setShowForm(false)
                    setTitle('')
                    setSummary('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
    </div>
  )
}

