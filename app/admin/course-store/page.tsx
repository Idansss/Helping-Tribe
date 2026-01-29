'use client'

import * as React from 'react'
import { BookOpenCheck, Plus, Check, Settings2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/admin/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StoreCourse {
  id: string
  title: string
  provider: string
  level: string
}

const MOCK_STORE_COURSES: StoreCourse[] = [
  {
    id: 'power-skills-1',
    title: 'Active Listening Power Skills',
    provider: 'Power Skills',
    level: 'Intermediate',
  },
  {
    id: 'workplace-ethics-1',
    title: 'Workplace Ethics for Helping Professionals',
    provider: 'Workplace Essentials',
    level: 'Foundational',
  },
  {
    id: 'engaging-learning-1',
    title: 'Engaging Group Facilitation',
    provider: 'Engaging Learning',
    level: 'Advanced',
  },
]

const CATALOG_STORAGE_KEY = 'ht-catalog-courses'

export default function AdminCourseStorePage() {
  const [addedCourseIds, setAddedCourseIds] = React.useState<string[]>([])
  const [showAccessInfo, setShowAccessInfo] = React.useState(false)
  const [showIntegrationInfo, setShowIntegrationInfo] = React.useState(false)

  // Hydrate added course state from localStorage so badges/buttons persist on reload
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as StoreCourse[]
      if (Array.isArray(stored)) {
        setAddedCourseIds(stored.map(c => c.id))
      }
    } catch {
      // ignore parse errors in demo
    }
  }, [])

  const handleAddToPortal = (course: StoreCourse) => {
    if (typeof window === 'undefined') return

    try {
      const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY)
      const existing = raw ? (JSON.parse(raw) as StoreCourse[]) : []
      const alreadyThere = existing.find(c => c.id === course.id)

      // Toggle: if course exists, remove it; otherwise add it
      const updated: StoreCourse[] = alreadyThere
        ? existing.filter(c => c.id !== course.id)
        : [...existing, course]

      window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated))
      setAddedCourseIds(updated.map(c => c.id))
    } catch {
      // ignore storage errors in demo
    }
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Course store</h1>
          <p className="text-xs text-slate-500">
            Browse and add pre‑built counseling content, power skills and
            Nigerian case studies.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => setShowAccessInfo(v => !v)}
        >
          <Settings2 className="h-3 w-3" />
          {showAccessInfo ? 'Hide library access' : 'Manage library access'}
        </Button>
      </div>

      {showAccessInfo && (
        <Card className="p-4 text-xs text-slate-700 space-y-2 border-dashed border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Library access (coming soon)
          </h2>
          <p>
            In a live portal, this section would let you decide which branches,
            cohorts or partners can see each catalog and imported course.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Limit premium catalogs to specific campuses or cohorts.</li>
            <li>Grant supervisors access to advanced ethics and trauma content.</li>
            <li>Hide experimental or draft courses from learners.</li>
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Available catalogs
              </h2>
              <p className="text-xs text-slate-500">
                Example categories you might connect from external providers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <Badge variant="outline">Power Skills</Badge>
            <Badge variant="outline">Workplace Essentials</Badge>
            <Badge variant="outline">Engaging Learning</Badge>
            <Badge variant="outline">Compliance</Badge>
            <Badge variant="outline">Wellbeing add‑ons</Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {MOCK_STORE_COURSES.map(course => {
              const isAdded = addedCourseIds.includes(course.id)
              return (
                <Card
                  key={course.id}
                  className="p-3 border-slate-200 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-slate-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {course.provider} • {course.level}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-slate-200 text-slate-600"
                    >
                      {isAdded ? 'Added to portal' : 'External catalog'}
                    </Badge>
                    <Button
                      size="icon"
                      variant="outline"
                      className={
                        isAdded
                          ? 'h-7 w-7 rounded-full bg-[var(--talent-primary)] text-white border-[var(--talent-primary)] cursor-default'
                          : 'h-7 w-7 rounded-full border-[var(--talent-primary)] text-[var(--talent-primary)] hover:bg-[var(--talent-primary)] hover:text-white'
                      }
                      aria-label={
                        isAdded
                          ? 'Remove course from portal'
                          : 'Add course to portal'
                      }
                      onClick={() => handleAddToPortal(course)}
                    >
                      {isAdded ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </Card>

        <Card className="px-5 py-4 space-y-3">
          <EmptyState
            title="Connect your external catalogs"
            description="Integrate external providers or your own store, then use the + button on a course card to add it to the portal."
            actionLabel={
              showIntegrationInfo
                ? 'Hide integration details'
                : 'Configure catalog integration'
            }
            icon={<BookOpenCheck className="h-4 w-4" />}
            onActionClick={() => setShowIntegrationInfo(v => !v)}
          />

          {showIntegrationInfo && (
            <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-2 px-1">
              <p className="font-semibold">Planned integration workflow</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Connect to external providers via API keys or LTI links.</li>
                <li>Choose which catalogs appear in the learner catalog.</li>
                <li>Map external tags to your own skill and category taxonomy.</li>
              </ul>
              <p className="text-slate-500">
                In the full product this area will guide you through a step‑by‑step
                wizard to set up and test your integrations safely.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

