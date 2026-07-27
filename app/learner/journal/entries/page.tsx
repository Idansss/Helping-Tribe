'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LearningJournal } from '@/components/lms/LearningJournal'

function JournalEntriesContent() {
  const searchParams = useSearchParams()
  const initialModuleId = searchParams.get('module') ?? undefined

  return (
    <div className="space-y-6 max-w-4xl px-4 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Learning Journal</h1>
        <p className="text-slate-600 mt-1">
          Reflect on your personal growth, emotional intelligence, and professional development throughout the HELP Foundations Training. Weekly reflective journals are required for graduation.
        </p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Reflective practice</CardTitle>
          <CardDescription>
            Select a module and answer the prompts, or write freely. Your journal is private and supports your development as an ethical, effective helper.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LearningJournal initialModuleId={initialModuleId} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function LearnerJournalEntriesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading journal…</div>}>
      <JournalEntriesContent />
    </Suspense>
  )
}
