'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LearnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Learner route error:', error)
  }, [error])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <CardTitle className="text-lg">This page couldn’t load</CardTitle>
              <CardDescription>
                Something went wrong loading this page. Try again or go back to your dashboard.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-xs bg-slate-100 rounded-lg p-3 overflow-auto max-h-28 text-slate-700">
              {error.message}
            </pre>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={reset} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              Try again
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/learner/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/learner/catalog">Catalog</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
