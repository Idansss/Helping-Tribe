'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Target,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface SkillArea {
  id: string
  name: string
  category: string
  currentLevel: number // 0-100
  targetLevel: number // 0-100
  gap: number
  status: 'critical' | 'needs-work' | 'proficient' | 'mastered'
  relatedModules: string[]
}

export function SkillGapAnalysis() {
  const [skillAreas, setSkillAreas] = useState<SkillArea[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    analyzeSkills()
  }, [])

  async function analyzeSkills() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's quiz scores by module
      const { data: progress } = await supabase
        .from('module_progress')
        .select('*, modules(*)')
        .eq('user_id', user.id)

      // Define skill areas based on modules
      const skills: SkillArea[] = [
        {
          id: 'ethics',
          name: 'Professional Ethics & Cultural Competence',
          category: 'Foundation',
          currentLevel: progress?.find(p => p.modules.week_number === 1)?.quiz_score || 0,
          targetLevel: 80,
          gap: 0,
          status: 'needs-work',
          relatedModules: ['Module 1']
        },
        {
          id: 'active-listening',
          name: 'Active Listening & Exploration Skills',
          category: 'Core Skills',
          currentLevel: progress?.find(p => p.modules.week_number === 2)?.quiz_score || 0,
          targetLevel: 85,
          gap: 0,
          status: 'needs-work',
          relatedModules: ['Module 2', 'Module 3']
        },
        {
          id: 'conflict-resolution',
          name: 'Conflict Resolution & Action Planning',
          category: 'Core Skills',
          currentLevel: progress?.find(p => p.modules.week_number === 3)?.quiz_score || 0,
          targetLevel: 80,
          gap: 0,
          status: 'needs-work',
          relatedModules: ['Module 3']
        },
        {
          id: 'self-care',
          name: 'Self-Care & Burnout Prevention',
          category: 'Professional Development',
          currentLevel: progress?.find(p => p.modules.week_number === 4)?.quiz_score || 0,
          targetLevel: 75,
          gap: 0,
          status: 'needs-work',
          relatedModules: ['Module 4']
        },
        {
          id: 'trauma-support',
          name: 'Trauma-Informed Practice',
          category: 'Specialized Skills',
          currentLevel: progress?.find(p => p.modules.week_number === 6)?.quiz_score || 0,
          targetLevel: 90,
          gap: 0,
          status: 'needs-work',
          relatedModules: ['Module 2', 'Module 6']
        },
      ]

      // Calculate gaps and status
      skills.forEach(skill => {
        skill.gap = skill.targetLevel - skill.currentLevel
        
        if (skill.currentLevel >= skill.targetLevel) {
          skill.status = 'mastered'
        } else if (skill.currentLevel >= skill.targetLevel * 0.8) {
          skill.status = 'proficient'
        } else if (skill.currentLevel >= skill.targetLevel * 0.5) {
          skill.status = 'needs-work'
        } else {
          skill.status = 'critical'
        }
      })

      // Sort by gap (largest gaps first)
      skills.sort((a, b) => b.gap - a.gap)

      setSkillAreas(skills)
    } catch (error) {
      console.error('Error analyzing skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'proficient':
        return <TrendingUp className="h-5 w-5 text-purple-600" />
      case 'needs-work':
        return <Target className="h-5 w-5 text-yellow-600" />
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'proficient':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'needs-work':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4c1d95]"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
          <Target className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#4c1d95]">Skill Gap Analysis</h3>
          <p className="text-sm text-gray-600">Identify areas for focused improvement</p>
        </div>
      </div>

      <div className="space-y-4">
        {skillAreas.map((skill) => (
          <div 
            key={skill.id} 
            className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#4c1d95] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(skill.status)}
                  <h4 className="font-bold text-gray-900">{skill.name}</h4>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {skill.category}
                  </Badge>
                  <Badge className={cn("text-xs capitalize", getStatusColor(skill.status))}>
                    {skill.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Level</span>
                <span className="font-semibold text-gray-900">{skill.currentLevel}%</span>
              </div>
              <Progress value={skill.currentLevel} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Target Level</span>
                <span className="font-semibold text-[#4c1d95]">{skill.targetLevel}%</span>
              </div>

              {skill.gap > 0 && (
                <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-orange-50 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-700 font-medium">
                    {skill.gap}% gap to target
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Related: {skill.relatedModules.join(', ')}
              </div>
              <Link href="/course/module/1">
                <Button size="sm" variant="outline" className="text-[#4c1d95] border-[#4c1d95]">
                  <BookOpen className="mr-2 h-3 w-3" />
                  Study
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
        <h4 className="font-semibold text-[#4c1d95] mb-2">📊 Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Mastered Skills</p>
            <p className="text-2xl font-bold text-green-600">
              {skillAreas.filter(s => s.status === 'mastered').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Need Improvement</p>
            <p className="text-2xl font-bold text-orange-600">
              {skillAreas.filter(s => s.status === 'critical' || s.status === 'needs-work').length}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
