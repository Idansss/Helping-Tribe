'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CaseStudyBank } from '@/components/lms/CaseStudyBank'

export default function LearnerCasesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Case Studies</h1>
        <p className="text-slate-600 mt-1">
          Locally relevant scenarios—displaced adolescents, widows facing grief, and more—for you to practice assessment and response. Use the Case Study Bank as part of your toolkit for real-world helping.
        </p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Case Study Bank</CardTitle>
          <CardDescription>
            Search and filter by difficulty. Complete scenarios and reflect in your journal or discussions. Admins and mentors add case studies from their portals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CaseStudyBank />
        </CardContent>
      </Card>
    </div>
  )
}
