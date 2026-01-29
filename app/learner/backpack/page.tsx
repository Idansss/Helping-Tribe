'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Backpack, Trash2, FolderOpen, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface SavedItem {
  id: string
  resource_type: string
  resource_id: string
  title: string | null
  created_at: string
}

export default function LearnerBackpackPage() {
  const supabase = createClient()
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error } = await supabase
          .from('backpack_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (!error && data) setItems(data as SavedItem[])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  async function remove(id: string) {
    try {
      await supabase.from('backpack_items').delete().eq('id', id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Backpack</h1>
        <p className="text-slate-600 mt-1">
          Saved resources and bookmarks for quick access in the field. Add items from the Resource Directory or Quick Reference Tools.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Backpack className="h-4 w-4 text-teal-600" />
            Saved items
          </CardTitle>
          <CardDescription>
            Your bookmarks appear here. Remove any you no longer need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <Backpack className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No saved items yet</p>
              <p className="text-xs text-slate-500 mt-1">Save resources from the Resource Directory or Quick Reference Tools.</p>
              <Link href="/learner/resources" className="inline-block mt-3">
                <Button size="sm" variant="outline">Go to Resources</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.resource_type === 'resource' ? (
                      <FolderOpen className="h-4 w-4 text-slate-500 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-slate-900 truncate">{item.title || 'Saved item'}</span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{item.resource_type}</Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => remove(item.id)} className="p-1.5 text-slate-500 hover:text-red-600" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
