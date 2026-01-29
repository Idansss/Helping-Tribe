'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { QuickReferenceToolCard } from './QuickReferenceTool'

interface QuickReferenceTool {
  id: string
  tool_type: string
  title: string
  content: {
    description: string
    [key: string]: any
  }
  module_id: string | null
  display_order: number | null
}

export function QuickReferenceTools() {
  const [tools, setTools] = useState<QuickReferenceTool[]>([])
  const [filteredTools, setFilteredTools] = useState<QuickReferenceTool[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState<QuickReferenceTool | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadTools() {
      try {
        const { data, error } = await supabase
          .from('quick_reference_tools')
          .select('*')
          .order('display_order', { ascending: true })
          .order('title', { ascending: true })

        if (error) throw error
        if (data) {
          setTools(data as QuickReferenceTool[])
          setFilteredTools(data as QuickReferenceTool[])
        }
      } catch (error: any) {
        console.error('Error loading tools:', error)
        // Check if it's a database table missing error
        if (error?.message?.includes('Could not find the table') || error?.code === 'PGRST205') {
          console.error('⚠️ DATABASE SETUP REQUIRED: Please run the migrations in Supabase SQL Editor. See RUN_MIGRATIONS.md for instructions.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadTools()
  }, [supabase])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredTools(tools)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = tools.filter(tool =>
      tool.title.toLowerCase().includes(query) ||
      tool.content.description?.toLowerCase().includes(query) ||
      tool.tool_type.toLowerCase().includes(query)
    )
    setFilteredTools(filtered)
  }, [searchQuery, tools])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tools...</p>
        </div>
      </div>
    )
  }

  if (selectedTool) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setSelectedTool(null)}
              className="text-sm text-primary hover:underline mb-2"
            >
              ← Back to all tools
            </button>
            <h1 className="text-4xl font-bold">{selectedTool.title}</h1>
            {selectedTool.content.description && (
              <p className="text-muted-foreground mt-2">{selectedTool.content.description}</p>
            )}
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <FullToolView tool={selectedTool} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Quick Reference Tools</h1>
        <p className="text-muted-foreground mt-2">
          Printable guides and checklists for your helping practice
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No tools found. Try adjusting your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <QuickReferenceToolCard
              key={tool.id}
              tool={tool}
              onView={setSelectedTool}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FullToolView({ tool }: { tool: QuickReferenceTool }) {
  const content = tool.content

  if (tool.tool_type === 'stages_of_helping' && content.stages) {
    return (
      <div className="space-y-6">
        {content.stages.map((stage: any, idx: number) => (
          <div key={idx} className="p-4 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-2">{stage.stage}</h2>
            <p className="text-muted-foreground mb-4">{stage.description}</p>
            <div>
              <h3 className="font-semibold mb-2">Key Skills:</h3>
              <ul className="list-disc list-inside space-y-1">
                {stage.key_skills?.map((skill: string, skillIdx: number) => (
                  <li key={skillIdx}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tool.tool_type === 'ethical_principles' && content.principles) {
    return (
      <div className="space-y-4">
        {content.principles.map((principle: any, idx: number) => (
          <div key={idx} className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{principle.principle}</h3>
            <p className="text-muted-foreground">{principle.description}</p>
          </div>
        ))}
      </div>
    )
  }

  if (tool.tool_type === 'crisis_intervention' && content.steps) {
    return (
      <div className="space-y-4">
        {content.steps.map((step: any, idx: number) => (
          <div key={idx} className="flex gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              {step.step}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (tool.tool_type === 'self_care_checklist' && content.categories) {
    return (
      <div className="space-y-4">
        {content.categories.map((category: any, idx: number) => (
          <div key={idx} className="p-4 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-3">{category.category}</h3>
            <ul className="space-y-2">
              {category.items.map((item: string, itemIdx: number) => (
                <li key={itemIdx} className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  if (tool.tool_type === 'active_listening' && content.skills) {
    return (
      <div className="space-y-4">
        {content.skills.map((skill: any, idx: number) => (
          <div key={idx} className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{skill.skill}</h3>
            <p className="text-muted-foreground">{skill.description}</p>
          </div>
        ))}
      </div>
    )
  }

  if (tool.tool_type === 'grounding_techniques' && content.techniques) {
    return (
      <div className="space-y-4">
        {content.techniques.map((technique: any, idx: number) => (
          <div key={idx} className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{technique.technique}</h3>
            <p className="text-muted-foreground">{technique.description}</p>
          </div>
        ))}
      </div>
    )
  }

  if (tool.tool_type === 'cultural_sensitivity' && content.guidelines) {
    return (
      <div className="space-y-4">
        {content.guidelines.map((guideline: any, idx: number) => (
          <div key={idx} className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{guideline.guideline}</h3>
            <p className="text-muted-foreground">{guideline.description}</p>
          </div>
        ))}
      </div>
    )
  }

  if (tool.tool_type === 'feedback_tips' && content.tips) {
    return (
      <div className="space-y-4">
        {content.tips.map((tip: any, idx: number) => (
          <div key={idx} className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{tip.tip}</h3>
            <p className="text-muted-foreground">{tip.description}</p>
          </div>
        ))}
      </div>
    )
  }

  return <p className="text-muted-foreground">Content not available</p>
}
