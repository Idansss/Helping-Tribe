'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  FileText, 
  Users, 
  FileSearch,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { BadgeDisplay } from '@/components/lms/BadgeDisplay'
import { Leaderboard } from '@/components/lms/Leaderboard'
import { PersonalizedRecommendations } from '@/components/lms/PersonalizedRecommendations'

type TabType = 'lessons' | 'assignments' | 'quiz'

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('lessons')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
    }
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Student'

  // Sample data - replace with actual data from your database
  const lessonsData = [
    { id: 1, title: 'Setting Goals', status: 'completed', icon: CheckCircle2 },
    { id: 2, title: 'Conflict Resolution Skills', status: 'in-progress', icon: Clock },
  ]

  const assignmentsData = [
    { 
      id: 1, 
      title: 'Reflective Essay on Conflict', 
      status: 'pending', 
      dueDate: 'Due in 3 days',
      icon: AlertCircle 
    },
  ]

  const quizData = [
    { id: 1, title: 'Week 3 Assessment', status: 'not-started', icon: AlertCircle },
  ]

  const learningTools = [
    {
      id: 1,
      title: 'Module 3 Reflection',
      subtitle: 'Journal Entry',
      status: 'Draft Saved',
      action: 'Resume Writing',
      icon: BookOpen,
      href: '/journal',
    },
    {
      id: 2,
      title: 'Circle Alpha Session',
      subtitle: 'Peer Learning Circle',
      time: 'Fri, 4:00 PM EST',
      action: 'Join Meeting',
      icon: Users,
      href: '/peer-circles',
      variant: 'meeting' as const,
    },
    {
      id: 3,
      title: 'Case 4: Domestic Conflict',
      subtitle: 'Case Study',
      meta: '(Ngozi)',
      level: 'Intermediate',
      action: 'View Case',
      icon: FileSearch,
      href: '/case-studies',
    },
  ]

  const getCurrentMonthDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getCurrentMonthDays()

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-[#4c1d95] mb-1">Welcome back, {firstName}.</h1>
        <p className="text-gray-600 text-sm">You are on Week 3.</p>
      </div>

      {/* Course Progress */}
      <Card className="p-4">
        <h3 className="text-base font-semibold text-[#4c1d95] mb-3">Course Progress</h3>
        <div className="flex items-center gap-3 mb-1">
          <Progress value={33} className="flex-1" />
          <span className="text-xs font-medium text-gray-600">33%</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Module 3: Action Stage and Conflict Resolution</p>
        <Button size="sm" className="bg-[#4c1d95] hover:bg-[#5b21b6] text-xs">
          Continue Lesson →
        </Button>
      </Card>

      {/* AI Recommendations */}
      <PersonalizedRecommendations />

      {/* This Week's Flow */}
      <div>
        <h2 className="text-xl font-bold text-[#4c1d95] mb-3">This Week's Flow</h2>
        
        {/* Tabs */}
        <div className="flex gap-3 mb-4 bg-[#f3e8ff] rounded-full p-1">
          <button
            onClick={() => setActiveTab('lessons')}
            className={cn(
              'flex-1 py-2 px-4 rounded-full font-medium text-xs transition-all',
              activeTab === 'lessons' 
                ? 'bg-white text-[#4c1d95] shadow-sm' 
                : 'text-gray-600 hover:text-[#4c1d95]'
            )}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={cn(
              'flex-1 py-2 px-4 rounded-full font-medium text-xs transition-all',
              activeTab === 'assignments' 
                ? 'bg-white text-[#4c1d95] shadow-sm' 
                : 'text-gray-600 hover:text-[#4c1d95]'
            )}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={cn(
              'flex-1 py-2 px-4 rounded-full font-medium text-xs transition-all',
              activeTab === 'quiz' 
                ? 'bg-white text-[#4c1d95] shadow-sm' 
                : 'text-gray-600 hover:text-[#4c1d95]'
            )}
          >
            Quiz
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-[#f3e8ff] rounded-2xl p-4">
          {activeTab === 'lessons' && (
            <div className="space-y-3">
              {lessonsData.map((lesson) => {
                const Icon = lesson.icon
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-xl"
                  >
                    <Icon className={cn(
                      "h-6 w-6",
                      lesson.status === 'completed' ? 'text-green-600' : 'text-[#4c1d95]'
                    )} />
                    <span className="font-medium text-gray-900 text-sm">{lesson.title}</span>
                    {lesson.status === 'completed' && (
                      <Badge className="ml-auto bg-green-100 text-green-700 hover:bg-green-100">
                        Completed
                      </Badge>
                    )}
                    {lesson.status === 'in-progress' && (
                      <Badge className="ml-auto bg-purple-100 text-purple-700 hover:bg-purple-100">
                        In Progress
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-3">
              {assignmentsData.map((assignment) => {
                const Icon = assignment.icon
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-3 p-4 bg-white/60 rounded-xl"
                  >
                    <Icon className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{assignment.title}</p>
                      <p className="text-xs text-gray-600">{assignment.status} - {assignment.dueDate}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-3">
              {quizData.map((quiz) => {
                const Icon = quiz.icon
                return (
                  <div
                    key={quiz.id}
                    className="flex items-center gap-3 p-4 bg-white/60 rounded-xl"
                  >
                    <Icon className="h-5 w-5 text-[#4c1d95]" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{quiz.title}</p>
                      <p className="text-xs text-gray-600 capitalize">{quiz.status.replace('-', ' ')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Learning Tools */}
      <div>
        <h2 className="text-xl font-bold text-[#4c1d95] mb-3">Learning Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card key={tool.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#4c1d95] text-sm mb-0.5">{tool.title}</h3>
                    <p className="text-xs text-gray-600">{tool.subtitle}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#f3e8ff] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#4c1d95]" />
                  </div>
                </div>

                {tool.status && (
                  <Badge className="mb-2 bg-[#f3e8ff] text-[#4c1d95] hover:bg-[#f3e8ff] text-[0.65rem]">
                    {tool.status}
                  </Badge>
                )}

                {tool.variant === 'meeting' && tool.time && (
                  <div className="mb-3">
                    <p className="font-semibold text-gray-900 text-sm">{tool.time.split(',')[0]},</p>
                    <p className="text-xs text-gray-600">{tool.time.split(',')[1]}</p>
                  </div>
                )}

                {tool.meta && (
                  <div className="mb-3">
                    <p className="font-semibold text-gray-900 text-sm">{tool.meta}</p>
                    {tool.level && (
                      <Badge className="mt-1 bg-purple-100 text-purple-700 hover:bg-purple-100 text-[0.65rem]">
                        {tool.level}
                      </Badge>
                    )}
                  </div>
                )}

                <Link href={tool.href}>
                  <Button 
                    variant={tool.variant === 'meeting' ? 'default' : 'outline'}
                    className={cn(
                      "w-full mt-auto text-xs py-2",
                      tool.variant === 'meeting' && "bg-[#4c1d95] hover:bg-[#5b21b6]"
                    )}
                  >
                    {tool.action}
                  </Button>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Upcoming Events & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <Card className="p-4">
          <h3 className="text-xl font-bold text-[#4c1d95] mb-3">Upcoming Events</h3>
        
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-gray-100 rounded-full"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-sm">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-full"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const isToday = 
              day === new Date().getDate() &&
              currentMonth.getMonth() === new Date().getMonth() &&
              currentMonth.getFullYear() === new Date().getFullYear()
            
            return (
              <div
                key={day}
                className={cn(
                  "p-2 rounded-lg text-sm hover:bg-[#f3e8ff] cursor-pointer transition-colors",
                  isToday && "bg-[#4c1d95] text-white hover:bg-[#5b21b6]"
                )}
              >
                {day}
              </div>
            )
          })}
        </div>
        </Card>

        {/* Leaderboard */}
        <Leaderboard />
      </div>

      {/* Achievements & Badges */}
      <div>
        <h2 className="text-xl font-bold text-[#4c1d95] mb-3">Your Achievements</h2>
        <BadgeDisplay />
      </div>
    </div>
  )
}
