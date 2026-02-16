'use client'

import { useMemo, useState, type ReactNode } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils/cn'

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
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)

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
    }),
    []
  )

  const {
    control,
    register,
    handleSubmit,
    watch,
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

  async function onSubmit(values: ApplyFormValues) {
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to submit')

      setSubmitted(true)
      toast({
        title: 'Application submitted',
        description: 'Thanks. Wait for approval.',
      })
      reset(defaultValues)
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: e?.message || 'Please try again.',
      })
    }
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl md:text-2xl">Help Foundation Course - Counsellor Training Application</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Please complete this form accurately. All information provided will be treated with confidentiality and used strictly for training, placement, and follow-up purposes.
        </CardDescription>
        <div className="text-xs text-slate-500">Fields marked with * are required.</div>
        {submitted ? (
          <div className="mt-2 text-sm rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3">
            Thanks. Wait for approval.
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <SectionCard title="SECTION D: MOTIVATION & EXPECTATIONS">
            <div className="space-y-1.5">
              <Label>15. Why do you want to enroll in the Help Foundation Course? (Short paragraph) *</Label>
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
              <Label>23. How did you hear about the Help Foundation Course? *</Label>
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
          </SectionCard>

          <div className="pt-1">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t bg-slate-50/60">
        <div className="text-xs text-slate-600">
          After submission: your application is saved as <span className="font-medium text-slate-800">PENDING</span> until an admin approves it.
        </div>
      </CardFooter>
    </Card>
  )
}
