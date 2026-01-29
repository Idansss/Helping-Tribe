import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { LowDataProvider } from '@/lib/contexts/LowDataContext'
import { GroundingButton } from '@/components/lms/GroundingButton'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'HELP Foundations Training Platform',
  description: 'Helping Tribe Learning Management System',
  icons: {
    icon: '/icon.svg',
  },
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

