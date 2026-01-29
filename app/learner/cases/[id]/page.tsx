'use client'

import { use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CaseStudyViewer } from '@/components/lms/CaseStudyViewer'

export default function LearnerCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="text-slate-600 -ml-2">
          <Link href="/learner/cases">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Case Studies
          </Link>
        </Button>
      </div>
      <CaseStudyViewer caseStudyId={id} />
    </div>
  )
}
