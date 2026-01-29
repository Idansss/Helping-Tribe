'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Edit2,
  TrendingUp,
  Target,
  Search,
  Award,
  Briefcase,
  BarChart3,
  Star,
  Zap,
  BookOpen,
  Heart,
  Shield,
  Users,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { MentorLayout } from '@/components/lms/MentorLayout'

type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type SkillCategory = 'core-counseling' | 'ethical' | 'clinical' | 'communication'

interface Skill {
  id: string
  name: string
  category: SkillCategory
  proficiency: ProficiencyLevel
  progress: number // 0-100
  description?: string
  lastUpdated?: string
}

const STORAGE_KEY = 'mentor-skills-data'

const defaultSkills: Skill[] = [
  {
    id: '1',
    name: 'Active Listening',
    category: 'core-counseling',
    proficiency: 'advanced',
    progress: 85,
    description: 'Ability to fully concentrate, understand, respond and remember what is being said.',
  },
  {
    id: '2',
    name: 'Empathetic Response',
    category: 'core-counseling',
    proficiency: 'intermediate',
    progress: 65,
    description: 'Understanding and sharing the feelings of clients while maintaining professional boundaries.',
  },
  {
    id: '3',
    name: 'Trauma-Informed Care',
    category: 'core-counseling',
    proficiency: 'beginner',
    progress: 35,
    description: 'Understanding the impact of trauma and implementing trauma-sensitive approaches.',
  },
  {
    id: '4',
    name: 'Confidentiality',
    category: 'ethical',
    proficiency: 'advanced',
    progress: 90,
    description: 'Maintaining client privacy and confidentiality according to ethical guidelines.',
  },
  {
    id: '5',
    name: 'Boundary Setting',
    category: 'ethical',
    proficiency: 'intermediate',
    progress: 70,
    description: 'Establishing and maintaining appropriate professional boundaries with clients.',
  },
  {
    id: '6',
    name: 'Crisis Intervention',
    category: 'clinical',
    proficiency: 'intermediate',
    progress: 60,
    description: 'Providing immediate support and intervention during mental health crises.',
  },
  {
    id: '7',
    name: 'Group Facilitation',
    category: 'communication',
    proficiency: 'advanced',
    progress: 80,
    description: 'Effectively facilitating group therapy and peer circle sessions.',
  },
]

const proficiencyColors = {
  beginner: 'bg-slate-100 text-slate-700 border-slate-300',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-300',
  advanced: 'bg-purple-100 text-purple-700 border-purple-300',
  expert: 'bg-green-100 text-green-700 border-green-300',
}

const proficiencyProgress = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
}

const categoryIcons = {
  'core-counseling': Heart,
  ethical: Shield,
  clinical: BookOpen,
  communication: Users,
}

const jobPaths = [
  {
    role: 'Licensed Professional Counselor (LPC)',
    requiredSkills: ['Active Listening', 'Empathetic Response', 'Trauma-Informed Care', 'Confidentiality'],
    match: 75,
    description: 'Provide counseling services to individuals, couples, and families.',
  },
  {
    role: 'Clinical Social Worker',
    requiredSkills: ['Trauma-Informed Care', 'Crisis Intervention', 'Boundary Setting'],
    match: 60,
    description: 'Work in healthcare settings providing mental health services.',
  },
  {
    role: 'Group Therapy Facilitator',
    requiredSkills: ['Group Facilitation', 'Active Listening', 'Boundary Setting'],
    match: 85,
    description: 'Lead group therapy sessions and peer support circles.',
  },
]

