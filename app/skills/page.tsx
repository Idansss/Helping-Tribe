'use client'

import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/admin/EmptyState'
import { Sparkles, Search, ThumbsUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ALL_SKILLS = [
  'Accounting',
  'Active Listening',
  'Adaptability',
  'AI Basics',
  'Analytical Thinking',
  'Argumentation',
  'Assertiveness',
  'Attention to Detail',
  'Brand Marketing',
  'Budgeting',
]

const COUNSELING_SKILLS = [
  { name: 'Active Listening', level: 'Advanced', progress: 90 },
  { name: 'Empathetic Response', level: 'Intermediate', progress: 75 },
  { name: 'Crisis Intervention', level: 'Beginner', progress: 40 },
]

const ETHICAL_SKILLS = [
  { name: 'Confidentiality', level: 'Advanced', progress: 95 },
  { name: 'Boundary Setting', level: 'Intermediate', progress: 70 },
  { name: 'Informed Consent', level: 'Beginner', progress: 50 },
]

export default function SkillsPage() {
  return (
    <LearnerPortalPlaceholder>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Skills (Counseling Competencies)
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Track and develop your counseling skills, ethical competencies,
              and professional capabilities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#how-skills-work"
              className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
            >
              How Skills work
            </a>
            <button className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              Recommend skilled users
            </button>
          </div>
        </div>

        <Card className="p-4 space-y-4 border-[#e2e8f0]">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="my-skills">My Skills</TabsTrigger>
              <TabsTrigger value="job-pathfinder">Job pathfinder</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0] mb-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="text-xs font-medium text-slate-700">
                    Sort by:
                  </label>
                  <Select defaultValue="suggested">
                    <SelectTrigger className="h-9 w-44 text-xs border-[#e2e8f0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[100] border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                      <SelectItem value="suggested">Suggested</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative flex-1 max-w-xs min-w-[160px]">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search for skill"
                    className="pl-8 h-9 text-xs border-[#e2e8f0]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Core Counseling Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {COUNSELING_SKILLS.map((skill) => (
                      <Card key={skill.name} className="p-4 border-[#e2e8f0] hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm mb-1">
                              {skill.name}
                            </h4>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Progress</span>
                                <span className="font-medium text-slate-700">{skill.progress}%</span>
                              </div>
                              <Progress value={skill.progress} className="h-1.5" />
                              <Badge variant="outline" className="text-xs">
                                {skill.level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Ethical Competencies
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ETHICAL_SKILLS.map((skill) => (
                      <Card key={skill.name} className="p-4 border-[#e2e8f0] hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm mb-1">
                              {skill.name}
                            </h4>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Progress</span>
                                <span className="font-medium text-slate-700">{skill.progress}%</span>
                              </div>
                              <Progress value={skill.progress} className="h-1.5" />
                              <Badge variant="outline" className="text-xs">
                                {skill.level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    All Available Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ALL_SKILLS.map((skill) => (
                      <div
                        key={skill}
                        className="border border-[#e2e8f0] rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="my-skills">
              <EmptyState
                title="No skills acquired yet!"
                description="Gain new skills to boost your expertise. Complete courses, assessments, and practice sessions to develop counseling competencies."
                icon={<Sparkles className="h-4 w-4" />}
              />
            </TabsContent>

            <TabsContent value="job-pathfinder" className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  Achieve your career goals
                </h2>
                <p className="text-sm text-slate-600">
                  See how you fit your ideal role and find ways to improve your
                  skills.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search for roles and see how you match"
                  className="flex-1"
                />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                  Search
                </button>
              </div>

              {/* Skill Matching Visualization */}
              {false && (
                <Card className="p-4 border-[#e2e8f0]">
                  <h3 className="font-semibold text-slate-900 text-sm mb-3">
                    Counselor Role Match
                  </h3>
                  <div className="space-y-3">
                    {[
                      { skill: 'Active Listening', match: 90, required: 85 },
                      { skill: 'Empathy', match: 75, required: 80 },
                      { skill: 'Ethics', match: 95, required: 90 },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-700">{item.skill}</span>
                          <span className={`font-medium ${item.match >= item.required ? 'text-green-600' : 'text-orange-600'}`}>
                            {item.match}% / {item.required}%
                          </span>
                        </div>
                        <Progress value={item.match} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-4 bg-slate-50 border-[#e2e8f0]">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  How Skills work
                </h3>
                <p className="text-xs text-slate-600">
                  Skills represent your competencies in counseling, ethics, and
                  professional practice. As you complete courses, assessments,
                  and practical exercises, your skill levels will increase.
                  Skills help you understand your strengths and identify areas
                  for growth in your counseling career.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </LearnerPortalPlaceholder>
  )
}
