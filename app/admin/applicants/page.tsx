'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

type Applicant = {
  id: string
  full_name_certificate: string
  phone_whatsapp: string
  email: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

type ProcessedDetails = {
  applicantId: string
  studentId: string | null
  matricNumber: string | null
  isPaid: boolean
  paidAt: string | null
  latestPaymentStatus: string | null
  paymentAuthorizationUrl: string | null
  paymentReference: string | null
  paymentAmountNgn: number | null
  discountApplied: boolean | null
  discountPercent: number | null
  setPasswordUrl: string | null
  expiresAt: string | null
  needsRepair: boolean
  detailsError: string | null
}

type ApplicantSubmission = Record<string, unknown>

const SUBMISSION_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'fullNameCertificate', label: 'Full name (certificate)' },
  { key: 'gender', label: 'Gender' },
  { key: 'dob', label: 'Date of birth' },
  { key: 'phoneWhatsApp', label: 'Phone number (WhatsApp)' },
  { key: 'email', label: 'Email (contact only)' },
  { key: 'cityState', label: 'Residential city & state' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'highestQualification', label: 'Highest educational qualification' },
  { key: 'highestQualificationOther', label: 'Qualification (other)' },
  { key: 'fieldOfStudy', label: 'Field / course of study' },
  { key: 'currentOccupation', label: 'Current occupation / role' },
  { key: 'professionalBackground', label: 'Professional background' },
  { key: 'professionalBackgroundOther', label: 'Professional background (other)' },
  { key: 'experienceLevel', label: 'Counselling experience level' },
  { key: 'formalTraining', label: 'Formal counselling training before' },
  { key: 'formalTrainingInstitution', label: 'Formal training institution/program' },
  { key: 'formalTrainingDuration', label: 'Formal training duration' },
  { key: 'areas', label: 'Areas worked in / interested in' },
  { key: 'areasOther', label: 'Areas (other)' },
  { key: 'whyEnroll', label: 'Why enroll' },
  { key: 'hopeToGain', label: 'Hope to gain' },
  { key: 'hopeToGainOther', label: 'Hope to gain (other)' },
  { key: 'intendToServe', label: 'Who they intend to serve' },
  { key: 'unresolvedIssues', label: 'Unresolved personal issues' },
  { key: 'openToSupervision', label: 'Open to supervision/feedback' },
  { key: 'agreeEthics', label: 'Agrees to confidentiality/ethics' },
  { key: 'trainingMode', label: 'Preferred training mode' },
  { key: 'availability', label: 'Availability' },
  { key: 'hearAbout', label: 'How they heard about the course' },
  { key: 'hearAboutOther', label: 'How they heard (other)' },
  { key: 'declarationAgree', label: 'Declaration agreed' },
  { key: 'typedSignature', label: 'Typed signature' },
  { key: 'signatureDate', label: 'Signature date' },
  { key: 'submittedAt', label: 'Submitted at' },
]

