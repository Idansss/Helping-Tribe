'use client'

import { useEffect, useState } from 'react'
import { Users2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/admin/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Group {
  id: string
  name: string
  type: string
  members: number
  courses: number
}

const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Lagos Evening Circle A',
    type: 'Peer circle',
    members: 12,
    courses: 3,
  },
  {
    id: 'g2',
    name: 'Abuja Campus Cohort 1',
    type: 'Campus cohort',
    members: 24,
    courses: 5,
  },
]

const GROUPS_STORAGE_KEY = 'ht-groups'

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS)
  const [showForm, setShowForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupType, setGroupType] = useState('Peer circle')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('Peer circle')

  // Load saved groups on first mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(GROUPS_STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as Group[]
      if (Array.isArray(stored)) {
        setGroups(stored)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Persist whenever groups change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
    } catch {
      // ignore storage errors in demo
    }
  }, [groups])

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return

    const newGroup: Group = {
      id: `g-${Date.now()}`,
      name: groupName.trim(),
      type: groupType.trim() || 'Peer circle',
      members: 0,
      courses: 0,
    }

    setGroups(prev => [...prev, newGroup])
    setGroupName('')
    setGroupType('Peer circle')
    setShowForm(false)
  }

  const handleStartEdit = (group: Group) => {
    setEditingId(group.id)
    setEditName(group.name)
    setEditType(group.type)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditType('Peer circle')
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    setGroups(prev =>
      prev.map(g =>
        g.id === editingId
          ? {
              ...g,
              name: editName.trim() || g.name,
              type: editType.trim() || g.type,
            }
          : g,
      ),
    )
    handleCancelEdit()
  }

  const handleDeleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id))
    if (editingId === id) {
      handleCancelEdit()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Groups</h1>
          <p className="text-xs text-slate-500">
            Organize learners into peer circles, campuses, and cohorts for
            targeted assignments.
          </p>
        </div>
        <Button
          className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-xs text-white"
          onClick={() => setShowForm(true)}
        >
          Add group
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        {groups.length === 0 ? (
          <EmptyState
            title="No groups configured yet"
            description="Create peer circles (e.g. “Lagos Evening Circle A”), branches (e.g. “South-West Region”), or thematic groups (e.g. “Youth Counseling Track”) to manage assignments and support."
            actionLabel="Create first group"
            icon={<Users2 className="h-4 w-4" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="px-3 py-2 text-left font-medium">Group</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Members</th>
                  <th className="px-3 py-2 text-left font-medium">
                    Assigned courses
                  </th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(group => (
                  <tr
                    key={group.id}
                    className="border-b last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-3 py-2 align-middle">
                      {editingId === group.id ? (
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        group.name
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {editingId === group.id ? (
                        <Input
                          value={editType}
                          onChange={e => setEditType(e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        <Badge variant="outline" className="text-[11px]">
                          {group.type}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-slate-600">
                      {group.members}
                    </td>
                    <td className="px-3 py-2 align-middle text-slate-600">
                      {group.courses}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {editingId === group.id ? (
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
                            onClick={() => handleStartEdit(group)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-3 text-[11px] text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteGroup(group.id)}
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
          <h2 className="text-sm font-semibold text-slate-900">New group</h2>
          <form onSubmit={handleAddGroup} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="group-name" className="text-xs text-slate-700">
                Group name
              </Label>
              <Input
                id="group-name"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. Lagos Evening Circle B"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="group-type" className="text-xs text-slate-700">
                Group type
              </Label>
              <Input
                id="group-type"
                value={groupType}
                onChange={e => setGroupType(e.target.value)}
                placeholder="e.g. Peer circle, Campus cohort"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
              >
                Save group
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-slate-600"
                onClick={() => {
                  setShowForm(false)
                  setGroupName('')
                  setGroupType('Peer circle')
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
          Group assignment model
        </h2>
        <p className="text-xs text-slate-500">
          Groups act as containers so you can assign sets of courses to many
          learners at once (e.g. all members of a peer circle or a campus
          cohort).
        </p>
        <p className="text-[11px] text-slate-500">
          In a later iteration, this page will include a full “Add group”
          wizard, course assignment panel, and filters by branch/cohort.
        </p>
      </Card>
    </div>
  )
}

