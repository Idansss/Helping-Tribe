'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { FileText, Upload, CheckCircle2, Calendar, Star, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface FinalProjectSubmissionProps {
  projectId: string
}

export function FinalProjectSubmission({ projectId }: FinalProjectSubmissionProps) {
  const [project, setProject] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionText, setSubmissionText] = useState('')
  const [reflection, setReflection] = useState('')
  const [presentationUrl, setPresentationUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  async function loadProjectData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from('final_projects')
        .select(`
          *,
          module:modules(week_number, title)
        `)
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // Load existing submission
      const { data: submissionData } = await supabase
        .from('final_project_submissions')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (submissionData) {
        setSubmission(submissionData)
        setSubmissionText(submissionData.submission_text || '')
        setReflection(submissionData.reflection || '')
        setPresentationUrl(submissionData.presentation_url || '')
      }
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload() {
    if (!file) return null

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${projectId}/${Date.now()}.${fileExt}`
      const filePath = `final-projects/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath)

      setUploading(false)
      return { url: publicUrl, name: file.name }
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploading(false)
      throw error
    }
  }

  async function handleSubmit() {
    if (!submissionText.trim()) {
      alert('Please provide your project submission')
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      let fileUrl = submission?.submission_file_url || null
      let fileName = submission?.submission_file_name || null

      // Upload file if new one selected
      if (file) {
        const uploadResult = await handleFileUpload()
        if (uploadResult) {
          fileUrl = uploadResult.url
          fileName = uploadResult.name
        }
      }

      const submissionData = {
        project_id: projectId,
        user_id: profile.id,
        submission_text: submissionText,
        reflection: reflection || null,
        presentation_url: presentationUrl || null,
        submission_file_url: fileUrl,
        submission_file_name: fileName,
        submitted_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('final_project_submissions')
        .upsert(submissionData, {
          onConflict: 'project_id,user_id'
        })

      if (error) throw error

      alert('Project submitted successfully!')
      loadProjectData()
    } catch (error) {
      console.error('Error submitting project:', error)
      alert('Failed to submit project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    )
  }

  const isOverdue = project.due_date && new Date(project.due_date) < new Date()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">{project.title}</h1>
        <p className="text-muted-foreground mt-2">{project.description}</p>
        {project.due_date && (
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
              Due: {format(new Date(project.due_date), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        )}
      </div>

      {submission && submission.graded && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Graded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Grade:</span>
                <Badge className="bg-green-100 text-green-800">
                  {submission.grade} / {project.max_points}
                </Badge>
              </div>
              {submission.feedback && (
                <div>
                  <p className="font-semibold mb-1">Feedback:</p>
                  <p className="text-sm">{submission.feedback}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Project Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.requirements?.objectives && (
            <div>
              <h4 className="font-semibold mb-2">Learning Objectives:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {project.requirements.objectives.map((obj: string, idx: number) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}
          {project.requirements?.deliverables && (
            <div>
              <h4 className="font-semibold mb-2">Deliverables:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {project.requirements.deliverables.map((del: string, idx: number) => (
                  <li key={idx}>{del}</li>
                ))}
              </ul>
            </div>
          )}
          {project.requirements?.guidelines && (
            <div>
              <h4 className="font-semibold mb-2">Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {project.requirements.guidelines.map((guideline: string, idx: number) => (
                  <li key={idx}>{guideline}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Submission</CardTitle>
          <CardDescription>
            Submit your final project below. You can update your submission until the due date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Project Report / Written Submission *
            </label>
            <Textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Write your project report here (1500-2000 words recommended)..."
              rows={15}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Reflection on Learning Journey
            </label>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflect on how this training has impacted your approach to helping others..."
              rows={6}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Presentation URL (Optional)
            </label>
            <input
              type="url"
              value={presentationUrl}
              onChange={(e) => setPresentationUrl(e.target.value)}
              placeholder="Link to presentation slides or recording..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Upload File (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="flex-1"
                aria-label="Upload project file"
              />
              {submission?.submission_file_name && (
                <Badge variant="outline">
                  Current: {submission.submission_file_name}
                </Badge>
              )}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={submitting || uploading}
            className="w-full"
          >
            {submitting ? 'Submitting...' : uploading ? 'Uploading...' : submission ? 'Update Submission' : 'Submit Project'}
          </Button>

          {submission && (
            <p className="text-xs text-muted-foreground text-center">
              Submitted: {format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
