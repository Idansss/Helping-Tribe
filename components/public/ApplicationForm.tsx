'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils/cn'
import { APPLICATION_HONEYPOT_FIELD } from '@/lib/applications/schema'
import {
  APPLICATION_ESTIMATED_MINUTES,
  APPLICATION_REVIEW_DAYS,
  PROGRAM_FULL_NAME,
  PROGRAM_NAME,
} from '@/lib/brand/program'

const ApplyFormSchema = z
  .object({
    fullNameCertificate: z.string().min(2, 'Full name is required'),
    gender: z.enum(['Male', 'Female', 'Prefer not to say']),
    dob: z.string().min(4, 'Date of birth is required'),
    phoneWhatsApp: z.string().min(5, 'WhatsApp number is required'),
    email: z.string().email('Valid email required'),
    cityState: z.string().min(2, 'City & State is required'),
    nationality: z.string().min(2, 'Nationality is required'),

    highestQualification: z.string().min(1),
    highestQualificationOther: z.string().optional(),
    fieldOfStudy: z.string().min(1),
    currentOccupation: z.string().min(1),
    professionalBackground: z.array(z.string()).min(1, 'Select at least one option'),
    professionalBackgroundOther: z.string().optional(),

    experienceLevel: z.string().min(1),
    formalTraining: z.enum(['Yes', 'No']),
    formalTrainingInstitution: z.string().optional(),
    formalTrainingDuration: z.string().optional(),
    areas: z.array(z.string()).default([]),
    areasOther: z.string().optional(),

    whyEnroll: z.string().min(10),
    hopeToGain: z.array(z.string()).default([]),
    hopeToGainOther: z.string().optional(),
    intendToServe: z.array(z.string()).default([]),

    unresolvedIssues: z.enum(['Yes', 'No', 'Prefer not to say']),
    openToSupervision: z.enum(['Yes', 'No']),
    agreeEthics: z.enum(['Yes', 'No']),

    trainingMode: z.enum(['Physical (In-person)', 'Online', 'Hybrid']),
    availability: z.array(z.string()).min(1, 'Select at least one option'),
    hearAbout: z.string().min(1),
    hearAboutOther: z.string().optional(),

    declarationAgree: z.boolean().refine((v) => v === true, 'You must agree'),
    typedSignature: z.string().min(2),
    signatureDate: z.string().min(4),
    consentPrivacy: z.boolean().refine((v) => v === true, 'Privacy consent is required'),
    consentSensitiveData: z.boolean().refine((v) => v === true, 'Sensitive data consent is required'),
    [APPLICATION_HONEYPOT_FIELD]: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.highestQualification === 'Other' && !values.highestQualificationOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['highestQualificationOther'],
        message: 'Please specify your qualification',
      })
    }

    if (values.professionalBackground.includes('Other') && !values.professionalBackgroundOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['professionalBackgroundOther'],
        message: 'Please specify',
      })
    }

    if (values.formalTraining === 'Yes') {
      if (!values.formalTrainingInstitution?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['formalTrainingInstitution'],
          message: 'Institution/Program is required',
        })
      }
      if (!values.formalTrainingDuration?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['formalTrainingDuration'],
          message: 'Duration is required',
        })
      }
    }

    if (values.areas.includes('Other') && !values.areasOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['areasOther'],
        message: 'Please specify',
      })
    }

    if (values.hopeToGain.includes('Other') && !values.hopeToGainOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hopeToGainOther'],
        message: 'Please specify',
      })
    }

    if (values.hearAbout === 'Other' && !values.hearAboutOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hearAboutOther'],
        message: 'Please specify',
      })
    }
  })

type ApplyFormValues = z.infer<typeof ApplyFormSchema>

const QUALIFICATIONS = [
  'SSCE',
  'NCE',
  'ND / HND',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Other',
] as const

const HEAR_ABOUT_OPTIONS = [
  'Social Media',
  'WhatsApp Broadcast',
  'Referral',
  'Previous Participant',
  'Event / Seminar',
  'Other',
] as const

