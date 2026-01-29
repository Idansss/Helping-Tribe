'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Target, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface CaseStudy {
  id: string
  module_id: string | null
  title: string
  scenario: string
  questions: Array<{
    id: string
    question: string
    hint?: string
  }>
  learning_objectives: string[] | null
  difficulty_level: string
  tags: string[] | null
  module?: {
    week_number: number
    title: string
  }
  hasResponse?: boolean
}

export function CaseStudyCard({ caseStudy, basePath = '/learner/cases' }: { caseStudy: CaseStudy; basePath?: string }) {
  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  const getDifficultyLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {caseStudy.module && (
                <Badge variant="outline">
                  Week {caseStudy.module.week_number}
                </Badge>
              )}
              <Badge className={getDifficultyColor(caseStudy.difficulty_level)}>
                {getDifficultyLabel(caseStudy.difficulty_level)}
              </Badge>
              {caseStudy.hasResponse && (
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg mb-2">{caseStudy.title}</CardTitle>
            <CardDescription className="line-clamp-3">
              {caseStudy.scenario}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{(caseStudy.questions ?? []).length} questions</span>
          </div>
          {caseStudy.learning_objectives && caseStudy.learning_objectives.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Learning Objectives:</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                {caseStudy.learning_objectives.slice(0, 3).map((objective, idx) => (
                  <li key={idx}>• {objective}</li>
                ))}
                {caseStudy.learning_objectives.length > 3 && (
                  <li className="text-muted-foreground/70">
                    +{caseStudy.learning_objectives.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}
          {caseStudy.tags && caseStudy.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {caseStudy.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Button asChild className="w-full mt-4">
          <Link href={`${basePath}/${caseStudy.id}`}>
            {caseStudy.hasResponse ? 'View Response' : 'Start Analysis'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
