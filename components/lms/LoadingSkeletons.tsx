'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Generic page title + description skeleton */
export function PageTitleSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </div>
  )
}

/** Dashboard: welcome + 4 stat cards + activity + sidebar */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageTitleSkeleton />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 border-slate-200">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 border-slate-200">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </Card>
          <Card className="p-5 border-slate-200">
            <Skeleton className="h-6 w-56 mb-2" />
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <Skeleton key={i} className="h-10 flex-1 rounded" />
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5 border-slate-200">
            <Skeleton className="h-6 w-40 mb-2" />
            <div className="space-y-3 mt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/** Inline module list only (for use inside course/modules page) */
export function ModuleListSkeleton() {
  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <li key={i}>
          <Card className="p-4 border-slate-200">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-full max-w-sm" />
              </div>
              <Skeleton className="h-2 w-24 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}

/** Course / module list: title + list of module cards */
export function CourseListSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl">
      <PageTitleSkeleton />
      <Card className="p-5 border-teal-200">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <ModuleListSkeleton />
      </div>
    </div>
  )
}

/** Quiz list: title + list of quiz cards */
export function QuizListSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageTitleSkeleton />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <Skeleton className="h-9 w-24 shrink-0" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

/** Messages: two-column layout - conversation list + thread (full page) */
export function MessageListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-1 border-slate-200">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1 min-w-0">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="md:col-span-2 border-slate-200">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <Skeleton className="h-16 w-full rounded-lg ml-0" />
          <Skeleton className="h-16 w-full rounded-lg mr-8" />
          <Skeleton className="h-12 w-3/4 rounded-lg ml-0" />
        </CardContent>
      </Card>
    </div>
  )
}

/** Conversation list only (for MessageInbox left column) */
export function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1 min-w-0">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Discussion list: title + list of prompt cards */
export function DiscussionListSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/** Catalog page: title + one feature card */
export function CatalogSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl">
      <PageTitleSkeleton />
      <Card className="border-slate-200 p-6">
        <Skeleton className="h-7 w-56 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </Card>
    </div>
  )
}
