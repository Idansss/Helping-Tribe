'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { FileText, Calendar, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface FinalProject {
  id: string
  module_id: string | null
  title: string
  description: string
  requirements: any
  due_date: string | null
  max_points: number
  is_active: boolean
  hasSubmission?: boolean
  module?: {
    week_number: number
    title: string
  }
}

export function FinalProjectList() {
  const [projects, setProjects] = useState<FinalProject[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadProjects() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('final_projects')
          .select(`
            *,
            module:modules(week_number, title)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          // Check which projects have submissions
          const projectsWithSubmissions = await Promise.all(
            data.map(async (project) => {
              const { data: submissionData } = await supabase
                .from('final_project_submissions')
                .select('id')
                .eq('project_id', project.id)
                .eq('user_id', user.id)
                .maybeSingle()

              return {
                ...project,
                hasSubmission: !!submissionData
              }
            })
          )

          setProjects(projectsWithSubmissions as FinalProject[])
        }
      } catch (error) {
        console.error('Error loading final projects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [supabase])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading final projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Final Projects</h1>
        <p className="text-muted-foreground mt-2">
          Complete your capstone project to demonstrate your integrated helping skills
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No final projects available at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const isOverdue = project.due_date && new Date(project.due_date) < new Date()
            const isDueSoon = project.due_date && 
              new Date(project.due_date) > new Date() && 
              new Date(project.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {project.title}
                      </CardTitle>
                      {project.module && (
                        <Badge variant="outline" className="mt-2">
                          Week {project.module.week_number}: {project.module.title}
                        </Badge>
                      )}
                      {project.hasSubmission && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-2 ml-2">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Submitted
                        </Badge>
                      )}
                    </div>
                    {project.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-muted-foreground'}>
                          Due: {format(new Date(project.due_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.requirements && (
                    <div className="space-y-3">
                      {project.requirements.objectives && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Learning Objectives:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {project.requirements.objectives.map((obj: string, idx: number) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {project.requirements.deliverables && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Deliverables:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {project.requirements.deliverables.map((del: string, idx: number) => (
                              <li key={idx}>{del}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      Max Points: {project.max_points}
                    </div>
                    <Button asChild>
                      <Link href={`/final-projects/${project.id}`}>
                        {project.hasSubmission ? 'View/Edit Submission' : 'Start Project'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
