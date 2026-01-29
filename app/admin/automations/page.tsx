'use client'

import { useEffect, useState } from 'react'
import { Workflow } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/admin/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Rule {
  id: string
  name: string
  trigger: string
  action: string
}

const INITIAL_RULES: Rule[] = [
  {
    id: 'r1',
    name: 'Enroll new learners into Week 1',
    trigger: 'User added / signup',
    action: 'Assign course',
  },
  {
    id: 'r2',
    name: 'Remind about ethics completion',
    trigger: 'Course not completed by due date',
    action: 'Send email to learner',
  },
]

const RULES_STORAGE_KEY = 'ht-automations'

export default function AdminAutomationsPage() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES)
  const [showForm, setShowForm] = useState(false)
  const [ruleName, setRuleName] = useState('')
  const [ruleTrigger, setRuleTrigger] = useState('User added / signup')
  const [ruleAction, setRuleAction] = useState('Assign course')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTrigger, setEditTrigger] = useState('')
  const [editAction, setEditAction] = useState('')

  // Load saved rules on first mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(RULES_STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as Rule[]
      if (Array.isArray(stored)) {
        setRules(stored)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Persist whenever rules change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules))
    } catch {
      // ignore storage errors
    }
  }, [rules])

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleName.trim()) return

    const newRule: Rule = {
      id: `r-${Date.now()}`,
      name: ruleName.trim(),
      trigger: ruleTrigger.trim() || 'User added / signup',
      action: ruleAction.trim() || 'Assign course',
    }

    setRules(prev => [...prev, newRule])
    setRuleName('')
    setRuleTrigger('User added / signup')
    setRuleAction('Assign course')
    setShowForm(false)
  }

  const handleStartEdit = (rule: Rule) => {
    setEditingId(rule.id)
    setEditName(rule.name)
    setEditTrigger(rule.trigger)
    setEditAction(rule.action)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditTrigger('')
    setEditAction('')
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    setRules(prev =>
      prev.map(r =>
        r.id === editingId
          ? {
              ...r,
              name: editName.trim() || r.name,
              trigger: editTrigger.trim() || r.trigger,
              action: editAction.trim() || r.action,
            }
          : r,
      ),
    )
    handleCancelEdit()
  }

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
    if (editingId === id) {
      handleCancelEdit()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Automations</h1>
          <p className="text-xs text-slate-500">
            Set up rule-based workflows for enrollments, reminders, and ethics
            escalation.
          </p>
        </div>
        <Button
          className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-xs text-white"
          onClick={() => setShowForm(true)}
        >
          Add automation
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        {rules.length === 0 ? (
          <EmptyState
            title="No automations configured"
            description="For example: auto-enroll new learners into Week 1, remind at-risk learners about ethics completion, or notify supervisors when practicum journals are overdue."
            actionLabel="Create first automation"
            icon={<Workflow className="h-4 w-4" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="px-3 py-2 text-left font-medium">Rule name</th>
                  <th className="px-3 py-2 text-left font-medium">Trigger</th>
                  <th className="px-3 py-2 text-left font-medium">Action</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr
                    key={rule.id}
                    className="border-b last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-3 py-2 align-middle">
                      {editingId === rule.id ? (
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        rule.name
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-slate-600">
                      {editingId === rule.id ? (
                        <Input
                          value={editTrigger}
                          onChange={e => setEditTrigger(e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        rule.trigger
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-slate-600">
                      {editingId === rule.id ? (
                        <Input
                          value={editAction}
                          onChange={e => setEditAction(e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        rule.action
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <Badge
                        variant="outline"
                        className="border-emerald-300 text-emerald-700 text-[11px]"
                      >
                        Enabled
                      </Badge>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {editingId === rule.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 px-3 text-[11px] bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-3 text-[11px] text-slate-600"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-3 text-[11px] text-slate-600"
                            onClick={() => handleStartEdit(rule)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-3 text-[11px] text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showForm && (
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            New automation rule
          </h2>
          <form onSubmit={handleAddRule} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="rule-name" className="text-xs text-slate-700">
                Rule name
              </Label>
              <Input
                id="rule-name"
                value={ruleName}
                onChange={e => setRuleName(e.target.value)}
                placeholder="e.g. Nudge learners who miss Week 2"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rule-trigger" className="text-xs text-slate-700">
                Trigger
              </Label>
              <Input
                id="rule-trigger"
                value={ruleTrigger}
                onChange={e => setRuleTrigger(e.target.value)}
                placeholder="e.g. Course not completed by due date"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rule-action" className="text-xs text-slate-700">
                Action
              </Label>
              <Input
                id="rule-action"
                value={ruleAction}
                onChange={e => setRuleAction(e.target.value)}
                placeholder="e.g. Send SMS reminder to learner"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
              >
                Save automation
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-slate-600"
                onClick={() => {
                  setShowForm(false)
                  setRuleName('')
                  setRuleTrigger('User added / signup')
                  setRuleAction('Assign course')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Example triggers & actions
        </h2>
        <p className="text-xs text-slate-500">
          The full rule builder will let you choose an event (trigger) and then
          one or more actions to perform automatically.
        </p>
        <ul className="space-y-1.5 text-xs text-slate-700">
          <li>On user signup → assign onboarding course.</li>
          <li>On course completion → issue certificate &amp; notify mentor.</li>
          <li>On ethics quiz failed twice → notify admin and flag learner.</li>
        </ul>
      </Card>
    </div>
  )
}

