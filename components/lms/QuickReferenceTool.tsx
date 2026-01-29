'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

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

interface QuickReferenceToolCardProps {
  tool: QuickReferenceTool
  onView?: (tool: QuickReferenceTool) => void
}

export function QuickReferenceToolCard({ tool, onView }: QuickReferenceToolCardProps) {
  const handlePrint = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const content = generatePrintableContent(tool)
      printWindow.document.write(content)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownload = () => {
    const content = generatePrintableContent(tool)
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tool.title.replace(/\s+/g, '_')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{tool.title}</CardTitle>
        {tool.content.description && (
          <CardDescription>{tool.content.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 mb-4">
          <PreviewContent content={tool.content} toolType={tool.tool_type} />
        </div>
        <div className="flex gap-2 pt-4 border-t">
          {onView && (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onView(tool)}
            >
              View Full
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PreviewContent({ content, toolType }: { content: any; toolType: string }) {
  if (toolType === 'stages_of_helping' && content.stages) {
    return (
      <div className="space-y-3">
        {content.stages.map((stage: any, idx: number) => (
          <div key={idx} className="p-3 bg-muted rounded-md">
            <h4 className="font-semibold mb-1">{stage.stage}</h4>
            <p className="text-sm text-muted-foreground mb-2">{stage.description}</p>
            <div className="flex flex-wrap gap-1">
              {stage.key_skills?.map((skill: string, skillIdx: number) => (
                <span key={skillIdx} className="text-xs bg-background px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (toolType === 'ethical_principles' && content.principles) {
    return (
      <ul className="space-y-2">
        {content.principles.map((principle: any, idx: number) => (
          <li key={idx} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <span className="font-medium">{principle.principle}</span>
              {principle.description && (
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (toolType === 'crisis_intervention' && content.steps) {
    return (
      <ol className="space-y-3">
        {content.steps.map((step: any, idx: number) => (
          <li key={idx} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {step.step}
            </div>
            <div>
              <h4 className="font-semibold">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    )
  }

  if (toolType === 'self_care_checklist' && content.categories) {
    return (
      <div className="space-y-3">
        {content.categories.map((category: any, idx: number) => (
          <div key={idx} className="p-3 bg-muted rounded-md">
            <h4 className="font-semibold mb-2">{category.category}</h4>
            <ul className="space-y-1">
              {category.items.map((item: string, itemIdx: number) => (
                <li key={itemIdx} className="text-sm flex items-center gap-2">
                  <span className="text-primary">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  if (toolType === 'active_listening' && content.skills) {
    return (
      <div className="space-y-3">
        {content.skills.map((skill: any, idx: number) => (
          <div key={idx} className="p-3 border rounded-md">
            <h4 className="font-semibold mb-1">{skill.skill}</h4>
            <p className="text-sm text-muted-foreground">{skill.description}</p>
          </div>
        ))}
      </div>
    )
  }

  if (toolType === 'grounding_techniques' && content.techniques) {
    return (
      <div className="space-y-3">
        {content.techniques.map((technique: any, idx: number) => (
          <div key={idx} className="p-3 border rounded-md">
            <h4 className="font-semibold mb-1">{technique.technique}</h4>
            <p className="text-sm text-muted-foreground">{technique.description}</p>
          </div>
        ))}
      </div>
    )
  }

  if (toolType === 'cultural_sensitivity' && content.guidelines) {
    return (
      <ul className="space-y-2">
        {content.guidelines.map((guideline: any, idx: number) => (
          <li key={idx} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <div>
              <span className="font-medium">{guideline.guideline}</span>
              {guideline.description && (
                <p className="text-sm text-muted-foreground">{guideline.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (toolType === 'feedback_tips' && content.tips) {
    return (
      <div className="space-y-3">
        {content.tips.map((tip: any, idx: number) => (
          <div key={idx} className="p-3 border rounded-md">
            <h4 className="font-semibold mb-1">{tip.tip}</h4>
            <p className="text-sm text-muted-foreground">{tip.description}</p>
          </div>
        ))}
      </div>
    )
  }

  return <p className="text-sm text-muted-foreground">Preview not available</p>
}

function generatePrintableContent(tool: QuickReferenceTool): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${tool.title} - HELP Foundations</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #7c3aed;
      border-bottom: 2px solid #7c3aed;
      padding-bottom: 10px;
    }
    h2 {
      color: #6d28d9;
      margin-top: 30px;
    }
    .description {
      font-style: italic;
      color: #666;
      margin-bottom: 20px;
    }
    @media print {
      body { margin: 0; padding: 15px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${tool.title}</h1>
  ${tool.content.description ? `<p class="description">${tool.content.description}</p>` : ''}
  ${generateContentHTML(tool.content, tool.tool_type)}
  <div class="no-print" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
    <p>HELP Foundations Training - Quick Reference Tool</p>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
  `
}

function generateContentHTML(content: any, toolType: string): string {
  // Similar logic to PreviewContent but returns HTML string
  if (toolType === 'stages_of_helping' && content.stages) {
    return content.stages.map((stage: any) => `
      <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
        <h2>${stage.stage}</h2>
        <p>${stage.description}</p>
        <p><strong>Key Skills:</strong> ${stage.key_skills?.join(', ')}</p>
      </div>
    `).join('')
  }
  
  // Add other tool types as needed
  return '<p>Content preview</p>'
}
