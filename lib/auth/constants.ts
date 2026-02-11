export const STUDENT_EMAIL_DOMAIN = 'students.helpingtribe.local'

export function matricToAuthEmail(matricNumber: string) {
  const normalized = matricNumber.trim().toUpperCase()
  return `${normalized}@${STUDENT_EMAIL_DOMAIN}`
}

