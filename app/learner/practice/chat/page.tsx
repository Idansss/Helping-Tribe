'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AIClientChat } from '@/components/lms/AIClientChat'

export default function LearnerPracticeChatPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Practice Client</h1>
        <p className="text-slate-600 mt-1">
          Practice your helping skills in a safe, simulated conversation. Choose a scenario and use active listening, empathy, and ethical boundaries—just like in the field.
        </p>
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Simulated client conversation</CardTitle>
          <CardDescription>
            Chika (withdrawn student), Amina (grief), and Tunde (disability stigma) are available. Start a conversation and practice your skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIClientChat />
        </CardContent>
      </Card>
    </div>
  )
}
