import { z } from 'zod'

export const APPLICATION_HONEYPOT_FIELD = 'companyWebsite'

const ApplicationObjectSchema = z.object({
    fullNameCertificate: z.string().min(2, 'Full name is required'),
    gender: z.enum(['Male', 'Female', 'Prefer not to say']),
    dob: z.string().min(4, 'Date of birth is required'),
    phoneWhatsApp: z.string().min(5, 'WhatsApp number is required'),
    email: z.string().email('Valid email required'),
    cityState: z.string().min(2, 'City & State is required'),
    nationality: z.string().min(2, 'Nationality is required'),

    highestQualification: z.string().min(1, 'Highest qualification is required'),
    highestQualificationOther: z.string().optional(),
    fieldOfStudy: z.string().min(1, 'Field of study is required'),
    currentOccupation: z.string().min(1, 'Current occupation is required'),
    professionalBackground: z.array(z.string()).min(1, 'Select at least one option'),
    professionalBackgroundOther: z.string().optional(),

    experienceLevel: z.string().min(1, 'Experience level is required'),
    formalTraining: z.enum(['Yes', 'No']),
    formalTrainingInstitution: z.string().optional(),
    formalTrainingDuration: z.string().optional(),
    areas: z.array(z.string()).default([]),
    areasOther: z.string().optional(),

    whyEnroll: z.string().min(10, 'Please provide more detail'),
    hopeToGain: z.array(z.string()).default([]),
    hopeToGainOther: z.string().optional(),
    intendToServe: z.array(z.string()).default([]),

    unresolvedIssues: z.enum(['Yes', 'No', 'Prefer not to say']),
    openToSupervision: z.enum(['Yes', 'No']),
    agreeEthics: z.enum(['Yes', 'No']),

    trainingMode: z.enum(['Physical (In-person)', 'Online', 'Hybrid']),
    availability: z.array(z.string()).min(1, 'Select at least one option'),
    hearAbout: z.string().min(1, 'Select one option'),
    hearAboutOther: z.string().optional(),

    declarationAgree: z.boolean().refine((value) => value === true, 'You must agree'),
    typedSignature: z.string().min(2, 'Typed signature is required'),
    signatureDate: z.string().min(4, 'Date is required'),

    consentPrivacy: z.boolean().refine((value) => value === true, 'Privacy consent is required'),
    consentSensitiveData: z.boolean().refine((value) => value === true, 'Sensitive data consent is required'),
    [APPLICATION_HONEYPOT_FIELD]: z.string().optional(),
  })

export const ApplicationSchema = ApplicationObjectSchema.superRefine((values, ctx) => {
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

export type ApplicationValues = z.infer<typeof ApplicationSchema>

export const ApplicationDraftSchema = ApplicationObjectSchema.partial().passthrough()
export type ApplicationDraftValues = z.infer<typeof ApplicationDraftSchema>

export const applicationDefaultValues: ApplicationValues = {
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
}
