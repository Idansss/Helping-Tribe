'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Plus, Edit2, Trash2, Send, Calendar, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface NewsletterIssue {
  id: string
  subject: string
  content: string
  sent_at: string | null
  created_at: string
}

interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: string
}

export default function AdminNewsletterPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [issues, setIssues] = useState<NewsletterIssue[]>([])
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [{ data: issuesData }, { data: subsData }] = await Promise.all([
        supabase.from('newsletter_issues').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }),
      ])
      setIssues((issuesData ?? []) as NewsletterIssue[])
      setSubscribers((subsData ?? []) as NewsletterSubscriber[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !content.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase.from('newsletter_issues').insert({
        subject: subject.trim(),
        content: content.trim(),
      })
      if (error) throw error
      setSubject('')
      setContent('')
      setShowForm(false)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to create issue.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleStartEdit = (issue: NewsletterIssue) => {
    setEditingId(issue.id)
    setSubject(issue.subject)
    setContent(issue.content)
    setShowForm(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !content.trim() || !editingId) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('newsletter_issues')
        .update({ subject: subject.trim(), content: content.trim(), updated_at: new Date().toISOString() })
        .eq('id', editingId)
      if (error) throw error
      setEditingId(null)
      setSubject('')
      setContent('')
      setShowForm(false)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to update issue.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setSubject('')
    setContent('')
    setShowForm(false)
  }

  const confirmDeleteIssue = async () => {
    if (!deletingId) return
    try {
      const { error } = await supabase.from('newsletter_issues').delete().eq('id', deletingId)
      if (error) throw error
      setDeletingId(null)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete issue.', variant: 'destructive' })
    }
  }

  const confirmSendIssue = async () => {
    if (!sendingId) return
    try {
      const { error } = await supabase
        .from('newsletter_issues')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', sendingId)
      if (error) throw error
      setSendingId(null)
      load()
      toast({ title: 'Newsletter marked as sent.' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to mark as sent.', variant: 'destructive' })
    }
  }

  const handleRemoveSubscriber = async (id: string) => {
    try {
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
      if (error) throw error
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to remove subscriber.', variant: 'destructive' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
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
                {issues.filter((i) => i.sent_at).length}
              </p>
            </div>
            <Send className="h-8 w-8 text-emerald-600 opacity-50" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Subscribers</p>
              <p className="text-2xl font-semibold text-slate-900">{subscribers.length}</p>
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
              <Label htmlFor="subject" className="text-xs font-medium text-slate-700">Subject</Label>
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
              <Label htmlFor="content" className="text-xs font-medium text-slate-700">Content</Label>
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
              <Button type="button" variant="ghost" onClick={handleCancel} className="text-xs text-slate-600">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white text-xs"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Save Changes' : 'Create Issue'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Newsletter Issues List */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Newsletter Issues</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No newsletter issues yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.id} className="border border-slate-200 rounded-md p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{issue.subject}</h3>
                      {issue.sent_at ? (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Sent</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 text-[10px]">Draft</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{issue.content}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(issue.created_at)}
                      </span>
                      {issue.sent_at && (
                        <span className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          Sent: {formatDate(issue.sent_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!issue.sent_at && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleStartEdit(issue)} className="text-xs text-slate-600">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSendingId(issue.id)} className="text-xs text-emerald-600">
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setDeletingId(issue.id)} className="text-xs text-red-600">
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
              <div key={subscriber.id} className="flex items-center justify-between border border-slate-200 rounded-md p-3 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">{subscriber.email}</p>
                  <p className="text-[11px] text-slate-500">Subscribed: {formatDate(subscriber.subscribed_at)}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveSubscriber(subscriber.id)}
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
            <DialogDescription>This issue will be marked as sent. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSendingId(null)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={confirmSendIssue}>Send Now</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
