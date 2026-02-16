'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/admin/EmptyState'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type PeerCircleRow = {
  id: string
  name: string
  description: string | null
  max_members: number
  created_by: string
  created_at: string
  member_count: number
}

type Learner = {
  id: string
  full_name: string | null
  email: string | null
}

type CircleMember = {
  id: string
  user_id: string
  full_name: string | null
}

export default function MentorGroupsPage() {
  const supabase = createClient()
  const [circles, setCircles] = useState<PeerCircleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [membersDialogCircleId, setMembersDialogCircleId] = useState<string | null>(null)
  const [learners, setLearners] = useState<Learner[]>([])
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([])
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<Set<string>>(new Set())
  const [addingMembers, setAddingMembers] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    loadCircles()
  }, [])

  async function loadCircles() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('peer_circles')
        .select('id, name, description, max_members, created_by, created_at')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data?.length) {
        const withCounts = await Promise.all(
          data.map(async (c) => {
            const { count } = await supabase
              .from('peer_circle_members')
              .select('*', { count: 'exact', head: true })
              .eq('circle_id', c.id)
            return { ...c, member_count: count ?? 0 }
          })
        )
        setCircles(withCounts as PeerCircleRow[])
      } else {
        setCircles([])
      }
    } catch (e) {
      console.error('Error loading groups:', e)
      setCircles([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!groupName.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const { error } = await supabase.from('peer_circles').insert({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        created_by: user.id,
        max_members: 12,
      })
      if (error) throw error
      setGroupName('')
      setGroupDescription('')
      setShowForm(false)
      await loadCircles()
    } catch (e) {
      console.error('Error creating group:', e)
      alert('Failed to create group. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(c: PeerCircleRow) {
    setEditingId(c.id)
    setEditName(c.name)
    setEditDescription(c.description || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditDescription('')
  }

  async function saveEdit() {
    if (!editingId) return
    setSavingEdit(true)
    try {
      const { error } = await supabase
        .from('peer_circles')
        .update({ name: editName.trim(), description: editDescription.trim() || null })
        .eq('id', editingId)
      if (error) throw error
      cancelEdit()
      await loadCircles()
    } catch (e) {
      console.error('Error updating group:', e)
      alert('Failed to update group.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function deleteGroup(id: string) {
    if (!confirm('Delete this group? Learners will no longer see it.')) return
    try {
      const { error } = await supabase.from('peer_circles').delete().eq('id', id)
      if (error) throw error
      if (editingId === id) cancelEdit()
      if (membersDialogCircleId === id) setMembersDialogCircleId(null)
      await loadCircles()
    } catch (e) {
      console.error('Error deleting group:', e)
      alert('Failed to delete group.')
    }
  }

  async function openMembersDialog(circleId: string) {
    setMembersDialogCircleId(circleId)
    setLoadingMembers(true)
    setSelectedLearnerIds(new Set())
    try {
      const [learnersRes, membersRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').eq('role', 'student').order('full_name'),
        supabase
          .from('peer_circle_members')
          .select('id, user_id, profiles(full_name)')
          .eq('circle_id', circleId),
      ])
      if (learnersRes.error) throw learnersRes.error
      if (membersRes.error) throw membersRes.error
      setLearners(learnersRes.data ?? [])
      const members: CircleMember[] = (membersRes.data ?? []).map((m: {
        id: string
        user_id: string
        profiles?: { full_name: string | null } | { full_name: string | null }[] | null
      }) => {
        const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
        return {
          id: m.id,
          user_id: m.user_id,
          full_name: profile?.full_name ?? null,
        }
      })
      setCircleMembers(members)
    } catch (e) {
      console.error('Error loading members:', e)
      setLearners([])
      setCircleMembers([])
    } finally {
      setLoadingMembers(false)
    }
  }

  function toggleLearner(id: string) {
    setSelectedLearnerIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function addSelectedMembers() {
    if (!membersDialogCircleId || selectedLearnerIds.size === 0) return
    setAddingMembers(true)
    try {
      const existingIds = new Set(circleMembers.map((m) => m.user_id))
      const toAdd = [...selectedLearnerIds].filter((id) => !existingIds.has(id))
      if (toAdd.length === 0) {
        setSelectedLearnerIds(new Set())
        setAddingMembers(false)
        return
      }
      const { error } = await supabase.from('peer_circle_members').insert(
        toAdd.map((user_id) => ({ circle_id: membersDialogCircleId, user_id, role: 'member' }))
      )
      if (error) throw error
      setSelectedLearnerIds(new Set())
      await openMembersDialog(membersDialogCircleId)
      await loadCircles()
    } catch (e) {
      console.error('Error adding members:', e)
      alert('Failed to add learners.')
    } finally {
      setAddingMembers(false)
    }
  }

  async function removeMember(membershipId: string) {
    try {
      const { error } = await supabase.from('peer_circle_members').delete().eq('id', membershipId)
      if (error) throw error
      if (membersDialogCircleId) await openMembersDialog(membersDialogCircleId)
      await loadCircles()
    } catch (e) {
      console.error('Error removing member:', e)
      alert('Failed to remove learner.')
    }
  }

  const currentCircle = circles.find((c) => c.id === membersDialogCircleId)
  const memberIds = new Set(circleMembers.map((m) => m.user_id))
  const availableLearners = learners.filter((l) => !memberIds.has(l.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Groups (Peer Circles)
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Create peer circles and add learners. They will see their circle and peers on their portal.
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-800 text-white text-xs"
          onClick={() => setShowForm(true)}
        >
          Add group
        </Button>
      </div>

      {loading ? (
        <Card className="p-6 border-[#e2e8f0]">
          <p className="text-slate-500 text-sm">Loading groups...</p>
        </Card>
      ) : circles.length === 0 ? (
        <Card className="p-6 border-[#e2e8f0]">
          <EmptyState
            title="There are no groups yet!"
            description="Create a peer circle, then add learners. They will see the circle and their peers on their portal."
            actionLabel="Add group"
            icon={<Users className="h-4 w-4" />}
            onActionClick={() => setShowForm(true)}
          />
        </Card>
      ) : (
        <Card className="p-4 border-[#e2e8f0] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Existing groups</h2>
              <p className="text-xs text-slate-500">Add learners so they see their circle and peers.</p>
            </div>
            <Badge variant="outline" className="text-[11px]">
              {circles.length} groups
            </Badge>
          </div>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-3 py-2 text-left font-medium">Group</th>
                  <th className="px-3 py-2 text-left font-medium">Members</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {circles.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-3 py-2">
                      {editingId === c.id ? (
                        <div className="space-y-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-xs"
                            placeholder="Group name"
                          />
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="h-7 text-xs"
                            placeholder="Description (optional)"
                          />
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-slate-900">{c.name}</span>
                          {c.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{c.member_count}</td>
                    <td className="px-3 py-2">
                      {editingId === c.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 px-3 text-[11px] bg-purple-600 hover:bg-purple-800 text-white"
                            onClick={saveEdit}
                            disabled={savingEdit}
                          >
                            {savingEdit ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[11px]"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[11px]"
                            onClick={() => openMembersDialog(c.id)}
                          >
                            <UserPlus className="h-3.5 w-3.5 mr-1" />
                            Add learners
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[11px]"
                            onClick={() => startEdit(c)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[11px] text-red-600"
                            onClick={() => deleteGroup(c.id)}
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
        </Card>
      )}

      {showForm && (
        <Card className="p-4 border-[#e2e8f0] space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">New group</h2>
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="mg-name" className="text-xs text-slate-700">Group name</Label>
              <Input
                id="mg-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Lagos Evening Circle A"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mg-desc" className="text-xs text-slate-700">Description (optional)</Label>
              <Input
                id="mg-desc"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="e.g. Peer circle for Week 1–3"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-purple-600 hover:bg-purple-800 text-white text-xs"
                disabled={saving}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Create group'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setShowForm(false)
                  setGroupName('')
                  setGroupDescription('')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Dialog open={!!membersDialogCircleId} onOpenChange={(open) => !open && setMembersDialogCircleId(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentCircle?.name ?? 'Circle'} – Add learners</DialogTitle>
            <DialogDescription>
              Add learners to this circle. They will see it and their peers on their portal.
            </DialogDescription>
          </DialogHeader>
          {loadingMembers ? (
            <p className="text-sm text-slate-500 py-4">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Current members</p>
                {circleMembers.length === 0 ? (
                  <p className="text-xs text-slate-500">No learners in this circle yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {circleMembers.map((m) => (
                      <li key={m.id} className="flex items-center justify-between text-sm">
                        <span>{m.full_name || 'Unknown'}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                          onClick={() => removeMember(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Add learners</p>
                {availableLearners.length === 0 ? (
                  <p className="text-xs text-slate-500">All learners are already in this circle.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableLearners.map((l) => (
                      <label
                        key={l.id}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLearnerIds.has(l.id)}
                          onChange={() => toggleLearner(l.id)}
                          className="rounded border-slate-300"
                        />
                        <span>{l.full_name || l.email || l.id}</span>
                      </label>
                    ))}
                  </div>
                )}
                {selectedLearnerIds.size > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 bg-purple-600 hover:bg-purple-800 text-white"
                    onClick={addSelectedMembers}
                    disabled={addingMembers}
                  >
                    {addingMembers ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `Add ${selectedLearnerIds.size} learner(s)`}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
