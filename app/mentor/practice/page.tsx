'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCircle, MessageCircle, ClipboardList, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function MentorPracticePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCircle className="h-7 w-7 text-teal-600" />
          Practice Client
        </h1>
        <p className="text-slate-600 mt-1">
          Learners use the Practice Client to have simulated conversations with AI personas (e.g. Chika, Amina, Tunde) and build helping skills. You don’t run sessions here—you review their work in Grading.
        </p>
      </div>

      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/80 to-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-teal-700" />
            What learners see
          </CardTitle>
          <CardDescription className="text-slate-600">
            In the learner portal, Practice Client offers scenario-based conversations with simulated clients. Learners practice active listening, empathy, and ethical boundaries. Conversations are for practice only; no real client data is used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">
            To review practice submissions, recordings, or related assignments, use the Grading Hub.
          </p>
          <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
            <Link href="/mentor/grading">
              Open Grading Hub
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Grading Hub
          </CardTitle>
          <CardDescription>
            Grade assignments, view practice recordings, and track learner submissions—including work that stems from Practice Client activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/mentor/grading">Go to Grading Hub</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
