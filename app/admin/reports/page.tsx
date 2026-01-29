'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { StatsCard } from '@/components/admin/StatsCard'
import { Button } from '@/components/ui/button'
import { CalendarRange, FileDown, LineChart } from 'lucide-react'

const DATE_RANGE_OPTIONS = ['Last 30 days', 'Last 90 days', 'This year'] as const

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState<(typeof DATE_RANGE_OPTIONS)[number]>('Last 30 days')
  const [isRangeOpen, setIsRangeOpen] = useState(false)

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value', 'Notes'],
      ['Active users', '124', 'Logged in at least once this cohort'],
      ['Never logged in', '7', 'Invited but not yet engaged'],
      ['Assigned courses', '9', 'Core + practicum modules'],
      ['Completed courses', '6', 'Average per learner'],
    ]

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'helping-tribe-reports.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Reports</h1>
          <p className="text-xs text-slate-500">
            Analyze learner progress, ethics completion, practicum outcomes and
            community impact.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => setIsRangeOpen(open => !open)}
            >
              <CalendarRange className="h-3 w-3" />
              {dateRange}
            </Button>
            {isRangeOpen && (
              <Card className="absolute right-0 mt-1 w-40 p-1 text-[11px] shadow-lg z-20">
                {DATE_RANGE_OPTIONS.map(option => (
                  <button
                    key={option}
                    className={`w-full text-left px-2 py-1 rounded-md hover:bg-slate-50 ${
                      option === dateRange ? 'bg-slate-50 font-medium' : ''
                    }`}
                    onClick={() => {
                      setDateRange(option)
                      setIsRangeOpen(false)
                    }}
                  >
                    {option}
                  </button>
                ))}
              </Card>
            )}
          </div>
          <Button
            size="sm"
            className="gap-2 text-xs bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
            onClick={handleExport}
          >
            <FileDown className="h-3 w-3" />
            Export to Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 bg-slate-50 rounded-lg p-1 w-fit">
          <TabsTrigger value="overview" className="text-xs px-3 py-1.5">
            Overview
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-xs px-3 py-1.5">
            Training matrix
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs px-3 py-1.5">
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              label="Active users"
              value="124"
              sublabel="Logged in at least once this cohort"
            />
            <StatsCard
              label="Never logged in"
              value="7"
              sublabel="Invited but not yet engaged"
            />
            <StatsCard
              label="Assigned courses"
              value="9"
              sublabel="Core + practicum modules"
            />
            <StatsCard
              label="Completed courses"
              value="6"
              sublabel="Average per learner"
            />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Learning structure
              </h2>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Courses: 9 core + 3 electives</li>
                <li>• Categories: Foundations, Ethics, Practicum</li>
                <li>• Branches: 4 active states</li>
                <li>• Groups: 18 peer circles</li>
              </ul>
            </Card>

            <Card className="p-4 md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Monthly completions
                </h2>
                <LineChart className="h-4 w-4 text-[var(--talent-primary)]" />
              </div>
              <div className="h-32 rounded-lg bg-slate-50 border border-dashed flex items-end gap-2 px-4 pb-3 text-[10px] text-slate-500">
                {[40, 55, 65, 72, 68, 80].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-full bg-[var(--talent-primary)]/20"
                      style={{ height: `${value}%` }}
                    >
                      <div
                        className="w-full rounded-full bg-[var(--talent-primary)]"
                        style={{ height: '60%' }}
                      />
                    </div>
                    <span>W{index + 1}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Progress is trending upward for this cohort. Wire a full chart library here when real data is available.
              </p>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-3 text-xs">
          <Card className="p-4 border-[#e2e8f0]">
            <div className="text-slate-600 mb-2">
              Training matrix will map users (rows) against courses (columns)
              with completion dots and status colors.
            </div>
            <div className="text-[11px] text-slate-500">
              You’ll be able to search by user, filter by course or branch, and{' '}
              <span className="font-medium">export to Excel</span> for offline
              analysis.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-3 text-xs">
          <Card className="p-4 border-[#e2e8f0] space-y-2">
            <div className="flex items-center gap-2 text-slate-700">
              Timeline view will show longitudinal engagement, completions and
              community support metrics across months.
            </div>
            <div className="text-[11px] text-slate-500">
              Filters will include From/To date, Event, User and Course, with a
              clear reset option so admins can quickly slice the audit history.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

