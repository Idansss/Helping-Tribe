'use client'

import { LearnerPortalPlaceholder } from '@/components/lms/LearnerPortalPlaceholder'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/admin/EmptyState'
import { Mail, Filter, Circle } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

export default function MessagesPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const messages: Array<{
    id: number
    from: string
    subject: string
    preview: string
    time: string
    unread: boolean
  }> = []

  return (
    <LearnerPortalPlaceholder>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Communicate with your mentors, instructors, and peer circle
              members.
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4">
            New message
          </Button>
        </div>

        <Card className="p-4 space-y-4 border-[#e2e8f0]">
          <Tabs defaultValue="inbox">
            <TabsList className="mb-4">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs border-[#e2e8f0]"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Filters
                  {activeFilters.length > 0 && (
                    <Badge className="ml-2 h-4 px-1.5 text-[10px]">{activeFilters.length}</Badge>
                  )}
                </Button>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setActiveFilters([])}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <Card className="p-4 mb-4 border-[#e2e8f0] bg-slate-50">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={activeFilters.includes('unread') ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (activeFilters.includes('unread')) {
                        setActiveFilters(activeFilters.filter(f => f !== 'unread'))
                      } else {
                        setActiveFilters([...activeFilters, 'unread'])
                      }
                    }}
                  >
                    Unread only
                  </Button>
                  <Button
                    variant={activeFilters.includes('mentors') ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (activeFilters.includes('mentors')) {
                        setActiveFilters(activeFilters.filter(f => f !== 'mentors'))
                      } else {
                        setActiveFilters([...activeFilters, 'mentors'])
                      }
                    }}
                  >
                    From mentors
                  </Button>
                </div>
              </Card>
            )}

            <TabsContent value="inbox">
              {messages.length > 0 ? (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <Card key={message.id} className="p-4 border-[#e2e8f0] hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {message.unread ? (
                            <Circle className="h-3 w-3 fill-purple-600 text-purple-600" />
                          ) : (
                            <Circle className="h-3 w-3 fill-transparent text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-slate-900 text-sm">
                              {message.from}
                            </h3>
                            <span className="text-xs text-slate-500">{message.time}</span>
                          </div>
                          <p className="font-medium text-slate-700 text-sm mb-1">
                            {message.subject}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {message.preview}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="You have no messages in your inbox"
                  description="Messages from mentors, instructors, and peer circle members will appear here when you receive them."
                  icon={<Mail className="h-4 w-4" />}
                />
              )}
            </TabsContent>

            <TabsContent value="sent">
              <EmptyState
                title="No sent messages"
                description="Messages you send to mentors, instructors, or peers will appear here."
                icon={<Mail className="h-4 w-4" />}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </LearnerPortalPlaceholder>
  )
}

