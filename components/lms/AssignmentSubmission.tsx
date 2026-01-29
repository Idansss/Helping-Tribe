'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, X, CheckCircle2, AlertCircle, Download, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface Assignment {
  id: string
  title: string
  description: string | null
  instructions: string | null
  assignment_type: string
  due_date: string | null
  max_points: number | null
  module?: {
    week_number: number
    title: string
  }
}

interface Submission {
  id: string
  submission_text: string | null
  file_url: string | null
  file_name: string | null
  submitted_at: string
  graded: boolean
  grade: number | null
  feedback: string | null
}

export function AssignmentSubmission({ assignment }: { assignment: Assignment }) {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSubmission() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', assignment.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setSubmission(data as Submission)
          setSubmissionText(data.submission_text || '')
        }
      } catch (error) {
        console.error('Error loading submission:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmission()
  }, [assignment.id, supabase])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!submissionText.trim() && !file) {
      alert('Please provide either text submission or upload a file')
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let fileUrl = submission?.file_url || null
      let fileName = submission?.file_name || null

      // Upload file if provided
      if (file) {
        setUploading(true)
        const fileExt = file.name.split('.').pop()
        const storagePath = `${user.id}/${assignment.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('final-exams') // Reuse this bucket or create assignments bucket
          .upload(storagePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('final-exams')
          .getPublicUrl(storagePath)

        fileUrl = publicUrl
        fileName = file.name
        setUploading(false)
      }

      // Create or update submission
      const { error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignment.id,
          user_id: user.id,
          submission_text: submissionText || null,
          file_url: fileUrl,
          file_name: fileName,
          submitted_at: new Date().toISOString()
        })

      if (error) throw error

      // Reload to show updated submission
      window.location.reload()
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Error submitting assignment. Please try again.')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading assignment...</p>
      </div>
    )
  }

  const isSubmitted = !!submission
  const isGraded = submission?.graded
  const canEdit = !isGraded

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              {assignment.module && (
                <CardDescription className="mt-2">
                  Week {assignment.module.week_number}: {assignment.module.title}
                </CardDescription>
              )}
            </div>
            {isSubmitted && (
              <Badge className={isGraded ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}>
                {isGraded ? 'Graded' : 'Submitted'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignment.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{assignment.description}</p>
            </div>
          )}
          {assignment.instructions && (
            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm">
            {assignment.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            {assignment.max_points && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{assignment.max_points} points</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
            <CardDescription>
              {isSubmitted 
                ? 'Update your submission (you can edit until it is graded)'
                : 'Complete and submit your assignment'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Written Response</label>
              <Textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type your response here..."
                className="min-h-[300px]"
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">File Upload (Optional)</label>
              <div className="border-2 border-dashed rounded-lg p-6">
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a file (PDF, Word, or other document)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      aria-label="Upload assignment file"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Max size: 10MB</p>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || uploading || (!submissionText.trim() && !file)}
              className="w-full"
            >
              {uploading ? 'Uploading...' : submitting ? 'Submitting...' : isSubmitted ? 'Update Submission' : 'Submit Assignment'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submitted View */}
      {isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
            <CardDescription>
              Submitted on {format(new Date(submission!.submitted_at), 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission!.submission_text && (
              <div>
                <h3 className="font-semibold mb-2">Written Response</h3>
                <div className="p-4 bg-muted rounded-md">
                  <p className="whitespace-pre-wrap">{submission!.submission_text}</p>
                </div>
              </div>
            )}
            {submission!.file_url && (
              <div>
                <h3 className="font-semibold mb-2">Uploaded File</h3>
                <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1">{submission!.file_name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={submission!.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            )}
            {isGraded && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Graded</h3>
                </div>
                {submission!.grade !== null && (
                  <p className="text-lg font-bold text-green-700 dark:text-green-300 mb-2">
                    Grade: {submission!.grade}%
                  </p>
                )}
                {submission!.feedback && (
                  <div>
                    <h4 className="font-semibold mb-1">Feedback:</h4>
                    <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                      {submission!.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
            {!isGraded && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your submission is being reviewed. You will receive feedback soon.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