const DRAFT_ID_STORAGE_KEY = 'ht_apply_draft_id'
const DRAFT_CACHE_STORAGE_KEY = 'ht_apply_form_cache'

const STEP_FIELDS: Array<Array<keyof ApplyFormValues>> = [
  ['fullNameCertificate', 'gender', 'dob', 'phoneWhatsApp', 'email', 'cityState', 'nationality'],
  [
    'highestQualification',
    'highestQualificationOther',
    'fieldOfStudy',
    'currentOccupation',
    'professionalBackground',
    'professionalBackgroundOther',
  ],
  [
    'experienceLevel',
    'formalTraining',
    'formalTrainingInstitution',
    'formalTrainingDuration',
    'areas',
    'areasOther',
  ],
  [
    'whyEnroll',
    'hopeToGain',
    'hopeToGainOther',
    'intendToServe',
    'unresolvedIssues',
    'openToSupervision',
    'agreeEthics',
  ],
  ['trainingMode', 'availability', 'hearAbout', 'hearAboutOther'],
  ['declarationAgree', 'typedSignature', 'signatureDate', 'consentPrivacy', 'consentSensitiveData'],
  [],
]

const STEP_TITLES = [
  'Personal Information',
  'Educational & Professional Background',
  'Experience',
  'Motivation & Readiness',
  'Training Logistics',
  'Declaration & Consent',
  'Review & Submit',
] as const

