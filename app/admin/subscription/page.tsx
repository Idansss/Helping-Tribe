'use client'

import { Card } from '@/components/ui/card'

// Subscription plans removed - billing handled externally

export default function AdminSubscriptionPage() {
  return (
    <div className="space-y-4">
      <Card className="p-4 text-sm text-slate-700">
        Subscription and billing are handled outside this demo.
        If you need to manage your real plan, please use your production billing system.
      </Card>
    </div>
  )
}
