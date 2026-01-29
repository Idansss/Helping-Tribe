'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Send, Clock, User, Reply, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { Profile } from '@/types'
import Link from 'next/link'

interface DiscussionPrompt {
  id: string
  module_id: string
  prompt_text: string
  posted_at: string
  module?: {
    week_number: number
    title: string
  }
}

interface DiscussionResponse {
  id: string
  prompt_id: string
  user_id: string
  response_text: string
  parent_response_id: string | null
  created_at: string
  updated_at: string
  profile?: Profile
  replies?: DiscussionResponse[]
}

export function DiscussionThread({ moduleId }: { moduleId: string }) {
  const [prompt, setPrompt] = useState<DiscussionPrompt | null>(null)
  const [responses, setResponses] = useState<DiscussionResponse[]>([])
  const [newResponse, setNewResponse] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadPrompt() {
      try {
        const { data, error } = await supabase
          .from('discussion_prompts')
          .select(`
            *,
            module:modules(week_number, title)
          `)
          .eq('module_id', moduleId)
          .order('posted_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setPrompt(data as DiscussionPrompt)
        }
      } catch (error) {
        console.error('Error loading prompt:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPrompt()
  }, [moduleId, supabase])

  useEffect(() => {
    if (!prompt) return
    const promptId = prompt.id

    async function loadResponses() {
      try {
        const { data, error } = await supabase
          .from('discussion_responses')
          .select(`
            *,
            profile:profiles(id, full_name, avatar_url)
          `)
          .eq('prompt_id', promptId)
          .order('created_at', { ascending: true })

        if (error) throw error

        if (data) {
          // Organize responses into threads
          const topLevelResponses = data
            .filter((r: any) => !r.parent_response_id)
            .map((r: any) => ({
              ...r,
              replies: data.filter((reply: any) => reply.parent_response_id === r.id)
            }))

          setResponses(topLevelResponses as DiscussionResponse[])
        }
      } catch (error) {
        console.error('Error loading responses:', error)
      }
    }

    loadResponses()
  }, [prompt, supabase])

  const handleSubmitResponse = async () => {
    const textToSubmit = replyingTo ? replyText : newResponse
    if (!textToSubmit.trim() || !prompt) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('discussion_responses')
        .insert({
          prompt_id: prompt.id,
          user_id: user.id,
          response_text: textToSubmit,
          parent_response_id: replyingTo || null
        })

      if (error) throw error

      // Notify parent author when replying (don't notify self)
      if (replyingTo) {
        const parent = responses.flatMap((r) => [r, ...(r.replies ?? [])]).find((x) => x.id === replyingTo)
        if (parent && parent.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: parent.user_id,
            type: 'discussion_reply',
            title: 'New reply to your discussion post',
            body: textToSubmit.trim().slice(0, 100),
            link: `/discussions/${prompt.module_id}`,
          })
        }
      }

      setNewResponse('')
      setReplyingTo(null)
      setReplyText('')
      
      // Reload responses
      window.location.reload()
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return

    try {
      const { error } = await supabase
        .from('discussion_responses')
        .delete()
        .eq('id', responseId)

      if (error) throw error
      
      // Reload responses
      window.location.reload()
    } catch (error) {
      console.error('Error deleting response:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading discussion...</p>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No discussion prompt found for this module.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/discussions">← Back to all discussions</Link>
        </Button>
        <h1 className="text-4xl font-bold">Discussion</h1>
        {prompt.module && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Week {prompt.module.week_number}</Badge>
            <span className="text-muted-foreground">{prompt.module.title}</span>
          </div>
        )}
      </div>

      {/* Prompt Card */}
      <Card>
        <CardHeader>
          <CardTitle>{prompt.prompt_text}</CardTitle>
          <CardDescription>
            Posted {formatDistanceToNow(new Date(prompt.posted_at), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* New Response Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {replyingTo ? 'Reply to Response' : 'Add Your Response'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={replyingTo ? replyText : newResponse}
            onChange={(e) => replyingTo ? setReplyText(e.target.value) : setNewResponse(e.target.value)}
            placeholder="Share your thoughts, experiences, or insights..."
            className="min-h-[120px]"
          />
          <div className="flex items-center justify-between">
            {replyingTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyText('')
                }}
              >
                Cancel Reply
              </Button>
            )}
            <Button
              onClick={handleSubmitResponse}
              disabled={submitting || (!newResponse.trim() && !replyText.trim())}
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? 'Posting...' : 'Post Response'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {responses.length} {responses.length === 1 ? 'Response' : 'Responses'}
        </h2>

        {responses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No responses yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          responses.map((response) => (
            <ResponseCard
              key={response.id}
              response={response}
              onReply={(id) => {
                setReplyingTo(id)
                setReplyText('')
              }}
              onDelete={handleDeleteResponse}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ResponseCard({
  response,
  onReply,
  onDelete
}: {
  response: DiscussionResponse
  onReply: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [isOwnResponse, setIsOwnResponse] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkOwnership() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && response.user_id === user.id) {
        setIsOwnResponse(true)
      }
    }
    checkOwnership()
  }, [response.user_id, supabase])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {response.profile?.full_name || 'Anonymous'}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            {isOwnResponse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(response.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-foreground whitespace-pre-wrap">{response.response_text}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReply(response.id)}
          >
            <Reply className="mr-2 h-3 w-3" />
            Reply
          </Button>

          {/* Replies */}
          {response.replies && response.replies.length > 0 && (
            <div className="ml-8 mt-4 space-y-4 border-l-2 pl-4">
              {response.replies.map((reply) => (
                <ResponseCard
                  key={reply.id}
                  response={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
