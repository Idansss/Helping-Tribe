export type Facilitator = {
  /** Full name as it should appear publicly. */
  name: string
  /** Post-nominals or qualifications, e.g. "MSc Counselling Psychology". */
  credentials: string
  /** Role on the programme, e.g. "Lead facilitator". */
  role: string
  bio: string
  /** Path under /public, e.g. "/faculty/ada-obi.jpg". */
  photo: string
}

/**
 * Public facilitator profiles.
 *
 * Intentionally empty. The names and biographies previously in the repository
 * had no approval evidence, and publishing an unverified professional
 * credential for a counselling school is a real-world harm, not a content gap.
 *
 * While this array is empty the facilitation section renders only its three
 * supporting points and hides the profile grid entirely — it never announces
 * that people are missing. Populate it once the client confirms each profile.
 */
export const FACULTY: readonly Facilitator[] = []
