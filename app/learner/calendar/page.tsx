'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WeeklyCalendar } from '@/components/lms/WeeklyCalendar'

export default function LearnerCalendarPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="text-slate-600 mt-1">
          Your weekly schedule: independent study, Peer Learning Circles, facilitator-led sessions, quizzes, and assignment due dates. Stay on track for 80% attendance and on-time submissions.
        </p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">My events</CardTitle>
          <CardDescription>
            Discussion prompts, peer circles, facilitator sessions, wrap-ups, and assignment due dates. Admins and mentors manage the schedule from their portals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
