import { NextRequest, NextResponse } from 'next/server'

// OpenAI import - will be handled at runtime
// If package is not installed, the route will return an error

export async function POST(request: NextRequest) {
  try {
    // Dynamic import to avoid build-time errors
    let OpenAI: any
    try {
      // @ts-ignore - Optional dependency
      const openaiModule = await import('openai')
      OpenAI = openaiModule.default || openaiModule
    } catch (e) {
      return NextResponse.json(
        { error: 'OpenAI package not installed. Run: npm install openai' },
        { status: 500 }
      )
    }

    const { messages, systemPrompt } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use cheaper model for practice
      messages: openaiMessages,
      temperature: 0.8,
      max_tokens: 150, // Keep responses short
    })

    const response = completion.choices[0]?.message?.content || 'I understand.'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
