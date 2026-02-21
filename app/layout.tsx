import React from "react"
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'
import { LowDataProvider } from '@/lib/contexts/LowDataContext'
import { GroundingButton } from '@/components/lms/GroundingButton'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'The Helping Tribe | School of Counselling & Positive Psychology',
  description: 'Premium counsellor training - apply, learn, and grow with The Helping Tribe School of Counselling & Positive Psychology.',
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
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        {/* Skip-to-content link for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4c1d95]"
        >
          Skip to main content
        </a>
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

