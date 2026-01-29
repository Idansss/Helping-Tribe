'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResourceDirectory } from '@/components/lms/ResourceDirectory'
import { QuickReferenceTools } from '@/components/lms/QuickReferenceTools'

export default function LearnerResourcesPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
        <p className="text-slate-600 mt-1">
          Your digital toolkit: referral contacts across Nigeria and downloadable one-page guides (Active Listening, Grounding Techniques, Suicide Prevention) for use in the field.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Resource Directory</CardTitle>
          <CardDescription>
            Emergency numbers, mental health hotlines, hospitals, NGOs. Search or filter; save to My Backpack. Admins and mentors add resources from their portals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceDirectory />
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Quick Reference Tools</CardTitle>
          <CardDescription>
            One-page guides on essential skills: Active Listening, Grounding Techniques, Suicide Prevention, and more. Download for use in the field.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuickReferenceTools />
        </CardContent>
      </Card>
    </div>
  )
}
