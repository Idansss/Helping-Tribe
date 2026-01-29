'use client'

import { ReactNode } from 'react'

/**
 * Placeholder wrapper for learner-facing pages.
 * Rebuild the Learner portal and replace this with your new layout when ready.
 */
export function LearnerPortalPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {children}
    </div>
  )
}
