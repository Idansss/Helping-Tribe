'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCircle, MessageCircle, ClipboardList, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function MentorPracticePage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <UserCircle className="size-7 text-primary" aria-hidden="true" />
          Practice Client
        </h1>
        <p className="mt-1 text-muted-foreground">
          Learners use the Practice Client to have simulated conversations with AI personas (e.g.
          Temi, Amara, Tobi) and build helping skills. You don’t run sessions here—you review their
          work in Grading.
        </p>
      </div>

      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <MessageCircle className="size-5 text-primary" aria-hidden="true" />
            What learners see
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            In the learner portal, Practice Client offers scenario-based conversations with simulated
            clients. Learners practice active listening, empathy, and ethical boundaries.
            Conversations are for practice only; no real client data is used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/90">
            To review practice submissions, recordings, or related assignments, use the Grading Hub.
          </p>
          <Button asChild>
            <Link href="/mentor/grading">
              Open Grading Hub
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <ClipboardList className="size-4" aria-hidden="true" />
            Grading Hub
          </CardTitle>
          <CardDescription>
            Grade assignments, view practice recordings, and track learner submissions—including work
            that stems from Practice Client activities.
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
