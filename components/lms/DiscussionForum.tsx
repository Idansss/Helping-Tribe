'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock, User, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DiscussionListSkeleton } from '@/components/lms/LoadingSkeletons'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface DiscussionPrompt {
  id: string
  module_id: string
  prompt_text: string
  posted_at: string
  module?: {
    week_number: number
    title: string
  }
  response_count?: number
}

export function DiscussionForum() {
  const [prompts, setPrompts] = useState<DiscussionPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadPrompts() {
      try {
        const { data, error } = await supabase
          .from('discussion_prompts')
          .select(`
            *,
            module:modules(week_number, title)
          `)
          .order('sort_order', { ascending: true, nullsFirst: true })
          .order('posted_at', { ascending: false })

        if (error) throw error

        if (data) {
          // Get response counts for each prompt
          const promptsWithCounts = await Promise.all(
            data.map(async (prompt) => {
              const { count } = await supabase
                .from('discussion_responses')
                .select('*', { count: 'exact', head: true })
                .eq('prompt_id', prompt.id)

              return {
                ...prompt,
                response_count: count || 0
              }
            })
          )

          setPrompts(promptsWithCounts as DiscussionPrompt[])
        }
      } catch (error) {
        console.error('Error loading prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPrompts()
  }, [supabase])

  if (loading) {
    return <DiscussionListSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Discussion Forum</h1>
        <p className="text-muted-foreground mt-2">
          Engage with your peers and share insights from each module
        </p>
      </div>

      {prompts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No discussion prompts yet. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {prompt.module && (
                        <Badge variant="outline">
                          Week {prompt.module.week_number}
                        </Badge>
                      )}
                      {prompt.module && (
                        <span className="text-sm text-muted-foreground">
                          {prompt.module.title}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg mb-2">{prompt.prompt_text}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(prompt.posted_at), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {prompt.response_count || 0} {prompt.response_count === 1 ? 'response' : 'responses'}
                      </div>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/discussions/${prompt.module_id}`}>
                      Join Discussion
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
