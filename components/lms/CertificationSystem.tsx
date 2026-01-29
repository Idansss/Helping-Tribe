'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, CheckCircle2, FileText, AlertCircle, ListChecks, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Certificate } from '@/types'
import Script from 'next/script'

declare global {
  interface Window {
    jspdf: any
  }
}

/** Completion data derived from Supabase (course/module, quizzes, final exam, final project). */
export type CompletionSummary = {
  modulesCompleted: number
  requiredModules: number
  quizAttemptsCompleted: number
  finalExamSubmitted: boolean
  finalProjectSubmitted: boolean
  /** Optional: quiz titles completed for PDF */
  quizTitlesCompleted: string[]
}

export function CertificationSystem() {
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [summary, setSummary] = useState<CompletionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load existing certificate
        const { data: certData } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        if (certData) setCertificate(certData as Certificate)

        // Required module count from modules table (default 9)
        let requiredModules = 9
        const { data: modulesData } = await supabase.from('modules').select('id').limit(100)
        if (modulesData?.length) requiredModules = modulesData.length

        // Module completion: try module_progress first, then user_progress
        let modulesCompleted = 0
        const { data: mpData } = await supabase
          .from('module_progress')
          .select('module_id, is_completed')
          .eq('user_id', user.id)
        if (mpData?.length) {
          modulesCompleted = mpData.filter((r: { is_completed: boolean }) => r.is_completed).length
        } else {
          const { data: upData } = await supabase
            .from('user_progress')
            .select('module_id, is_completed')
            .eq('user_id', user.id)
          if (upData?.length) {
            const completedModuleIds = [...new Set(
              upData.filter((r: { is_completed: boolean }) => r.is_completed).map((r: { module_id: string }) => r.module_id)
            )]
            modulesCompleted = completedModuleIds.length
          }
        }

        // Quiz attempts completed (quiz_attempts with completed_at set)
        const { data: attemptsData } = await supabase
          .from('quiz_attempts')
          .select('id, quiz_id, completed_at')
          .eq('user_id', user.id)
        const completedAttempts = (attemptsData ?? []).filter((a: { completed_at: string | null }) => a.completed_at)
        const quizAttemptsCompleted = completedAttempts.length
        const quizIds = completedAttempts.map((a: { quiz_id: string }) => a.quiz_id)
        let quizTitlesCompleted: string[] = []
        if (quizIds.length) {
          const { data: quizzesData } = await supabase
            .from('quizzes')
            .select('id, title')
            .in('id', quizIds)
          quizTitlesCompleted = (quizzesData ?? []).map((q: { title: string }) => q.title)
        }

        // Final exam
        const { data: examData } = await supabase
          .from('final_exam_submissions')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()
        const finalExamSubmitted = !!examData

        // Final project
        const { data: projectData } = await supabase
          .from('final_project_submissions')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()
        const finalProjectSubmitted = !!projectData

        setSummary({
          modulesCompleted,
          requiredModules,
          quizAttemptsCompleted,
          finalExamSubmitted,
          finalProjectSubmitted,
          quizTitlesCompleted,
        })
      } catch (error) {
        console.error('Error loading certification data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const allModulesCompleted = summary
    ? summary.modulesCompleted >= summary.requiredModules
    : false
  const capstoneDone = summary?.finalExamSubmitted || summary?.finalProjectSubmitted || false
  const eligibleForCertificate = summary && allModulesCompleted && capstoneDone

  const generateCertificate = async () => {
    if (!eligibleForCertificate || !summary) return

    setGenerating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      const userName = profile?.full_name || 'Student'

      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const { jsPDF } = window.jspdf
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      doc.setFillColor(200, 230, 250)
      doc.rect(0, 0, 297, 210, 'F')
      doc.setDrawColor(100, 150, 200)
      doc.setLineWidth(2)
      doc.rect(20, 20, 257, 170)

      doc.setFontSize(32)
      doc.setTextColor(50, 100, 150)
      doc.setFont('helvetica', 'bold')
      doc.text('CERTIFICATE OF COMPLETION', 148.5, 55, { align: 'center' })

      doc.setFontSize(18)
      doc.setTextColor(80, 120, 160)
      doc.setFont('helvetica', 'normal')
      doc.text('HELP Foundations Training Program', 148.5, 72, { align: 'center' })

      doc.setFontSize(24)
      doc.setTextColor(30, 80, 120)
      doc.setFont('helvetica', 'bold')
      doc.text(userName, 148.5, 95, { align: 'center' })

      doc.setFontSize(14)
      doc.setTextColor(60, 100, 140)
      doc.setFont('helvetica', 'normal')
      doc.text('has successfully completed the course on', 148.5, 112, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.text('Counseling, Ethics, and Trauma Support', 148.5, 127, { align: 'center' })

      // Course/quiz info from real data
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(70, 100, 130)
      let y = 145
      doc.text(`${summary.modulesCompleted} of ${summary.requiredModules} modules completed`, 148.5, y, { align: 'center' })
      y += 7
      if (summary.quizAttemptsCompleted > 0) {
        doc.text(`${summary.quizAttemptsCompleted} quiz${summary.quizAttemptsCompleted !== 1 ? 'zes' : ''} completed`, 148.5, y, { align: 'center' })
        y += 7
      }
      if (summary.finalExamSubmitted) {
        doc.text('Final exam submitted', 148.5, y, { align: 'center' })
        y += 7
      }
      if (summary.finalProjectSubmitted) {
        doc.text('Final project submitted', 148.5, y, { align: 'center' })
        y += 7
      }

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Issued on ${date}`, 148.5, 168, { align: 'center' })

      const pdfBlob = doc.output('blob')
      const fileName = `certificate_${user.id}_${Date.now()}.pdf`
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf' })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName)

      const { data: certData, error: certError } = await supabase
        .from('certificates')
        .upsert({ user_id: user.id, certificate_url: urlData.publicUrl }, { onConflict: 'user_id' })
        .select()
        .single()
      if (certError) throw certError

      setCertificate(certData as Certificate)
    } catch (error) {
      console.error('Error generating certificate:', error)
    } finally {
      setGenerating(false)
    }
  }

  const downloadCertificate = () => {
    if (!certificate) return
    window.open(certificate.certificate_url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading certification status...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
      <div>
        <h1 className="text-4xl font-bold">Certification</h1>
        <p className="text-muted-foreground mt-2">
          Your certificate of completion for the HELP Foundations Training — driven by your actual progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Requirements</CardTitle>
          <CardDescription>Complete all requirements to earn your certificate (data from Supabase)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {allModulesCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Complete course modules</p>
                <p className="text-sm text-muted-foreground">
                  {summary ? `${summary.modulesCompleted} of ${summary.requiredModules} completed` : '—'}
                </p>
              </div>
            </div>
            {allModulesCompleted && (
              <Badge variant="default" className="bg-green-500">Complete</Badge>
            )}
          </div>

          {summary && summary.quizAttemptsCompleted > 0 && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <ListChecks className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-medium">Quizzes completed</p>
                  <p className="text-sm text-muted-foreground">
                    {summary.quizAttemptsCompleted} quiz{summary.quizAttemptsCompleted !== 1 ? 'zes' : ''} passed
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{summary.quizAttemptsCompleted}</Badge>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {summary?.finalExamSubmitted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Final exam</p>
                <p className="text-sm text-muted-foreground">Case Study Analysis submission</p>
              </div>
            </div>
            {summary?.finalExamSubmitted && (
              <Badge variant="default" className="bg-green-500">Submitted</Badge>
            )}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {summary?.finalProjectSubmitted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Final project</p>
                <p className="text-sm text-muted-foreground">Capstone project submission</p>
              </div>
            </div>
            {summary?.finalProjectSubmitted && (
              <Badge variant="default" className="bg-green-500">Submitted</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {certificate ? (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Certificate Issued
            </CardTitle>
            <CardDescription>
              Your certificate was issued on{' '}
              {new Date(certificate.issued_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadCertificate} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
          </CardContent>
        </Card>
      ) : eligibleForCertificate ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-teal-600" />
              Ready for Certificate
            </CardTitle>
            <CardDescription>
              Your progress meets the requirements. Generate a PDF with your name, date, and course/quiz info.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateCertificate}
              disabled={generating}
              className="w-full"
            >
              {generating ? 'Generating...' : 'Generate Certificate'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Not Yet Eligible
            </CardTitle>
            <CardDescription>
              Complete all modules and submit the final exam or final project to earn your certificate.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
