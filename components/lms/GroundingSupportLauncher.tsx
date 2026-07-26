'use client'

import dynamic from 'next/dynamic'

const GroundingButton = dynamic(
  () => import('./GroundingButton').then((module) => module.GroundingButton),
  { ssr: false }
)

export function GroundingSupportLauncher() {
  return <GroundingButton />
}
