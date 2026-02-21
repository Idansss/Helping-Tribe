'use client'

import { useMemo, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/admin/EmptyState'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Download, MessageCircle, Pencil, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

type ProfileRole = 'student' | 'mentor' | 'admin' | 'faculty'

interface ProfileRow {
  id: string
  email: string | null
  full_name: string | null
  role: string
  updated_at: string
  is_active: boolean | null
}

const ROLE_OPTIONS: { value: ProfileRole; label: string }[] = [
  { value: 'student', label: 'Learner' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'admin', label: 'Admin' },
]

function roleToLabel(role: string): string {
  const found = ROLE_OPTIONS.find((r) => r.value === role)
  return found?.label ?? role
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<ProfileRole | 'All'>('All')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState<ProfileRole>('student')
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadProfiles() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, updated_at, is_active')
        .order('full_name', { ascending: true, nullsFirst: false })

      if (error) throw error
      const rows: ProfileRow[] = (data ?? []).map((p: any) => ({
        id: p.id,
        email: p.email ?? null,
        full_name: p.full_name ?? null,
        role: p.role ?? 'student',
        updated_at: p.updated_at ?? '',
        is_active: p.is_active ?? true,
      }))
      setProfiles(rows)
    } catch (e) {
      console.error(e)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const filtered = useMemo(
    () =>
      profiles.filter((p) => {
        const q = search.toLowerCase()
        const matchesSearch =
          !search ||
          (p.email ?? '').toLowerCase().includes(q) ||
          (p.full_name ?? '').toLowerCase().includes(q) ||
          (p.role ?? '').toLowerCase().includes(q)
        const matchesRole =
          filterRole === 'All' || (p.role === filterRole)
        return matchesSearch && matchesRole
      }),
    [profiles, search, filterRole]
  )

  const handleExport = () => {
    if (!filtered.length) return
    const header = 'email,full_name,role,updated_at,is_active'
    const rows = filtered.map((p) =>
      [
        p.email ?? '',
        p.full_name ?? '',
        p.role,
        p.updated_at ? format(new Date(p.updated_at), 'yyyy-MM-dd') : '',
        p.is_active ?? true,
      ].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'users.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function openEdit(p: ProfileRow) {
    setEditId(p.id)
    setEditName(p.full_name ?? '')
    setEditRole((p.role as ProfileRole) || 'student')
    setEditActive(p.is_active ?? true)
  }

  async function saveEdit() {
    if (!editId) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName.trim() || null,
          role: editRole,
          is_active: editActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editId)

      if (error) throw error
      setEditId(null)
      loadProfiles()
    } catch (e) {
      console.error(e)
      toast({ title: 'Failed to update user.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Users</h1>
          <p className="text-xs text-slate-500">
            Manage users from Supabase profiles. Edit role, display name, and active status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs text-sm"
          />

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Filter:</span>
            {(['All', 'student', 'mentor', 'faculty', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFilterRole(r === 'All' ? 'All' : r)}
                className={`px-2 py-1 rounded-full border text-[11px] ${
                  filterRole === r
                    ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r === 'All' ? 'All' : roleToLabel(r)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No users match your filters"
            description="Users appear here once they have a profile (e.g. after sign-up). Run admin_profiles_policies.sql if you need admins to list and edit all profiles."
            actionLabel="Reload"
            onActionClick={loadProfiles}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Role</th>
                  <th className="px-3 py-2 text-left font-medium">Active</th>
                  <th className="px-3 py-2 text-left font-medium">Updated</th>
                  <th className="px-3 py-2 text-left font-medium w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-3 py-2 align-middle">{p.email ?? '—'}</td>
                    <td className="px-3 py-2 align-middle">{p.full_name ?? '—'}</td>
                    <td className="px-3 py-2 align-middle">
                      <Badge variant="outline" className="text-[11px]">
                        {roleToLabel(p.role)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {p.is_active !== false ? (
                        <span className="text-emerald-600">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-slate-500">
                      {p.updated_at
                        ? format(new Date(p.updated_at), 'MMM d, yyyy')
                        : '—'}
                    </td>
                    <td className="px-3 py-2 align-middle flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" asChild className="h-7 text-[11px]">
                        <Link href={`/admin/messages?to=${p.id}`}>
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-500">
        New users get a profile when they sign up. To allow admins to list and edit all users (including role and active flag), run{' '}
        <code className="bg-slate-100 px-1 rounded">supabase/scripts/admin_profiles_policies.sql</code> in the Supabase SQL Editor.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">User roles</h2>
              <p className="text-xs text-slate-500">
                Learner, Mentor, Faculty, Admin. Admins can change roles from the table above.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-3 py-2 text-left font-medium">Role</th>
                  <th className="px-3 py-2 text-left font-medium">Access</th>
                </tr>
              </thead>
              <tbody>
                {ROLE_OPTIONS.map((r) => (
                  <tr key={r.value} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{r.label}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {r.value === 'admin' && 'Full access'}
                      {r.value === 'mentor' && 'Mentor + Learner portals'}
                      {r.value === 'faculty' && 'Faculty + Mentor + Learner'}
                      {r.value === 'student' && 'Learner portal only'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Defaults</h2>
          <ul className="space-y-2 text-xs text-slate-700">
            <li>Default role for new sign-ups: <strong>Learner</strong> (student).</li>
            <li>Set <strong>Active</strong> to No to exclude a user from access (admin-managed).</li>
          </ul>
        </Card>
      </div>

      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Change display name, role, or active status. Saved to Supabase profiles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Display name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as ProfileRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="rounded border-slate-300"
                aria-label="Active (user can sign in)"
              />
              <Label htmlFor="edit-active">Active (user can sign in)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