export default function MentorSkillsPage() {
  const { toast } = useToast()
  const [skills, setSkills] = useState<Skill[]>(defaultSkills)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load skills from localStorage on mount
  useEffect(() => {
    try {
      const storedSkills = localStorage.getItem(STORAGE_KEY)
      if (storedSkills) {
        const parsedSkills = JSON.parse(storedSkills) as Skill[]
        setSkills(parsedSkills)
      }
    } catch (error) {
      console.error('Failed to load skills from localStorage:', error)
    }
  }, [])

  // Save skills to localStorage whenever skills change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skills))
    } catch (error) {
      console.error('Failed to save skills to localStorage:', error)
    }
  }, [skills])

  const handleUpdateSkill = (updatedSkill: Skill) => {
    setSkills(skills.map(skill => 
      skill.id === updatedSkill.id 
        ? { ...updatedSkill, lastUpdated: new Date().toISOString() }
        : skill
    ))
    setIsDialogOpen(false)
    setEditingSkill(null)
    toast({
      title: 'Skill updated',
      description: `${updatedSkill.name} proficiency has been updated.`,
    })
  }

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const coreSkills = filteredSkills.filter(s => s.category === 'core-counseling')
  const ethicalSkills = filteredSkills.filter(s => s.category === 'ethical')
  const clinicalSkills = filteredSkills.filter(s => s.category === 'clinical')
  const communicationSkills = filteredSkills.filter(s => s.category === 'communication')

  const mySkillsStats = {
    total: skills.length,
    advanced: skills.filter(s => s.proficiency === 'advanced' || s.proficiency === 'expert').length,
    averageProgress: Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length),
    recentUpdates: skills.filter(s => s.lastUpdated).length,
  }

  const renderSkillCard = (skill: Skill) => {
    const IconComponent = categoryIcons[skill.category]
    return (
      <Card
        key={skill.id}
        className="p-4 hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-purple-500"
        onClick={() => {
          setEditingSkill(skill)
          setIsDialogOpen(true)
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <IconComponent className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm">{skill.name}</h3>
              {skill.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{skill.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setEditingSkill(skill)
              setIsDialogOpen(true)
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`text-xs ${proficiencyColors[skill.proficiency]}`}
            >
              {skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1)}
            </Badge>
            <span className="text-xs font-medium text-slate-600">{skill.progress}%</span>
          </div>
          <Progress value={skill.progress} className="h-2" />
        </div>
      </Card>
    )
  }

  return (
    <MentorLayout>
      <Toaster />
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Skills (Counseling competencies)
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Track and nurture counseling skills like Active Listening,
              Empathetic Response and Trauma‑Informed Care.
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="my-skills">My Skills</TabsTrigger>
              <TabsTrigger value="job-pathfinder">Job Pathfinder</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="core-counseling">Core Counseling</SelectItem>
                    <SelectItem value="ethical">Ethical</SelectItem>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {coreSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-purple-600" />
                    <h2 className="text-base font-semibold text-slate-900">
                      Core Counseling Skills
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coreSkills.map(renderSkillCard)}
                  </div>
                </div>
              )}

              {ethicalSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <h2 className="text-base font-semibold text-slate-900">
                      Ethical Competencies
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ethicalSkills.map(renderSkillCard)}
                  </div>
                </div>
              )}

              {clinicalSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <h2 className="text-base font-semibold text-slate-900">
                      Clinical Skills
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clinicalSkills.map(renderSkillCard)}
                  </div>
                </div>
              )}

              {communicationSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <h2 className="text-base font-semibold text-slate-900">
                      Communication Skills
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communicationSkills.map(renderSkillCard)}
                  </div>
                </div>
              )}

              {filteredSkills.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">No skills found matching your search.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-skills" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-xs text-slate-500">Total Skills</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{mySkillsStats.total}</div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-slate-500">Advanced+</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{mySkillsStats.advanced}</div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-slate-500">Avg Progress</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{mySkillsStats.averageProgress}%</div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-xs text-slate-500">Updated</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{mySkillsStats.recentUpdates}</div>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Skill Progress Overview
                </h2>
                <div className="space-y-3">
                  {skills
                    .sort((a, b) => b.progress - a.progress)
                    .map(skill => (
                      <div key={skill.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">{skill.name}</span>
                          <span className="text-xs text-slate-500">{skill.progress}%</span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-purple-50 p-3 rounded-lg">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>
                  AI‑powered suggestions: Focus on improving "Trauma-Informed Care" based on recent case study performance.
                </span>
              </div>
            </TabsContent>

            <TabsContent value="job-pathfinder" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Career Pathways
                </h2>
                <p className="text-sm text-slate-600">
                  Explore counseling-related roles and see how your skills align with different career paths.
                </p>
              </div>

              <div className="space-y-4">
                {jobPaths.map((path, index) => (
                  <Card key={index} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{path.role}</h3>
                        <p className="text-sm text-slate-600 mb-3">{path.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {path.requiredSkills.map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`text-xs ${
                                skills.some(s => s.name === skill && s.proficiency !== 'beginner')
                                  ? 'bg-green-50 text-green-700 border-green-300'
                                  : 'bg-slate-50 text-slate-600 border-slate-300'
                              }`}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-purple-600">{path.match}%</div>
                        <div className="text-xs text-slate-500">Match</div>
                      </div>
                    </div>
                    <Progress value={path.match} className="h-2" />
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Edit Skill Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Skill Proficiency</DialogTitle>
              <DialogDescription>
                Update your proficiency level and progress for {editingSkill?.name}.
              </DialogDescription>
            </DialogHeader>
            {editingSkill && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Proficiency Level</Label>
                  <Select
                    value={editingSkill.proficiency}
                    onValueChange={(value: ProficiencyLevel) => {
                      setEditingSkill({
                        ...editingSkill,
                        proficiency: value,
                        progress: proficiencyProgress[value],
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Progress ({editingSkill.progress}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={editingSkill.progress}
                    onChange={(e) => {
                      setEditingSkill({
                        ...editingSkill,
                        progress: parseInt(e.target.value),
                      })
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {editingSkill.description && (
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <p className="text-sm text-slate-600">{editingSkill.description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => editingSkill && handleUpdateSkill(editingSkill)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MentorLayout>
  )
}

