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
import { FolderOpen, Plus, Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react'

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

const CATEGORIES = [
  { value: 'emergency', label: 'Emergency Services' },
  { value: 'mental_health', label: 'Mental Health Hotlines' },
  { value: 'hospital', label: 'Hospitals & Psychiatric' },
  { value: 'ngo', label: 'NGOs & Community Support' },
  { value: 'faith_based', label: 'Faith & Community-Based' },
  { value: 'international', label: 'International' },
] as const

export default function AdminResourcesPage() {
  const supabase = createClient()
  const [list, setList] = useState<ResourceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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

  useEffect(() => {
    load()
  }, [])

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
      alert('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this resource?')) return
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id)
      if (error) throw error
      load()
    } catch (e) {
      console.error(e)
      alert('Failed to delete.')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resource Directory</h1>
          <p className="text-sm text-slate-600 mt-1">
            Add and edit referral contacts (emergency, mental health, hospitals, NGOs). Learners and mentors see them on their Resources page.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => remove(row.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
    </div>
  )
}
