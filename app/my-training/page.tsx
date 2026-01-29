'use client'

import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/admin/EmptyState'
import { BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function MyTrainingPage() {
  const router = useRouter()
  return (
    <LearnerPortalPlaceholder>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Training</h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Track your progress through counseling courses and learning paths.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 border-[#e2e8f0]">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-medium text-slate-700">View:</label>
              <Select defaultValue="category">
                <SelectTrigger className="h-9 w-40 text-xs border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] border-[#e2e8f0]">
                  <SelectItem value="category">Category view</SelectItem>
                  <SelectItem value="list">List view</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium text-slate-700">Status:</label>
              <Select defaultValue="all">
                <SelectTrigger className="h-9 w-40 text-xs border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] border-[#e2e8f0]">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="not-passed">Not passed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium text-slate-700">Type:</label>
              <Select defaultValue="all">
                <SelectTrigger className="h-9 w-40 text-xs border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] border-[#e2e8f0]">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="courses">Courses</SelectItem>
                  <SelectItem value="learning-paths">Learning paths</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium text-slate-700">Sort by:</label>
              <Select defaultValue="name">
                <SelectTrigger className="h-9 w-40 text-xs border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] border-[#e2e8f0]">
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Course List */}
        <Card className="p-6 border-[#e2e8f0]">
          {/* Mock courses with progress - replace with real data */}
          {false ? (
            <div className="space-y-4">
              {[
                { id: 1, title: 'Introduction to Counseling Ethics', progress: 65, status: 'in-progress' },
                { id: 2, title: 'Active Listening & Empathetic Response', progress: 30, status: 'in-progress' },
                { id: 3, title: 'Crisis Intervention Techniques', progress: 100, status: 'completed' },
              ].map((course) => (
                <Card key={course.id} className="p-4 border-[#e2e8f0] hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {course.title}
                        </h3>
                        <Badge 
                          variant={course.status === 'completed' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {course.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-medium text-slate-700">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="You have no courses yet"
              description="You can browse our catalog and start learning counseling skills, ethics, and practical techniques."
              actionLabel="Go to catalog"
              icon={<BookOpen className="h-4 w-4" />}
              onActionClick={() => router.push('/catalog')}
            />
          )}
        </Card>
      </div>
    </LearnerPortalPlaceholder>
  )
}