function formatSubmissionValue(value: unknown) {
  if (value === null || value === undefined) return '-'
  if (Array.isArray(value)) {
    const items = value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
    return items.length > 0 ? items.join(', ') : '-'
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  const text = String(value).trim()
  return text.length > 0 ? text : '-'
}

export default function ApplicantsPage() {
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedProcessedId, setSelectedProcessedId] = useState<string | null>(null)
  const [loadingProcessedDetailsId, setLoadingProcessedDetailsId] = useState<string | null>(null)
  const [processedDetails, setProcessedDetails] = useState<ProcessedDetails | null>(null)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
  const [loadingSubmissionId, setLoadingSubmissionId] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<ApplicantSubmission | null>(null)
  const isMountedRef = useRef(true)

  function isAbortLikeError(error: unknown) {
    const message = String((error as any)?.message ?? error ?? '').toLowerCase()
    const name = String((error as any)?.name ?? '').toLowerCase()
    return name === 'aborterror' || message.includes('signal is aborted') || message.includes('aborted')
  }

  async function load() {
    if (!isMountedRef.current) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('id, full_name_certificate, phone_whatsapp, email, status, created_at')
        .order('created_at', { ascending: false })

      if (!isMountedRef.current) return

      if (error) {
        toast({ variant: 'destructive', title: 'Failed to load applicants', description: error.message })
        setApplicants([])
      } else {
        setApplicants((data ?? []) as Applicant[])
      }
    } catch (e: any) {
      if (!isAbortLikeError(e)) {
        toast({
          variant: 'destructive',
          title: 'Failed to load applicants',
          description: e?.message || 'Unexpected error while loading applicants',
        })
        if (isMountedRef.current) setApplicants([])
      }
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    load()
    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function approve(applicantId: string) {
    setBusyId(applicantId)
    try {
      const res = await fetch('/api/admin/applicants/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'Failed to approve applicant')
      }

      // Default flow: pay after approval. Generate a Paystack payment link for the approved student.
      const payRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const payJson = await payRes.json()
      if (!payRes.ok) {
        throw new Error(payJson?.error || 'Approved, but failed to generate payment link')
      }

      const fullPaymentUrl = toAbsoluteUrl(payJson.authorizationUrl)

      try {
        await navigator.clipboard.writeText(fullPaymentUrl)
        toast({
          title: 'Approved',
          description: `Matric: ${json.matricNumber}. Paystack payment link copied. Amount: NGN ${Number(payJson.amountNgn).toLocaleString()}`,
        })
      } catch {
        toast({
          title: 'Approved',
          description: `Matric: ${json.matricNumber}. Payment link: ${fullPaymentUrl}`,
        })
      }

      await load()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Approve failed', description: e?.message || 'Error' })
    } finally {
      setBusyId(null)
    }
  }

  async function reject(applicantId: string) {
    setBusyId(applicantId)
    try {
      const res = await fetch('/api/admin/applicants/reject', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to reject applicant')
      toast({ title: 'Rejected', description: 'Applicant marked as rejected.' })
      await load()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Reject failed', description: e?.message || 'Error' })
    } finally {
      setBusyId(null)
    }
  }

  function toAbsoluteUrl(pathOrUrl: string) {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
    if (typeof window === 'undefined') return pathOrUrl
    return `${window.location.origin}${pathOrUrl}`
  }

  async function toggleSubmissionView(applicant: Applicant) {
    if (selectedSubmissionId === applicant.id) {
      setSelectedSubmissionId(null)
      setSelectedSubmission(null)
      return
    }

    setSelectedSubmissionId(applicant.id)
    setSelectedSubmission(null)
    setLoadingSubmissionId(applicant.id)

    try {
      const res = await fetch('/api/admin/applicants/details', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId: applicant.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load form submission')
      setSelectedSubmission((json?.submission as ApplicantSubmission) ?? {})
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to load form',
        description: e?.message || 'Error',
      })
    } finally {
      setLoadingSubmissionId(null)
    }
  }

  async function openProcessedDetails(applicant: Applicant) {
    if (selectedProcessedId === applicant.id) {
      setSelectedProcessedId(null)
      setProcessedDetails(null)
      return
    }

    setSelectedProcessedId(applicant.id)
    setProcessedDetails(null)

    if (applicant.status !== 'APPROVED') return

    setLoadingProcessedDetailsId(applicant.id)
    try {
      const res = await fetch('/api/admin/applicants/details', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId: applicant.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to load applicant details')
      }

      setProcessedDetails({
        applicantId: applicant.id,
        studentId: json.student?.id ?? null,
        matricNumber: json.student?.matricNumber ?? null,
        isPaid: Boolean(json.student?.isPaid),
        paidAt: json.student?.paidAt ?? null,
        latestPaymentStatus: json.latestPayment?.status ?? null,
        paymentAuthorizationUrl: null,
        paymentReference: json.latestPayment?.reference ?? null,
        paymentAmountNgn: Number.isFinite(Number(json.latestPayment?.amountKobo))
          ? Number(json.latestPayment.amountKobo) / 100
          : null,
        discountApplied: typeof json.latestPayment?.discountApplied === 'boolean' ? json.latestPayment.discountApplied : null,
        discountPercent: Number.isFinite(Number(json.latestPayment?.discountPercent)) ? Number(json.latestPayment.discountPercent) : null,
        setPasswordUrl: null,
        expiresAt: null,
        needsRepair: Boolean(json?.needsRepair),
        detailsError: json?.student ? null : 'Student record not linked for this applicant. Use Repair if available.',
      })
    } catch (e: any) {
      setProcessedDetails({
        applicantId: applicant.id,
        studentId: null,
        matricNumber: null,
        isPaid: false,
        paidAt: null,
        latestPaymentStatus: null,
        paymentAuthorizationUrl: null,
        paymentReference: null,
        paymentAmountNgn: null,
        discountApplied: null,
        discountPercent: null,
        setPasswordUrl: null,
        expiresAt: null,
        needsRepair: true,
        detailsError: e?.message || 'Failed to load details',
      })
      toast({
        variant: 'destructive',
        title: 'Failed to load details',
        description: e?.message || 'Error',
      })
    } finally {
      setLoadingProcessedDetailsId(null)
    }
  }

  async function refreshProcessedDetails(applicantId: string) {
    const res = await fetch('/api/admin/applicants/details', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ applicantId }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || 'Failed to refresh details')

    setProcessedDetails((prev) => {
      if (!prev || prev.applicantId !== applicantId) return prev
      return {
        ...prev,
        studentId: json.student?.id ?? null,
        matricNumber: json.student?.matricNumber ?? null,
        isPaid: Boolean(json.student?.isPaid),
        paidAt: json.student?.paidAt ?? null,
        latestPaymentStatus: json.latestPayment?.status ?? null,
        paymentReference: json.latestPayment?.reference ?? prev.paymentReference,
        paymentAmountNgn: Number.isFinite(Number(json.latestPayment?.amountKobo))
          ? Number(json.latestPayment.amountKobo) / 100
          : prev.paymentAmountNgn,
        discountApplied: typeof json.latestPayment?.discountApplied === 'boolean' ? json.latestPayment.discountApplied : prev.discountApplied,
        discountPercent: Number.isFinite(Number(json.latestPayment?.discountPercent)) ? Number(json.latestPayment.discountPercent) : prev.discountPercent,
        needsRepair: Boolean(json?.needsRepair),
        detailsError: json?.student ? null : 'Student record not linked for this applicant. Use Repair if available.',
      }
    })
  }

  async function safeRefreshProcessedDetails(applicantId: string) {
    setBusyId(applicantId)
    try {
      await refreshProcessedDetails(applicantId)
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Refresh failed',
        description: e?.message || 'Error',
      })
    } finally {
      setBusyId(null)
    }
  }

  async function repairLink(applicantId: string) {
    setBusyId(applicantId)
    try {
      const res = await fetch('/api/admin/applicants/repair-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to repair student link')
      toast({ title: 'Repaired', description: 'Student link repaired. Reloading details...' })
      await refreshProcessedDetails(applicantId)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Repair failed', description: e?.message || 'Error' })
    } finally {
      setBusyId(null)
    }
  }

  async function generatePaymentLink(applicantId: string) {
    setBusyId(applicantId)
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to generate payment link')

      const fullPaymentUrl = toAbsoluteUrl(json.authorizationUrl)

      setProcessedDetails((prev) =>
        prev && prev.applicantId === applicantId
          ? {
              ...prev,
              paymentAuthorizationUrl: fullPaymentUrl,
              paymentReference: json.reference ?? null,
              paymentAmountNgn: Number.isFinite(Number(json.amountNgn)) ? Number(json.amountNgn) : null,
              discountApplied: typeof json.discountApplied === 'boolean' ? json.discountApplied : null,
              discountPercent: Number.isFinite(Number(json.discountPercent)) ? Number(json.discountPercent) : null,
            }
          : prev
      )

      try {
        await navigator.clipboard.writeText(fullPaymentUrl)
        toast({
          title: 'Payment link ready',
          description: `Paystack payment link copied. Amount: NGN ${Number(json.amountNgn).toLocaleString()}`,
        })
      } catch {
        toast({ title: 'Payment link ready', description: fullPaymentUrl })
      }

      await refreshProcessedDetails(applicantId)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Payment link failed', description: e?.message || 'Error' })
    } finally {
      setBusyId(null)
    }
  }

  async function verifyLatestPayment(applicantId: string, reference: string) {
    setBusyId(applicantId)
    try {
      const res = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || json?.reason || 'Failed to verify payment')

      toast({ title: 'Verified', description: `Payment verified for ${reference}.` })
      await refreshProcessedDetails(applicantId)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Verify failed', description: e?.message || 'Error' })
    } finally {
      setBusyId(null)
    }
  }

  async function generateSetupLink(applicantId: string) {
    setBusyId(applicantId)
    try {
      const res = await fetch('/api/admin/applicants/setup-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ applicantId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to generate setup link')

      const fullUrl = toAbsoluteUrl(json.setPasswordUrl)

      setProcessedDetails((prev) =>
        prev && prev.applicantId === applicantId
          ? {
              ...prev,
              setPasswordUrl: fullUrl,
              expiresAt: json.expiresAt ?? null,
            }
          : prev
      )

      await copySetupLink(fullUrl)
      await refreshProcessedDetails(applicantId)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Setup link failed', description: e?.message || 'Error' })
    } finally {
      setBusyId(null)
    }
  }

  async function copySetupLink(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      toast({ title: 'Copied', description: 'Set-password link copied to clipboard.' })
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed', description: link })
    }
  }

  function renderSubmissionPanel(applicantId: string) {
    if (loadingSubmissionId === applicantId) {
      return <p className="text-xs text-slate-600">Loading submitted form...</p>
    }

    if (selectedSubmissionId !== applicantId || !selectedSubmission) {
      return <p className="text-xs text-slate-600">Could not load form details. Tap "View form" again.</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {SUBMISSION_FIELDS.map((field) => (
          <div key={field.key} className="rounded-md border border-slate-200 bg-white p-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">{field.label}</div>
            <div className="text-sm text-slate-900 whitespace-pre-wrap break-words">
              {formatSubmissionValue(selectedSubmission[field.key])}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const pending = applicants.filter((a) => a.status === 'PENDING')
  const processed = applicants.filter((a) => a.status !== 'PENDING')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
        <h1 className="text-xl font-semibold text-slate-900">Applicants</h1>
        <p className="text-sm text-slate-600">
          Review applications, approve to generate a matric number + set-password link.
        </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/outbox">Email outbox</Link>
        </Button>
      </div>

      <Card className="p-4 border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-900">Pending</div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No pending applicants.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {a.full_name_certificate}
                    </div>
                    <div className="text-xs text-slate-600">
                      {a.phone_whatsapp} • {a.email}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Submitted: {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSubmissionView(a)}
                      disabled={loadingSubmissionId === a.id}
                    >
                      {selectedSubmissionId === a.id ? 'Hide form' : 'View form'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approve(a.id)}
                      disabled={busyId === a.id}
                    >
                      {busyId === a.id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reject(a.id)}
                      disabled={busyId === a.id}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {selectedSubmissionId === a.id && (
                  <div className="mt-3 rounded-md bg-slate-50 p-3 space-y-2">
                    <p className="text-xs font-medium text-slate-700">Submitted application form</p>
                    {renderSubmissionPanel(a.id)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 border-slate-200 bg-white">
        <div className="text-sm font-medium text-slate-900">Processed</div>
        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading...</div>
        ) : processed.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No processed applicants yet.</div>
        ) : (
          <div className="mt-4 space-y-2">
            {processed.slice(0, 20).map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between text-sm gap-3">
                  {a.status === 'APPROVED' ? (
                    <button
                      type="button"
                      onClick={() => openProcessedDetails(a)}
                      className="text-left text-slate-700 truncate font-medium hover:text-slate-900 hover:underline"
                    >
                      {a.full_name_certificate}
                    </button>
                  ) : (
                    <span className="text-slate-700 truncate">{a.full_name_certificate}</span>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSubmissionView(a)}
                      disabled={loadingSubmissionId === a.id}
                    >
                      {selectedSubmissionId === a.id ? 'Hide form' : 'View form'}
                    </Button>
                    <span className="text-xs text-slate-500">{a.status}</span>
                  </div>
                </div>

                {selectedSubmissionId === a.id && (
                  <div className="mt-3 rounded-md bg-slate-50 p-3 space-y-2">
                    <p className="text-xs font-medium text-slate-700">Submitted application form</p>
                    {renderSubmissionPanel(a.id)}
                  </div>
                )}

                {selectedProcessedId === a.id && (
                  <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-700 space-y-2">
                    {a.status !== 'APPROVED' ? (
                      <p>Set-password details are only available for approved applicants.</p>
                    ) : loadingProcessedDetailsId === a.id ? (
                      <p>Loading matric number and setup link...</p>
                    ) : processedDetails?.applicantId === a.id ? (
                      <>
                        {!processedDetails.studentId ? (
                          <>
                            <p className="text-slate-600">
                              {processedDetails.detailsError ?? 'Student record not linked for this applicant yet.'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === a.id}
                                onClick={() => safeRefreshProcessedDetails(a.id)}
                              >
                                {busyId === a.id ? 'Working...' : 'Retry'}
                              </Button>
                              {processedDetails.needsRepair && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busyId === a.id}
                                  onClick={() => repairLink(a.id)}
                                >
                                  {busyId === a.id ? 'Working...' : 'Repair link'}
                                </Button>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <p>
                              Matric Number:{' '}
                              <span className="font-semibold text-slate-900">{processedDetails.matricNumber ?? '(missing)'}</span>
                            </p>
                            <p>
                              Payment status:{' '}
                              <span
                                className={processedDetails.isPaid ? 'font-semibold text-green-700' : 'font-semibold text-amber-700'}
                              >
                                {processedDetails.isPaid ? 'PAID' : 'UNPAID'}
                              </span>
                              {processedDetails.paidAt ? ` (paid at ${new Date(processedDetails.paidAt).toLocaleString()})` : ''}
                            </p>

                            {!processedDetails.isPaid ? (
                              <>
                                <p className="text-slate-600">
                                  Set-password link can be issued only after payment is verified.
                                </p>
                                {processedDetails.paymentReference && (
                                  <p className="break-all">
                                    Latest payment: <span className="font-mono">{processedDetails.paymentReference}</span>
                                    {processedDetails.latestPaymentStatus ? ` (${processedDetails.latestPaymentStatus})` : ''}
                                    {processedDetails.paymentAmountNgn ? ` - NGN ${processedDetails.paymentAmountNgn.toLocaleString()}` : ''}
                                  </p>
                                )}
                                {processedDetails.paymentAuthorizationUrl && (
                                  <p className="break-all">
                                    Payment link:{' '}
                                    <a
                                      href={processedDetails.paymentAuthorizationUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-teal-700 hover:underline"
                                    >
                                      {processedDetails.paymentAuthorizationUrl}
                                    </a>
                                  </p>
                                )}
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={busyId === a.id}
                                    onClick={() => generatePaymentLink(a.id)}
                                  >
                                    {busyId === a.id ? 'Working...' : 'Generate Paystack payment link'}
                                  </Button>
                                  {processedDetails.paymentReference && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={busyId === a.id}
                                      onClick={() => verifyLatestPayment(a.id, processedDetails.paymentReference!)}
                                    >
                                      {busyId === a.id ? 'Working...' : 'Verify payment'}
                                    </Button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                {processedDetails.setPasswordUrl && (
                                  <>
                                    <p className="break-all">
                                      Set-password link:{' '}
                                      <a
                                        href={processedDetails.setPasswordUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-teal-700 hover:underline"
                                      >
                                        {processedDetails.setPasswordUrl}
                                      </a>
                                    </p>
                                    {processedDetails.expiresAt && (
                                      <p>Expires: {new Date(processedDetails.expiresAt).toLocaleString()}</p>
                                    )}
                                  </>
                                )}
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={busyId === a.id}
                                    onClick={() => generateSetupLink(a.id)}
                                  >
                                    {busyId === a.id ? 'Generating...' : 'Generate set-password link'}
                                  </Button>
                                  {processedDetails.setPasswordUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copySetupLink(processedDetails.setPasswordUrl!)}
                                    >
                                      Copy link
                                    </Button>
                                  )}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <p>Could not load setup details. Tap the name again.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
