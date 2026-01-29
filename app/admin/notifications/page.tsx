'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Bell, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NotificationRule {
  id: string
  name: string
  event: string
  recipient: string
  enabled: boolean
}

const INITIAL_NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: 'n1',
    name: 'Course assignment',
    event: 'Course assignment',
    recipient: 'Related user',
    enabled: true,
  },
  {
    id: 'n2',
    name: 'Course completion',
    event: 'Course completion',
    recipient: 'Course instructors',
    enabled: true,
  },
  {
    id: 'n3',
    name: 'Certificate issued',
    event: 'Certificate issued',
    recipient: 'Account owner',
    enabled: true,
  },
]

const RULE_MESSAGES: Record<string, string> = {
  n1: 'Hi {{first_name}}, you have been assigned to the course "{{course_title}}". Please log in to Helping Tribe to get started.',
  n2: 'Great work, {{first_name}}! You have completed "{{course_title}}". Your mentor has been notified and any next steps will appear in your portal.',
  n3: 'A new certificate has been issued for {{learner_name}} – "{{course_title}}". You can download a copy from the admin Reports area.',
}

export default function AdminNotificationsPage() {
  const [search, setSearch] = useState('')
  const [rules, setRules] = useState<NotificationRule[]>(
    INITIAL_NOTIFICATION_RULES,
  )
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>('n1')

  const filteredRules = rules.filter(
    rule =>
      !search ||
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      rule.event.toLowerCase().includes(search.toLowerCase()),
  )

  const activeCount = rules.filter(r => r.enabled).length

  const toggleRuleEnabled = (id: string) => {
    setRules(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule,
      ),
    )
  }

  const selectedRule = rules.find(r => r.id === selectedRuleId) || rules[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Notifications
          </h1>
          <p className="text-xs text-slate-500">
            Configure emails and in-app alerts for assignments, completions and
            ethics-related events.
          </p>
        </div>
        <Badge className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
          {activeCount} active rules
        </Badge>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-xs w-full bg-slate-50 border rounded-md px-2 py-1.5">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search notification rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent h-6 px-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-3 bg-slate-50 rounded-lg p-1 w-fit">
            <TabsTrigger value="overview" className="text-xs px-3 py-1.5">
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs px-3 py-1.5">
              History
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs px-3 py-1.5">
              Pending
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs px-3 py-1.5">
              System notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--talent-primary)]" />
              <p className="text-slate-600">
                Common events like{' '}
                <span className="font-medium">
                  course assignment, completion, ethics warning
                </span>{' '}
                and{' '}
                <span className="font-medium">
                  practicum supervisor feedback
                </span>{' '}
                are configured as notification rules.
              </p>
            </div>

            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-3 py-2 text-left font-medium">Rule</th>
                    <th className="px-3 py-2 text-left font-medium">Event</th>
                    <th className="px-3 py-2 text-left font-medium">
                      Recipient
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map(rule => (
                    <tr
                      key={rule.id}
                      className="border-t border-slate-100 hover:bg-slate-50/80 cursor-pointer"
                      onClick={() => setSelectedRuleId(rule.id)}
                    >
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {rule.name}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{rule.event}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {rule.recipient}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={rule.enabled ? 'outline' : 'ghost'}
                          className={
                            rule.enabled
                              ? 'h-7 px-3 text-[11px] border-emerald-300 text-emerald-700 bg-emerald-50'
                              : 'h-7 px-3 text-[11px] border-slate-200 text-slate-500'
                          }
                          onClick={() => toggleRuleEnabled(rule.id)}
                        >
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRule && (
              <Card className="mt-3 p-3 space-y-1.5 bg-slate-50/80 border-dashed border-slate-200">
                <p className="text-[11px] font-semibold text-slate-900">
                  Preview: {selectedRule.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Sent to <span className="font-medium">{selectedRule.recipient}</span> when{' '}
                  <span className="font-medium">{selectedRule.event}</span> occurs.
                </p>
                <div className="mt-2 rounded-md bg-white border border-slate-200 px-3 py-2 text-[11px] text-slate-700">
                  {RULE_MESSAGES[selectedRule.id] ??
                    'This is where your email / in‑app message template will appear.'}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="text-xs text-slate-500">
            Notification history will show recent emails and in-app alerts sent
            to learners, coordinators and supervisors.
          </TabsContent>

          <TabsContent value="pending" className="text-xs text-slate-500">
            Pending notifications for queued reminders or batched weekly
            reports will appear here.
          </TabsContent>

          <TabsContent value="system" className="text-xs text-slate-500">
            System notifications include platform status messages and
            integration alerts.
          </TabsContent>
        </Tabs>

        <Card className="p-3 mt-2 space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-900">
            Events catalog
          </p>
          <p className="text-[11px] text-slate-600">
            Examples: assignment grading, assignment submission, certificate
            issued, course assignment, course completion, user addition/signup.
          </p>
        </Card>
      </Card>
    </div>
  )
}

