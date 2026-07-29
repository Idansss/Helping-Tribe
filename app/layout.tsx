import React from "react"
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { DM_Sans, Literata } from 'next/font/google'
import './globals.css'
import { LowDataProvider } from '@/lib/contexts/LowDataContext'
import { Toaster } from '@/components/ui/toaster'
import { getSiteUrlObject } from '@/lib/site-url'
import { ThemeProvider } from '@/components/theme-provider'
import { JsonLd } from '@/components/json-ld'
import { SITE_CONFIG } from '@/lib/brand/site-config'
import { organizationJsonLd } from '@/lib/brand/structured-data'

// Body / UI face.
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Display face. This is a school, so the headline face is a reading typeface —
// Literata is designed for long-form text and carries an optical-size axis.
// Loaded as a variable font: `axes` cannot be combined with static weights, and
// the variable file covers the 400–600 range in one download.
const literata = Literata({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['opsz'],
  display: 'swap',
})

const SITE_TITLE = 'The Helping Tribe | School of Counselling & Positive Psychology'
const SITE_DESCRIPTION =
  'Premium counsellor training - apply, learn, and grow with The Helping Tribe School of Counselling & Positive Psychology.'

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_CONFIG.organisation.schoolName,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
  const enableVercelAnalytics = process.env.ENABLE_VERCEL_ANALYTICS === 'true'

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${literata.variable} font-sans antialiased`}>
        {/* Skip-to-content link for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[9999] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <LowDataProvider>
            {children}
            <Toaster />
          </LowDataProvider>
        </ThemeProvider>
        <JsonLd data={organizationJsonLd()} />
        {enableVercelAnalytics ? <Analytics /> : null}
      </body>
    </html>
  )
}

