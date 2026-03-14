'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { FolderOpen, Plus, Pencil, Trash2, ArrowLeft, Loader2, FileText, Upload, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type ResourceRow = {
  id: string
  category: string
  title: string
  description: string | null
  contact_info: { phone?: string; email?: string; address?: string } | null
  website_url: string | null
  location: string | null
  tags: string[] | null
  display_order: number | null
  created_at: string
}

type ResourceDoc = {
  id: string
  week_number: number
  title: string
  description: string | null
  file_url: string | null
  file_name: string | null
}

const CATEGORIES = [
  { value: 'emergency', label: 'Emergency Services' },
  { value: 'mental_health', label: 'Mental Health Hotlines' },
  { value: 'hospital', label: 'Hospitals & Psychiatric' },
  { value: 'ngo', label: 'NGOs & Community Support' },
  { value: 'faith_based', label: 'Faith & Community-Based' },
  { value: 'international', label: 'International' },
] as const

const WEEKS = Array.from({ length: 9 }, (_, i) => i + 1)
const DOC_BUCKET = 'final-exams'

export default function AdminResourcesPage() {
  const supabase = createClient()
  const { toast } = useToast()

  // ── Resource Directory state ──────────────────────────────────────────────
  const [list, setList] = useState<ResourceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formCategory, setFormCategory] = useState<string>('mental_health')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formWebsite, setFormWebsite] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formOrder, setFormOrder] = useState<string>('')

  // ── Weekly Documents state ────────────────────────────────────────────────
  const [docs, setDocs] = useState<ResourceDoc[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [docDialogOpen, setDocDialogOpen] = useState(false)
  const [docEditingWeek, setDocEditingWeek] = useState<number | null>(null)
  const [docExistingId, setDocExistingId] = useState<string | null>(null)
  const [docTitle, setDocTitle] = useState('')
  const [docDescription, setDocDescription] = useState('')
  const [docWeek, setDocWeek] = useState<string>('1')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docExistingUrl, setDocExistingUrl] = useState<string | null>(null)
  const [docExistingName, setDocExistingName] = useState<string | null>(null)
  const [docSaving, setDocSaving] = useState(false)
  const [docDeletingId, setDocDeletingId] = useState<string | null>(null)

  // ── Load Resource Directory ───────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('title', { ascending: true })
      if (error) throw error
      setList((data ?? []) as ResourceRow[])
    } catch (e) {
      console.error(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  // ── Load Weekly Documents ─────────────────────────────────────────────────
  const loadDocs = async () => {
    setDocsLoading(true)
    try {
      const { data, error } = await supabase
        .from('resource_documents')
        .select('*')
        .order('week_number', { ascending: true })
      if (error) throw error
      setDocs((data ?? []) as ResourceDoc[])
    } catch (e) {
      console.error(e)
      setDocs([])
    } finally {
      setDocsLoading(false)
    }
  }

  useEffect(() => {
    load()
    loadDocs()
  }, [])

  // ── Resource Directory handlers ───────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null)
    setFormCategory('mental_health')
    setFormTitle('')
    setFormDescription('')
    setFormPhone('')
    setFormEmail('')
    setFormAddress('')
    setFormWebsite('')
    setFormLocation('')
    setFormTags('')
    setFormOrder('')
    setDialogOpen(true)
  }

  const openEdit = (row: ResourceRow) => {
    setEditingId(row.id)
    setFormCategory(row.category)
    setFormTitle(row.title)
    setFormDescription(row.description || '')
    setFormPhone(row.contact_info?.phone || '')
    setFormEmail(row.contact_info?.email || '')
    setFormAddress(row.contact_info?.address || '')
    setFormWebsite(row.website_url || '')
    setFormLocation(row.location || '')
    setFormTags((row.tags ?? []).join(', '))
    setFormOrder(row.display_order != null ? String(row.display_order) : '')
    setDialogOpen(true)
  }

  const save = async () => {
    if (!formTitle.trim()) return
    setSaving(true)
    try {
      const contact_info: { phone?: string; email?: string; address?: string } = {}
      if (formPhone.trim()) contact_info.phone = formPhone.trim()
      if (formEmail.trim()) contact_info.email = formEmail.trim()
      if (formAddress.trim()) contact_info.address = formAddress.trim()

      const payload = {
        category: formCategory,
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        contact_info: Object.keys(contact_info).length ? contact_info : {},
        website_url: formWebsite.trim() || null,
        location: formLocation.trim() || null,
        tags: formTags.split(',').map((s) => s.trim()).filter(Boolean) || null,
        display_order: formOrder.trim() ? parseInt(formOrder, 10) : null,
      }
      if (editingId) {
        const { error } = await supabase.from('resources').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('resources').insert(payload)
        if (error) throw error
      }
      setDialogOpen(false)
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save resource.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const remove = (id: string) => setDeletingId(id)

  const confirmDelete = async () => {
    if (!deletingId) return
    try {
      const { error } = await supabase.from('resources').delete().eq('id', deletingId)
      if (error) throw error
      load()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete resource.', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  // ── Weekly Documents handlers ─────────────────────────────────────────────
  const openDocUpload = (weekNumber?: number) => {
    const existingDoc = weekNumber ? docs.find((d) => d.week_number === weekNumber) : null
    setDocEditingWeek(weekNumber ?? null)
    setDocExistingId(existingDoc?.id ?? null)
    setDocTitle(existingDoc?.title ?? '')
    setDocDescription(existingDoc?.description ?? '')
    setDocWeek(weekNumber ? String(weekNumber) : '1')
    setDocFile(null)
    setDocExistingUrl(existingDoc?.file_url ?? null)
    setDocExistingName(existingDoc?.file_name ?? null)
    setDocDialogOpen(true)
  }

  const saveDoc = async () => {
    if (!docTitle.trim()) {
      toast({ title: 'Title is required.', variant: 'destructive' })
      return
    }
    setDocSaving(true)
    let fileUrl: string | null = docExistingUrl
    let fileName: string | null = docExistingName
    let fileUploadFailed = false

    try {
      if (docFile) {
        const ext = (docFile.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '')
        const storagePath = `resource-docs/week-${docWeek}/${Date.now()}.${ext || 'pdf'}`
        const { error: uploadError } = await supabase.storage
          .from(DOC_BUCKET)
          .upload(storagePath, docFile, {
            upsert: true,
            contentType: docFile.type || 'application/pdf',
          })
        if (uploadError) {
          fileUploadFailed = true
          console.warn('Document upload failed:', uploadError)
        } else {
          const { data: urlData } = supabase.storage.from(DOC_BUCKET).getPublicUrl(storagePath)
          fileUrl = urlData.publicUrl
          fileName = docFile.name
        }
      }

      const payload = {
        week_number: parseInt(docWeek, 10),
        title: docTitle.trim(),
        description: docDescription.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
        updated_at: new Date().toISOString(),
      }

      if (docExistingId) {
        const { error } = await supabase.from('resource_documents').update(payload).eq('id', docExistingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('resource_documents').insert(payload)
        if (error) throw error
      }

      setDocDialogOpen(false)
      loadDocs()

      if (fileUploadFailed) {
        toast({
          title: 'Saved, but file upload failed',
          description: 'Make sure the "final-exams" storage bucket exists in Supabase and is public.',
          variant: 'destructive',
        })
      } else {
        toast({ title: docExistingId ? 'Document updated' : 'Document uploaded', description: 'Learners and mentors can now access it.' })
      }
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to save document.', variant: 'destructive' })
    } finally {
      setDocSaving(false)
    }
  }

  const confirmDeleteDoc = async () => {
    if (!docDeletingId) return
    try {
      const { error } = await supabase.from('resource_documents').delete().eq('id', docDeletingId)
      if (error) throw error
      loadDocs()
      toast({ title: 'Document removed.' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to delete document.', variant: 'destructive' })
    } finally {
      setDocDeletingId(null)
    }
  }

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* ── Resource Directory ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resource Directory</h1>
            <p className="text-sm text-slate-600 mt-1">
              Add and edit referral contacts (emergency, mental health, hospitals, NGOs). Learners and mentors see them on their Resources page.
            </p>
          </div>
          <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add resource
          </Button>
        </div>

        <Card className="p-4 border-slate-200">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-slate-500 py-6">
              No resources yet. Add one to show it in the learner and mentor Resource Directory.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-2 pr-4 font-medium">Title</th>
                    <th className="pb-2 pr-4 font-medium">Category</th>
                    <th className="pb-2 pr-4 font-medium">Location</th>
                    <th className="pb-2 pr-4 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-900">{row.title}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs capitalize">{row.category.replace('_', ' ')}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{row.location || '—'}</td>
                      <td className="py-3 pr-4 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)} aria-label="Edit">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => remove(row.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Weekly Documents ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Weekly Course Documents</h2>
            <p className="text-sm text-slate-600 mt-1">
              Upload one PDF document per week (Weeks 1–9). Learners and mentors can open or download them from their Resources page.
            </p>
          </div>
          <Button onClick={() => openDocUpload()} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Upload document
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {docsLoading ? (
            <Card className="p-6 lg:col-span-2 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </Card>
          ) : (
            WEEKS.map((wk) => {
              const doc = docs.find((d) => d.week_number === wk)
              return (
                <Card key={wk} className="p-4 border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${doc ? 'bg-teal-100' : 'bg-slate-100'}`}>
                      {doc ? (
                        <FileText className="h-4 w-4 text-teal-700" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Week {wk}</p>
                      {doc ? (
                        <>
                          <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                          {doc.description && <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>}
                          {doc.file_name && <p className="text-xs text-slate-400 mt-0.5">{doc.file_name}</p>}
                        </>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No document uploaded</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-teal-700 hover:text-teal-800"
                      onClick={() => openDocUpload(wk)}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      {doc ? 'Replace' : 'Upload'}
                    </Button>
                    {doc && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={() => setDocDeletingId(doc.id)}
                        aria-label="Delete document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* ── Resource Directory Dialog ────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit resource' : 'New resource'}</DialogTitle>
            <DialogDescription>
              Referral contact for the Resource Directory. Learners and mentors will see this on their Resources page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Mentally Aware Nigeria Initiative (MANI)" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Short description…" rows={2} className="mt-1" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Phone (optional)</Label>
                <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="e.g. 0809 111 6264" className="mt-1" />
              </div>
              <div>
                <Label>Email (optional)</Label>
                <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="contact@example.org" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Address (optional)</Label>
              <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Physical address" className="mt-1" />
            </div>
            <div>
              <Label>Website URL (optional)</Label>
              <Input value={formWebsite} onChange={(e) => setFormWebsite(e.target.value)} placeholder="https://…" className="mt-1" />
            </div>
            <div>
              <Label>Location (optional)</Label>
              <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="e.g. Nigeria, Lagos" className="mt-1" />
            </div>
            <div>
              <Label>Tags (comma-separated, optional)</Label>
              <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="mental health, hotline, peer support" className="mt-1" />
            </div>
            <div>
              <Label>Display order (optional number)</Label>
              <Input value={formOrder} onChange={(e) => setFormOrder(e.target.value)} placeholder="e.g. 10" className="mt-1 w-24" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this resource?</DialogTitle>
            <DialogDescription>This resource will be permanently removed from the directory.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Weekly Document Upload Dialog ────────────────────────────────────── */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{docExistingId ? 'Replace document' : 'Upload document'}</DialogTitle>
            <DialogDescription>
              Upload a PDF for the selected week. Learners and mentors will be able to open or download it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Week</Label>
              <Select value={docWeek} onValueChange={setDocWeek}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKS.map((w) => (
                    <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document title</Label>
              <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="e.g. HELP Foundation Course, Module One" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={docDescription} onChange={(e) => setDocDescription(e.target.value)} placeholder="Brief description of this document…" rows={2} className="mt-1" />
            </div>
            <div>
              <Label>File (PDF, DOC, etc.)</Label>
              <p className="text-xs text-slate-500 mb-2">
                {docExistingUrl && !docFile
                  ? <>Current file: <a href={docExistingUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">{docExistingName || 'Open file'}</a>. Choose a new file to replace it.</>
                  : 'Choose a file to upload.'}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                  className="max-w-xs"
                />
                {docFile && <span className="text-xs text-slate-500">{docFile.name}</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDocDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveDoc} disabled={docSaving} className="bg-teal-600 hover:bg-teal-700 text-white">
                {docSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {docSaving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!docDeletingId} onOpenChange={(open) => { if (!open) setDocDeletingId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove this document?</DialogTitle>
            <DialogDescription>The document record will be removed. The file in storage will remain but will no longer be linked.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDocDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteDoc}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
