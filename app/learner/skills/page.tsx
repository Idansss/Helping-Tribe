'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Brain, Heart, Shield, MessageSquare, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'

const SKILL_AREAS = [
  { icon: Shield, name: 'Ethics & boundaries', desc: 'Confidentiality, cultural competence, professional limits', module: 'Modules 1–2' },
  { icon: MessageSquare, name: 'Active listening & exploration', desc: 'Open-ended questions, reflection, insight stages', module: 'Module 2' },
  { icon: Heart, name: 'Trauma-informed practice', desc: 'Safety, trust, choice, empowerment', module: 'Modules 2, 6' },
  { icon: Brain, name: 'Conflict resolution & action', desc: 'Action stage, problem-solving, collaboration', module: 'Module 3' },
  { icon: Users, name: 'Group & peer support', desc: 'Peer circles, group counselling, facilitation', module: 'Modules 7–8' },
  { icon: BookOpen, name: 'Crisis intervention', desc: 'Risk assessment, safety, referral', module: 'Module 6' },
]

export default function LearnerSkillsPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Skills</h1>
        <p className="mt-1 text-muted-foreground">
          The HELP Foundations Training builds skills and ethical practice for mental health and psychosocial support. Track how each module contributes to your development as an effective, ethical helper.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skill areas</CardTitle>
          <CardDescription>
            These competencies are developed across the 9-week program. Outstanding performance may be recognized with a Certificate of Merit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SKILL_AREAS.map(({ icon: Icon, name, desc, module }) => (
            <div key={name} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/55">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{name}</span>
                  <Badge variant="outline" className="text-[10px]">{module}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keep building</CardTitle>
          <CardDescription>
            Complete modules, participate in Peer Circles, and use the Practice Client and Case Studies to strengthen your skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/learner/course/modules">
            <Badge className="cursor-pointer hover:bg-teal-100">My Course</Badge>
          </Link>
          <Link href="/learner/practice/chat">
            <Badge className="cursor-pointer hover:bg-teal-100">Practice Client</Badge>
          </Link>
          <Link href="/learner/cases">
            <Badge className="cursor-pointer hover:bg-teal-100">Case Studies</Badge>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
