'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResourceDirectory } from '@/components/lms/ResourceDirectory'

export default function MentorResourcesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          Same Resource Directory as learners: referral contacts (emergency, mental health, hospitals, NGOs). Admins add and edit resources from the admin portal.
        </p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Resource Directory</CardTitle>
          <CardDescription>
            Search and filter; share links or contacts with learners as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceDirectory />
        </CardContent>
      </Card>
    </div>
  )
}
