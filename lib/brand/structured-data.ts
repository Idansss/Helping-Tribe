import { FAQS } from '@/lib/brand/faq'
import { PROGRAM_FULL_NAME } from '@/lib/brand/program'
import { CURRICULUM_MODULES, SITE_CONFIG } from '@/lib/brand/site-config'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

/** Stable node id so other graph nodes can reference the school by @id. */
export function organizationId(): string {
  return `${getSiteUrl()}/#organization`
}

/**
 * The school itself. `EducationalOrganization` is a subtype of `Organization`,
 * so declaring both on one node is the correct way to satisfy consumers that
 * look for either type without emitting two competing entities.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'Organization'],
    '@id': organizationId(),
    name: SITE_CONFIG.organisation.schoolName,
    alternateName: [SITE_CONFIG.organisation.name, SITE_CONFIG.organisation.shortName],
    description:
      'A guided learning community for people building ethical, practical helping skills in Nigerian and African contexts.',
    url: getSiteUrl(),
    logo: absoluteUrl('/logo.png'),
    image: absoluteUrl('/logo.png'),
    email: SITE_CONFIG.contact.email.value,
    telephone: SITE_CONFIG.contact.phone.value,
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
      identifier: 'NG',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'admissions',
      email: SITE_CONFIG.contact.email.value,
      telephone: SITE_CONFIG.contact.phone.value,
      areaServed: 'NG',
      availableLanguage: 'en',
    },
  }
}

/**
 * The nine-week programme.
 *
 * Deliberately omits `offers`: the fee in SITE_CONFIG is marked
 * `client-confirmation-required`, and publishing an unconfirmed price as
 * structured data would put a wrong number into search results.
 */
export function courseJsonLd(): Record<string, unknown> {
  const weeks = SITE_CONFIG.programme.durationWeeks.value

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${getSiteUrl()}/#course`,
    name: PROGRAM_FULL_NAME,
    description: `A ${weeks}-week guided programme in counselling and positive psychology, moving from ethical foundations to supported practice and reflection.`,
    url: getSiteUrl(),
    inLanguage: 'en',
    provider: { '@id': organizationId() },
    educationalCredentialAwarded: 'Certificate of completion',
    timeRequired: `P${weeks}W`,
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: `P${weeks}W`,
        inLanguage: 'en',
      },
    ],
    syllabusSections: CURRICULUM_MODULES.map((module) => ({
      '@type': 'Syllabus',
      position: module.week,
      name: module.title,
      description: module.description,
    })),
  }
}

/** Built from the same array the visible FAQ renders from. */
export function faqJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${getSiteUrl()}/#faq`,
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
