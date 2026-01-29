'use client'

import { useEffect, useState } from 'react'
import { Layers3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/admin/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface LearningPath {
  id: string
  title: string
  summary: string
  courses: number
}

const INITIAL_PATHS: LearningPath[] = []
const STORAGE_KEY = 'ht-learning-paths'

export default function AdminLearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>(INITIAL_PATHS)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const newPath: LearningPath = {
      id: `${Date.now()}`,
      title: title.trim(),
      summary: summary.trim() || 'Custom counseling journey',
      courses: 3,
    }

    setPaths(prev => [...prev, newPath])
    setTitle('')
    setSummary('')
    setShowForm(false)
  }

  const openForm = () => {
    setShowForm(true)
  }

  // Load saved paths from localStorage on first client render
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as LearningPath[]
      if (Array.isArray(parsed)) {
        setPaths(parsed)
      }
    } catch {
      // ignore parse errors and fall back to defaults
    }
  }, [])

  // Persist paths whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(paths))
    } catch {
      // ignore quota or storage errors in demo
    }
  }, [paths])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Learning paths
          </h1>
          <p className="text-xs text-slate-500">
            Curate sequenced journeys across the 9‑week curriculum, electives,
            and practicum.
          </p>
        </div>
        <Button
          className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-xs text-white"
          onClick={openForm}
        >
          Add learning path
        </Button>
      </div>

      {paths.length === 0 && (
        <Card className="p-6">
          {paths.length === 0 ? (
            <EmptyState
              title="No learning paths yet"
              description='Design paths like "Foundations + Ethics + Practicum" or "Peer Circle Facilitator Track" to guide learners through a structured counseling journey.'
              actionLabel="Create first learning path"
              onActionClick={openForm}
              icon={<Layers3 className="h-4 w-4" />}
            />
          ) : (
            <div className="text-xs text-slate-600">
              <p className="font-semibold mb-1">How learning paths work</p>
              <p>
                Use the table below to review paths you have created. Future
                iterations will let you open each path to manage steps,
                enrolments and automation rules.
              </p>
            </div>
          )}
        </Card>
      )}

      {paths.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Existing learning paths
              </h2>
              <p className="text-xs text-slate-500">
                Use these to assign journeys to cohorts or peer circles.
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
                  <th className="px-3 py-2 text-left font-medium">
                    Approx. courses
                  </th>
                </tr>
              </thead>
              <tbody>
                {paths.map(path => (
                  <tr
                    key={path.id}
                    className="border-t border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {path.title}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {path.summary}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {path.courses}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showForm && (
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            New learning path
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="lp-title" className="text-xs text-slate-700">
                Path name
              </Label>
              <Input
                id="lp-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Foundations + Ethics + Practicum"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lp-summary" className="text-xs text-slate-700">
                Short summary
              </Label>
              <Input
                id="lp-summary"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Brief description shown to learners"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
              >
                Save path
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-slate-600"
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

