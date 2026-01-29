'use client'

import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/admin/EmptyState'
import { MessageSquare, Search, ChevronUp, ChevronDown, Clock } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function DiscussionsPage() {
  const [sortBy, setSortBy] = useState('activity-date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // Mock discussion threads
  const mockDiscussions = [
    { id: 1, title: 'Ethical Dilemmas in Counseling', author: 'Sarah M.', replies: 12, lastActivity: '2 hours ago', unread: true },
    { id: 2, title: 'Active Listening Techniques', author: 'John D.', replies: 8, lastActivity: '5 hours ago', unread: false },
    { id: 3, title: 'Case Study Discussion: Week 3', author: 'Maria L.', replies: 15, lastActivity: '1 day ago', unread: true },
  ]

  return (
    <LearnerPortalPlaceholder>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Engage with peers, mentors, and instructors in counseling-focused
              discussions and peer learning circles.
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4">
            New discussion
          </Button>
        </div>

        <Card className="p-4 space-y-4 border-[#e2e8f0]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0]">
            <div className="relative flex-1 max-w-md min-w-0">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search"
                className="pl-8 h-9 text-sm border-[#e2e8f0]"
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-xs font-medium text-slate-700">
                Sort by:
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-40 text-xs border-[#e2e8f0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] border-[#e2e8f0]">
                  <SelectItem value="activity-date">Activity date</SelectItem>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 hover:bg-slate-100 rounded border border-[#e2e8f0] transition-colors"
                title={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
              >
                {sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4 text-slate-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {mockDiscussions.length > 0 ? (
            <div className="space-y-3">
              {mockDiscussions.map((discussion) => (
                <Card key={discussion.id} className="p-4 border-[#e2e8f0] hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {discussion.title}
                        </h3>
                        {discussion.unread && (
                          <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        by {discussion.author}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {discussion.replies} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {discussion.lastActivity}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="There are no discussion threads"
              description="Any new discussions that are posted will be found here. Start a conversation with your peers or mentors about counseling topics, case studies, or training experiences."
              icon={<MessageSquare className="h-4 w-4" />}
            />
          )}
        </Card>
      </div>
    </LearnerPortalPlaceholder>
  )
}
