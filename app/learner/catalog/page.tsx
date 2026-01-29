'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Award, Users, Calendar, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const PROGRAM_HIGHLIGHTS = [
  { icon: BookOpen, label: '9 modules', desc: 'From ethics to crisis intervention' },
  { icon: Calendar, label: '9 weeks', desc: 'Structured weekly schedule' },
  { icon: Users, label: 'Peer circles', desc: 'Learner-centered, participatory' },
  { icon: FileText, label: 'Journal & project', desc: 'Reflection and final project' },
  { icon: Award, label: 'Certificate', desc: 'Completion & optional Certificate of Merit' },
]

export default function LearnerCatalogPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catalog</h1>
        <p className="text-slate-600 mt-1">
          HELP Foundations Training — the 9-week program by Blakmoh Wellbeing Foundation. Train to become a skilled, ethical helper in mental health and psychosocial support in Nigeria and similar contexts. Mentors see the same catalog; admins manage the course store.
        </p>
      </div>

      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/80 to-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-700" />
            HELP Foundations Training
          </CardTitle>
          <CardDescription className="text-slate-600">
            A structured 9-week course: Helping Profession & Ethics, Exploration & Trauma-Informed Practice, Action & Conflict Resolution, Self-Care, Special Populations, Crisis & Trauma Counselling, Group & Peer Support, Case Analysis, and Final Projects. Graduate with 80% attendance, journals, group work, and Final Project; receive a Certificate of Completion (and optionally Certificate of Merit).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PROGRAM_HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2">
                <Icon className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="text-sm font-medium text-slate-800">{label}</span>
                <span className="text-xs text-slate-500 hidden sm:inline">— {desc}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/learner/course/modules">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Go to My Course
              </Button>
            </Link>
            <Link href="/learner/calendar">
              <Button variant="outline">View calendar</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">What you will learn</CardTitle>
          <CardDescription>
            Professional ethics and boundaries, cultural competence, active listening, trauma-informed practice, conflict resolution, crisis intervention, group counselling, case analysis, and reflective practice—all applied to low-resource and Nigerian contexts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Ethics & boundaries', 'Cultural competence', 'Active listening', 'Trauma-informed practice', 'Conflict resolution', 'Crisis intervention', 'Group & peer support', 'Case analysis', 'Self-care & supervision'].map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
