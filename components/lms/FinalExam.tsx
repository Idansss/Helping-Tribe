'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FinalExamSubmission } from '@/types'

export function FinalExam() {
  const [file, setFile] = useState<File | null>(null)
  const [submission, setSubmission] = useState<FinalExamSubmission | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSubmission() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('final_exam_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (data) {
          setSubmission(data as FinalExamSubmission)
        }
      } catch (error) {
        console.error('Error loading submission:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmission()
  }, [supabase])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload a PDF or Word document')
        return
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Upload file to Supabase Storage
      const fileName = `final_exam_${user.id}_${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('final-exams')
        .upload(fileName, file, {
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('final-exams')
        .getPublicUrl(fileName)

      // Save submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('final_exam_submissions')
        .insert({
          user_id: user.id,
          file_url: urlData.publicUrl,
          file_name: file.name,
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      setSubmission(submissionData as FinalExamSubmission)
      setFile(null)
    } catch (error) {
      console.error('Error submitting final exam:', error)
      alert('Error submitting file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Final Exam</h1>
        <p className="text-muted-foreground mt-2">
          Submit your Case Study Analysis to complete the course
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Study Analysis</CardTitle>
          <CardDescription>
            Upload your completed case study analysis document (PDF or Word format, max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submission ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-semibold">Submission Received</p>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{submission.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.graded ? (
                          submission.grade !== null ? (
                            `Graded: ${submission.grade}%`
                          ) : (
                            'Graded - No score'
                          )
                        ) : (
                          'Pending review'
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open(submission.file_url, '_blank')}
                  >
                    View File
                  </Button>
                </div>
              </div>

              {submission.feedback && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Instructor Feedback</p>
                  <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file-upload">
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 mx-auto text-primary" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">
                        PDF or Word document (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Submit Final Exam'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
