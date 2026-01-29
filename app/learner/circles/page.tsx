'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PeerCircleList } from '@/components/lms/PeerCircleList'

export default function LearnerCirclesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Peer Circles</h1>
        <p className="text-slate-600 mt-1">
          Helping skills are best learned together. Join Peer Learning Circles for discussion, role-play, and support with other trainees. Participation is central to the HELP Foundations methodology.
        </p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">The Tribe</CardTitle>
          <CardDescription>
            Small groups linked to modules. Your mentor adds you to a circle; you&apos;ll see your circle and peers here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PeerCircleList />
        </CardContent>
      </Card>
    </div>
  )
}
