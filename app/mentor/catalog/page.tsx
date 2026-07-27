'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Award, Users, Calendar, FileText, LayoutGrid } from 'lucide-react'

const PROGRAM_HIGHLIGHTS = [
  { icon: BookOpen, label: '9 modules', desc: 'From ethics to crisis intervention' },
  { icon: Calendar, label: '9 weeks', desc: 'Structured weekly schedule' },
  { icon: Users, label: 'Peer circles', desc: 'Learner-centered, participatory' },
  { icon: FileText, label: 'Journal & project', desc: 'Reflection and final project' },
  { icon: Award, label: 'Certificate', desc: 'Completion & optional Certificate of Merit' },
]

export default function MentorCatalogPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <LayoutGrid className="size-7 text-primary" aria-hidden="true" />
          Catalog
        </h1>
        <p className="mt-1 text-muted-foreground">
          This is the same catalog learners see. HELP Foundations Training — the 9-week program by
          Blakmoh Wellbeing Foundation. Use it to reference what learners can enroll in and to
          align your mentoring with the curriculum.
        </p>
      </div>

      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <BookOpen className="size-5 text-primary" aria-hidden="true" />
            HELP Foundations Training
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            A structured 9-week course: Helping Profession & Ethics, Exploration & Trauma-Informed
            Practice, Action & Conflict Resolution, Self-Care, Special Populations, Crisis & Trauma
            Counselling, Group & Peer Support, Case Analysis, and Final Projects. Graduate with 80%
            attendance, journals, group work, and Final Project; receive a Certificate of Completion
            (and optionally Certificate of Merit).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PROGRAM_HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border bg-background/80 px-3 py-2 text-foreground"
              >
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">{label}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">— {desc}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Admins manage the course store; learners see this catalog and go to My Course from here.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">What learners will learn</CardTitle>
          <CardDescription>
            Professional ethics and boundaries, cultural competence, active listening,
            trauma-informed practice, conflict resolution, crisis intervention, group counselling,
            case analysis, and reflective practice—all applied to low-resource and Nigerian contexts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'Ethics & boundaries',
              'Cultural competence',
              'Active listening',
              'Trauma-informed practice',
              'Conflict resolution',
              'Crisis intervention',
              'Group & peer support',
              'Case analysis',
              'Self-care & supervision',
            ].map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
