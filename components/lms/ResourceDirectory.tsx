'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Phone, Mail, MapPin, ExternalLink, Copy, Check, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BackpackButton } from '@/components/lms/BackpackButton'

interface Resource {
  id: string
  category: string
  title: string
  description: string | null
  contact_info: {
    phone?: string
    email?: string
    address?: string
  } | null
  website_url: string | null
  location: string | null
  tags: string[] | null
  display_order: number | null
}

const CATEGORY_LABELS: Record<string, string> = {
  emergency: 'Emergency Services',
  mental_health: 'Mental Health Hotlines',
  hospital: 'Hospitals & Psychiatric',
  ngo: 'NGOs & Community Support',
  faith_based: 'Faith & Community-Based',
  international: 'International',
}

const CATEGORY_COLORS: Record<string, string> = {
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  mental_health: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  hospital: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ngo: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  faith_based: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  international: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
}

export function ResourceDirectory() {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadResources() {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('title', { ascending: true })

        if (error) {
          if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
            setTableMissing(true)
            setResources([])
            setFilteredResources([])
            setLoading(false)
            return
          }
          throw error
        }
        const list = (data ?? []) as Resource[]
        setResources(list)
        setFilteredResources(list)
      } catch (error) {
        console.error('Error loading resources:', error)
        setTableMissing(true)
        setResources([])
        setFilteredResources([])
      } finally {
        setLoading(false)
      }
    }
    loadResources()
  }, [supabase])

  useEffect(() => {
    let filtered = resources
    if (selectedCategory) filtered = filtered.filter((r) => r.category === selectedCategory)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }
    setFilteredResources(filtered)
  }, [searchQuery, selectedCategory, resources])

  const handleCopyPhone = async (phone: string, resourceId: string) => {
    try {
      await navigator.clipboard.writeText(phone)
      setCopiedId(resourceId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const categories = Array.from(new Set(resources.map((r) => r.category))).sort()

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-500 text-sm">Loading resources…</p>
      </div>
    )
  }

  if (tableMissing) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">Resource Directory is not set up yet.</p>
        <p className="mt-1 text-amber-800">
          An admin needs to run the setup script in Supabase. After that, admins and mentors can add resources from their portals.
        </p>
        <p className="mt-2 text-xs text-amber-700">
          Run <code className="rounded bg-amber-100 px-1">supabase/scripts/create_resources_and_admin_policies.sql</code> in Supabase Dashboard → SQL Editor.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm border-slate-200"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat] || cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-10 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-700">No resources found</p>
          <p className="mt-1 text-xs text-slate-500">
            {resources.length === 0
              ? 'Admins or mentors can add resources from their portals. You can also save items to My Backpack once resources are added.'
              : 'Try adjusting your search or category filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{resource.title}</CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <BackpackButton
                      resourceId={resource.id}
                      resourceType="resource"
                      title={resource.title}
                    />
                    <Badge className={`text-[10px] ${CATEGORY_COLORS[resource.category] || 'bg-slate-100 text-slate-800'}`}>
                      {CATEGORY_LABELS[resource.category] || resource.category}
                    </Badge>
                  </div>
                </div>
                {resource.description && (
                  <CardDescription className="mt-1 line-clamp-2 text-xs">
                    {resource.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-2 pt-0 text-sm">
                {resource.contact_info?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-xs">{resource.contact_info.phone}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-auto shrink-0"
                      onClick={() => handleCopyPhone(resource.contact_info!.phone!, resource.id)}
                      title="Copy"
                    >
                      {copiedId === resource.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                )}
                {resource.contact_info?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${resource.contact_info.email}`} className="text-xs text-teal-700 hover:underline truncate">
                      {resource.contact_info.email}
                    </a>
                  </div>
                )}
                {resource.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs">{resource.location}</span>
                  </div>
                )}
                {resource.website_url && (
                  <a
                    href={resource.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {resource.tags.slice(0, 4).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 pt-2">
        This directory offers entry points for professional, medical, or community-based support. Verify contact details and availability before use.
      </p>
    </div>
  )
}
