'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookMarked, Wrench, FileSearch, ClipboardCheck } from 'lucide-react'

export function LearningTools() {
  const tools = [
    {
      title: 'Resources',
      description: 'Directory of helping resources',
      icon: BookMarked,
      href: '/resources'
    },
    {
      title: 'Quick Tools',
      description: 'Reference guides and checklists',
      icon: Wrench,
      href: '/tools'
    },
    {
      title: 'Case Studies',
      description: 'Practice with real scenarios',
      icon: FileSearch,
      href: '/case-studies'
    },
    {
      title: 'Assessments',
      description: 'Track your progress',
      icon: ClipboardCheck,
      href: '/assessments'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tools.map((tool) => {
        const Icon = tool.icon
        return (
          <Link key={tool.href} href={tool.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <CardDescription className="text-sm">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