function optionId(group: string, value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${group}-${slug}`
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600">{message}</p>
}

function Option({
  id,
  active,
  inputProps,
  children,
  className,
}: {
  id: string
  active: boolean
  inputProps: React.InputHTMLAttributes<HTMLInputElement>
  children: ReactNode
  className?: string
}) {
  const { className: inputClassName, type, ...rest } = inputProps
  const isCheckbox = type === 'checkbox'

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm transition-colors',
        'cursor-pointer select-none',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-600/25',
        active ? 'border-teal-600 bg-teal-50/70' : 'border-slate-200 hover:bg-slate-50',
        className
      )}
    >
      <input
        id={id}
        type={type}
        className={cn(
          'h-5 w-5 shrink-0 accent-teal-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 focus-visible:ring-offset-2 ring-offset-white',
          isCheckbox ? 'rounded-sm' : 'rounded-full',
          inputClassName
        )}
        {...rest}
      />
      <span className="leading-snug text-slate-900">{children}</span>
    </label>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        {description ? <CardDescription className="text-sm">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

export function ApplicationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [loadingDraft, setLoadingDraft] = useState(true)
  const [savingDraft, setSavingDraft] = useState(false)

  const defaultValues = useMemo<ApplyFormValues>(
    () => ({
      fullNameCertificate: '',
      gender: 'Male',
      dob: '',
      phoneWhatsApp: '',
      email: '',
      cityState: '',
      nationality: '',

      highestQualification: '',
      highestQualificationOther: '',
      fieldOfStudy: '',
      currentOccupation: '',
      professionalBackground: [],
      professionalBackgroundOther: '',

      experienceLevel: '',
      formalTraining: 'No',
      formalTrainingInstitution: '',
      formalTrainingDuration: '',
      areas: [],
      areasOther: '',

      whyEnroll: '',
      hopeToGain: [],
      hopeToGainOther: '',
      intendToServe: [],

      unresolvedIssues: 'Prefer not to say',
      openToSupervision: 'Yes',
      agreeEthics: 'Yes',

      trainingMode: 'Online',
      availability: [],
      hearAbout: '',
      hearAboutOther: '',

      declarationAgree: false,
      typedSignature: '',
      signatureDate: '',
      consentPrivacy: false,
      consentSensitiveData: false,
      [APPLICATION_HONEYPOT_FIELD]: '',
    }),
    []
  )

  const {
    control,
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(ApplyFormSchema),
    defaultValues,
  })

  const highestQualification = watch('highestQualification')
  const formalTraining = watch('formalTraining')
  const hearAbout = watch('hearAbout')
  const gender = watch('gender')
  const experienceLevel = watch('experienceLevel')
  const unresolvedIssues = watch('unresolvedIssues')
  const openToSupervision = watch('openToSupervision')
  const agreeEthics = watch('agreeEthics')
  const trainingMode = watch('trainingMode')
  const professionalBackground = watch('professionalBackground') ?? []
  const areas = watch('areas') ?? []
  const hopeToGain = watch('hopeToGain') ?? []
  const intendToServe = watch('intendToServe') ?? []
  const availability = watch('availability') ?? []
  const declarationAgree = watch('declarationAgree')
  const consentPrivacy = watch('consentPrivacy')
  const consentSensitiveData = watch('consentSensitiveData')
  const watchedValues = watch()

  const totalSteps = STEP_FIELDS.length
  const progressValue = (currentStep / totalSteps) * 100

  useEffect(() => {
    let mounted = true

    async function hydrateDraft() {
      try {
        const queryDraftId = searchParams.get('draft')
        const localDraftId = localStorage.getItem(DRAFT_ID_STORAGE_KEY)
        const candidateDraftId = queryDraftId || localDraftId

        if (candidateDraftId) {
          const res = await fetch(`/api/apply/draft?id=${encodeURIComponent(candidateDraftId)}`, { cache: 'no-store' })
          if (res.ok) {
            const json = await res.json()
            const draft = json?.draft
            if (draft?.id) {
              reset({
                ...defaultValues,
                ...(draft.data ?? {}),
              })
              setDraftId(draft.id)
              setCurrentStep(Math.min(totalSteps, Math.max(1, Number(draft.lastStep ?? 1))))
              setLastSavedAt(draft.updatedAt ?? null)
              localStorage.setItem(DRAFT_ID_STORAGE_KEY, draft.id)
              localStorage.setItem(DRAFT_CACHE_STORAGE_KEY, JSON.stringify(draft.data ?? {}))
            }
          }
        } else {
          const cached = localStorage.getItem(DRAFT_CACHE_STORAGE_KEY)
          if (cached) {
            reset({
              ...defaultValues,
              ...(JSON.parse(cached) as Partial<ApplyFormValues>),
            })
          }
        }
      } catch {
        if (mounted) {
          toast({
            variant: 'destructive',
            title: 'Could not load saved draft',
            description: 'You can continue with this form state.',
          })
        }
      } finally {
        if (mounted) setLoadingDraft(false)
      }
    }

    hydrateDraft()
    return () => {
      mounted = false
    }
  }, [defaultValues, reset, searchParams, toast, totalSteps])

  async function saveDraft(mode: 'silent' | 'manual' = 'silent') {
    if (loadingDraft || isSubmitting) return true
    if (mode === 'manual') setSavingDraft(true)
    try {
      const values = getValues()
      const res = await fetch('/api/apply/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          draftId: draftId ?? undefined,
          email: values.email || undefined,
          lastStep: currentStep,
          data: values,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to save draft')

      if (json?.draftId) {
        setDraftId(json.draftId)
        localStorage.setItem(DRAFT_ID_STORAGE_KEY, json.draftId)
      }

      localStorage.setItem(DRAFT_CACHE_STORAGE_KEY, JSON.stringify(values))
      if (json?.lastSavedAt) setLastSavedAt(json.lastSavedAt)

      if (mode === 'manual') {
        toast({ title: 'Draft saved', description: 'You can resume this application later.' })
      }
      return true
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Draft save failed',
        description: e?.message || 'Could not save draft.',
      })
      return false
    } finally {
      if (mode === 'manual') setSavingDraft(false)
    }
  }

  useEffect(() => {
    if (loadingDraft || isSubmitting) return
    const timeout = setTimeout(() => {
      void saveDraft('silent')
    }, 2500)
    return () => clearTimeout(timeout)
  }, [watchedValues, currentStep, loadingDraft, isSubmitting])

  async function nextStep() {
    const fields = STEP_FIELDS[currentStep - 1]
    if (fields.length > 0) {
      const valid = await trigger(fields as any, { shouldFocus: true })
      if (!valid) return
    }
    setCurrentStep((value) => Math.min(totalSteps, value + 1))
    void saveDraft('silent')
  }

  function previousStep() {
    setCurrentStep((value) => Math.max(1, value - 1))
  }

  async function saveAndExit() {
    const ok = await saveDraft('manual')
    if (ok) router.push('/apply/resume')
  }

  async function onSubmit(values: ApplyFormValues) {
    try {
      const res = await fetch('/api/apply/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          draftId: draftId ?? undefined,
          data: values,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to submit')

      setSubmitted(true)
      localStorage.removeItem(DRAFT_ID_STORAGE_KEY)
      localStorage.removeItem(DRAFT_CACHE_STORAGE_KEY)
      toast({
        title: 'Application submitted',
        description: 'Redirecting to confirmation page...',
      })
      reset(defaultValues)
      router.push(`/apply/success?id=${encodeURIComponent(json.applicationId)}`)
      router.refresh()
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: e?.message || 'Please try again.',
      })
    }
  }

  if (loadingDraft) {
    return (
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-6 text-sm text-slate-600">Loading saved application...</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl md:text-2xl">{PROGRAM_FULL_NAME} Application</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Complete all steps accurately. Estimated completion time: {APPLICATION_ESTIMATED_MINUTES} minutes.
        </CardDescription>
        <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-xs text-teal-900">
          Applications are reviewed within {APPLICATION_REVIEW_DAYS} working days.
        </div>
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{STEP_TITLES[currentStep - 1]}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-500">
            {lastSavedAt ? `Last saved: ${new Date(lastSavedAt).toLocaleString()}` : 'Draft not saved yet'}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={saveAndExit}
            disabled={savingDraft || isSubmitting}
          >
            {savingDraft ? 'Saving...' : 'Save & exit'}
          </Button>
        </div>
        {submitted ? (
          <div className="mt-2 text-sm rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3">
            Application submitted successfully.
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="pt-0">
        <form
          onSubmit={
            currentStep === totalSteps
              ? handleSubmit(onSubmit)
              : (event) => {
                  event.preventDefault()
                  void nextStep()
                }
          }
          className="space-y-5"
        >
          <div className="hidden" aria-hidden>
            <Input tabIndex={-1} autoComplete="off" {...register(APPLICATION_HONEYPOT_FIELD)} />
          </div>

          {currentStep === 1 && (
          <SectionCard title="SECTION A: PERSONAL INFORMATION">
            <div className="space-y-1.5">
              <Label>1. Full Name (as you want it on your certificate) *</Label>
              <Input {...register('fullNameCertificate')} />
              <FieldError message={errors.fullNameCertificate?.message} />
            </div>

            <div className="space-y-2">
              <Label>2. Gender *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Male', 'Female', 'Prefer not to say'] as const).map((g) => (
                  <Option
                    key={g}
                    id={optionId('gender', g)}
                    active={gender === g}
                    inputProps={{ type: 'radio', value: g, ...register('gender') }}
                  >
                    {g}
                  </Option>
                ))}
              </div>
              <FieldError message={errors.gender?.message} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>3. Date of Birth *</Label>
                <Input type="date" {...register('dob')} />
                <FieldError message={errors.dob?.message} />
              </div>
              <div className="space-y-1.5">
                <Label>4. Phone Number (WhatsApp enabled) *</Label>
                <Input type="tel" {...register('phoneWhatsApp')} />
                <FieldError message={errors.phoneWhatsApp?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>5. Email Address (for approval updates only — not used for login) *</Label>
              <Input type="email" {...register('email')} />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>6. Residential City &amp; State *</Label>
                <Input {...register('cityState')} />
                <FieldError message={errors.cityState?.message} />
              </div>
              <div className="space-y-1.5">
                <Label>7. Nationality *</Label>
                <Input {...register('nationality')} />
                <FieldError message={errors.nationality?.message} />
              </div>
            </div>
          </SectionCard>
          )}

          {currentStep === 2 && (
          <SectionCard title="SECTION B: EDUCATIONAL & PROFESSIONAL BACKGROUND">
            <div className="space-y-1.5">
              <Label>8. Highest Educational Qualification *</Label>
              <Controller
                control={control}
                name="highestQualification"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATIONS.map((q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.highestQualification?.message} />
            </div>

            {highestQualification === 'Other' ? (
              <div className="space-y-1.5">
                <Label>Please specify:</Label>
                <Input {...register('highestQualificationOther')} />
                <FieldError message={errors.highestQualificationOther?.message} />
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>9. Field / Course of Study *</Label>
                <Input {...register('fieldOfStudy')} />
                <FieldError message={errors.fieldOfStudy?.message} />
              </div>
              <div className="space-y-1.5">
                <Label>10. Current Occupation / Role *</Label>
                <Input {...register('currentOccupation')} />
                <FieldError message={errors.currentOccupation?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>11. Professional Background (tick all that apply) *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Counsellor / Therapist',
                  'Psychologist',
                  'Social Worker',
                  'Teacher / Educator',
                  'Clergy / Religious Worker',
                  'Healthcare Worker',
                  'NGO / Humanitarian Worker',
                  'Student',
                  'Other',
                ].map((v) => (
                  <Option
                    key={v}
                    id={optionId('professional-background', v)}
                    active={professionalBackground.includes(v)}
                    inputProps={{ type: 'checkbox', value: v, ...register('professionalBackground') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
              <FieldError message={errors.professionalBackground?.message as any} />

              {professionalBackground.includes('Other') ? (
                <div className="space-y-1.5">
                  <Label>Other (specify):</Label>
                  <Input {...register('professionalBackgroundOther')} />
                  <FieldError message={errors.professionalBackgroundOther?.message} />
                </div>
              ) : null}
            </div>
          </SectionCard>
          )}

          {currentStep === 3 && (
          <SectionCard title="SECTION C: COUNCELLING/THERAPY SERVICE EXPERIENCE">
            <div className="space-y-2">
              <Label>12. Your counselling experience level *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Beginner (no formal training)',
                  'Beginner (some informal experience)',
                  'Intermediate (1–3 years)',
                  'Advanced (4+ years)',
                ].map((v) => (
                  <Option
                    key={v}
                    id={optionId('experience-level', v)}
                    active={experienceLevel === v}
                    inputProps={{ type: 'radio', value: v, ...register('experienceLevel') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
              <FieldError message={errors.experienceLevel?.message} />
            </div>

            <div className="space-y-2">
              <Label>13. Have you received any formal counselling or psychology training before? *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['Yes', 'No'] as const).map((v) => (
                  <Option
                    key={v}
                    id={optionId('formal-training', v)}
                    active={formalTraining === v}
                    inputProps={{ type: 'radio', value: v, ...register('formalTraining') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
              <FieldError message={errors.formalTraining?.message} />
            </div>

            {formalTraining === 'Yes' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Institution / Program:</Label>
                  <Input {...register('formalTrainingInstitution')} />
                  <FieldError message={errors.formalTrainingInstitution?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration:</Label>
                  <Input {...register('formalTrainingDuration')} />
                  <FieldError message={errors.formalTrainingDuration?.message} />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>14. Areas you have worked in or are interested in (tick all that apply):</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Marriage & Family',
                  'Youth & Adolescents',
                  'Children',
                  'Trauma & Abuse',
                  'Addiction',
                  'Mental Health',
                  'Faith-based Counselling',
                  'Career / Academic Counselling',
                  'Community Outreach',
                  'Other',
                ].map((v) => (
                  <Option
                    key={v}
                    id={optionId('areas', v)}
                    active={areas.includes(v)}
                    inputProps={{ type: 'checkbox', value: v, ...register('areas') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>

              {areas.includes('Other') ? (
                <div className="space-y-1.5">
                  <Label>Other:</Label>
                  <Input {...register('areasOther')} />
                  <FieldError message={errors.areasOther?.message} />
                </div>
              ) : null}
            </div>
          </SectionCard>
          )}

          {currentStep === 4 && (
          <SectionCard title="SECTION D: MOTIVATION & EXPECTATIONS">
            <div className="space-y-1.5">
              <Label>15. Why do you want to enroll in the {PROGRAM_NAME}? (Short paragraph) *</Label>
              <Textarea rows={5} {...register('whyEnroll')} />
              <FieldError message={errors.whyEnroll?.message} />
            </div>

            <div className="space-y-2">
              <Label>16. What do you hope to gain from this training? (tick all that apply)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Foundational counselling skills',
                  'Structured counselling framework',
                  'Ethical & professional grounding',
                  'Faith-sensitive counselling approach',
                  'Confidence to begin counselling',
                  'Improvement of existing practice',
                  'Certification / career development',
                  'Other',
                ].map((v) => (
                  <Option
                    key={v}
                    id={optionId('hope-to-gain', v)}
                    active={hopeToGain.includes(v)}
                    inputProps={{ type: 'checkbox', value: v, ...register('hopeToGain') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>

              {hopeToGain.includes('Other') ? (
                <div className="space-y-1.5">
                  <Label>Other:</Label>
                  <Input {...register('hopeToGainOther')} />
                  <FieldError message={errors.hopeToGainOther?.message} />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>17. Who do you intend to serve with this training? (tick all that apply)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Individuals', 'Couples', 'Families', 'Children', 'Youth', 'Community / Faith groups'].map((v) => (
                  <Option
                    key={v}
                    id={optionId('intend-to-serve', v)}
                    active={intendToServe.includes(v)}
                    inputProps={{ type: 'checkbox', value: v, ...register('intendToServe') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
            </div>
          </SectionCard>
          )}

          {currentStep === 4 && (
          <SectionCard
            title="SECTION E: PERSONAL READINESS & ETHICS (IMPORTANT)"
            description="Your answers help us provide appropriate support and ensure a healthy learning environment."
          >
            <div className="space-y-2">
              <Label>18. Are you currently dealing with unresolved personal issues that may affect your counselling work?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Yes', 'No', 'Prefer not to say'] as const).map((v) => (
                  <Option
                    key={v}
                    id={optionId('unresolved-issues', v)}
                    active={unresolvedIssues === v}
                    inputProps={{ type: 'radio', value: v, ...register('unresolvedIssues') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
              <p className="text-xs text-slate-500">(This does not disqualify you; it helps us provide appropriate support.)</p>
            </div>

            <div className="space-y-2">
              <Label>19. Are you open to supervision, feedback, and personal growth during the training? *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['Yes', 'No'] as const).map((v) => (
                  <Option
                    key={v}
                    id={optionId('open-to-supervision', v)}
                    active={openToSupervision === v}
                    inputProps={{ type: 'radio', value: v, ...register('openToSupervision') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>20. Do you agree to uphold confidentiality, ethical practice, and respect for clients' boundaries? *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['Yes', 'No'] as const).map((v) => (
                  <Option
                    key={v}
                    id={optionId('agree-ethics', v)}
                    active={agreeEthics === v}
                    inputProps={{ type: 'radio', value: v, ...register('agreeEthics') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
            </div>
          </SectionCard>
          )}

          {currentStep === 5 && (
          <SectionCard title="SECTION F: TRAINING LOGISTICS">
            <div className="space-y-2">
              <Label>21. Preferred mode of training *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Physical (In-person)', 'Online', 'Hybrid'] as const).map((v) => (
                  <Option
                    key={v}
                    id={optionId('training-mode', v)}
                    active={trainingMode === v}
                    inputProps={{ type: 'radio', value: v, ...register('trainingMode') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>22. Availability (tick all that apply) *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Weekdays', 'Weekends', 'Evenings only'].map((v) => (
                  <Option
                    key={v}
                    id={optionId('availability', v)}
                    active={availability.includes(v)}
                    inputProps={{ type: 'checkbox', value: v, ...register('availability') }}
                  >
                    {v}
                  </Option>
                ))}
              </div>
              <FieldError message={errors.availability?.message as any} />
            </div>

            <div className="space-y-1.5">
              <Label>23. How did you hear about the {PROGRAM_NAME}? *</Label>
              <Controller
                control={control}
                name="hearAbout"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HEAR_ABOUT_OPTIONS.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.hearAbout?.message} />
            </div>

            {hearAbout === 'Other' ? (
              <div className="space-y-1.5">
                <Label>Other:</Label>
                <Input {...register('hearAboutOther')} />
                <FieldError message={errors.hearAboutOther?.message} />
              </div>
            ) : null}
          </SectionCard>
          )}

          {currentStep === 6 && (
          <SectionCard title="SECTION G: COMMITMENT & DECLARATION">
            <p className="text-sm text-slate-700">
              24. I confirm that the information provided is accurate to the best of my knowledge. I understand that this training requires commitment, emotional maturity, and ethical responsibility.
            </p>

            <Option
              id="declaration-agree"
              active={!!declarationAgree}
              inputProps={{ type: 'checkbox', ...register('declarationAgree') }}
            >
              I agree *
            </Option>
            <FieldError message={errors.declarationAgree?.message} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>25. Full Name &amp; Signature (type your full name) *</Label>
                <Input {...register('typedSignature')} />
                <FieldError message={errors.typedSignature?.message} />
              </div>
              <div className="space-y-1.5">
                <Label>26. Date *</Label>
                <Input type="date" {...register('signatureDate')} />
                <FieldError message={errors.signatureDate?.message} />
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Option
                id="consent-privacy"
                active={!!consentPrivacy}
                inputProps={{ type: 'checkbox', ...register('consentPrivacy') }}
              >
                I consent to collection and processing of my personal data according to the Privacy Policy. *
              </Option>
              <FieldError message={errors.consentPrivacy?.message} />

              <Option
                id="consent-sensitive"
                active={!!consentSensitiveData}
                inputProps={{ type: 'checkbox', ...register('consentSensitiveData') }}
              >
                I consent to admissions review of sensitive readiness responses included in this application. *
              </Option>
              <FieldError message={errors.consentSensitiveData?.message} />

              <p className="text-xs text-slate-600">
                Read: <Link href="/privacy" className="font-medium text-teal-700 hover:underline">Privacy Policy</Link> and{' '}
                <Link href="/terms" className="font-medium text-teal-700 hover:underline">Terms of Service</Link>.
              </p>
            </div>
          </SectionCard>
          )}

          {currentStep === 7 && (
            <SectionCard title="REVIEW & SUBMIT" description="Confirm key details before final submission.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Full name</div>
                  <div className="mt-1 text-slate-900">{watchedValues.fullNameCertificate || '-'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Email</div>
                  <div className="mt-1 text-slate-900">{watchedValues.email || '-'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Phone</div>
                  <div className="mt-1 text-slate-900">{watchedValues.phoneWhatsApp || '-'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Training mode</div>
                  <div className="mt-1 text-slate-900">{watchedValues.trainingMode || '-'}</div>
                </div>
              </div>
              <div className="rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900">
                Final submission sets your application status to <span className="font-semibold">PENDING</span> for admissions review.
              </div>
            </SectionCard>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Button type="button" variant="outline" onClick={previousStep} disabled={currentStep === 1 || isSubmitting}>
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} className="bg-teal-700 text-white hover:bg-teal-800">
                Next step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 rounded-lg bg-teal-700 px-6 text-base font-semibold text-white shadow-[0_10px_20px_rgba(15,118,110,0.28)] transition-all hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-[0_12px_24px_rgba(15,118,110,0.34)] focus-visible:ring-2 focus-visible:ring-teal-700/40 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:bg-slate-400 disabled:shadow-none"
              >
                {isSubmitting ? 'Submitting...' : 'Submit application'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t bg-slate-50/60">
        <div className="text-xs text-slate-600">
          After submission: your application is saved as <span className="font-medium text-slate-800">PENDING</span> until an admin reviews it. Need to continue later? Use{' '}
          <Link href="/apply/resume" className="font-medium text-teal-700 hover:underline">Resume application</Link>.
        </div>
      </CardFooter>
    </Card>
  )
}
