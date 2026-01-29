'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CalendarWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          View your weekly schedule and upcoming events
        </p>
        <Button asChild className="w-full">
          <Link href="/calendar">
            View Full Calendar
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
