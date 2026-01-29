'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DiscussionForum } from '@/components/lms/DiscussionForum'

export default function LearnerDiscussionsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
        <p className="text-slate-600 mt-1">
          Join module-based discussions with your cohort. Share reflections, respond to prompts, and learn from the Tribe. Mentors can view and follow discussions; admins manage prompts. Participation supports your learning and counts toward engagement.
        </p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Discussion forum</CardTitle>
          <CardDescription>
            Prompts are posted per module. Reply to threads and start conversations. Check &quot;Don&apos;t miss&quot; on your dashboard for new threads and replies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiscussionForum />
        </CardContent>
      </Card>
    </div>
  )
}
