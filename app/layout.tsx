import React from "react"
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { LowDataProvider } from '@/lib/contexts/LowDataContext'
import { GroundingButton } from '@/components/lms/GroundingButton'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Help Foundation Course - Counsellor Training | The Helping Tribe',
  description: 'Admissions, onboarding, and learning platform for The Helping Tribe School of Counselling & Positive Psychology.',
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LowDataProvider>
          {children}
          <GroundingButton />
          <Toaster />
        </LowDataProvider>
        <Analytics />
      </body>
    </html>
  )
}

