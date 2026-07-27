import React from "react"
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { DM_Sans, Newsreader } from 'next/font/google'
import './globals.css'
import { LowDataProvider } from '@/lib/contexts/LowDataContext'
import { Toaster } from '@/components/ui/toaster'
import { getSiteUrlObject } from '@/lib/site-url'
import { ThemeProvider } from '@/components/theme-provider'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
})
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: 'The Helping Tribe | School of Counselling & Positive Psychology',
  description: 'Premium counsellor training - apply, learn, and grow with The Helping Tribe School of Counselling & Positive Psychology.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
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
      <body className={`${dmSans.variable} ${newsreader.variable} font-sans antialiased`}>
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
        {enableVercelAnalytics ? <Analytics /> : null}
      </body>
    </html>
  )
}

