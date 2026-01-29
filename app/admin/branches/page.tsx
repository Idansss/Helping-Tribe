'use client'

import { useEffect, useState } from 'react'
import { GitBranch } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/admin/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Branch {
  id: string
  name: string
  domain: string
  users: number
}

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'Lagos Campus',
    domain: 'lagos.helpingtribe.ng',
    users: 48,
  },
  {
    id: 'b2',
    name: 'Abuja Campus',
    domain: 'abuja.helpingtribe.ng',
    users: 32,
  },
]

const BRANCHES_STORAGE_KEY = 'ht-branches'

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES)
  const [showForm, setShowForm] = useState(false)
  const [branchName, setBranchName] = useState('')
  const [branchDomain, setBranchDomain] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDomain, setEditDomain] = useState('')

  // Load saved branches on first mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(BRANCHES_STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as Branch[]
      if (Array.isArray(stored)) {
        setBranches(stored)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Persist whenever branches change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches))
    } catch {
      // ignore storage errors
    }
  }, [branches])

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchName.trim() || !branchDomain.trim()) return

    const newBranch: Branch = {
      id: `b-${Date.now()}`,
      name: branchName.trim(),
      domain: branchDomain.trim(),
      users: 0,
    }

    setBranches(prev => [...prev, newBranch])
    setBranchName('')
    setBranchDomain('')
    setShowForm(false)
  }

  const handleStartEdit = (branch: Branch) => {
    setEditingId(branch.id)
    setEditName(branch.name)
    setEditDomain(branch.domain)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditDomain('')
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    setBranches(prev =>
      prev.map(b =>
        b.id === editingId
          ? {
              ...b,
              name: editName.trim() || b.name,
              domain: editDomain.trim() || b.domain,
            }
          : b,
      ),
    )
    handleCancelEdit()
  }

  const handleDeleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id))
    if (editingId === id) {
      handleCancelEdit()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Branches</h1>
          <p className="text-xs text-slate-500">
            Create independent sub-portals for different states, campuses or
            partner organizations.
          </p>
        </div>
        <Button
          className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-xs text-white"
          onClick={() => setShowForm(true)}
        >
          Add branch
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        {branches.length === 0 ? (
          <EmptyState
            title="No branches yet"
            description="Branches let you spin up separate portals with their own domains, admins, and counseling cohorts while sharing the same core curriculum."
            actionLabel="Configure first branch"
            icon={<GitBranch className="h-4 w-4" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="px-3 py-2 text-left font-medium">Branch</th>
                  <th className="px-3 py-2 text-left font-medium">Domain</th>
                  <th className="px-3 py-2 text-left font-medium">Users</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => (
                  <tr
                    key={branch.id}
                    className="border-b last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-3.5 w-3.5 text-[var(--talent-primary)]" />
                        {editingId === branch.id ? (
                          <Input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="h-7 text-xs"
                          />
                        ) : (
                          <span className="font-medium text-slate-900">
                            {branch.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle text-slate-600">
                      {editingId === branch.id ? (
                        <Input
                          value={editDomain}
                          onChange={e => setEditDomain(e.target.value)}
                          className="h-7 text-xs"
                        />
                      ) : (
                        <Badge variant="outline" className="text-[11px]">
                          {branch.domain}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-slate-600">
                      {branch.users}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {editingId === branch.id ? (
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
                            onClick={() => handleStartEdit(branch)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-3 text-[11px] text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteBranch(branch.id)}
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
          <h2 className="text-sm font-semibold text-slate-900">New branch</h2>
          <form onSubmit={handleAddBranch} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="branch-name" className="text-xs text-slate-700">
                Branch name
              </Label>
              <Input
                id="branch-name"
                value={branchName}
                onChange={e => setBranchName(e.target.value)}
                placeholder="e.g. Port Harcourt Campus"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="branch-domain" className="text-xs text-slate-700">
                Branch domain
              </Label>
              <Input
                id="branch-domain"
                value={branchDomain}
                onChange={e => setBranchDomain(e.target.value)}
                placeholder="e.g. phc.helpingtribe.ng"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white"
              >
                Save branch
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-slate-600"
                onClick={() => {
                  setShowForm(false)
                  setBranchName('')
                  setBranchDomain('')
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
          Branch configuration
        </h2>
        <p className="text-xs text-slate-500">
          Each branch can have its own domain, branding, admins, groups and
          learning paths, while still sharing the same core HELP Foundations
          curriculum.
        </p>
        <p className="text-[11px] text-slate-500">
          A future wizard can walk admins through creating a branch, mapping
          courses, and choosing which features to expose per branch.
        </p>
      </Card>
    </div>
  )
}

