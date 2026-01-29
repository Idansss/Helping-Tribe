'use client'

import { useState } from 'react'
import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Search, X, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from '@/components/ui/input'

const MOCK_COURSES = [
  {
    id: '1',
    title: 'Introduction to Counseling Ethics',
    code: 'ETH-001',
    category: 'Core',
  },
  {
    id: '2',
    title: 'Guide for Counselors-in-Training',
    code: 'CORE-001',
    category: 'Core',
  },
  {
    id: '3',
    title: 'Active Listening & Empathetic Response',
    code: 'SKL-002',
    category: 'Skills',
  },
]

export default function CatalogPage() {
  const [previewCourse, setPreviewCourse] = useState<any>(null)

  return (
    <LearnerPortalPlaceholder>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Catalog</h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Browse and enroll in counseling courses, ethics training, and
              skill-building modules.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-purple-50 text-purple-700 border border-[#e2e8f0] text-xs px-3 py-1">
            Core (2)
          </Badge>
          <Badge className="bg-slate-50 text-slate-700 border border-[#e2e8f0] text-xs px-3 py-1">
            Skills (1)
          </Badge>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4 border-[#e2e8f0]">
          {/* Filter Chips */}
          {false && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                Core
                <button className="ml-1 hover:text-purple-900">×</button>
              </Badge>
              <button className="text-xs text-purple-600 hover:text-purple-700">
                Clear all
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-0 max-w-md">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search courses"
                className="pl-8 h-9 text-sm border-[#e2e8f0]"
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-xs font-medium text-slate-700">View:</label>
              <Select defaultValue="category">
                <SelectTrigger className="h-9 w-36 text-xs border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] border-[#e2e8f0]">
                  <SelectItem value="category">Category view</SelectItem>
                  <SelectItem value="list">List view</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="date">
                <SelectTrigger className="h-9 w-32 text-xs border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] border-[#e2e8f0]">
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Course List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_COURSES.map((course) => (
            <Card key={course.id} className="overflow-hidden border-[#e2e8f0] hover:shadow-md transition-shadow">
              {/* Course Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center relative group">
                <BookOpen className="h-12 w-12 text-purple-600 opacity-50" />
                <button
                  onClick={() => setPreviewCourse(course)}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <Eye className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{course.code}</span>
                      <span>•</span>
                      <span>{course.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-[#e2e8f0]"
                    onClick={() => setPreviewCourse(course)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    Enroll
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Course Preview Modal */}
        <Dialog open={!!previewCourse} onOpenChange={() => setPreviewCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{previewCourse?.title}</DialogTitle>
              <DialogDescription>
                {previewCourse?.code} • {previewCourse?.category}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-purple-600 opacity-50" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Course Description</h3>
                <p className="text-sm text-slate-600">
                  This course provides comprehensive training in counseling ethics, covering professional standards,
                  ethical decision-making frameworks, and practical applications in counseling practice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">What you'll learn</h3>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>Professional ethical standards in counseling</li>
                  <li>Ethical decision-making frameworks</li>
                  <li>Confidentiality and privacy principles</li>
                  <li>Boundary management in therapeutic relationships</li>
                </ul>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPreviewCourse(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </LearnerPortalPlaceholder>
  )
}
