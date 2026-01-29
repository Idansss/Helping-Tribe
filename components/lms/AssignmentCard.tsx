'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { formatDistanceToNow, format, isPast, isFuture } from 'date-fns'
import Link from 'next/link'

interface Assignment {
  id: string
  module_id: string
  title: string
  description: string | null
  assignment_type: string
  due_date: string | null
  max_points: number | null
  instructions: string | null
  module?: {
    week_number: number
    title: string
  }
  submission?: {
    id: string
    submitted_at: string
    graded: boolean
    grade: number | null
  }
}

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
  const isOverdue = dueDate && isPast(dueDate) && !assignment.submission
  const isDueSoon = dueDate && isFuture(dueDate) && dueDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 // 3 days
  const isSubmitted = !!assignment.submission
  const isGraded = assignment.submission?.graded

  const getStatusBadge = () => {
    if (isGraded) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Graded
        </Badge>
      )
    }
    if (isSubmitted) {
      return (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Submitted
        </Badge>
      )
    }
    if (isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      )
    }
    if (isDueSoon) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Due Soon
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      worksheet: 'Worksheet',
      reflection: 'Reflection',
      case_study: 'Case Study',
      project: 'Project',
      practice: 'Practice Exercise'
    }
    return labels[type] || type
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {assignment.module && (
                <Badge variant="outline">
                  Week {assignment.module.week_number}
                </Badge>
              )}
              <Badge variant="secondary">
                {getTypeLabel(assignment.assignment_type)}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-2">{assignment.title}</CardTitle>
            {assignment.description && (
              <CardDescription className="line-clamp-2">
                {assignment.description}
              </CardDescription>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          {dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                Due: {format(dueDate, 'MMM d, yyyy')}
                {isFuture(dueDate) && (
                  <span className="ml-2">
                    ({formatDistanceToNow(dueDate, { addSuffix: true })})
                  </span>
                )}
              </span>
            </div>
          )}
          {assignment.max_points && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{assignment.max_points} points</span>
            </div>
          )}
          {isSubmitted && assignment.submission && (
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                Submitted: {format(new Date(assignment.submission.submitted_at), 'MMM d, yyyy')}
              </p>
              {isGraded && assignment.submission.grade !== null && (
                <p className="font-semibold text-green-600">
                  Grade: {assignment.submission.grade}%
                </p>
              )}
            </div>
          )}
        </div>
        <Button asChild className="w-full mt-4">
          <Link href={`/assignments/${assignment.id}`}>
            {isSubmitted ? 'View Submission' : 'Start Assignment'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
