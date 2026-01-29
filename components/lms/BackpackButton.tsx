'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface BackpackButtonProps {
  resourceType: 'lesson' | 'resource' | 'case_study' | 'discussion' | 'assignment'
  resourceId: string
  title: string
}

export function BackpackButton({ resourceType, resourceId, title }: BackpackButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkBookmarkStatus()
  }, [resourceType, resourceId])

  const checkBookmarkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('backpack_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .maybeSingle()

      setIsBookmarked(!!data)
    } catch (error) {
      console.error('Error checking bookmark:', error)
    }
  }

  const toggleBookmark = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to save items')
        return
      }

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('backpack_items')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_type', resourceType)
          .eq('resource_id', resourceId)

        if (error) throw error
        setIsBookmarked(false)
        toast.success('Removed from Backpack')
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('backpack_items')
          .insert({
            user_id: user.id,
            resource_type: resourceType,
            resource_id: resourceId,
            title: title,
          })

        if (error) throw error
        setIsBookmarked(true)
        toast.success('Saved to Backpack')
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to update bookmark')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={toggleBookmark}
      variant="ghost"
      size="sm"
      disabled={isLoading}
      aria-label={isBookmarked ? 'Remove from Backpack' : 'Save to Backpack'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  )
}
