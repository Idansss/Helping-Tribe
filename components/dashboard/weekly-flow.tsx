'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, MessageSquare, FileText, Users } from 'lucide-react'

export function WeeklyFlow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week's Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="learn">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="learn">
              <BookOpen className="h-4 w-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="discuss">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discuss
            </TabsTrigger>
            <TabsTrigger value="practice">
              <FileText className="h-4 w-4 mr-2" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="reflect">
              <Users className="h-4 w-4 mr-2" />
              Reflect
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="learn" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete this week's module content and lessons
            </p>
          </TabsContent>
          
          <TabsContent value="discuss" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Participate in discussion forums and peer learning
            </p>
          </TabsContent>
          
          <TabsContent value="practice" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Work on assignments and case studies
            </p>
          </TabsContent>
          
          <TabsContent value="reflect" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Write in your learning journal
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
