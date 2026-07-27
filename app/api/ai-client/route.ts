import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getRequestIp } from '@/lib/server/rate-limit'

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000
const MAX_SYSTEM_PROMPT_LENGTH = 1000
const FALLBACK_CHAT_MODEL = 'gpt-4o-mini'
/** Visible reply budget — personas stay at 1–3 sentences. */
const MAX_VISIBLE_OUTPUT_TOKENS = 160

const ReasoningLevelSchema = z.enum(['low', 'medium', 'high'])

const AiClientRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string().max(MAX_MESSAGE_LENGTH),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
  systemPrompt: z.string().max(MAX_SYSTEM_PROMPT_LENGTH).optional(),
  reasoningEffort: ReasoningLevelSchema.optional(),
})

function getPracticeModelConfig() {
  const practiceModel = process.env.OPENAI_PRACTICE_MODEL?.trim()
  const reasoningEnabled = Boolean(practiceModel)
  return {
    practiceModel: practiceModel || null,
    reasoningEnabled,
  }
}

/**
 * GET exposes capability flags only — never the model id or API key.
 * Reasoning UI stays hidden unless OPENAI_PRACTICE_MODEL is configured
 * with a Responses-API reasoning model (e.g. gpt-5-mini).
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reasoningEnabled } = getPracticeModelConfig()
  return NextResponse.json({
    reasoningEnabled,
    defaultReasoningEffort: 'medium' as const,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate-limit AI calls: 20 requests per user per hour (cost + DoS protection)
  const ip = getRequestIp(request.headers)
  const limit = await checkRateLimit({
    key: `ai-client:${user.id}:${ip}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many AI requests. Please wait before sending more messages.' },
      { status: 429 }
    )
  }

  try {
    let OpenAI: typeof import('openai').default
    try {
      const openaiModule = await import('openai')
      OpenAI = openaiModule.default || openaiModule
    } catch {
      return NextResponse.json(
        { error: 'OpenAI package not installed. Run: npm install openai' },
        { status: 500 }
      )
    }

    let parsed: z.infer<typeof AiClientRequestSchema>
    try {
      const body = await request.json()
      parsed = AiClientRequestSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid AI client payload' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { messages, systemPrompt, reasoningEffort } = parsed

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const { practiceModel, reasoningEnabled } = getPracticeModelConfig()
    const effort = reasoningEffort ?? 'medium'

    // Prefer Responses API + reasoning when OPENAI_PRACTICE_MODEL is set.
    // Otherwise keep the existing gpt-4o-mini Chat Completions path (no fake reasoning).
    if (reasoningEnabled && practiceModel) {
      const input = messages.map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }))

      // max_output_tokens includes hidden reasoning tokens on reasoning models.
      const maxOutputTokens =
        effort === 'high' ? 900 : effort === 'medium' ? 600 : 400

      const response = await openai.responses.create({
        model: practiceModel,
        instructions: systemPrompt || undefined,
        input,
        reasoning: {
          effort,
        },
        store: false,
        max_output_tokens: maxOutputTokens,
      })

      const text = (response.output_text || '').trim()
      // Never return reasoning summaries / encrypted reasoning to the browser.
      return NextResponse.json({
        response: text || 'I understand.',
      })
    }

    const openaiMessages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages.map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: FALLBACK_CHAT_MODEL,
      messages: openaiMessages,
      temperature: 0.8,
      max_tokens: MAX_VISIBLE_OUTPUT_TOKENS,
    })

    const response = completion.choices[0]?.message?.content || 'I understand.'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('OpenAI API error:', error instanceof Error ? error.name : 'unknown')
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
