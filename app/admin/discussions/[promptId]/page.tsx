'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Loader2, MessageSquare, User, CornerDownRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

type Prompt = {
  id: string
  module_id: string
  prompt_text: string
  posted_at: string
  module?: { week_number: number; title: string } | null
}

type ResponseProfile = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  avatar_url: string | null
}

type ResponseRow = {
  id: string
  prompt_id: string
  user_id: string
  response_text: string
  parent_response_id: string | null
  created_at: string
  profile?: ResponseProfile | null
  replies?: ResponseRow[]
}

export default function AdminDiscussionResponsesPage() {
  const params = useParams()
  const promptId = params?.promptId as string
  const supabase = createClient()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [responses, setResponses] = useState<ResponseRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!promptId) return
    async function load() {
      setLoading(true)
      try {
        const { data: promptData, error: promptErr } = await supabase
          .from('discussion_prompts')
          .select(`id, module_id, prompt_text, posted_at, module:modules(week_number, title)`)
          .eq('id', promptId)
          .maybeSingle()
        if (promptErr) throw promptErr
        let normalizedModule: Prompt['module'] = null
        if (promptData) {
          const rawModule = (promptData as unknown as { module?: unknown }).module
          if (Array.isArray(rawModule)) {
            const first = (rawModule as { week_number: number; title: string }[])[0]
            normalizedModule = first ?? null
          } else if (rawModule && typeof rawModule === 'object') {
            normalizedModule = rawModule as { week_number: number; title: string }
          }
        }
        const normalizedPrompt: Prompt | null = promptData
          ? {
              id: (promptData as { id: string }).id,
              module_id: (promptData as { module_id: string }).module_id,
              prompt_text: (promptData as { prompt_text: string }).prompt_text,
              posted_at: (promptData as { posted_at: string }).posted_at,
              module: normalizedModule,
            }
          : null
        setPrompt(normalizedPrompt)

        const { data: responseData, error: respErr } = await supabase
          .from('discussion_responses')
          .select(`id, prompt_id, user_id, response_text, parent_response_id, created_at,
            profile:profiles(id, full_name, email, role, avatar_url)`)
          .eq('prompt_id', promptId)
          .order('created_at', { ascending: true })
        if (respErr) throw respErr

        const rows = (responseData ?? []).map((r: unknown) => {
          const row = r as ResponseRow & { profile?: ResponseProfile | ResponseProfile[] | null }
          const profile = Array.isArray(row.profile)
            ? (row.profile[0] ?? null)
            : (row.profile ?? null)
          return { ...row, profile }
        })
        const topLevel = rows
          .filter((r) => !r.parent_response_id)
          .map((r) => ({
            ...r,
            replies: rows.filter((reply) => reply.parent_response_id === r.id),
          }))
        setResponses(topLevel)
      } catch (err) {
        console.error('Failed to load discussion responses', err)
        setPrompt(null)
        setResponses([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [promptId, supabase])

  const totalResponses = responses.reduce(
    (acc, r) => acc + 1 + (r.replies?.length ?? 0),
    0
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/discussions" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Discussions
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading responses…
        </div>
      ) : !prompt ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Prompt not found.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50/70 to-white">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {prompt.module && (
                  <Badge variant="outline" className="bg-white">
                    Week {prompt.module.week_number}
                  </Badge>
                )}
                {prompt.module && (
                  <span className="text-sm text-slate-600">{prompt.module.title}</span>
                )}
              </div>
              <CardTitle className="text-xl flex items-start gap-2">
                <MessageSquare className="h-6 w-6 text-teal-600 mt-0.5 shrink-0" />
                <span>{prompt.prompt_text}</span>
              </CardTitle>
              <CardDescription>
                Posted {formatDistanceToNow(new Date(prompt.posted_at), { addSuffix: true })} ·{' '}
                {totalResponses} {totalResponses === 1 ? 'response' : 'responses'}
              </CardDescription>
            </CardHeader>
          </Card>

          {responses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No responses yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {responses.map((r) => (
                <ResponseBlock key={r.id} response={r} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ResponseBlock({ response, isReply = false }: { response: ResponseRow; isReply?: boolean }) {
  const name = response.profile?.full_name || response.profile?.email || 'Unknown student'
  const email = response.profile?.email
  const role = response.profile?.role
  return (
    <Card className={isReply ? 'border-slate-200 bg-slate-50/60' : 'border-slate-200'}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            {isReply ? <CornerDownRight className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-semibold text-slate-900">{name}</p>
              {role && (
                <Badge variant="secondary" className="capitalize">
                  {role}
                </Badge>
              )}
              {email && (
                <span className="text-xs text-slate-500 break-all">{email}</span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
            </p>
            <p className="mt-3 text-slate-800 whitespace-pre-wrap">{response.response_text}</p>
          </div>
        </div>
        {response.replies && response.replies.length > 0 && (
          <div className="mt-4 ml-6 pl-4 border-l-2 border-slate-200 space-y-3">
            {response.replies.map((reply) => (
              <ResponseBlock key={reply.id} response={reply} isReply />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
