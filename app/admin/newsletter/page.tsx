'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Plus, Edit2, Trash2, Send, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface NewsletterIssue {
  id: string
  subject: string
  content: string
  sentAt: string | null
  createdAt: string
}

interface NewsletterSubscriber {
  id: string
  email: string
  subscribedAt: string
}

const NEWSLETTER_STORAGE_KEY = 'ht-newsletter-issues'
const SUBSCRIBERS_STORAGE_KEY = 'ht-newsletter-subscribers'

const INITIAL_ISSUES: NewsletterIssue[] = [
  {
    id: 'n1',
    subject: 'Welcome to Helping Tribe Newsletter',
    content: 'Welcome to our monthly newsletter! Stay updated with the latest counseling training resources, community updates, and professional development opportunities.',
    sentAt: '2025-01-15T10:00:00Z',
    createdAt: '2025-01-15T10:00:00Z',
  },
]

export default function AdminNewsletterPage() {
  const [issues, setIssues] = useState<NewsletterIssue[]>(INITIAL_ISSUES)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Load saved data on mount
  useEffect(() => {
    try {
      const issuesRaw = localStorage.getItem(NEWSLETTER_STORAGE_KEY)
      if (issuesRaw) {
        const parsed = JSON.parse(issuesRaw) as NewsletterIssue[]
        setIssues(parsed)
      }
    } catch {
      // ignore
    }

    try {
      const subscribersRaw = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY)
      if (subscribersRaw) {
        const parsed = JSON.parse(subscribersRaw) as NewsletterSubscriber[]
        setSubscribers(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist issues whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(issues))
    } catch {
      // ignore
    }
  }, [issues])

  // Persist subscribers whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers))
    } catch {
      // ignore
    }
  }, [subscribers])

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !content.trim()) return

    const newIssue: NewsletterIssue = {
      id: `n${Date.now()}`,
      subject: subject.trim(),
      content: content.trim(),
      sentAt: null,
      createdAt: new Date().toISOString(),
    }

    setIssues([newIssue, ...issues])
    setSubject('')
    setContent('')
    setShowForm(false)
    setSaveMessage('Newsletter issue created successfully.')
    setTimeout(() => setSaveMessage(null), 2500)
  }

  const handleStartEdit = (issue: NewsletterIssue) => {
    setEditingId(issue.id)
    setSubject(issue.subject)
    setContent(issue.content)
    setShowForm(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !content.trim() || !editingId) return

    setIssues(
      issues.map((issue) =>
        issue.id === editingId
          ? { ...issue, subject: subject.trim(), content: content.trim() }
          : issue
      )
    )

    setEditingId(null)
    setSubject('')
    setContent('')
    setShowForm(false)
    setSaveMessage('Newsletter issue updated successfully.')
    setTimeout(() => setSaveMessage(null), 2500)
  }

  const handleCancel = () => {
    setEditingId(null)
    setSubject('')
    setContent('')
    setShowForm(false)
  }

  const handleDeleteIssue = (id: string) => setDeletingId(id)

  const confirmDeleteIssue = () => {
    if (!deletingId) return
    setIssues(issues.filter((issue) => issue.id !== deletingId))
    setSaveMessage('Newsletter issue deleted.')
    setTimeout(() => setSaveMessage(null), 2500)
    setDeletingId(null)
  }

  const handleSendIssue = (id: string) => setSendingId(id)

  const confirmSendIssue = () => {
    if (!sendingId) return
    setIssues(
      issues.map((issue) =>
        issue.id === sendingId ? { ...issue, sentAt: new Date().toISOString() } : issue
      )
    )
    setSaveMessage('Newsletter sent successfully.')
    setTimeout(() => setSaveMessage(null), 2500)
    setSendingId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[var(--talent-primary)]" />
            Newsletter Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, and send newsletter issues to your subscribers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className="text-xs text-emerald-600">{saveMessage}</span>
          )}
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Newsletter Issue
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Issues</p>
              <p className="text-2xl font-semibold text-slate-900">{issues.length}</p>
            </div>
            <Mail className="h-8 w-8 text-[var(--talent-primary)] opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Sent Issues</p>
              <p className="text-2xl font-semibold text-slate-900">
                {issues.filter((i) => i.sentAt).length}
              </p>
            </div>
            <Send className="h-8 w-8 text-emerald-600 opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Subscribers</p>
              <p className="text-2xl font-semibold text-slate-900">
                {subscribers.length}
              </p>
            </div>
            <Mail className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Newsletter Issue' : 'Create New Newsletter Issue'}
          </h2>
          <form onSubmit={editingId ? handleSaveEdit : handleCreateIssue} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="subject" className="text-xs font-medium text-slate-700">
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Newsletter subject line"
                className="text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="content" className="text-xs font-medium text-slate-700">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your newsletter content here..."
                className="text-sm min-h-[200px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                className="text-xs text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white text-xs"
              >
                {editingId ? 'Save Changes' : 'Create Issue'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Newsletter Issues List */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Newsletter Issues</h2>
        {issues.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No newsletter issues yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="border border-slate-200 rounded-md p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {issue.subject}
                      </h3>
                      {issue.sentAt ? (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                          Sent
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 text-[10px]">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{issue.content}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(issue.createdAt)}
                      </span>
                      {issue.sentAt && (
                        <span className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          Sent: {formatDate(issue.sentAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!issue.sentAt && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(issue)}
                          className="text-xs text-slate-600"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendIssue(issue.id)}
                          className="text-xs text-emerald-600"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteIssue(issue.id)}
                      className="text-xs text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Subscribers List */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Subscribers</h2>
        {subscribers.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No subscribers yet. Subscribers will appear here when they sign up via the public form.
          </div>
        ) : (
          <div className="space-y-2">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between border border-slate-200 rounded-md p-3 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{subscriber.email}</p>
                  <p className="text-[11px] text-slate-500">
                    Subscribed: {formatDate(subscriber.subscribedAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Remove this subscriber?')) {
                      setSubscribers(
                        subscribers.filter((s) => s.id !== subscriber.id)
                      )
                    }
                  }}
                  className="text-xs text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this newsletter issue?</DialogTitle>
            <DialogDescription>This issue will be permanently removed and cannot be recovered.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteIssue}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sendingId} onOpenChange={(open) => { if (!open) setSendingId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Send this newsletter?</DialogTitle>
            <DialogDescription>This issue will be sent to all active subscribers. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSendingId(null)}>Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={confirmSendIssue}>Send Now</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
