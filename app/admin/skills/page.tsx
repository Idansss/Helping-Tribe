'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/admin/EmptyState'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Skill {
  id: string
  name: string
  level: string
}

const INITIAL_SKILLS: Skill[] = [
  { id: 's1', name: 'Active Listening', level: 'Intermediate' },
  { id: 's2', name: 'Trauma-Informed Care', level: 'Advanced' },
  { id: 's3', name: 'Ethics in Nigerian Context', level: 'Foundational' },
]

const SKILL_STORAGE_KEY = 'ht-skills'

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(() => {
    if (typeof window === 'undefined') return INITIAL_SKILLS
    try {
      const raw = window.localStorage.getItem(SKILL_STORAGE_KEY)
      if (!raw) return INITIAL_SKILLS
      const parsed = JSON.parse(raw) as Skill[]
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SKILLS
    } catch {
      return INITIAL_SKILLS
    }
  })
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate')

  const persistSkills = (next: Skill[]) => {
    setSkills(next)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(SKILL_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return

    const skill: Skill = {
      id: `s-${Date.now()}`,
      name: newSkillName.trim(),
      level: newSkillLevel.trim() || 'Intermediate',
    }

    const next = [...skills, skill]
    persistSkills(next)
    setNewSkillName('')
    setNewSkillLevel('Intermediate')
    setShowAddForm(false)
  }

  const filteredSkills = useMemo(
    () =>
      skills.filter(skill => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          skill.name.toLowerCase().includes(q) ||
          skill.level.toLowerCase().includes(q)
        )
      }),
    [skills, search],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Skills</h1>
          <p className="text-xs text-slate-500">
            Manage the counseling skill library, self-assessments and AI-driven
            skill generation.
          </p>
        </div>
        <Button
          className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-xs text-white"
          onClick={() => setShowAddForm(true)}
        >
          Add skill
        </Button>
      </div>

      <Tabs defaultValue="skills" className="space-y-3">
        <TabsList className="mb-1 bg-slate-50 rounded-lg p-1 w-fit">
          <TabsTrigger value="skills" className="text-xs px-3 py-1.5">
            Skills
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs px-3 py-1.5">
            Users
          </TabsTrigger>
          <TabsTrigger value="talent" className="text-xs px-3 py-1.5">
            Talent pool
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-3">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--talent-primary)]" />
                <span className="text-xs font-semibold text-slate-900">
                  Skill library
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {skills.length} skills
                </Badge>
              </div>
              <Input
                placeholder="Search skills (e.g. Active Listening)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-7 max-w-xs text-xs"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {filteredSkills.map(skill => (
                <Card key={skill.id} className="p-3 border-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {skill.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Level: {skill.level}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Counseling skill
                    </Badge>
                  </div>
                </Card>
              ))}
              {filteredSkills.length === 0 && (
                <div className="col-span-full text-[11px] text-slate-500">
                  No skills match “{search}”. Try another term.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Skill settings & assessments
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li>Toggle: activate skills for learners.</li>
              <li>Toggle: enable skill recommendations from AI.</li>
              <li>Choose levels model (single level vs multi-level framework).</li>
              <li>
                Assessment options: expiration, number of questions, pass mark,
                retry-after period, completion time.
              </li>
            </ul>
            <p className="text-[11px] text-slate-500">
              An AI instruction field will allow you to describe your context
              (e.g. Nigerian counseling standards) so suggested skills fit your
              program.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="text-xs text-slate-500">
          User-level skill views (e.g. skill profiles per learner/mentor) will
          be summarized here.
        </TabsContent>

        <TabsContent value="talent" className="text-xs text-slate-500">
          Talent pool insights (e.g. strongest skills across cohorts) will be
          surfaced here.
        </TabsContent>
      </Tabs>

      <Card className="p-6 mt-1">
        <EmptyState
          title="Build your counseling skill framework"
          description="Create skills such as Active Listening, Trauma-Informed Care, Ethics in Nigerian Context, and map them to courses, assessments and practicum evaluations."
          actionLabel="Open skill settings"
          icon={<Sparkles className="h-4 w-4" />}
        />
      </Card>

      {showAddForm && (
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Add new counseling skill
          </h2>
          <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label
                htmlFor="skill-name"
                className="text-[11px] font-medium text-slate-700"
              >
                Skill name
              </label>
              <Input
                id="skill-name"
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                placeholder="e.g. Group facilitation, Ethics in crisis counseling"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="skill-level"
                className="text-[11px] font-medium text-slate-700"
              >
                Level
              </label>
              <Input
                id="skill-level"
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(e.target.value)}
                placeholder="e.g. Foundational, Intermediate, Advanced"
                className="text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-[var(--talent-primary)] hover:bg-[var(--talent-primary-dark)] text-white text-xs"
              >
                Save skill
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-slate-600"
                onClick={() => {
                  setShowAddForm(false)
                  setNewSkillName('')
                  setNewSkillLevel('Intermediate')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

